import axios, {AxiosError, AxiosResponse} from 'axios'
import store from '@/store'
import {RequestError, ValidationError} from "@/store/types";

const REFRESH_TOKEN_KEY = 'refresh_token'
const TOKEN_KEY = 'token'

let INTERCEPTOR_401: number | undefined
let refreshTokenPromise: Promise<AxiosResponse> | undefined
let INTERCEPTORS_LOADING_ENABLED: boolean

export default class BackendService {
    constructor() {
        axios.defaults.baseURL = process.env.VUE_APP_API_URL || ''

        if (this.isLoggedIn()) {
            this.setAuthHeader()
            this.enable401Interceptor()
        }

        this.enableLoadingInterceptors();
    }

    get token(): string | null {
        return localStorage.getItem(TOKEN_KEY) || ''
    }

    set token(token: string | null) {
        if (token) {
            localStorage.setItem(TOKEN_KEY, token)
        } else {
            localStorage.removeItem(TOKEN_KEY)
        }
    }

    get refreshToken(): string | null {
        return localStorage.getItem(REFRESH_TOKEN_KEY) || ''
    }

    set refreshToken(token: string | null) {
        if (token) {
            localStorage.setItem(REFRESH_TOKEN_KEY, token)
        } else {
            localStorage.removeItem(REFRESH_TOKEN_KEY)
        }
    }

    setAuthHeader(): void {
        axios.defaults.headers.common.Authorization = `Bearer ${this.token}`
    }

    removeAuthHeader(): void {
        delete axios.defaults.headers.common.Authorization
    }

    /* Session helpers */
    isLoggedIn(): boolean {
        return !!this.token && !!this.refreshToken
    }

    get(resource: string): Promise<any> {
        console.log('Getting data', resource)
        return axios.get(resource).catch(error => this.processRequestError(error));
    }

    post(resource: string, data: object): Promise<any> {
        console.log('Posting data', resource, data)
        return axios.post(resource, data).catch(error => this.processRequestError(error));
    }

    postRaw(resource: string, data: string): Promise<any> {
        console.log('Posting raw data', resource, data)
        return axios.post(resource, data).catch(error => this.processRequestError(error));
    }

    patch(resource: string, data: object): Promise<any> {
        console.log('Patching data', resource, data)
        return axios.patch(resource, data).catch(error => this.processRequestError(error));
    }

    delete(resource: string): Promise<any> {
        console.log('Deleting data', resource)
        return axios.delete(resource).catch(error => this.processRequestError(error));
    }

    request(data: object): Promise<any> {
        return axios(data);
    }

    setSession(token: string, refreshToken: string): void {
        this.token = token;
        this.refreshToken = refreshToken;
        this.setAuthHeader();
        if (INTERCEPTOR_401 === undefined) this.enable401Interceptor();

        console.log('Session successfully updated.');
    }

    removeSession(): void {
        this.token = null;
        this.refreshToken = null;
        this.removeAuthHeader();
        this.disable401Interceptor();

        console.log('Session successfully deleted.');
    }

    // TODO: See - https://medium.com/@sina.alizadeh120/repeating-failed-requests-after-token-refresh-in-axios-interceptors-for-react-js-apps-50feb54ddcbc
    enable401Interceptor(): void {
        INTERCEPTOR_401 = axios.interceptors.response.use(
            response => response,
            (error: any) => {
                if (error.request && error.request.status === 401) {
                    if (error.config.url.includes('/login_check')) {
                        // Login request failed.
                        console.error('[ERROR] 401 Interceptor should not be active if not logged in');
                        throw error;
                    } else if (error.config.url.includes('/token/refresh')) {
                        // Refresh token has failed.
                        console.error('enable401Interceptor :: Refresh token expired or not found')
                        store.commit('user/setCurrentUser', undefined)
                        this.removeSession()
                        throw error;
                    } else {
                        // Try to refresh the token.
                        console.error('Access token expired')
                        return this.refreshExpiredToken()
                            .then((token) => this.request({
                                method: error.config.method,
                                url: error.config.url,
                                data: error.config.data,
                                headers: {
                                    ...error.config.headers,
                                    Authorization: 'Bearer ' + token
                                }
                            }))
                    }
                }
                // If error was not 401 just re-throw.
                throw error;
            },
        );
    }

    disable401Interceptor() {
        axios.interceptors.response.eject(INTERCEPTOR_401 || 0);
        INTERCEPTOR_401 = undefined;
    }

    enableLoadingInterceptors() {
        if (INTERCEPTORS_LOADING_ENABLED) {
            return;
        }
        INTERCEPTORS_LOADING_ENABLED = true;

        // Exclude pure background loading tasks from loading counter flow.
        const ignoreLoadingUrls = [/*'/pusher-auth',*/ '/.well-known/mercure', '/token/refresh'];
        const ignoreEndpoint = (url: string | undefined) => ignoreLoadingUrls.indexOf(url || '') !== -1;

        axios.interceptors.request.use((conf) => {
                // console.log('Request URL', conf.url);
                if (conf.method) {
                    if (conf.method.toUpperCase() === 'GET') {
                        if (ignoreEndpoint(conf.url)) {
                            console.log('Ignore request in loading counter update. URL: ' + conf.url);
                            return conf;
                        }
                        // Increment loading state counter.
                        store.commit('settings/setDataLoading', true);
                    } else {
                        // Increment action state counter.
                        store.commit('settings/setActionInProgress', true);
                    }
                }
                return conf
            },
            (error) => {
                // Reset action state counter.
                // console.log('Request error', error);

                store.commit('settings/setDataLoading', undefined);
                store.commit('settings/setActionInProgress', undefined);
                throw error;
                // return Promise.reject(error);
            });

        axios.interceptors.response.use((response) => {
            // console.log('Response method', response.config.method);

            if (response.config && response.config.method) {
                if (response.config.method.toUpperCase() === 'GET') {
                    if (ignoreEndpoint(response.config.url)) {
                        console.log('Ignore response in loading counter update. URL: ' + response.config.url);
                        return response;
                    }
                    // Decrement loading state counter.
                    store.commit('settings/setDataLoading', false);
                } else {
                    // Decrement action state counter.
                    store.commit('settings/setActionInProgress', false);
                }
            }
            return response;
        }, (error) => {
            if (error.response) {
                console.log('Error', error.response.data);

                if (!this.checkingValidationErrorResponse(error.response)) {
                    console.error('Response error', error.response);
                } else {
                    console.log('Validation error', error.response.data);
                }

                if (error.response.config.method.toUpperCase() === 'GET') {
                    if (!ignoreEndpoint(error.response.config.url)) {
                        console.log('Ignore response in loading counter update. URL: ' + error.response.config.url);
                        store.commit('settings/setDataLoading', false);
                    }
                    store.commit('settings/setDataLoading', false);
                } else {
                    store.commit('settings/setActionInProgress', false);
                }
            } else /* if (error.request) */ {
                // console.log('Response - request error', error.request);

                store.commit('settings/setDataLoading', undefined);
                store.commit('settings/setActionInProgress', undefined);
            }
            throw error;
        });
    }

    refreshExpiredToken(): Promise<AxiosResponse> {
        // If this is the first time the refreshToken has been called, make a request
        // otherwise return the same promise to the caller.
        if (!refreshTokenPromise) {
            // For token refresh request we should remove expired JWT from request header.
            this.removeAuthHeader()
            refreshTokenPromise = this.post('/token/refresh', {refresh_token: this.refreshToken})
                .then((response) => {
                    console.log('Refresh token updated successfully', response);
                    this.setSession(response.data.token, response.data.refresh_token);
                    return Promise.resolve(response.data.token);
                })
                .finally(() => {
                    refreshTokenPromise = undefined;
                });
        }

        return refreshTokenPromise;
    }

    processRequestError(error: RequestError | AxiosError): Promise<RequestError> {
        let code, message

        if (error instanceof AxiosError) {
            console.log('processRequestError - Axios Error', error);
            code = error.request ? error.request.status : 500
            message = error.request ? error.request.statusText : 'Internal Server Error';
        } else {
            console.log('processRequestError - Custom exception', error);
            code = error.code
            message = error.message
        }

        return Promise.reject({
            code,
            message,
        });
    }

    checkingValidationErrorResponse(response: AxiosResponse) {
        if (response.data && response.data && response.data.errors) {
            console.log('Validation errors', response.data.errors)
            response.data.errors.forEach((error: ValidationError) => {
                store.commit('settings/addValidationErrors', error);
            })
            return true;
        }
        return false;
    }
}

import {Commit, Module} from "vuex";
import {AuthorizedHubUrl, MercureHandlerCallback, MercureState, RootState} from "@/store/types";

import {EventSourcePolyfill} from 'event-source-polyfill'

const mercureModule: Module<MercureState, RootState> = {
    namespaced: true,
    state: {
        urlString: '',
        token: '',
        subscriptions: [],
    },
    getters: {
        isHubReady(state): boolean {
            return !!state.urlString && !!state.token
        }
    },
    mutations: {
        setHubUrl(state, authorizedUrl: AuthorizedHubUrl) {
            console.log('setHubUrl mutation', state, authorizedUrl)
            state.urlString = authorizedUrl.url
            state.token = authorizedUrl.token
        },
        addSubscription(state, topic: string) {
            console.log('addSubscription mutation', state, topic)
            if (!state.urlString || !state.token) {
                console.log('DEBUG::ERROR - Add subscription should not be called before Mercure Hub access setup is complete')
                return
            }
            const existing = state.subscriptions.find(s => s.topic === topic)
            if (!existing) {
                // Only add subscription if not yet registered.
                const encoded = encodeURIComponent(topic)
                try {
                    const eventSource = new EventSourcePolyfill(`${state.urlString}?topic=${encoded}`, {
                        withCredentials: false, // TODO: Check this option.
                        headers: {
                            'Authorization': `Bearer ${state.token}`
                        }
                    });
                    state.subscriptions.push({
                        topic,
                        eventSource,
                    })
                } catch (error) {
                    console.error('Error creating Event source', error)
                }
            }
        },
        removeSubscription(state, topic: string) {
            console.log('removeSubscription mutation', state, topic)
            const existingIndex = state.subscriptions.findIndex(s => s.topic === topic)
            if (existingIndex >= 0) {
                state.subscriptions[existingIndex].eventSource?.close()
                state.subscriptions.splice(existingIndex, 1)
            }
        },
        addHandler(state, handler: MercureHandlerCallback) {
            console.log('addHandler mutation', state, handler)
            const subscription = state.subscriptions.find(s => s.topic === handler.topic)
            if (subscription) {
                subscription.eventSource.addEventListener('message', handler.callback)
            }
        },
        removeHandler(state, handler: MercureHandlerCallback) {
            const subscription = state.subscriptions.find(s => s.topic === handler.topic)
            if (subscription) {
                subscription.eventSource.removeEventListener('message', handler.callback)
            }
        }
    },
    actions: {
        setHubUrl({commit}: { commit: Commit }, payload: AuthorizedHubUrl) {
            console.log('setHubUrl action', payload)

            commit('setHubUrl', payload)
        },
        addSubscription({commit}: { commit: Commit }, payload: string) {
            console.log('addSubscription action', payload)

            commit('addSubscription', payload)
        },
        removeSubscription({commit}: { commit: Commit }, payload: string) {
            console.log('removeSubscription action', payload)

            commit('removeSubscription', payload)
        },
        addEventHandler({commit}: { commit: Commit }, payload: MercureHandlerCallback) {
            console.log('addEventHandler action', payload)

            commit('addSubscription', payload.topic)
            commit('addHandler', payload)
        },
        removeEventHandler({commit}: { commit: Commit }, payload: MercureHandlerCallback) {
            console.log('removeEventHandler action', payload)

            commit('removeHandler', payload)
        }

    },
}

export default mercureModule

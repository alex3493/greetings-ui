import BackendService from '@/service/BackendService'
import {GreetingUpdateDTO} from "@/models/types";

import store from '@/store'

export default class GreetingService {

    service: BackendService

    constructor() {
        this.service = new BackendService()
    }

    loadGreetings(limit = 10, offset = 0): Promise<void> {
        return this.service.get(`/greetings?limit=${limit}&offset=${offset}`)
            .then(async (response) => {
                console.log('Service response - greetings', response)

                const hubUrl = response.headers.get('Link').match(/<([^>]+)>;\s+rel=(?:mercure|"[^"]*mercure[^"]*")/)[1];
                await this.discoverMercureHub(hubUrl)

                console.log('Adding Mercure subscription')
                await this.addSubscription()

                store.commit('greeting/setGreetings', response.data.greetings)
            })
            .catch((error) => {
                console.log('Error loading greetings', error)
            })
    }

    loadGreeting(id: string | number): Promise<void> {
        return this.service.get('/greeting/' + id)
            .then(async (response) => {
                console.log('Service response - greeting', response)

                const hubUrl = response.headers.get('Link').match(/<([^>]+)>;\s+rel=(?:mercure|"[^"]*mercure[^"]*")/)[1];
                await this.discoverMercureHub(hubUrl)

                await store.dispatch('greeting/updateGreeting', response.data.greeting)
            })
            .catch((error) => {
                console.log('Error loading greeting ' + id, error)
            })
    }

    createGreeting(greeting: GreetingUpdateDTO): Promise<void> {
        return this.service.post('/greetings', greeting)
            .then(async ({data}) => {
                console.log('Create response - adding greeting to list...', data)
                await store.dispatch('greeting/addGreeting', data.greeting)
            })
            .catch((error) => {
                console.log('Error creating greeting ', error)
                throw error
            })
    }

    updateGreeting(greeting: GreetingUpdateDTO): Promise<void> {
        return this.service.patch(`/greeting/${greeting.id}`, greeting)
            .then(async ({data}) => {
                console.log('Update response', data)
                await store.dispatch('greeting/updateGreeting', data.greeting)
            })
            .catch((error) => {
                console.log('Error loading greeting ' + greeting.id, error)
                throw error
            })
    }

    async deleteGreeting(id: string | number): Promise<void> {
        return this.service.delete(`/greeting/${id}`)
            .then(async ({data}) => {
                console.log('Delete response', data)
                await store.dispatch('greeting/deleteGreeting', id)
            })
            .catch((error) => {
                console.log('Error deleting greeting ' + id, error)
                throw error
            })
    }

    async addSubscription(greetingId?: string | number | undefined): Promise<void> {
        console.log('Add subscription', greetingId)
        if (!store.getters['mercure/isHubReady']) {
            return Promise.reject(new Error('You must be authorized in Mercure Hub'))
        }
        if (!greetingId) {
            await store.dispatch('mercure/addEventHandler', {
                topic: 'https://symfony.test/greetings',
                callback: (event: MessageEvent) => {
                    const data = JSON.parse(event.data)
                    console.log('Received message', data);

                    const currentUser = store.getters['user/getCurrentUser'];

                    // Make sure we have current user in store, otherwise, do nothing.
                    if (currentUser && data.causer) {
                        // Reserved: If this update was caused by current user, there is noting to do here.
                        // if (currentUser.id !== data.causer.id) {
                        if (data.reason === 'create') {
                            store.commit('greeting/addGreeting', data.greeting)
                        }
                        if (data.reason === 'update') {
                            store.commit('greeting/updateGreeting', data.greeting)
                        }
                        if (data.reason === 'delete') {
                            store.commit('greeting/deleteGreeting', data.greeting.id)
                        }
                        // }
                    }
                }
            }, {root: true})
        } else {
            await store.dispatch('mercure/addEventHandler', {
                topic: 'https://symfony.test/greeting/' + greetingId,
                callback: (event: MessageEvent) => {
                    const data = JSON.parse(event.data)
                    console.log('Received message for greeting' + greetingId, data);

                    if (data.reason === 'update' || data.reason === 'delete') {
                        store.commit('greeting/registerGreetingUpdate', data)
                    }
                }
            }, {root: true})
        }
    }

    removeSubscription(greetingId: string | number | undefined = undefined): void {
        console.log('Remove subscription', greetingId)
        const topic = greetingId ? 'https://symfony.test/greeting/' + greetingId : 'https://symfony.test/greetings'
        store.commit('mercure/removeSubscription', topic, {root: true})
    }

    authorizeMercureHub() {
        return this.service.get('/mercure-auth')
            .then(({data}) => {
                console.log('Service response - auth', data)
                return Promise.resolve(data);
            })
            .catch(async (error) => {
                return Promise.reject(new Error('Error authorizing mercure updates ' + error.message));
            })
    }

    async discoverMercureHub(hubUrl: string): Promise<void> {
        console.log('Discovered link', hubUrl);

        if (!store.getters['mercure/isHubReady']) {
            try {
                const data = await this.authorizeMercureHub()
                await store.dispatch('mercure/setHubUrl', {
                    url: hubUrl,
                    token: data.token,
                }, {root: true})
            } catch (error) {
                console.log('Error authorizing mercure hub', error)
            }
        }
    }

    async sendAdminGreeting(greeting: string) {
        console.log('Sending greeting...', greeting)
        return this.service.post('/admin-greeting', {
            greeting
        })
            .then(({data}) => {
                console.log('Admin greeting response', data)
                return data
            })
            .catch(async (error) => {
                return Promise.reject(new Error('Error sending admin greeting ' + error.message));
            })
    }

}


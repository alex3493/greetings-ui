import BackendService from '@/service/BackendService'
import store from "@/store";

export default class ProfileService {
    service: BackendService

    constructor() {
        this.service = new BackendService()
    }

    loadProfile(): void {
        this.service.get('/dashboard')
            .then(async ({data}) => {
                console.log('Service response - profile', data)

                await store.dispatch('user/setCurrentUser', data.user)
            })
            .catch(async (error) => {
                console.log(error)
            });

    }
}

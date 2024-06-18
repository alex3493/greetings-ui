import BackendService from "@/service/BackendService";
import store from '@/store'
import {UserProfileForm, UserUpdatePasswordForm} from "@/models/types";

export default class UserService {
    service: BackendService

    constructor() {
        this.service = new BackendService()
    }

    async logout(): Promise<void> {
        try {
            await this.service.post('/account/me/logout', {})
            this.service.removeSession()
            store.commit('user/setCurrentUser', undefined)
            // await router.push('/login')
        } catch (error) {
            console.log('Error caught in logout view', error)
        } finally {
            this.service.removeSession()
            store.commit('user/setCurrentUser', undefined)
        }
    }

    async logoutDevice(tokenId: string): Promise<void> {
        try {
            const {data} = await this.service.delete(`/account/logout/${tokenId}`)

            console.log('logoutDevice response', data)

            store.commit('user/setCurrentUser', data.user)
        } catch (error) {
            console.log('Error logging out from device', error)
        }
    }

    async signOut(): Promise<void> {
        try {
            const {data} = await this.service.post('/account/me/sign-out', {})

            console.log('signOut response', data)

            store.commit('user/setCurrentUser', data.user)
        } catch (error) {
            console.log('Error logging out from device', error)
        }
    }

    async updateProfile(profileData: UserProfileForm): Promise<void> {
        try {
            const {data} = await this.service.patch('/account/me/update', profileData)

            console.log('updateProfile response', data)

            store.commit('user/setCurrentUser', data.user)
        } catch (error) {
            console.log(error)
        }
    }

    async updatePassword(passwordData: UserUpdatePasswordForm) {
        try {
            const {data} = await this.service.patch('/account/me/change-password', passwordData)

            console.log('updatePassword response', data)
        } catch (error) {
            console.log(error)
        }
    }
}

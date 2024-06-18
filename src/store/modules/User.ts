import UserModel from "@/models/UserModel";
import {Commit, Module} from "vuex";
import {RootState, UserState} from "@/store/types";

const userModule: Module<UserState, RootState> = {
    namespaced: true,
    state: {
        user: undefined
    },
    getters: {
        getCurrentUser(state: UserState): UserModel | undefined {
            return state.user
        },
        isLoggedIn(state: UserState): boolean {
            return !!state.user
        },
        isAdminUser(state: UserState) {
            // return state.user?.roles.some(r => r === 'ROLE_ADMIN')
            return state.user?.role === 'ROLE_ADMIN'
        }
    },
    mutations: {
        setCurrentUser(state: UserState, payload: UserModel | undefined): void {
            state.user = payload
        }
    },
    actions: {
        setCurrentUser({commit}: { commit: Commit }, payload: UserModel | undefined): void {
            console.log('Set user payload', payload)
            commit('setCurrentUser', payload ? new UserModel(payload) : undefined)
        }
    }
}

export default userModule

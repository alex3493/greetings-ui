import GreetingModel from "@/models/GreetingModel";
import {Commit, Module} from "vuex";
import {GreetingsState, GreetingUpdate, RootState} from "@/store/types";
import {GreetingUpdateDTO} from "@/models/types";

const greetingModule: Module<GreetingsState, RootState> = {
    namespaced: true,
    state: {
        greetings: [],
        greetingUpdates: [],
    },
    getters: {
        getGreetings(state): GreetingModel[] {
            return state.greetings.map(g => new GreetingModel(g));
        },
        getGreetingSorted(state): GreetingModel[] {
            return state.greetings.map(g => new GreetingModel(g))
                .sort((a: GreetingModel, b: GreetingModel): number => {
                    const compareA = a.updated_at === undefined ? new Date(a.created_at) : new Date(a.updated_at);
                    const compareB = b.updated_at === undefined ? new Date(b.created_at) : new Date(b.updated_at);
                    if (compareA < compareB) {
                        return 1
                    }
                    if (compareA > compareB) {
                        return -1
                    }
                    return 0
                })
        },
        hasUpdate: (state) => (id: string): boolean => {
            return state.greetingUpdates.find(g => g.greeting.id === id && g.reason === 'update') !== undefined;
        },
        hasDeletionUpdate: (state) => (id: string): boolean => {
            return state.greetingUpdates.find(g => g.greeting.id === id && g.reason === 'delete') !== undefined;
        },
    },
    mutations: {
        setGreetings(state, payload: GreetingModel[]): void {
            console.log('setGreetings mutation', payload)
            state.greetings = payload.map(p => new GreetingModel(p))
        },
        addGreeting(state, payload: GreetingModel): void {
            const newGreeting = new GreetingModel(payload)
            if (newGreeting.isValidId() && !state.greetings.find(g => g.id === newGreeting.id)) {
                state.greetings.unshift(newGreeting)
                // TODO: not sure we are fine with just keeping track of 10 recent greetings.
                // We may implement a paginated list here.
                state.greetings = state.greetings.slice(0, 10)
            }
        },
        updateGreeting(state, payload: GreetingModel): void {
            const updatedGreeting = new GreetingModel(payload)
            const index = state.greetings.findIndex(g => g.id === updatedGreeting.id)
            if (index >= 0) {
                state.greetings.splice(index, 1, updatedGreeting)
            }
        },
        deleteGreeting(state, payload: string): void {
            const index = state.greetings.findIndex(g => g.id === payload)
            if (index >= 0) {
                state.greetings.splice(index, 1)
            }
        },
        registerGreetingUpdate(state, payload: GreetingUpdate): void {
            const index = state.greetingUpdates.findIndex(g => g.greeting.id === payload.greeting.id)
            if (index >= 0) {
                state.greetingUpdates.splice(index, 1, payload)
            } else {
                state.greetingUpdates.push(payload)
            }
        },
        removeUpdate: (state, payload: string): void => {
            const updateIndex = state.greetingUpdates.findIndex(g => g.greeting.id === payload)
            if (updateIndex >= 0) {
                state.greetingUpdates.splice(updateIndex, 1)
            }
        },
        // TODO: check array filter return value (shallow copy) - does it fit right here?
        checkAndRemoveOrphanUpdates(state) {
            const currentGreetingIds = state.greetings.map(g => g.id)
            state.greetingUpdates = state.greetingUpdates.filter(u => currentGreetingIds.indexOf(u.greeting.id) >= 0)
        },
    },
    actions: {
        setGreetings({commit}: { commit: Commit }, payload: GreetingModel[]) {
            console.log('Set greetings payload', payload)
            commit('setGreetings', payload)
        },
        addGreeting({commit}: { commit: Commit }, payload: GreetingModel) {
            console.log('Add greeting payload', payload)
            commit('addGreeting', payload)
            commit('checkAndRemoveOrphanUpdates')
        },
        updateGreeting({commit}: { commit: Commit }, payload: GreetingModel) {
            console.log('Update greeting payload', payload)
            commit('updateGreeting', payload)
        },
        deleteGreeting({commit}: { commit: Commit }, payload: string) {
            console.log('Delete greeting payload', payload)
            commit('deleteGreeting', payload)
        },
        consumeUpdate({commit, state}: {
            commit: Commit,
            state: GreetingsState
        }, payload: string): Promise<GreetingUpdateDTO> {
            console.log('Consume update payload', payload)

            const update = state.greetingUpdates.find(g => g.greeting.id === payload)
            if (update !== undefined) {
                commit('removeUpdate', payload)

                return Promise.resolve({
                    id: update.greeting.id,
                    text: update.greeting.text,
                    variant: update.greeting.variant.name
                })
            } else {
                return Promise.reject(new Error('Greeting update data not found'))
            }
        }
    },
}

export default greetingModule

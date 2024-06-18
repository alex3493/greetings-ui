import {Module} from "vuex";
import {RootState, SettingsState, ValidationError} from "@/store/types";

const loadingTimeoutLimit = 15000;

const settingsModule: Module<SettingsState, RootState> = {
    namespaced: true,
    state: {
        dataLoadingCount: 0,
        actionInProgressCount: 0,
        rescueLoadingTimeout: undefined,
        rescueActionTimeout: undefined,
        validationErrors: []

    },
    getters: {
        isBusy(state: SettingsState): boolean {
            return state.dataLoadingCount + state.actionInProgressCount > 0
        },
        isLoading(state: SettingsState): boolean {
            return state.dataLoadingCount > 0
        },
        isActionInProgress(state: SettingsState): boolean {
            return state.actionInProgressCount > 0
        },
        getValidationErrors(state: SettingsState): ValidationError[] {
            return state.validationErrors
        },
    },
    mutations: {
        setDataLoading(state, value: boolean | undefined) {
            const rescueResetCount = () => {
                if (state.dataLoadingCount > 0) {
                    console.log('Panic: stalled in loading state');
                    state.dataLoadingCount = 0;
                }
            };
            // Reinitialize timeout if we have activity.
            window.clearTimeout(state.rescueLoadingTimeout);
            state.rescueLoadingTimeout = window.setTimeout(rescueResetCount, loadingTimeoutLimit);

            if (true === value) {
                state.dataLoadingCount += 1
            } else if (false === value) {
                state.dataLoadingCount -= 1
            } else {
                state.dataLoadingCount = 0
            }
            if (state.dataLoadingCount < 0) {
                state.dataLoadingCount = 0
            }
        },
        setActionInProgress(state, value: boolean | undefined) {
            const rescueResetCount = () => {
                if (state.actionInProgressCount > 0) {
                    console.log('Panic: stalled in loading state');
                    state.actionInProgressCount = 0;
                }
            };
            // Reinitialize timeout if we have activity.
            window.clearTimeout(state.rescueActionTimeout);
            state.rescueActionTimeout = window.setTimeout(rescueResetCount, loadingTimeoutLimit);

            if (true === value) {
                state.actionInProgressCount += 1
            } else if (false === value) {
                state.actionInProgressCount -= 1
            } else {
                state.actionInProgressCount = 0
            }
            if (state.actionInProgressCount < 0) {
                state.actionInProgressCount = 0
            }
        },
        addValidationErrors(state, payload: ValidationError) {
            const existingIndex = state.validationErrors.findIndex(e => e.context === payload.context && e.property === payload.property)

            if (existingIndex >= 0) {
                state.validationErrors.splice(existingIndex, 1, payload)
            } else {
                state.validationErrors.push(payload)
            }
        },
        removeValidationErrors(state, payload: ValidationError) {
            state.validationErrors = state.validationErrors.filter(e => e.context !== payload.context || e.property !== payload.property)
        },
        removeValidationErrorsForContext(state, payload: string) {
            state.validationErrors = state.validationErrors.filter(e => e.context !== payload)
        }
    },
}

export default settingsModule

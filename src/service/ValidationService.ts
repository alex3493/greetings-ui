import {ValidationError} from "@/store/types";
import store from '@/store'
import {computed} from "vue";

export default class ValidationService {

    context?: string;

    constructor(context?: string) {
        this.context = context;
    }

    propertyErrors(property: string, context?: string) {
        context = context || this.context
        const errors = computed(() => store.getters['settings/getValidationErrors'])

        return errors.value
            .filter((e: ValidationError) => e.property === property && e.context === context)
            .flatMap((e: ValidationError) => e.errors)
    }

    removeErrors(property: string, context?: string) {
        context = context || this.context
        store.commit('settings/removeValidationErrors', {
            property, context
        })
    }

    removeErrorsForContext(context?: string) {
        context = context || this.context
        store.commit('settings/removeValidationErrorsForContext', context)
    }

}

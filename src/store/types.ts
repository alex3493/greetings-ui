import UserModel from "@/models/UserModel";
import GreetingModel from "@/models/GreetingModel";
import {GreetingAuthor} from "@/models/types";

export interface RootState {
    status: string;
}

export interface UserState {
    user: UserModel | undefined;
}

export interface GreetingUpdate {
    greeting: GreetingModel
    reason: string
    // User who updated or deleted the greeting.
    causer: GreetingAuthor
}

export interface GreetingsState {
    greetings: GreetingModel[],
    greetingUpdates: GreetingUpdate[],
}

interface Subscription {
    topic: string,
    eventSource: EventSource
}

export interface MercureHandlerCallback {
    topic: string,
    callback: (event: Event) => void
}

export interface AuthorizedHubUrl {
    url: string,
    token: string
}

export interface MercureState {
    urlString: string
    token: string
    subscriptions: Subscription[]
}

export interface ValidationError {
    property: string
    context: string
    errors: string[]
}

export interface SettingsState {
    dataLoadingCount: number
    actionInProgressCount: number
    rescueLoadingTimeout: number | undefined
    rescueActionTimeout: number | undefined
    validationErrors: ValidationError[]
}

export interface RequestError {
    code: number,
    message: string
}

import {createLogger, createStore} from 'vuex'
import userModule from './modules/User'
import greetingModule from "@/store/modules/Greeting";
import mercureModule from "@/store/modules/Mercure";
import settingsModule from "@/store/modules/Settings";

import VuexPersistence from 'vuex-persist'

const vuexLocal = new VuexPersistence({
    storage: window.localStorage,
    modules: ['user']
})

const storePlugins = process.env.NODE_ENV !== 'production'
    ? [createLogger()]
    : []
storePlugins.push(vuexLocal.plugin)

const store = createStore({
    modules: {
        user: userModule,
        greeting: greetingModule,
        mercure: mercureModule,
        settings: settingsModule
    },
    plugins: storePlugins
})

export default store


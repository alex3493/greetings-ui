import Pusher, {ChannelAuthorizationCallback} from 'pusher-js'
import BackendService from '@/service/BackendService'

export default class PusherService {
    static pusher: Pusher | undefined = undefined

    static shared() {
        if (PusherService.pusher === undefined) {
            PusherService.pusher = new Pusher(process.env.VUE_APP_PUSHER_APP_KEY, {
                authorizer: ({name}) => ({
                    authorize: async (socketId: string, callback: ChannelAuthorizationCallback) => {
                        const channel_name = `channel_name=${name}`
                        const socket_id = `socket_id=${socketId}`
                        try {
                            const service = new BackendService()
                            const {data} = await service.postRaw('/pusher-auth', `${socket_id}&${channel_name}`)
                            callback(null, {auth: data.auth})
                        } catch (e) {
                            callback(new Error('Pusher authorization failed'), null)
                        }
                    }
                }),
                cluster: process.env.VUE_APP_PUSHER_CLUSTER,
            })
        }

        return PusherService.pusher
    }

}

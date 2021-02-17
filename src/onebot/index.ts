import axios, { AxiosInstance } from "axios";
import genUid from "../utils/uid";
import { BaseMessage, CQMessage, MessageMessage, PostType, SubMessageType } from "./messages";
import type { OneBot } from "./types";

export enum ConnectMethod {
    WebSocket,
    HttpPost
}

class NoConnectedError extends Error {
    constructor() {
        super('This onebot isn\'t connected to any backend.')
    }
}
export class OneBotWS extends EventTarget {
    connected: boolean = false

    private connectMethod: ConnectMethod = ConnectMethod.WebSocket
    private ws?: WebSocket = undefined
    private accessToken: string = ''
    private promises: { [key: string]: [Function, Function] } = {}
    private host: string = '';
    private postClient: AxiosInstance

    constructor() {
        super()
        this.postClient = axios.create()
    }

    connect(method: ConnectMethod, host: string, accessToken = '') {
        if (this.connected) this.disconnect()
        this.accessToken = accessToken
        this.connectMethod = method
        this.host = host
        if (method === ConnectMethod.WebSocket)
            this.connectWebSocket()
        else if (method === ConnectMethod.HttpPost)
            this.setupHttpPost()
    }

    setupHttpPost() {
        if (this.accessToken.length > 0)
            this.postClient = axios.create({
                headers: {
                    authorization: 'Bearer ' + this.accessToken
                }
            })
        else
            this.postClient = axios.create({
                withCredentials: true
            })

        this.sendAndEmit('get_login_info', 'getLoginInfo')
        this.sendAndEmit('get_version_info', 'getVersionInfo')
        this.sendAndEmit('get_friend_list', 'getFriendList')
        this.sendAndEmit('get_group_list', 'getGroupList')
    }

    private connectWebSocket() {
        this.ws = new WebSocket(this.host)
        this.registerEvents()
        this.ws.addEventListener('open', () => {
            this.connected = true
            this.dispatchEvent(new CustomEvent('ws.open'))
            this.sendAndEmit('get_login_info', 'getLoginInfo')
            this.sendAndEmit('get_version_info', 'getVersionInfo')
            this.sendAndEmit('get_friend_list', 'getFriendList')
            this.sendAndEmit('get_group_list', 'getGroupList')
        })
        this.ws.addEventListener('message', e => {
            try {
                const data: OneBot.ActionResultStruct<any> = JSON.parse(e.data)
                this.parseMessage(data)
            } catch (err) {
                console.error('Can\'t parse socket data', e.data, err)
            }
        })
        this.ws.addEventListener('close', () => {

        })
        this.ws.addEventListener('error', (evt) => {

        })
    }

    private log(...args: any[]) {
        switch (this.connectMethod) {
            case ConnectMethod.HttpPost:
                console.log('[OneBot HTTP POST]', ...args)
                break
            case ConnectMethod.WebSocket:
                console.log('[OneBot WEBSOCKET]', ...args)
                break
        }
    }

    disconnect() {
        if (!this.connected) return
        if (this.ws) {
            this.ws.close()
            this.ws = undefined
        }
        this.connected = false
    }

    private parseMessage(data: OneBot.ActionResultStruct<any>) {
        this.log(data)
        if (data.echo) {
            if (data.echo in this.promises) {
                const [resolve, reject] = this.promises[data.echo]
                resolve(data)
                delete this.promises[data.echo]
            }
        }
        // Is base message
        if ('post_type' in data) {
            const baseMsg = data as BaseMessage
            switch (baseMsg.post_type) {
                case PostType.Message: {
                    const msg = baseMsg as MessageMessage
                    this.dispatchEvent(new CustomEvent('userMessage', {
                        detail: msg
                    }))
                    break
                }
                case PostType.MetaEvent:
                case PostType.Request:
                case PostType.MetaEvent: {
                    break
                }
                default: {
                    console.warn('Unknown post type', baseMsg.post_type)
                }
            }
        }
    }

    private sendJson(obj: any) {
        if (!this.ws) throw new NoConnectedError()
        this.ws.send(JSON.stringify(obj))
    }

    async sendAndEmit<T = OneBot.Action>(action: T, eventName: string, data?: OneBot.BaseParam<T>) {
        await this.send(action, data).then(v => {
            this.dispatchEvent(new CustomEvent(eventName, {
                detail: v
            }))
        })
    }

    send<T = OneBot.Action>(action: T, data?: OneBot.BaseParam<T>): Promise<OneBot.ActionResultStruct<T>> {
        if (this.connectMethod === ConnectMethod.WebSocket)
            return new Promise((resolve, reject) => {
                if (!this.ws) return reject(new NoConnectedError())
                const uid = genUid()
                this.promises[uid] = [resolve, reject]
                const msg = {
                    action,
                    params: data || [],
                    echo: uid
                }
                this.log('Send', msg)
                this.ws.send(JSON.stringify(msg))
            })
        else if (this.connectMethod === ConnectMethod.HttpPost)
            return (async () => {
                this.log('Send', this.getMethodURL(action))
                const result = await this.postClient.post(this.getMethodURL(action), data)
                return result.data as OneBot.ActionResultStruct<T>
            })()
        else
            throw new NoConnectedError()
    }

    private getMethodURL<T = OneBot.Action>(method: T): string {
        if (this.host[this.host.length - 1] === '/') {
            return this.host + method
        } else {
            return this.host + '/' + method
        }
    }

    async sendPrivateMsg(userId: number, message: string, autoEscape = false) {
        const v = await this.send('send_private_msg', {
            user_id: userId,
            message,
            auto_escape: autoEscape
        });
        return v.data.message_id as string;
    }

    async sendGroupMsg(groupId: number, message: string, autoEscape = false) {
        const v = await this.send('send_group_msg', {
            group_id: groupId,
            message,
            auto_escape: autoEscape
        });
        return v.data.message_id as string;
    }

    async getMessageByID(messageId: string) {
        return this.send('get_msg', {
            message_id: messageId
        })
    }

    private registerEvents() {

    }
}

export const onebot = new OneBotWS()

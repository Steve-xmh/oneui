import genUid from "../utils/uid";
import { BaseMessage, MessageMessage, PostType, SubMessageType } from "./messages";
import type { OneBot } from "./types";

export class OneBotWS extends EventTarget {
    ws: WebSocket
    promises: {[key: string]: [Function, Function]} = {}
    constructor (host: string) {
        super()
        // Authorization
        this.ws = new WebSocket(host)
        this.registerEvents()
        this.ws.addEventListener('open', e => {
            this.dispatchEvent(new CustomEvent('ws.open'))
            this.sendAndEmit('get_login_info', 'getLoginInfo')
            this.sendAndEmit('get_version_info', 'getVersionInfo')
            this.sendAndEmit('get_friend_list', 'getFriendList')
            this.sendAndEmit('get_group_list', 'getGroupList')
        })
        this.ws.addEventListener('message', e => {
            try {
                const data: OneBot.ActionResultStruct<any> = JSON.parse(e.data)
                console.log('[OneBot WS]', data)
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
                    switch(baseMsg.post_type) {
                        case PostType.Message: {
                            const msg = baseMsg as MessageMessage
                            this.dispatchEvent(new CustomEvent('userMessage', {
                                detail: msg
                            }))
                            break
                        }
                        case PostType.MetaEvent: {
                            break
                        }
                        case PostType.Request: {
                            break
                        }
                        case PostType.MetaEvent: {
                            break
                        }
                        default: {
                            console.warn('Unknown post type', baseMsg.post_type)
                        }
                    }
                }
            } catch (err) {
                console.error('Can\'t parse socket data', e.data, err)
            }
        })
    }

    private sendJson(obj: any) {
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
        return new Promise((resolve, reject) => {
            const uid = genUid()
            this.promises[uid] = [resolve, reject]
            const msg = {
                action,
                params: data || [],
                echo: uid
            }
            console.log('OneBot WS', 'Send', msg)
            this.ws.send(JSON.stringify(msg))
        })
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

    private registerEvents() {

    }
}
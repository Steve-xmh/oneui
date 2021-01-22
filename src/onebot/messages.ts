export enum PostType {
    Message = 'message',
    Notice = 'notice',
    Request = 'request',
    MetaEvent = 'meta_event',
}

export interface CQMessage {
    type: string,
    data: any
}

export interface BaseMessage {
    time: number
    self_id: number
    post_type: PostType
}

export enum MessageType {
    Private = 'private',
    Group = 'group'
}

export enum SubMessageType {
    // Only in private
    /** 私聊 - 好友会话 */
    Friend = 'friend',
    /** 私聊 - 群临时会话 */
    Group = 'group',
    /** 私聊 - 其他 */
    Other = 'other',
    // Only in group
    /** 群聊 - 正常消息 */
    Normal = 'normal',
    /** 群聊 - 匿名信息 */
    Anonymous = 'anonymous',
    /** 群聊 - 系统提示 */
    Notice = 'notice'
}

export interface Sender {
    user_id: number
    nickname: string
    sex: string
    age: number
}

export interface MessageMessage extends BaseMessage {
    post_type: PostType.Message
    message_type: MessageType.Private
    sub_type: SubMessageType
    message_id: number
    user_id: number
    message: string
    raw_message: string
    font: number
    sender: Sender
}

export interface GroupMessage extends BaseMessage {
    post_type: PostType.Message
    message_type: MessageType.Group

    group_id: number
    anonymous: number

    sub_type: SubMessageType
    message_id: number
    user_id: number
    message: string
    raw_message: string
    font: number
    sender: Sender
}

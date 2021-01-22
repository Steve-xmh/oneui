export namespace OneBot {
    export namespace Actions {
        export type SendPrivateMsgAction = 'send_private_msg'
        export type SendGroupMsgAction = 'send_group_msg'
        export type SendMsgAction = 'send_msg'
        export type DeleteMsgAction = 'delete_msg'
        export type GetMsgAction = 'get_msg'
        export type GetForwardMsgAction = 'get_forward_msg'
        export type SendLikeAction = 'send_like'
        export type SetGroupKickAction = 'set_group_kick'
        export type SetGroupBanAction = 'set_group_ban'
        export type SetGroupAnonymousBanAction = 'set_group_anonymous_ban'
        export type SetGroupWholeBanAction = 'set_group_whole_ban'
        export type SetGroupAdminAction = 'set_group_admin'
        export type SetGroupAnonymousAction = 'set_group_anonymous'
        export type SetGroupCardAction = 'set_group_card'
        export type SetGroupNameAction = 'set_group_name'
        export type SetGroupLeaveAction = 'set_group_leave'
        export type SetGroupSpecialTitleAction = 'set_group_special_title'
        export type SetFriendAddRequestAction = 'set_friend_add_request'
        export type SetGroupAddRequestAction = 'set_group_add_request'
        export type GetLoginInfoAction = 'get_login_info'
        export type GetStrangerInfoAction = 'get_stranger_info'
        export type GetFriendListAction = 'get_friend_list'
        export type GetGroupInfoAction = 'get_group_info'
        export type GetGroupListAction = 'get_group_list'
        export type GetGroupMemberInfoAction = 'get_group_member_info'
        export type GetGroupMemberListAction = 'get_group_member_list'
        export type GetGroupHonorInfoAction = 'get_group_honor_info'
        export type GetCookiesAction = 'get_cookies'
        export type GetCsrfTokenAction = 'get_csrf_token'
        export type GetCredentialsAction = 'get_credentials'
        export type GetRecordAction = 'get_record'
        export type GetImageAction = 'get_image'
        export type CanSendImageAction = 'can_send_image'
        export type CanSendRecordAction = 'can_send_record'
        export type GetStatusAction = 'get_status'
        export type GetVersionInfoAction = 'get_version_info'
        export type SetRestartAction = 'set_restart'
        export type CleanCacheAction = 'clean_cache'
    }
    export type Action = Actions.SendPrivateMsgAction |
        Actions.SendGroupMsgAction |
        Actions.SendMsgAction |
        Actions.DeleteMsgAction |
        Actions.GetMsgAction |
        Actions.GetForwardMsgAction |
        Actions.SendLikeAction |
        Actions.SetGroupKickAction |
        Actions.SetGroupBanAction |
        Actions.SetGroupAnonymousBanAction |
        Actions.SetGroupWholeBanAction |
        Actions.SetGroupAdminAction |
        Actions.SetGroupAnonymousAction |
        Actions.SetGroupCardAction |
        Actions.SetGroupNameAction |
        Actions.SetGroupLeaveAction |
        Actions.SetGroupSpecialTitleAction |
        Actions.SetFriendAddRequestAction |
        Actions.SetGroupAddRequestAction |
        Actions.GetLoginInfoAction |
        Actions.GetStrangerInfoAction |
        Actions.GetFriendListAction |
        Actions.GetGroupInfoAction |
        Actions.GetGroupListAction |
        Actions.GetGroupMemberInfoAction |
        Actions.GetGroupMemberListAction |
        Actions.GetGroupHonorInfoAction |
        Actions.GetCookiesAction |
        Actions.GetCsrfTokenAction |
        Actions.GetCredentialsAction |
        Actions.GetRecordAction |
        Actions.GetImageAction |
        Actions.CanSendImageAction |
        Actions.CanSendRecordAction |
        Actions.GetStatusAction |
        Actions.GetVersionInfoAction |
        Actions.SetRestartAction |
        Actions.CleanCacheAction
    export interface ActionStruct<T = Action> {
        action: Action
        params: BaseParam<T>
        echo?: string
    }
    export interface BaseParam<T = Action> {}
    export interface ActionResultStruct<T = Action> {
        status: 'ok' | 'async' | 'failed'
        retcode: 0 | 1 | 1400 | 1401 | 1403 | 1404
        data: any,
        echo?: string
    }
    export interface GetFriendListActionResult extends ActionResultStruct {
        data: {
            user_id: number,
            nickname: string,
            remark: string
        }[]
    }
    export interface GetVersionInfoActionResult extends ActionResultStruct<Actions.GetVersionInfoAction> {
        data: {
            app_name: string,
            app_version: string,
            protocol_version: string
        }
    }
}
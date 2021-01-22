const list = [
'send_private_msg' ,
'send_group_msg' ,
'send_msg' ,
'delete_msg' ,
'get_msg' ,
'get_forward_msg' ,
'send_like' ,
'set_group_kick' ,
'set_group_ban' ,
'set_group_anonymous_ban' ,
'set_group_whole_ban' ,
'set_group_admin' ,
'set_group_anonymous' ,
'set_group_card' ,
'set_group_name' ,
'set_group_leave' ,
'set_group_special_title' ,
'set_friend_add_request' ,
'set_group_add_request' ,
'get_login_info' ,
'get_stranger_info' ,
'get_friend_list' ,
'get_group_info' ,
'get_group_list' ,
'get_group_member_info' ,
'get_group_member_list' ,
'get_group_honor_info' ,
'get_cookies' ,
'get_csrf_token' ,
'get_credentials' ,
'get_record' ,
'get_image' ,
'can_send_image' ,
'can_send_record' ,
'get_status' ,
'get_version_info' ,
'set_restart' ,
'clean_cache']

const result = []

for (const item of list)
{
    const splited = item.split('_')
    result.push('Actions.' + splited.map(v => v[0].toUpperCase() + v.substring(1)).join('') + 'Action |')
}

console.log(result.join('\n'))
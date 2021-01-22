export default [
    {
        name: 'send_private_msg',
        desc: '发送私聊消息',
        params: [
            {
                field: 'user_id',
                type: 'number',
                defaultValue: '-',
                desc: '对方 QQ 号'
            },
            {
                field: 'message',
                type: 'message',
                defaultValue: '-',
                desc: '要发送的内容'
            },
            {
                field: 'auto_escape',
                type: 'boolean',
                defaultValue: 'false',
                desc: '消息内容是否作为纯文本发送（即不解析 CQ 码），只在 message 字段是字符串时有效'
            }
        ],
        results: [
            {
                field: 'message_id',
                type: 'number (int32)',
                desc: '消息 ID'
            }
        ]
    },
    {
        name: 'send_group_msg',
        desc: '发送群消息',
        params: [
            {
                field: 'group_id',
                type: 'number',
                defaultValue: '-',
                desc: '群号'
            },
            {
                field: 'message',
                type: 'message',
                defaultValue: '-',
                desc: '要发送的内容'
            },
            {
                field: 'auto_escape',
                type: 'boolean',
                defaultValue: 'false',
                desc: '消息内容是否作为纯文本发送（即不解析 CQ 码），只在 message 字段是字符串时有效'
            }
        ],
        results: [
            {
                field: 'message_id',
                type: 'number (int32)',
                desc: '消息 ID'
            }
        ]
    },
    {
        name: 'send_msg',
        desc: '发送消息',
        params: [
            {
                field: 'message_type',
                type: 'string',
                defaultValue: '-',
                desc: '消息类型，支持 private、group，分别对应私聊、群组，如不传入，则根据传入的 *_id 参数判断'
            },
            {
                field: 'user_id',
                type: 'number',
                defaultValue: '-',
                desc: '对方 QQ 号（消息类型为 private 时需要）'
            },
            {
                field: 'group_id',
                type: 'number',
                defaultValue: '-',
                desc: '群号（消息类型为 group 时需要）'
            },
            {
                field: 'message',
                type: 'message',
                defaultValue: '-',
                desc: '要发送的内容'
            },
            {
                field: 'auto_escape',
                type: 'boolean',
                defaultValue: 'false',
                desc: '消息内容是否作为纯文本发送（即不解析 CQ 码），只在 message 字段是字符串时有效'
            }
        ],
        results: [
            {
                field: 'message_id',
                type: 'number (int32)',
                desc: '消息 ID'
            }
        ]
    },
    {
        name: 'delete_msg',
        desc: '撤回消息',
        params: [
            {
                field: 'message_id',
                type: 'number (int32)',
                defaultValue: '-',
                desc: '消息 ID'
            }
        ],
        results: []
    },
    {
        name: 'get_msg',
        desc: '获取消息',
        params: [
            {
                field: 'message_id',
                type: 'number (int32)',
                defaultValue: '',
                desc: '消息 ID'
            }
        ],
        results: [
            {
                field: 'time',
                type: 'number (int32)',
                desc: '发送时间'
            },
            {
                field: 'message_type',
                type: 'string',
                desc: '消息类型，同 消息事件'
            },
            {
                field: 'message_id',
                type: 'number (int32)',
                desc: '消息 ID'
            },
            {
                field: 'real_id',
                type: 'number (int32)',
                desc: '消息真实 ID'
            },
            {
                field: 'sender',
                type: 'object',
                desc: '发送人信息，同 消息事件'
            },
            {
                field: 'message',
                type: 'message',
                desc: '消息内容'
            }
        ]
    },
    {
        name: 'get_forward_msg',
        desc: '获取合并转发消息',
        params: [
            {
                field: 'id',
                type: 'string',
                defaultValue: '',
                desc: '合并转发 ID'
            }
        ],
        results: [
            {
                field: 'message',
                type: 'message',
                desc: '消息内容，使用 消息的数组格式 表示，数组中的消息段全部为 node 消息段'
            }
        ]
    },
    {
        name: 'send_like',
        desc: '发送好友赞',
        params: [
            {
                field: 'user_id',
                type: 'number',
                defaultValue: '-',
                desc: '对方 QQ 号'
            },
            {
                field: 'times',
                type: 'number',
                defaultValue: '1',
                desc: '赞的次数，每个好友每天最多 10 次'
            }
        ],
        results: []
    },
    {
        name: 'set_group_kick',
        desc: '群组踢人',
        params: [
            {
                field: 'group_id',
                type: 'number',
                defaultValue: '-',
                desc: '群号'
            },
            {
                field: 'user_id',
                type: 'number',
                defaultValue: '-',
                desc: '要踢的 QQ 号'
            },
            {
                field: 'reject_add_request',
                type: 'boolean',
                defaultValue: 'false',
                desc: '拒绝此人的加群请求'
            }
        ],
        results: []
    },
    {
        name: 'set_group_ban',
        desc: '群组单人禁言',
        params: [
            {
                field: 'group_id',
                type: 'number',
                defaultValue: '-',
                desc: '群号'
            },
            {
                field: 'user_id',
                type: 'number',
                defaultValue: '-',
                desc: '要禁言的 QQ 号'
            },
            {
                field: 'duration',
                type: 'number',
                defaultValue: '30 * 60',
                desc: '禁言时长，单位秒，0 表示取消禁言'
            }
        ],
        results: []
    },
    {
        name: 'set_group_anonymous_ban',
        desc: '群组匿名用户禁言',
        params: [
            {
                field: 'group_id',
                type: 'number',
                defaultValue: '-',
                desc: '群号'
            },
            {
                field: 'anonymous',
                type: 'object',
                defaultValue: '-',
                desc: '可选，要禁言的匿名用户对象（群消息上报的 anonymous 字段）'
            },
            {
                field: 'anonymous_flag 或 flag',
                type: 'string',
                defaultValue: '-',
                desc: '可选，要禁言的匿名用户的 flag（需从群消息上报的数据中获得）'
            },
            {
                field: 'duration',
                type: 'number',
                defaultValue: '30 * 60',
                desc: '禁言时长，单位秒，无法取消匿名用户禁言'
            }
        ],
        results: []
    },
    {
        name: 'set_group_whole_ban',
        desc: '群组全员禁言',
        params: [
            {
                field: 'group_id',
                type: 'number',
                defaultValue: '-',
                desc: '群号'
            },
            {
                field: 'enable',
                type: 'boolean',
                defaultValue: 'true',
                desc: '是否禁言'
            }
        ],
        results: []
    },
    {
        name: 'set_group_admin',
        desc: '群组设置管理员',
        params: [
            {
                field: 'group_id',
                type: 'number',
                defaultValue: '-',
                desc: '群号'
            },
            {
                field: 'user_id',
                type: 'number',
                defaultValue: '-',
                desc: '要设置管理员的 QQ 号'
            },
            {
                field: 'enable',
                type: 'boolean',
                defaultValue: 'true',
                desc: 'true 为设置，false 为取消'
            }
        ],
        results: []
    },
    {
        name: 'set_group_anonymous',
        desc: '群组匿名',
        params: [
            {
                field: 'group_id',
                type: 'number',
                defaultValue: '-',
                desc: '群号'
            },
            {
                field: 'enable',
                type: 'boolean',
                defaultValue: 'true',
                desc: '是否允许匿名聊天'
            }
        ],
        results: []
    },
    {
        name: 'set_group_card',
        desc: '设置群名片（群备注）',
        params: [
            {
                field: 'group_id',
                type: 'number',
                defaultValue: '-',
                desc: '群号'
            },
            {
                field: 'user_id',
                type: 'number',
                defaultValue: '-',
                desc: '要设置的 QQ 号'
            },
            {
                field: 'card',
                type: 'string',
                defaultValue: '空',
                desc: '群名片内容，不填或空字符串表示删除群名片'
            }
        ],
        results: []
    },
    {
        name: 'set_group_name',
        desc: '设置群名',
        params: [
            {
                field: 'group_id',
                type: 'number (int64)',
                defaultValue: '',
                desc: '群号'
            },
            {
                field: 'group_name',
                type: 'string',
                defaultValue: '',
                desc: '新群名'
            }
        ],
        results: []
    },
    {
        name: 'set_group_leave',
        desc: '退出群组',
        params: [
            {
                field: 'group_id',
                type: 'number',
                defaultValue: '-',
                desc: '群号'
            },
            {
                field: 'is_dismiss',
                type: 'boolean',
                defaultValue: 'false',
                desc: '是否解散，如果登录号是群主，则仅在此项为 true 时能够解散'
            }
        ],
        results: []
    },
    {
        name: 'set_group_special_title',
        desc: '设置群组专属头衔',
        params: [
            {
                field: 'group_id',
                type: 'number',
                defaultValue: '-',
                desc: '群号'
            },
            {
                field: 'user_id',
                type: 'number',
                defaultValue: '-',
                desc: '要设置的 QQ 号'
            },
            {
                field: 'special_title',
                type: 'string',
                defaultValue: '空',
                desc: '专属头衔，不填或空字符串表示删除专属头衔'
            },
            {
                field: 'duration',
                type: 'number',
                defaultValue: '-1',
                desc: '专属头衔有效期，单位秒，-1 表示永久，不过此项似乎没有效果，可能是只有某些特殊的时间长度有效，有待测试'
            }
        ],
        results: []
    },
    {
        name: 'set_friend_add_request',
        desc: '处理加好友请求',
        params: [
            {
                field: 'flag',
                type: 'string',
                defaultValue: '-',
                desc: '加好友请求的 flag（需从上报的数据中获得）'
            },
            {
                field: 'approve',
                type: 'boolean',
                defaultValue: 'true',
                desc: '是否同意请求'
            },
            {
                field: 'remark',
                type: 'string',
                defaultValue: '空',
                desc: '添加后的好友备注（仅在同意时有效）'
            }
        ],
        results: []
    },
    {
        name: 'set_group_add_request',
        desc: '处理加群请求／邀请',
        params: [
            {
                field: 'flag',
                type: 'string',
                defaultValue: '-',
                desc: '加群请求的 flag（需从上报的数据中获得）'
            },
            {
                field: 'sub_type 或 type',
                type: 'string',
                defaultValue: '-',
                desc: 'add 或 invite，请求类型（需要和上报消息中的 sub_type 字段相符）'
            },
            {
                field: 'approve',
                type: 'boolean',
                defaultValue: 'true',
                desc: '是否同意请求／邀请'
            },
            {
                field: 'reason',
                type: 'string',
                defaultValue: '空',
                desc: '拒绝理由（仅在拒绝时有效）'
            }
        ],
        results: []
    },
    {
        name: 'get_login_info',
        desc: '获取登录号信息',
        params: [],
        results: [
            {
                field: 'user_id',
                type: 'number (int64)',
                desc: 'QQ 号'
            },
            {
                field: 'nickname',
                type: 'string',
                desc: 'QQ 昵称'
            }
        ]
    },
    {
        name: 'get_stranger_info',
        desc: '获取陌生人信息',
        params: [
            {
                field: 'user_id',
                type: 'number',
                defaultValue: '-',
                desc: 'QQ 号'
            },
            {
                field: 'no_cache',
                type: 'boolean',
                defaultValue: 'false',
                desc: '是否不使用缓存（使用缓存可能更新不及时，但响应更快）'
            }
        ],
        results: [
            {
                field: 'user_id',
                type: 'number (int64)',
                desc: 'QQ 号'
            },
            {
                field: 'nickname',
                type: 'string',
                desc: '昵称'
            },
            {
                field: 'sex',
                type: 'string',
                desc: '性别，male 或 female 或 unknown'
            },
            {
                field: 'age',
                type: 'number (int32)',
                desc: '年龄'
            }
        ]
    },
    {
        name: 'get_friend_list',
        desc: '获取好友列表',
        params: [],
        results: []
    },
    {
        name: 'get_group_info',
        desc: '获取群信息',
        params: [
            {
                field: 'group_id',
                type: 'number',
                defaultValue: '-',
                desc: '群号'
            },
            {
                field: 'no_cache',
                type: 'boolean',
                defaultValue: 'false',
                desc: '是否不使用缓存（使用缓存可能更新不及时，但响应更快）'
            }
        ],
        results: [
            {
                field: 'group_id',
                type: 'number (int64)',
                desc: '群号'
            },
            {
                field: 'group_name',
                type: 'string',
                desc: '群名称'
            },
            {
                field: 'member_count',
                type: 'number (int32)',
                desc: '成员数'
            },
            {
                field: 'max_member_count',
                type: 'number (int32)',
                desc: '最大成员数（群容量）'
            }
        ]
    },
    {
        name: 'get_group_list',
        desc: '获取群列表',
        params: [],
        results: []
    },
    {
        name: 'get_group_member_info',
        desc: '获取群成员信息',
        params: [
            {
                field: 'group_id',
                type: 'number',
                defaultValue: '-',
                desc: '群号'
            },
            {
                field: 'user_id',
                type: 'number',
                defaultValue: '-',
                desc: 'QQ 号'
            },
            {
                field: 'no_cache',
                type: 'boolean',
                defaultValue: 'false',
                desc: '是否不使用缓存（使用缓存可能更新不及时，但响应更快）'
            }
        ],
        results: [
            {
                field: 'group_id',
                type: 'number (int64)',
                desc: '群号'
            },
            {
                field: 'user_id',
                type: 'number (int64)',
                desc: 'QQ 号'
            },
            {
                field: 'nickname',
                type: 'string',
                desc: '昵称'
            },
            {
                field: 'card',
                type: 'string',
                desc: '群名片／备注'
            },
            {
                field: 'sex',
                type: 'string',
                desc: '性别，male 或 female 或 unknown'
            },
            {
                field: 'age',
                type: 'number (int32)',
                desc: '年龄'
            },
            {
                field: 'area',
                type: 'string',
                desc: '地区'
            },
            {
                field: 'join_time',
                type: 'number (int32)',
                desc: '加群时间戳'
            },
            {
                field: 'last_sent_time',
                type: 'number (int32)',
                desc: '最后发言时间戳'
            },
            {
                field: 'level',
                type: 'string',
                desc: '成员等级'
            },
            {
                field: 'role',
                type: 'string',
                desc: '角色，owner 或 admin 或 member'
            },
            {
                field: 'unfriendly',
                type: 'boolean',
                desc: '是否不良记录成员'
            },
            {
                field: 'title',
                type: 'string',
                desc: '专属头衔'
            },
            {
                field: 'title_expire_time',
                type: 'number (int32)',
                desc: '专属头衔过期时间戳'
            },
            {
                field: 'card_changeable',
                type: 'boolean',
                desc: '是否允许修改群名片'
            }
        ]
    },
    {
        name: 'get_group_member_list',
        desc: '获取群成员列表',
        params: [
            {
                field: 'group_id',
                type: 'number (int64)',
                defaultValue: '-',
                desc: '群号'
            }
        ],
        results: []
    },
    {
        name: 'get_group_honor_info',
        desc: '获取群荣誉信息',
        params: [
            {
                field: 'group_id',
                type: 'number (int64)',
                defaultValue: '-',
                desc: '群号'
            },
            {
                field: 'type',
                type: 'string',
                defaultValue: '-',
                desc: '要获取的群荣誉类型，可传入 talkative performer legend strong_newbie emotion 以分别获取单个类型的群荣誉数据，或传入 all 获取所有数据'
            }
        ],
        results: [
            {
                field: 'group_id',
                type: 'number (int64)',
                desc: '群号'
            },
            {
                field: 'current_talkative',
                type: 'object',
                desc: '当前龙王，仅 type 为 talkative 或 all 时有数据'
            },
            {
                field: 'talkative_list',
                type: 'array',
                desc: '历史龙王，仅 type 为 talkative 或 all 时有数据'
            },
            {
                field: 'performer_list',
                type: 'array',
                desc: '群聊之火，仅 type 为 performer 或 all 时有数据'
            },
            {
                field: 'legend_list',
                type: 'array',
                desc: '群聊炽焰，仅 type 为 legend 或 all 时有数据'
            },
            {
                field: 'strong_newbie_list',
                type: 'array',
                desc: '冒尖小春笋，仅 type 为 strong_newbie 或 all 时有数据'
            },
            {
                field: 'emotion_list',
                type: 'array',
                desc: '快乐之源，仅 type 为 emotion 或 all 时有数据'
            }
        ]
    },
    {
        name: 'get_cookies',
        desc: '获取 Cookies',
        params: [
            {
                field: 'domain',
                type: 'string',
                defaultValue: '空',
                desc: '需要获取 cookies 的域名'
            }
        ],
        results: [
            {
                field: 'cookies',
                type: 'string',
                desc: 'Cookies'
            }
        ]
    },
    {
        name: 'get_csrf_token',
        desc: '获取 CSRF Token',
        params: [],
        results: [
            {
                field: 'token',
                type: 'number (int32)',
                desc: 'CSRF Token'
            }
        ]
    },
    {
        name: 'get_credentials',
        desc: '获取 QQ 相关接口凭证',
        params: [],
        results: []
    },
    {
        name: 'get_record',
        desc: '获取语音',
        params: [],
        results: []
    },
    {
        name: 'get_image',
        desc: '获取图片',
        params: [
            {
                field: 'file',
                type: 'string',
                defaultValue: '-',
                desc: '收到的图片文件名（消息段的 file 参数），如 6B4DE3DFD1BD271E3297859D41C530F5.jpg'
            }
        ],
        results: [
            {
                field: 'file',
                type: 'string',
                desc: '下载后的图片文件路径，如 /home/somebody/cqhttp/data/image/6B4DE3DFD1BD271E3297859D41C530F5.jpg'
            }
        ]
    },
    {
        name: 'can_send_image',
        desc: '检查是否可以发送图片',
        params: [],
        results: [
            {
                field: 'yes',
                type: 'boolean',
                desc: '是或否'
            }
        ]
    },
    {
        name: 'can_send_record',
        desc: '检查是否可以发送语音',
        params: [],
        results: [
            {
                field: 'yes',
                type: 'boolean',
                desc: '是或否'
            }
        ]
    },
    {
        name: 'get_status',
        desc: '获取运行状态',
        params: [],
        results: [
            {
                field: 'online',
                type: 'boolean',
                desc: '当前 QQ 在线，null 表示无法查询到在线状态'
            },
            {
                field: 'good',
                type: 'boolean',
                desc: '状态符合预期，意味着各模块正常运行、功能正常，且 QQ 在线'
            },
            {
                field: '……',
                type: '-',
                desc: 'OneBot 实现自行添加的其它内容'
            }
        ]
    },
    {
        name: 'get_version_info',
        desc: '获取版本信息',
        params: [],
        results: [
            {
                field: 'app_name',
                type: 'string',
                desc: '应用标识，如 mirai-native'
            },
            {
                field: 'app_version',
                type: 'string',
                desc: '应用版本，如 1.2.3'
            },
            {
                field: 'protocol_version',
                type: 'string',
                desc: 'OneBot 标准版本，如 v11'
            },
            {
                field: '……',
                type: '-',
                desc: 'OneBot 实现自行添加的其它内容'
            }
        ]
    },
    {
        name: 'set_restart',
        desc: '重启 OneBot 实现',
        params: [],
        results: []
    },
    {
        name: 'clean_cache',
        desc: '清理缓存',
        params: [],
        results: []
    }
]
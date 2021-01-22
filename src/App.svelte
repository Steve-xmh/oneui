<script lang="ts">
    import {
        MaterialApp,
        Button,
        Container,
        AppBar,
        Icon,
        NavigationDrawer,
        List,
        ListItem,
        Card,
        CardTitle,
        CardText,
        TextField,
        Textarea,
        CardActions,
        Avatar,
        ListGroup,
Overlay,
    } from "svelte-materialify";
    import { mdiAccount, mdiAccountMultiple, mdiChevronUp, mdiCog, mdiMenu, mdiSend } from "@mdi/js";
    import { OneBotWS } from "./onebot";
    import type { MessageMessage, GroupMessage } from "./onebot/messages";
    import { SubMessageType, MessageType } from "./onebot/messages";
    import { contact, getContactID, getContactType, getUserID } from "./stores/contact";
    import { messageDB } from "./stores/messages";
    import MessageList from "./MessageList.svelte";
import MessageBubble from "./components/message/MessageBubble.svelte";
    let theme: "light" | "dark" = "dark";
    let active = false;
    let mini = false;
    let usersListGroup = false;
    let groupsListGroup = false;
    let connectUrl = "ws://localhost:5700";
    let backendMeta = "";
    let messageField = '';
    let selfId = 0;
    let selfName = '';
    let sendingMessage = false
    let onebot: OneBotWS;
    interface Friend {
        user_id: number;
        nickname: string;
        remark: string;
    }

    interface Group {
        group_id: number;
        group_name: string;
        member_count: number;
        max_member_count: number;
    }

    let friends: Friend[] = [];
    let groups: Group[] = [];
    let msgList: HTMLDivElement

    function onGetFriendsInfo(e: CustomEvent<any>) {
        friends = e.detail.data;
    }

    function onGetGroupsInfo(e: CustomEvent<any>) {
        console.log("get", e.detail);
        groups = e.detail.data;
    }

    function onGetVersionInfo(e: CustomEvent<any>) {
        backendMeta = `Connected ${
            e.detail.data?.app_name || e.detail.data?.name
        } v${e.detail.data?.app_version || e.detail.data?.version}`;
    }

    function tryScrollToBottom() {
        if (msgList) {
            const isScrolledToBottom = msgList.scrollHeight - msgList.clientHeight <= msgList.scrollTop + 1;
            if (isScrolledToBottom) {
                requestAnimationFrame(() => {
                    msgList.scrollTo({
                        top: msgList.scrollHeight,
                        behavior: 'smooth'
                    })
                })
            }
        }
    }

    async function sendMessage() {
        if (selfId > 0) {
            const cid = $contact
            const ctype = getContactType(cid)
            const msg = messageField
            messageField = ''
            sendingMessage = true
            let msgId
            if (ctype === MessageType.Private) {
                msgId = await onebot.sendPrivateMsg(getUserID(cid), msg, true)
            } else if (ctype === MessageType.Group) {
                msgId = await onebot.sendGroupMsg(getUserID(cid), msg, true)
            }
            try {
                const rawMsg = (await onebot.send('get_msg', { message_id: msgId })).data
                tryScrollToBottom()
                messageDB.addMessage(cid, rawMsg.raw_message, selfId)
            } catch {
                tryScrollToBottom()
                messageDB.addMessage(cid, msg, selfId)
            }
            sendingMessage = false
        }
    }

    function connectHost() {
        if (connectUrl.length > 0) {
            onebot = new OneBotWS(connectUrl);
            onebot.addEventListener("getVersionInfo", onGetVersionInfo);
            onebot.addEventListener("getFriendList", onGetFriendsInfo);
            onebot.addEventListener("getGroupList", onGetGroupsInfo);
            onebot.addEventListener('getLoginInfo', (e: CustomEvent) => {
                selfId = e.detail.data.user_id
                selfName = e.detail.data.nickname
            })
            // const isScrolledToBottom = out.scrollHeight - out.clientHeight <= out.scrollTop + 1;
            onebot.addEventListener("userMessage", (e: CustomEvent) => {
                const baseMsg = e.detail as MessageMessage;
                tryScrollToBottom()
                if (baseMsg.message_type === MessageType.Private) {
                    const cid = getContactID(baseMsg.user_id, false);
                    messageDB.addMessage(cid, baseMsg.raw_message);
                } else if (baseMsg.message_type === MessageType.Group) {
                    const cid = getContactID((baseMsg as unknown as GroupMessage).group_id, true);
                    messageDB.addMessage(cid, baseMsg.raw_message, baseMsg.user_id);
                }
            });
        }
    }
</script>

<MaterialApp {theme}>
    <AppBar>
        <div slot="icon">
            <Button
                fab
                depressed
                on:click={() => {
                    active = !active;
                }}
            >
                <Icon path={mdiMenu} />
            </Button>
        </div>
        <span slot="title">OneUI</span>
    </AppBar>
    {#if !onebot}
        <Container class="d-flex justify-center" style="height:calc(100%-56px)">
            <Card style="min-width:300px;">
                <CardTitle>Connect</CardTitle>
                <CardText>
                    <TextField
                        placeholder="Connect Url"
                        bind:value={connectUrl}
                    />
                </CardText>
                <CardActions>
                    <Button
                        disabled={connectUrl.length === 0}
                        on:click={connectHost}
                    >Connect</Button
                    >
                </CardActions>
            </Card>
        </Container>
    {:else}
        <NavigationDrawer clipped absolute width={400}>
            <List>
                <!-- Self -->
                {#if selfId > 0}
                <ListItem disabled>
                    <span slot="prepend">
                        <Avatar>
                            <img
                                src={`http://q1.qlogo.cn/g?b=qq&nk=${selfId}&s=640`}
                                alt=""
                            />
                        </Avatar>
                    </span>
                    {selfName}
                </ListItem>
                {:else}
                <ListItem disabled>
                    <span slot="prepend">
                        <Avatar size={30}
                            ><img
                                src=''
                                alt=""
                            /></Avatar
                        >
                    </span>
                    Logining
                </ListItem>
                {/if}
                <!-- Users -->
                <ListGroup bind:usersListGroup offset={72}>
                    <span slot="prepend">
                        <Icon path={mdiAccount} />
                    </span>
                    <span slot="activator">Users</span>
                    <span slot="append">
                        <Icon
                            path={mdiChevronUp}
                            rotate={usersListGroup ? 0 : 180}
                        />
                    </span>
                    {#each friends as friend (friend.user_id)}
                        <ListItem
                            dense
                            active={$contact === getContactID(friend.user_id)}
                            on:click={() =>
                                contact.switch(getContactID(friend.user_id))}
                        >
                            <span slot="prepend">
                                <Avatar size={30}
                                    ><img
                                        src={`http://q1.qlogo.cn/g?b=qq&nk=${friend.user_id}&s=640`}
                                        alt=""
                                    /></Avatar
                                >
                            </span>
                            {friend.nickname}
                        </ListItem>
                    {/each}
                </ListGroup>
                <!-- Groups -->
                <ListGroup bind:groupsListGroup offset={72}>
                    <span slot="prepend">
                        <Icon path={mdiAccountMultiple} />
                    </span>
                    <span slot="activator">Groups</span>
                    <span slot="append">
                        <Icon
                            path={mdiChevronUp}
                            rotate={groupsListGroup ? 0 : 180}
                        />
                    </span>
                    {#each groups as group (group.group_id)}
                        <ListItem
                            dense
                            active={$contact ===
                                getContactID(group.group_id, true)}
                            on:click={() =>
                                contact.switch(
                                    getContactID(group.group_id, true)
                                )}
                        >
                            <span slot="prepend">
                                <Avatar size={30}
                                    ><img
                                        src={`http://p.qlogo.cn/gh/${group.group_id}/${group.group_id}/0`}
                                        alt=""
                                    /></Avatar
                                >
                            </span>
                            {group.group_name}
                        </ListItem>
                    {/each}
                </ListGroup>
            </List>
        </NavigationDrawer>
        <main class="navigation-enabled">
            {#if $contact === ""}
                <div class="d-flex justify-center align-center max-size">
                    Nothing is there, click a user or a group to chat.
                </div>
            {:else}
                <div class="d-flex flex-column max-size">
                    <MessageList className="flex-grow-1 pa-4" bind:msgdiv={msgList} />
                    <div style="height:1px;background-color:#AAA" />
                    <div class="flex-grow-0 pl-2 pt-2 pr-2 pb-1 d-flex">
                        <Textarea
                            autogrow
                            rows={1}
                            class="flex-grow-1 pr-2"
                            placeholder="Chating here"
                            bind:value={messageField}
                        />
                        <Button disabled={messageField.length === 0 || sendingMessage} icon class="flex-grow-0" on:click={sendMessage}>
                            <Icon path={mdiSend} />
                        </Button>
                    </div>
                </div>
                <!--
                <div class="d-flex justify-center align-center max-size">
                    Switched contact id: {$contact}
                </div>
                -->
            {/if}
        </main>
    {/if}
    <NavigationDrawer clipped fixed {mini} {active}>
        <List>
            <ListItem>Users</ListItem>
        </List>
        <span slot="append" class="pa-2">
            <ListItem>{backendMeta}</ListItem>
            <Button block>Disconnect</Button>
        </span>
    </NavigationDrawer>
    <Overlay index={1} {active} on:click={() => {active = false}} absolute />
</MaterialApp>

<style>
    main {
        height: calc(100% - 56px);
        overflow: auto;
    }
    .max-size {
        width: 100%;
        height: 100%;
    }
    .navigation-enabled {
        padding: 0 0 0 400px;
    }
</style>

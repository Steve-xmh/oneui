<script lang="ts">
import { mdiAccount, mdiAccountMultiple, mdiChevronUp, mdiSend } from "@mdi/js";
import { onMount, tick } from "svelte";

    import {
        Button,
        Icon,
        NavigationDrawer,
        List,
        ListItem,
        TextField,
        Textarea,
        Avatar,
        ListGroup,
    } from "svelte-materialify";
    import type { OneBotWS } from "../../onebot";
    import { MessageType } from "../../onebot/messages";
    import { contact, getContactID, getContactType, getUserID } from "../../stores/contact";
    import { messageDB } from "../../stores/messages";
    import { selfData } from "../../stores/self";
    import MessageList from './MessageList.svelte'
    export let onebot: OneBotWS

    let msgList: HTMLDivElement
    let usersListGroup = false;
    let groupsListGroup = false;
    let sendingMessage = false;
    let autoScroll = true;
    let messageField = '';
    let searchField = '';

    function tryScrollToBottom() {
        if (msgList) {
            const isScrolledToBottom = msgList.scrollHeight - msgList.clientHeight <= msgList.scrollTop + 1;
            if (autoScroll && !isScrolledToBottom) {
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
        if ($selfData.userId > 0) {
            const cid = $contact
            const ctype = getContactType(cid)
            const msg = messageField
            messageField = ''
            sendingMessage = true
            let msgId
            try {
                if (ctype === MessageType.Private) {
                    msgId = await onebot.sendPrivateMsg(getUserID(cid), msg, true)
                } else if (ctype === MessageType.Group) {
                    msgId = await onebot.sendGroupMsg(getUserID(cid), msg, true)
                }
                try {
                    const rawMsg = (await onebot.send('get_msg', { message_id: msgId })).data
                    tryScrollToBottom()
                    messageDB.addMessage(cid, rawMsg.raw_message, $selfData.userId)
                } catch {
                    tryScrollToBottom()
                    messageDB.addMessage(cid, msg, $selfData.userId)
                }
            } catch {}
            sendingMessage = false
        }
    }
</script>

<NavigationDrawer clipped absolute width={400}>
    <List>
        <!-- Self -->
        {#if $selfData.userId > 0}
            <ListItem disabled>
                <span slot="prepend">
                    <Avatar>
                        <img
                            src={`http://q1.qlogo.cn/g?b=qq&nk=${$selfData.userId}&s=640`}
                            alt=""
                        />
                    </Avatar>
                </span>
                {$selfData.userName}
            </ListItem>
        {:else}
            <ListItem disabled>
                <span slot="prepend">
                    <Avatar><img src="" alt="" /></Avatar>
                </span>
                Logining
            </ListItem>
        {/if}
        <ListItem ripple={{}}>
            <TextField placeholder="Search" bind:value={searchField} />
        </ListItem>
        <!-- Users -->
        <ListGroup bind:usersListGroup offset={72}>
            <span slot="prepend">
                <Icon path={mdiAccount} />
            </span>
            <span slot="activator">Users</span>
            <span slot="append">
                <Icon path={mdiChevronUp} rotate={usersListGroup ? 0 : 180} />
            </span>
            {#each $selfData.friends.filter(v => v.user_id === parseInt(searchField) || v.nickname.toLowerCase().includes(searchField.toLowerCase())) as friend (friend.user_id)}
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
                <Icon path={mdiChevronUp} rotate={groupsListGroup ? 0 : 180} />
            </span>
            {#each $selfData.groups.filter(v => v.group_id === parseInt(searchField) || v.group_name.toLowerCase().includes(searchField.toLowerCase())) as group (group.group_id)}
                <ListItem
                    dense
                    active={$contact === getContactID(group.group_id, true)}
                    on:click={() =>
                        contact.switch(getContactID(group.group_id, true))}
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
        <div class="d-flex justify-center align-center max-size text--secondary">
            Nothing is there, click a user or a group to chat.
        </div>
    {:else}
        <div class="d-flex flex-column max-size">
            <MessageList className="flex-grow-1 pa-4" bind:msgdiv={msgList} bind:autoScroll={autoScroll} />
            <div style="height:1px;background-color:#AAA" />
            <div class="flex-grow-0 pl-2 pt-2 pr-2 pb-1 d-flex">
                <Textarea
                    autogrow
                    rows={1}
                    class="flex-grow-1 pr-2"
                    placeholder="Chating here"
                    bind:value={messageField}
                />
                <Button
                    disabled={messageField.length === 0 || sendingMessage}
                    icon
                    class="flex-grow-0"
                    on:click={sendMessage}
                >
                    <Icon path={mdiSend} />
                </Button>
            </div>
        </div>
    {/if}
</main>


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
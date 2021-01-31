<script lang="ts">
    import {
        mdiAccount,
        mdiAccountMultiple,
        mdiAttachment,
        mdiChevronUp,
        mdiSend,
    } from '@mdi/js';
    import { onMount, tick } from 'svelte';
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
    } from 'svelte-materialify/src';
    import type { OneBotWS } from '../../onebot';
    import { MessageType } from '../../onebot/messages';
    import {
        contact,
        getContactID,
        getContactType,
        getUserID,
    } from '../../stores/contact';
    import { messageDB } from '../../stores/messages';
    import { selfData } from '../../stores/self';
    import { toBase64 } from '../../utils/base64';
    import MessageList from './MessageList.svelte';
    export let onebot: OneBotWS;

    let msgList: HTMLDivElement;
    let usersListGroup = false;
    let groupsListGroup = false;
    let sendingMessage = false;
    let autoScroll = true;
    let messageField = '';
    let searchField = '';

    function tryScrollToBottom() {
        if (msgList) {
            const isScrolledToBottom =
                msgList.scrollHeight - msgList.clientHeight <=
                msgList.scrollTop + 1;
            if (autoScroll && !isScrolledToBottom) {
                requestAnimationFrame(() => {
                    msgList.scrollTo({
                        top: msgList.scrollHeight,
                        behavior: 'smooth',
                    });
                });
            }
        }
    }

    let imageOrAudioInput: HTMLInputElement;

    function setupImageOrAudioInput(node: HTMLInputElement) {
        node.addEventListener('change', async () => {
            if (node.files && node.files.length > 0) {
                const cid = $contact;
                // Transform into base64 and send them
                const msg = (() => {
                    let r: File[][] = [];
                    let index = 0;
                    let chunk: File[] = [];
                    for (let i = 0; i < node.files.length; i++) {
                        index++;
                        if (index >= 10) {
                            r.push(chunk);
                            chunk = [];
                            index = 0;
                        }
                        chunk.push(node.files[i]);
                    }
                    r.push(chunk);
                    return r;
                })();
                const msgs = await Promise.all(
                    msg.map(async (msgs) => {
                        return (
                            await Promise.all(
                                msgs.map(async (v) => {
                                    if (v.type.startsWith('image')) {
                                        console.log('Collected image', v.name);
                                        return (
                                            '[CQ:image,file=base64://' +
                                            toBase64(
                                                new Uint8Array(
                                                    await v.arrayBuffer()
                                                )
                                            ) +
                                            ']'
                                        );
                                    } else if (v.type.startsWith('audio')) {
                                        console.log('Collected audio', v.name);
                                        return (
                                            '[CQ:record,file=base64://' +
                                            toBase64(
                                                new Uint8Array(
                                                    await v.arrayBuffer()
                                                )
                                            ) +
                                            ']'
                                        );
                                    } else {
                                        console.warn(
                                            'Unknown file type',
                                            v.type,
                                            'of',
                                            v.name,
                                            'with size',
                                            v.size,
                                            ', ignored'
                                        );
                                    }
                                })
                            )
                        ).join('');
                    })
                );
                for (const msg of msgs) {
                    try {
                        const msgId = await sendMsg(msg);
                        const rawMsg = (
                            await onebot.getMessageByID(msgId as string)
                        ).data;
                        messageDB.addMessage(
                            cid,
                            rawMsg.raw_message,
                            $selfData.userId
                        );
                    } catch {
                        messageDB.addMessage(cid, msg, $selfData.userId);
                    }
                }
            }
        });
    }

    async function sendMsg(msg: string, autoEscape = false) {
        const cid = $contact;
        const ctype = getContactType(cid);
        if (ctype === MessageType.Private) {
            return await onebot.sendPrivateMsg(getUserID(cid), msg, autoEscape);
        } else if (ctype === MessageType.Group) {
            return await onebot.sendGroupMsg(getUserID(cid), msg, autoEscape);
        }
    }

    async function sendImageOrAudio() {
        // sendImageOrAudio
        imageOrAudioInput.click();
    }

    async function sendMessage() {
        if ($selfData.userId > 0) {
            const cid = $contact;
            const ctype = getContactType(cid);
            const msg = messageField;
            messageField = '';
            sendingMessage = true;
            let msgId;
            try {
                msgId = await sendMsg(msg, true);
                try {
                    const rawMsg = (
                        await onebot.getMessageByID(msgId as string)
                    ).data;
                    tryScrollToBottom();
                    messageDB.addMessage(
                        cid,
                        rawMsg.raw_message,
                        $selfData.userId
                    );
                } catch {
                    tryScrollToBottom();
                    messageDB.addMessage(cid, msg, $selfData.userId);
                }
            } catch {}
            sendingMessage = false;
        }
    }
</script>

<NavigationDrawer clipped absolute width={400}>
    <List rounded>
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
            {#each $selfData.friends.filter((v) => v.user_id === parseInt(searchField) || v.nickname
                        .toLowerCase()
                        .includes(
                            searchField.toLowerCase()
                        )) as friend (friend.user_id)}
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
            {#each $selfData.groups.filter((v) => v.group_id === parseInt(searchField) || v.group_name
                        .toLowerCase()
                        .includes(
                            searchField.toLowerCase()
                        )) as group (group.group_id)}
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
    {#if $contact === ''}
        <div
            class="d-flex justify-center align-center max-size text--secondary"
        >
            Nothing is there, click a user or a group to chat.
        </div>
    {:else}
        <div class="d-flex flex-column max-size">
            <MessageList
                className="flex-grow-1 pa-4"
                bind:msgdiv={msgList}
                bind:autoScroll
            />
            <div style="height:1px;background-color:#AAA" />
            <div class="flex-grow-0 pl-2 pt-2 pr-2 pb-1 d-flex align-center">
                <Button icon on:click={sendImageOrAudio}>
                    <Icon path={mdiAttachment} />
                    <input
                        type="file"
                        accept="audio/wav,audio/mp3,audio/flac,image/png,image/jpeg,image/gif"
                        class="d-none"
                        multiple
                        use:setupImageOrAudioInput
                        bind:this={imageOrAudioInput}
                    />
                </Button>
                <div class="flex-grow-1 mr-2 ml-2">
                    <Textarea
                        autogrow
                        rows={1}
                        placeholder="Chating here"
                        bind:value={messageField}
                    />
                </div>
                <Button
                    disabled={messageField.length === 0 || sendingMessage}
                    icon
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

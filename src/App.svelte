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
        Overlay,
        Tabs,
        Tab,
        Window,
        WindowItem,
    } from 'svelte-materialify/src';
    import { mdiMenu } from '@mdi/js';
    import { onebot } from './onebot';
    import type { MessageMessage, GroupMessage } from './onebot/messages';
    import { MessageType } from './onebot/messages';
    import { getContactID } from './stores/contact';
    import { messageDB } from './stores/messages';
    import Chat from './components/chat/Chat.svelte';
    import { selfData } from './stores/self';
    import ImageViewer from './components/utils/ImageViewer.svelte';
    import { Theme } from './stores/theme';
    import Settings from './components/settings/Settings.svelte';
    import { settings } from './stores/settings';
    import { tryParse } from './utils/cqcode';
    import MessageBubble from './components/message/MessageBubble.svelte';
    let active = false;
    let settingsActive = false;
    let mini = false;
    let connected = false;
    let connectMethod = 0;
    let connectUrl = 'ws://localhost:5700';
    let connectUrlAuth = '';
    let messageBubbleTestField = 'Hello World![CQ:face,id=4]';
    $: messageBubbleTestFieldCQ = tryParse(messageBubbleTestField);
    let backendMeta = '';

    function onGetFriendsInfo(e: CustomEvent) {
        selfData.setFriends(e.detail.data);
    }

    function onGetGroupsInfo(e: CustomEvent) {
        selfData.setGroups(e.detail.data);
    }

    function onGetVersionInfo(e: CustomEvent) {
        backendMeta = `Connected ${e.detail.data?.app_name} v${e.detail.data?.app_version}`;
    }

    onebot.addEventListener('getVersionInfo', onGetVersionInfo);
    onebot.addEventListener('getFriendList', onGetFriendsInfo);
    onebot.addEventListener('getGroupList', onGetGroupsInfo);
    onebot.addEventListener('getLoginInfo', (e: CustomEvent) => {
        selfData.setSelf(e.detail.data.user_id, e.detail.data.nickname);
    });
    onebot.addEventListener('userMessage', (e: CustomEvent) => {
        const baseMsg = e.detail as MessageMessage;
        if (baseMsg.message_type === MessageType.Private) {
            const cid = getContactID(baseMsg.user_id, false);
            messageDB.addMessage(cid, baseMsg.raw_message);
        } else if (baseMsg.message_type === MessageType.Group) {
            const cid = getContactID(
                ((baseMsg as unknown) as GroupMessage).group_id,
                true
            );
            messageDB.addMessage(cid, baseMsg.raw_message, baseMsg.user_id);
        }
    });

    function connectHost() {
        if (connectUrl.length > 0) {
            onebot.connect(connectUrl);
            connected = true;
        }
    }
</script>

<MaterialApp theme={$settings.theme === Theme.Dark ? 'dark' : 'light'}>
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
    {#if !connected}
        <Container
            class="d-flex justify-center align-center align-content-center flex-wrap"
            style="height:calc(100%-56px)"
        >
            <Card style="width:400px;" class="ma-2">
                <CardTitle>Connect to OneBot</CardTitle>
                <Tabs bind:value={connectMethod} class="primary-text" fixedTabs>
                    <div slot="tabs">
                        <Tab>WebSocket</Tab>
                        <Tab>HTTP</Tab>
                    </div>
                </Tabs>
                <Window value={connectMethod}>
                    <WindowItem>
                        <CardText>
                            <TextField
                                placeholder="Connect Url"
                                bind:value={connectUrl}
                            />
                        </CardText>
                    </WindowItem>
                    <WindowItem>
                        <CardText>
                            Still work in progress, it will connect as
                            WebSocket.
                            <TextField
                                placeholder="Connect Url"
                                bind:value={connectUrl}
                            />
                            <TextField
                                placeholder="Serects"
                                bind:value={connectUrlAuth}
                            />
                        </CardText>
                    </WindowItem>
                </Window>
                <CardActions>
                    <Button
                        text
                        block
                        class="primary-text"
                        disabled={connectUrl.length === 0}
                        on:click={connectHost}>Connect</Button
                    >
                </CardActions>
            </Card>
            <Card style="min-width:400px;height:500px" class="ma-2">
                <CardTitle>MessageBubble Test</CardTitle>
                <CardText>
                    Input some raw message to see what the bubble looks.
                    <Textarea
                        autogrow
                        rows={1}
                        bind:value={messageBubbleTestField}
                    />
                    <MessageBubble
                        userId={1}
                        style="min-height:fit-content;"
                        messages={messageBubbleTestFieldCQ}
                    />
                </CardText>
            </Card>
        </Container>
    {:else}
        <Chat {onebot} />
    {/if}
    <NavigationDrawer clipped fixed {mini} {active}>
        <List>
            <ListItem
                on:click={() => {
                    settingsActive = true;
                    active = false;
                }}>Settings</ListItem
            >
        </List>
        <span slot="append" class="pa-2">
            {#if connected}
                <ListItem>{backendMeta}</ListItem>
                <Button block>Disconnect</Button>
            {/if}
        </span>
    </NavigationDrawer>
    <Settings bind:active={settingsActive} />
    <Overlay
        index={1}
        {active}
        on:click={() => {
            active = false;
        }}
        absolute
    />
    <ImageViewer />
</MaterialApp>

<style lang="scss" src="./App.scss" global></style>

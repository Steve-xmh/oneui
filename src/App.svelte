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
    } from 'svelte-materialify';
    import { mdiMenu } from '@mdi/js';
    import { ConnectMethod, onebot } from './onebot';
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
    import l from './i18n/index';
import { users } from './stores/users';
    let active = false;
    let settingsActive = false;
    let mini = false;
    let connected = false;
    let connectMethod = 0;
    let connectUrl = 'ws://localhost:5700';
    let connectHttpUrl = 'http://localhost:5700';
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
            users.setUser(baseMsg.user_id, {
                nickname: baseMsg.sender.nickname
            })
            messageDB.addMessage(cid, baseMsg.raw_message);
        } else if (baseMsg.message_type === MessageType.Group) {
            const cid = getContactID(
                ((baseMsg as unknown) as GroupMessage).group_id,
                true
            );
            users.setUser(baseMsg.user_id, {
                nickname: baseMsg.sender.nickname
            })
            messageDB.addMessage(cid, baseMsg.raw_message, baseMsg.user_id);
        }
    });

    function connectHost() {
        if (connectUrl.length > 0) {
            const methods = [
                ConnectMethod.WebSocket,
                ConnectMethod.HttpPost
            ]
            const urls = [
                connectUrl,
                connectHttpUrl
            ]
            onebot.connect(methods[connectMethod], urls[connectMethod], connectUrlAuth.length > 0 ? connectUrlAuth : undefined);
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
                <CardTitle>{l('oneui.connect.title')}</CardTitle>
                <Tabs bind:value={connectMethod} class="primary-text" fixedTabs>
                    <div slot="tabs">
                        <Tab>WebSocket</Tab>
                        <Tab>HTTP</Tab>
                    </div>
                </Tabs>
                <Window value={connectMethod}>
                    <WindowItem>
                        <CardText>
                            <div class="mb-4">{l('oneui.connect.websocket.warning')}</div>
                            <TextField
                                bind:value={connectUrl}
                            >{l('oneui.connect.websocket.field.url')}</TextField>
                        </CardText>
                    </WindowItem>
                    <WindowItem>
                        <CardText>
                            <div class="mb-4">{l('oneui.connect.http.warning')}</div>
                            <TextField class="mb-2" bind:value={connectHttpUrl}>Connect Url</TextField>
                            <TextField bind:value={connectUrlAuth}>Access Token</TextField>
                        </CardText>
                    </WindowItem>
                </Window>
                <CardActions>
                    <Button
                        text
                        block
                        class="primary-text"
                        disabled={connectUrl.length === 0}
                        on:click={connectHost}>{l('oneui.connect.button.text')}</Button
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
                }}>{l('oneui.settings')}</ListItem
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

<style lang="scss">
    @import 'svelte-materialify/src/styles/tools/colors';
    $primary-color: material-color('blue', 'base');
</style>

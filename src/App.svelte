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
    } from 'svelte-materialify';
    import { mdiMenu } from '@mdi/js';
    import { OneBotWS, onebot } from './onebot';
    import type { MessageMessage, GroupMessage } from './onebot/messages';
    import { MessageType } from './onebot/messages';
    import { getContactID } from './stores/contact';
    import { messageDB } from './stores/messages';
    import Chat from './components/chat/Chat.svelte';
    import { selfData } from './stores/self';
    import ImageViewer from './components/utils/ImageViewer.svelte';
    import { Theme, theme } from './stores/theme';
    let active = false;
    let mini = false;
    let connected = false;
    let connectUrl = 'ws://localhost:5700';
    let backendMeta = '';

    function onGetFriendsInfo(e: CustomEvent) {
        selfData.setFriends(e.detail.data);
    }

    function onGetGroupsInfo(e: CustomEvent) {
        selfData.setGroups(e.detail.data);
    }

    function onGetVersionInfo(e: CustomEvent) {
        backendMeta = `Connected ${
            e.detail.data?.app_name || e.detail.data?.name
        } v${e.detail.data?.app_version || e.detail.data?.version}`;
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

<MaterialApp theme={$theme === Theme.Dark ? 'dark' : 'light'}>
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
        <Chat {onebot} />
    {/if}
    <NavigationDrawer clipped fixed {mini} {active}>
        <List>
            <ListItem>Settings</ListItem>
        </List>
        <span slot="append" class="pa-2">
            <ListItem>{backendMeta}</ListItem>
            <Button block>Disconnect</Button>
        </span>
    </NavigationDrawer>
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

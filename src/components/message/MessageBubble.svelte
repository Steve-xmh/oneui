<script lang="ts">
    import type { CQMessage } from '../../onebot/messages';
    import { settings } from '../../stores/settings';
    import { Theme } from '../../stores/theme';
import { users } from '../../stores/users';
    import Message from './Message.svelte';
    export let style: string;
    export let userId: number = 0;
    export let messages: CQMessage[] = [];
    export let className: string = '';
</script>

<div class="bubble mt-2" classname={className} {style}>
    <img
        width={35}
        height={35}
        class="avatar"
        class:hide={userId === 0}
        src={`http://q1.qlogo.cn/g?b=qq&nk=${userId}&s=640`}
        alt=""
    />
    <div class="bubble-left" class:dark={$settings.theme === Theme.Dark} />
    <div class="d-flex flex-column">
        {#each messages as message, i (i)}
            <div
                class="bubble-main"
                class:mt-1={i !== 0}
                class:dark={$settings.theme === Theme.Dark}
            >
            {#if i === 0 && (userId in $users)}
                <div
                    class="font-weight-bold green-text mr-2 ml-2 mt-2"
                    class:mb-n3={['text'].includes(message.type)}
                    class:mb-2={!(['text'].includes(message.type))}
                >{$users[userId].card || $users[userId].nickname}</div>
            {/if}
                <Message {message} />
            </div>
        {/each}
    </div>
</div>

<style>
    .hide {
        opacity: 0;
    }
    .bubble {
        align-items: flex-end;
        display: flex;
    }
    .avatar {
        width: 35px;
        height: 35px;
        border-radius: 50%;
    }
    .bubble-left {
        min-width: 8px;
        min-height: 8px;
        width: 8px;
        height: 8px;
        bottom: 0;
        background: radial-gradient(
            16px at left top,
            transparent 48%,
            #e0e0e0 50%
        );
        filter: drop-shadow(0 1px 2px #0003);
    }
    .dark.bubble-left {
        background: radial-gradient(
            16px at left top,
            transparent 48%,
            #343434 50%
        );
    }
    .bubble-main {
        /* padding: 8px; */
        background-color: #e0e0e0;
        width: fit-content;
        height: fit-content;
        line-break: auto;
        word-break: break-word;
        white-space: pre-line;
        border-radius: 8px;
        color: black;
        max-width: 450px;
        margin-bottom: 4px;
        overflow: visible;
        transition: all 0.2s;
        filter: drop-shadow(0 1px 2px #0003);
    }

    .dark.bubble-main {
        background-color: #343434;
        color: #eeeeee;
    }

    .bubble-main:last-child {
        margin-bottom: 0;
        border-radius: 8px 8px 8px 0;
    }
</style>

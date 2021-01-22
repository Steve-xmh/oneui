<script lang="ts">
    import type { CQMessage } from "../../onebot/messages";
import ImageMessage from "./ImageMessage.svelte";
import RawMessage from "./RawMessage.svelte";
import TextMessage from "./TextMessage.svelte";
    export let userId: number = 0;
    export let userName: string = ''
    export let messages: CQMessage[] = [];
    export let className: string = '';
</script>

<div class="bubble pt-2" classname={className}>
    <img width={35} height={35} class="avatar" class:hide={userId === 0} src={`http://q1.qlogo.cn/g?b=qq&nk=${userId}&s=640`} alt="" />
    <div class="bubble-left" />
    <div>
        {#each messages as message, i (i)}
            <div class="bubble-main">
                <div class="font-weight-medium">{userName}</div>
                {#if message.type === 'text' && message.data.text.trim().length > 0}
                    <TextMessage {message} />
                {:else if message.type === 'image'}
                    <ImageMessage {message} />
                {:else}
                    <RawMessage {message} />
                {/if}
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
          16px at left top,transparent 48%,white 50%);
        filter: drop-shadow(0 1px 2px #0003);
    }
    .bubble-main {
        /* padding: 8px; */
        background-color: white;
        width: fit-content;
        height: fit-content;
        line-break: auto;
        word-break: break-word;
        white-space: pre-line;
        border-radius: 8px;
        color: black;
        max-width: 450px;
        margin-bottom: 4px;
        overflow: hidden;
        filter: drop-shadow(0 1px 2px #0003);
    }

    .bubble-main:last-child {
        margin-bottom: 0;
        border-radius: 8px 8px 8px 0;
    }
</style>

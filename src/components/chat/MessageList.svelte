<script lang="ts">
    import MessageBubble from "../message/MessageBubble.svelte";
    import { contact } from "../../stores/contact";
    import { messageDB } from "../../stores/messages";
    import { onMount } from "svelte";
    export let msgdiv: HTMLDivElement
    export let autoScroll = true;
    export let className = "";
    $: hasMessages = $contact in $messageDB;
    $: messages = $messageDB[$contact];
    
    onMount(async () => {
        msgdiv.addEventListener('wheel', () => {
            const isScrolledToBottom = msgdiv.scrollHeight - msgdiv.clientHeight <= msgdiv.scrollTop + 10;
            autoScroll = isScrolledToBottom
        })
    })
</script>

<!-- <MessageBubble userId={776470918} userName="SteveXMH" message="Hello World!"/> -->

<div class={className + ' message-list'} bind:this={msgdiv}>
    <div class="spacer" />
    {#if hasMessages}
        {#each messages as msg}
            <MessageBubble className="mt-2" userId={msg.userId} messages={msg.messages} />
        {/each}
    {/if}
</div>

<style>
    .spacer {
        flex-grow: 1;
    }
    .message-list {
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        overflow-x: hidden;
        word-wrap: break-word;
    }
</style>

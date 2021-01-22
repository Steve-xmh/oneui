<script lang="ts">
    import MessageBubble from "./components/message/MessageBubble.svelte";
import { contact } from "./stores/contact";
    import { messageDB } from "./stores/messages";
    export let msgdiv: HTMLDivElement
    export let className = "";
    $: hasMessages = $contact in $messageDB;
    $: messages = $messageDB[$contact];
</script>

<!-- <MessageBubble userId={776470918} userName="SteveXMH" message="Hello World!"/> -->

<div class={className + ' message-list'} bind:this={msgdiv}>
    <div class="spacer" />
    {#if hasMessages}
        {#each messages as msg}
            <MessageBubble className="pt-2" userId={msg.userId} message={msg.rawMessage} />
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

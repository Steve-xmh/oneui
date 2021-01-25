
<script lang="ts">
    import type { CQMessage } from "../../onebot/messages";
    import AtMessage from "./AtMessage.svelte";
    import FaceMessage from "./FaceMessage.svelte";
    import ImageMessage from "./ImageMessage.svelte";
    import RawMessage from "./RawMessage.svelte";
    import TextMessage from "./TextMessage.svelte";
    import ReplyMessage from "./ReplyMessage.svelte";
    import FileMessage from "./FileMessage.svelte";
    export let message: CQMessage
</script>

{#if message.type === 'text' && message.data.text.trim().length > 0}
    <TextMessage {message} />
{:else if message.type === 'image'}
    <ImageMessage {message} />
{:else if message.type === 'face'}
    <FaceMessage {message} />
{:else if message.type === 'at'}
    <AtMessage {message} />
{:else if message.type === 'reply'}
    <ReplyMessage {message} />
{:else if message.type === 'file'}
    <FileMessage {message} />
{:else if message.type !== 'text'}
    <RawMessage {message} />
{/if}

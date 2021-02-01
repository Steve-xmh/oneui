<script lang="ts">
    import type { CQMessage } from '../../onebot/messages';
    import AtMessage from './AtMessage.svelte';
    import FaceMessage from './FaceMessage.svelte';
    import ImageMessage from './ImageMessage.svelte';
    import RawMessage from './RawMessage.svelte';
    import TextMessage from './TextMessage.svelte';
    import ReplyMessage from './ReplyMessage.svelte';
    import RecordMessage from './RecordMessage.svelte';
    import FileMessage from './FileMessage.svelte';
    import { settings } from '../../stores/settings';
    export let message: CQMessage;
    const messages = {
        text: TextMessage,
        image: ImageMessage,
        record: RecordMessage,
        face: FaceMessage,
        at: AtMessage,
        reply: ReplyMessage,
        file: FileMessage,
    }
</script>

{#if $settings.allRaw || !(message.type in messages)}
    <RawMessage {message} />
{:else}
    <svelte:component this={messages[message.type]} {message} />
{/if}

<script lang="ts">
    import type { CQMessage } from "../../onebot/messages";
    // import { Marked } from '@ts-stack/markdown';
    import marked from 'marked';
    import { markdown } from "../../stores/markdown";
    export let message: CQMessage
</script>
<div class="ma-2" class:markdown={$markdown}>
    {#if $markdown}
        {@html marked.parse(message.data.text)}
    {:else}
        {message.data.text}
    {/if}
</div>
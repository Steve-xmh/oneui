<script lang="ts">
    import type { CQMessage } from '../../onebot/messages';
    import { settings } from '../../stores/settings';
    import marked from 'marked';
    export let message: CQMessage;
</script>

<div class="ma-2" class:markdown={$settings.markdown}>
    {#if $settings.markdown}
        {@html marked.parse(message.data.text)}
    {:else}
        {message.data.text}
    {/if}
</div>

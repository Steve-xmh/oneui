<script lang="ts">
    import type { CQMessage } from '../../onebot/messages';
    import { ProgressCircular } from 'svelte-materialify/src';
    import Message from './Message.svelte';
    export let message: CQMessage;
</script>

<div class="ma-2 pl-1 reply">
    Reply:<br />
    {#await message.data.detail}
        <ProgressCircular indeterminate />
    {:then result}
        {#if result}
            {#each result as msg}
                <Message message={msg} />
            {/each}
        {:else}
            <span class="red-text">Failed to resolve reply detail.</span>
        {/if}
    {/await}
</div>

<style>
    .reply {
        border-left: 2px solid #64b5f6;
    }
</style>

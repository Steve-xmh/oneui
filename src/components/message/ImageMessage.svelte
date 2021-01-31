<script lang="ts">
    import type { CQMessage } from '../../onebot/messages';
    import { imageViewer } from '../utils/ImageViewer.svelte';
    import { Icon, ProgressCircular } from 'svelte-materialify/src';
    import { mdiAlertCircleOutline } from '@mdi/js';
    export let message: CQMessage;
</script>

{#await message.data.detail}
    <ProgressCircular indeterminate size={30} class="ma-6" />
{:then url}
    <img
        src={url}
        alt=""
        referrerPolicy="no-referrer"
        on:click={() => imageViewer.show(url)}
    />
{:catch}
    <Icon size={30} class="ma-6 red-text" path={mdiAlertCircleOutline} />
{/await}

<style>
    img {
        max-height: 200px;
        max-width: 100%;
        border-radius: 8px;
        display: block;
    }
</style>

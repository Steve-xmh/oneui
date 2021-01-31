<script lang="ts">
    import type { CQMessage } from '../../onebot/messages';
    import { Icon, Ripple } from 'svelte-materialify/src';
    import { getSizeString } from '../../utils/size';
    import { getFileIconPath } from '../../utils/file-icons';
    export let message: CQMessage;
</script>

<div
    class="d-flex pa-2 pr-4 s-btn text depressed file"
    use:Ripple
    on:click={() => window.open(message.data.url)}
>
    <Icon class="ma-2 mr-4" path={getFileIconPath(message.data.name)} />
    <div>
        <div class="text--primary text">{message.data.name}</div>
        <div class="text--secondary text-caption">
            {getSizeString(message.data.size)}
        </div>
    </div>
</div>

<style>
    .file {
        cursor: pointer;
        border-radius: 8px;
    }
    .text {
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
    }
</style>

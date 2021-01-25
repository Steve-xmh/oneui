<script lang="ts">
    import type { CQMessage } from "../../onebot/messages";
    import { imageViewer } from "../utils/ImageViewer.svelte";
    import { Icon, ProgressCircular } from "svelte-materialify";
    import { mdiAlertCircleOutline } from "@mdi/js";
    export let message: CQMessage
</script>
{#await message.data.detail}
    <ProgressCircular indeterminate size={30} class="ma-2 ml-6"/>
{:then url} 
    <div class="text-caption orange-text ma-2">
        Due to the oneui-audio is work in progress, you can't listen this undecoded audio record.
    </div>
    <!-- svelte-ignore a11y-media-has-caption -->
    <audio controls src={url} crossorigin="anonymous" class="ma-2" />
{:catch}
    <Icon size={30} class="ma-2 red-text" path={mdiAlertCircleOutline}/>
{/await}
<style>
    audio {
        max-height: 200px;
        max-width: 100%;
        display: block;
    }
</style>
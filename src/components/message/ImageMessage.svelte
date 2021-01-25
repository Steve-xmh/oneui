<script lang="ts">
    import type { CQMessage } from "../../onebot/messages";
    import { imageViewer } from "../utils/ImageViewer.svelte";
    export let message: CQMessage
</script>

<img src={message.data.url} alt="" referrerPolicy="no-referrer" on:click={() => imageViewer.show(message.data.url)}/>
<style>
    img {
        max-height: 200px;
        max-width: 100%;
        display: block;
    }
</style>
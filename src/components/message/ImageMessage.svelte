<script lang="ts">
    import type { CQMessage } from "../../onebot/messages";
    export let message: CQMessage
</script>

<img src={message.data.url} alt="" referrerpolicy="no-referrer" />
<style>
    img {
        max-height: 200px;
        max-width: 100%;
        display: block;
    }
</style>
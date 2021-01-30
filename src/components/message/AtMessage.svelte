<script lang="ts">
    import type { CQMessage } from "../../onebot/messages";
    export let message: CQMessage
</script>
<div class="ma-2 blue-text" alt={'QQ: ' + message.data.qq}>
    {message.data.text}
</div>
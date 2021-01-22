<script lang="ts">
    import type { CQMessage } from "../../onebot/messages";
    export let message: CQMessage
</script>
<div class="pa-2">
    {message.data.text}
</div>
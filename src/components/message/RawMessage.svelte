<script lang="ts">
    import type { CQMessage } from "../../onebot/messages";
    import { stringifyOne } from "../../utils/cqcode";
    export let message: CQMessage
</script>
<div class="pa-2">
    <div class="raw-code">
    {stringifyOne(message)}
    </div>
    <div class="raw">RAW</div>
</div>
<style>
    .raw {
        color: green;
        font-size: 7px;
        font-weight: bold;
    }
    .raw-code {
        font-family: monospace;
    }
</style>
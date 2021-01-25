<script lang="ts">
    import type { CQMessage } from "../../onebot/messages";
    import { Icon, Card, CardTitle, CardSubtitle, CardActions, Button } from 'svelte-materialify';
    import { mdiDownload } from '@mdi/js';
    export let message: CQMessage
</script>
<Card>
    <CardTitle>File</CardTitle>
    <CardSubtitle>{message.data.name}</CardSubtitle>
    <CardActions>
        <Button on:click={() => window.open(message.data.url)}>
            <Icon path={mdiDownload} />
            Download
        </Button>
    </CardActions>
</Card>

<script lang="ts">
    import type { CQMessage } from "../../onebot/messages";
    import { Icon, Card, CardTitle, CardSubtitle, CardActions, Button } from 'svelte-materialify';
    import { mdiDownload } from '@mdi/js';
    export let message: CQMessage
</script>
<Card class="transparent">
    <CardTitle>File</CardTitle>
    <CardSubtitle>{message.data.name}</CardSubtitle>
    <CardActions>
        <Button text on:click={() => window.open(message.data.url)}>
            <Icon path={mdiDownload} class="mr2" />
            Download
        </Button>
    </CardActions>
</Card>

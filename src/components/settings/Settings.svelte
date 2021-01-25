<script lang="ts">
    import { Button, Card, CardActions, CardText, CardTitle, Overlay, Switch } from "svelte-materialify";
    import { Theme, theme } from "../../stores/theme";
    import { markdown } from "../../stores/markdown";
    export let active = false;
</script>
<Overlay {active}>
    <Card style="max-width:500px;">
        <CardTitle>Settings</CardTitle>
        <CardText>
            <div>
                <Switch checked={$theme === Theme.Dark} on:change={() => theme.setTheme($theme === Theme.Dark ? Theme.Light : Theme.Dark)}>Dark Mode</Switch>
            </div>
            <div>
                <Switch checked={$markdown} on:change={() => markdown.set(!$markdown)}>Enable Markdown (Expermantal)</Switch>
            </div>
        </CardText>
        <CardActions>
            <Button on:click={() => { active = false }}>Save and close</Button>
        </CardActions>
    </Card>
</Overlay>
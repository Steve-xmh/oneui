<script lang="ts">
    import {
        Button,
        Card,
        CardActions,
        CardText,
        CardTitle,
        Overlay,
        Switch,
    } from 'svelte-materialify/src';
    import { Theme } from '../../stores/theme';
    import { settings } from '../../stores/settings';
    import { CQFaceType } from '../../stores/face';
    export let active = false;
</script>

<Overlay {active}>
    <Card style="max-width:500px;">
        <CardTitle>Settings</CardTitle>
        <CardText class="ml-4 mr-4">
            <div />
            <Switch
                checked={$settings.theme === Theme.Dark}
                on:change={() =>
                    settings.setSetting(
                        'theme',
                        $settings.theme === Theme.Dark
                            ? Theme.Light
                            : Theme.Dark
                    )}
            >
                Dark Mode
            </Switch>
            <div />
            <Switch
                checked={$settings.markdown}
                on:change={() =>
                    settings.setSetting('markdown', !$settings.markdown)}
            >
                Enable Markdown (Expermantal)
            </Switch>
            <div />
            <Switch
                checked={$settings.allRaw}
                on:change={() =>
                    settings.setSetting('allRaw', !$settings.allRaw)}
            >
                Show messages as raw message
            </Switch>
            <div />
            <Switch
                checked={$settings.faceType === CQFaceType.Dynamic}
                on:change={() =>
                    settings.setSetting(
                        'faceType',
                        $settings.faceType === CQFaceType.Dynamic
                            ? CQFaceType.Static
                            : CQFaceType.Dynamic
                    )}
            >
                Use dynamic face image
            </Switch>
            <Switch
                checked={$settings.hideFaceOutline}
                on:change={() =>
                    settings.setSetting(
                        'hideFaceOutline',
                        !$settings.hideFaceOutline
                    )}
            >
                Use white background to hide dynamic face white outline
            </Switch>
        </CardText>
        <CardActions>
            <Button
                text
                on:click={() => {
                    active = false;
                }}
            >
                Save
            </Button>
            <Button
                text
                on:click={() => {
                    settings.reset();
                }}
            >
                Reset
            </Button>
        </CardActions>
    </Card>
</Overlay>

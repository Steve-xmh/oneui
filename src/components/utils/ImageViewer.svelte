<script context="module" lang="ts">
    import { writable } from 'svelte/store';
    const { subscribe, set, update } = writable({
        active: false,
        image: '',
    });
    export const imageViewer = {
        subscribe,
        show: (image: string) =>
            update((v) => {
                v.active = true;
                v.image = image;
                return v;
            }),
        hide: () =>
            update((v) => {
                v.active = false;
                return v;
            }),
    };
</script>

<script lang="ts">
    import { Overlay } from 'svelte-materialify/src';
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<Overlay absolute active={$imageViewer.active} on:click={imageViewer.hide}>
    <img class="elevation-10" src={$imageViewer.image} />
</Overlay>

<style>
    img {
        max-width: 95%;
        max-height: 90%;
    }
</style>

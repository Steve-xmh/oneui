<script lang="ts">
    import type { CQMessage } from '../../onebot/messages';
    import { imageViewer } from '../utils/ImageViewer.svelte';
    import {
        Button,
        Icon,
        ProgressCircular,
        Slider,
    } from 'svelte-materialify/src';
    import { mdiAlertCircleOutline, mdiPlay, mdiStop } from '@mdi/js';
    import type { PCMSource } from '../../utils/audio';
    export let message: CQMessage;
    let playbackPosition = 0;
    let startTime = 0;
    let bufSource: AudioBufferSourceNode;
    function moveSlider() {
        if (startTime !== 0) {
            playbackPosition = (Date.now() - startTime) / 1000;
            requestAnimationFrame(moveSlider);
        }
    }
    function timeToString(t: number): string {
        if (t < 60) {
            return Math.floor(t).toString() + '″';
        } else {
            const m = Math.floor(t / 60).toString();
            const s = Math.floor(t % 60).toString();
            return m + '′' + s + '″';
        }
    }
    function playOrStop(source: PCMSource) {
        if (startTime === 0) {
            startTime = Date.now() - playbackPosition * 1000;
            const buf = source.ctx.createBuffer(
                1,
                source.source.length,
                source.rate
            );
            bufSource = source.ctx.createBufferSource();
            bufSource.addEventListener('ended', () => {
                startTime = 0;
                playbackPosition = 0;
            });
            buf.copyToChannel(source.source, 0);
            bufSource.buffer = buf;
            bufSource.start(0, playbackPosition);
            bufSource.connect(source.ctx.destination);
            requestAnimationFrame(moveSlider);
        } else {
            startTime = 0;
            bufSource.stop();
        }
    }
</script>

{#if message.data.detail}
    {#await message.data.detail}
        <ProgressCircular indeterminate size={30} class="ma-2" />
    {:then source}
        <div
            class="audio-div d-flex ma-2 mb-0 align-center align-content-center"
        >
            <Button icon on:click={() => playOrStop(source)}>
                <Icon path={startTime === 0 ? mdiPlay : mdiStop} />
            </Button>
            <Slider
                thumb={startTime !== 0}
                style="margin:8px 18px 0 0;"
                bind:value={playbackPosition}
                max={source.length}
            />
            <span class="mr-2">
                {timeToString(Math.round(playbackPosition))}/{timeToString(
                    Math.round(source.length)
                )}
            </span>
        </div>
    {:catch}
        <Icon size={30} class="ma-2 red-text" path={mdiAlertCircleOutline} />
    {/await}
{:else}
    <Icon size={30} class="ma-2 red-text" path={mdiAlertCircleOutline} />
{/if}

<style>
    .audio-div {
        max-width: 300px;
        min-width: 250px;
    }
</style>

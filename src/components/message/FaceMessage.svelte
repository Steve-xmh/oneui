<script lang="ts">
    import type { CQMessage } from '../../onebot/messages';
    import { CQFaceType } from '../../stores/face';
    import { settings } from '../../stores/settings';
    export let message: CQMessage;
    // https://github.com/kyubotics/coolq-http-api/blob/bbfe6c7a370cdf2c37f510068c1168db78b0ea9f/docs/qq-face/0.png?raw=true
    const faceFileTypes = {
        [CQFaceType.Static]: '.png',
        [CQFaceType.Dynamic]: '.gif',
    };
    const baseUrl =
        'https://cdn.jsdelivr.net/gh/kyubotics/coolq-http-api@bbfe6c7a370cdf2c37f510068c1168db78b0ea9f/docs/qq-face/';
</script>

<img
    class:white={$settings.hideFaceOutline &&
        $settings.faceType === CQFaceType.Dynamic}
    src={baseUrl + message.data.id + faceFileTypes[$settings.faceType]}
    alt=""
/>

<style>
    img {
        max-height: 200px;
        max-width: 100%;
        border-radius: 8px;
        display: block;
    }
</style>

<script lang="ts">
    import type { CQMessage } from "../../onebot/messages";
    import { CQFaceType, faceType } from "../../stores/face";
    export let message: CQMessage
    // https://github.com/kyubotics/coolq-http-api/blob/bbfe6c7a370cdf2c37f510068c1168db78b0ea9f/docs/qq-face/0.png?raw=true
    const faceFileTypes = {
        [CQFaceType.Static]: '.png',
        [CQFaceType.Dynamic]: '.png'
    }
    const baseUrl = 'https://raw.github.com/kyubotics/coolq-http-api/bbfe6c7a370cdf2c37f510068c1168db78b0ea9f/docs/qq-face/'

</script>

<img src={baseUrl + message.data.id + faceFileTypes[$faceType]} alt="" />
<style>
    img {
        max-height: 200px;
        max-width: 100%;
        display: block;
    }
</style>
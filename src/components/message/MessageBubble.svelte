<script lang="ts">
    export let userId: number = 0;
    export let userName: string = ''
    export let message: string = "";
    export let className: string = '';
</script>

<div class="bubble pt-2" classname={className}>
    <img width={35} height={35} class="avatar" class:hide={userId === 0} src={`http://q1.qlogo.cn/g?b=qq&nk=${userId}&s=640`} alt="" />
    <div class="bubble-left" />
    <div class="bubble-main">
        <div class="font-weight-medium">{userName}</div>
        {message}
    </div>
</div>

<style>
    .hide {
        opacity: 0;
    }
    .bubble {
        align-items: flex-end;
        display: flex;
    }
    .avatar {
        width: 35px;
        height: 35px;
        border-radius: 50%;
    }
    .bubble-left {
        min-width: 8px;
        min-height: 8px;
        width: 8px;
        height: 8px;
        bottom: 0;
        background: radial-gradient(
          16px at left top,transparent 48%,white 50%);
    }
    .bubble-main {
        padding: 8px;
        background-color: white;
        height: fit-content;
        line-break: auto;
        word-break: break-word;
        white-space: pre-line;
        border-radius: 8px 8px 8px 0;
        color: black;
        max-width: 450px;
    }
</style>

<template>
    <div class="flex-1 text-white flex flex-col justify-center p-8">
    <h1 class="font-bold text-4xl">OneUI</h1>
    <div class="my-4">A brand new OneBot/NeonBot debugger on web!</div>
    <TextBox />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import TextBox from '../components/TextBox.vue'
export default defineComponent({
    components: {
        TextBox,
    }
})
</script>

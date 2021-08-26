<template>
    <div class="flex-1 text-white flex flex-col p-8">
        <h2 class="font-bolder my-4 text-xl">Debug Page</h2>
        <h3 class="text-lg">Message Component Test</h3>
        <textarea v-model="messageText" class="rounded p-2 text-black overflow-y-scroll" />
        <code>
            <pre>{{ messageArray }}</pre>
        </code>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import TextBox from '../components/TextBox.vue'
import { tryParse } from '../utils/cqcode'
export default defineComponent({
    components: {
        TextBox,
    },
    setup(props, ctx) {
        const messageText = ref('')
        const messageArray = computed(() => JSON.stringify(tryParse(messageText.value), null, 4))
        return {
            messageText,
            messageArray
        }
    }
})
</script>

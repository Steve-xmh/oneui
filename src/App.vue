<template>
    <div class="fixed flex w-full h-full overflow-hidden select-none flex-row bg-blue-300">
        <!-- SideBar -->
        <div class="bg-blue-500 w-16 flex flex-col">
            <Button @click="pageNum = 0" :class="{ 'opacity-100': pageNum === 0 }">Main</Button>
            <Button @click="pageNum = 1" :class="{ 'opacity-100': pageNum === 1 }">Debug</Button>
        </div>
        <div class="bg-blue-400 w-16"></div>
        <!-- MainPage -->
        <Main v-if="pageNum === 0" />
        <Debug v-if="pageNum === 1" />
    </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue'
import TextBox from './components/TextBox.vue'
import Button from './components/Button.vue'
import Main from './pages/Main.vue'
import Debug from './pages/Debug.vue'

export default defineComponent({
    components: {
        TextBox,
        Button,
        Main,
        Debug,
    },
    setup() {
        const pageNum = ref(0)
        return {
            pageNum
        };
    },
});
</script>

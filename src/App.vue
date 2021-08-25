<template>
  <div class="fixed flex w-full h-full overflow-hidden select-none flex-row bg-blue-300">
    <!-- SideBar -->
    <div class="bg-blue-500 w-16"></div>
    <div class="bg-blue-400 w-16"></div>
    <!-- MainPage -->
    <div class="flex-1 text-white flex flex-col justify-center p-8">
      <h1 class="font-bold text-4xl">OneUI</h1>
      <div class="my-4">A brand new OneBot/NeonBot debugger on web!</div>
      <TextBox />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineComponent } from 'vue'
import TextBox from './components/TextBox.vue'
</script>

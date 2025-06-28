<template>
  <ReverseEngineerPrompt @back="router.push('/')" />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import ReverseEngineerPrompt from '../components/ReverseEngineerPrompt.vue'

const router = useRouter()
</script>



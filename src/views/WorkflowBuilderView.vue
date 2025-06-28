<template>
  <WorkflowBuilder 
    v-if="workflow"
    :workflow="workflow"
    @update="handleUpdate"
    @save="handleSave"
    @cancel="handleCancel"
  />
</template>

<script setup lang="ts">
//v-if="store.isEditingWorkflow && store.activeWorkflow"
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '../stores/app'
import WorkflowBuilder from '../components/WorkflowBuilder.vue'
import type { Workflow } from '../types/appTypes'

const router = useRouter()
const route = useRoute()
const store = useAppStore()

const workflow = computed(() => {
  if (route.query.workflowId) {
    return store.activeProject?.workflows.find((w: Workflow) => w.id === route.query.workflowId) || store.activeWorkflow
  }
  return store.activeWorkflow
})

const handleUpdate = (updatedWorkflow: Workflow) => {
  store.activeWorkflow = updatedWorkflow
}

const handleSave = () => {
  store.saveWorkflow()
  router.push('/workflows')
}

const handleCancel = () => {
  router.push('/workflows')
}
</script>
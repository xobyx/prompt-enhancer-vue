<template>
  <WorkflowRunner 
    v-if="workflow"
    :workflow="workflow"
    :api-key="store.apiKey"
    :model-params="store.modelParams"
    @complete="handleComplete"
    @cancel="handleCancel"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '../stores/app'
import WorkflowRunner from '../components/WorkflowRunner.vue'
import type { Workflow ,WorkflowExecution} from '../types/appTypes'

const router = useRouter()
const route = useRoute()
const store = useAppStore()

const workflow = computed(() => {
  if (route.query.workflowId) {
    return store.activeProject?.workflows.find((w: Workflow) => w.id === route.query.workflowId) || store.activeWorkflow
  }
  return store.activeWorkflow
})

const handleComplete = (exec:WorkflowExecution) => {
  store.completeWorkflow(exec)
  router.push('/workflows')
}

const handleCancel = () => {
  store.isRunningWorkflow = false
  router.push('/workflows')
}
</script>
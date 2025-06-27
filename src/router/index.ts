import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import WorkflowsView from '../views/WorkflowsView.vue'
import WorkflowBuilderView from '../views/WorkflowBuilderView.vue'
import WorkflowRunnerView from '../views/WorkflowRunnerView.vue'
import WorkflowHistoryView from '../views/WorkflowHistoryView.vue'
import ReverseEngineeringView from '../views/ReverseEngineeringView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { title: 'Prompt Engineering Assistant' }
  },
  {
    path: '/workflows',
    name: 'workflows',
    component: WorkflowsView,
    meta: { title: 'Workflow Management' }
  },
  {
    path: '/workflows/build',
    name: 'workflow-builder',
    component: WorkflowBuilderView,
    props: route => ({ workflowId: route.query.workflowId }),
    meta: { title: 'Workflow Builder' }
  },
  {
    path: '/workflows/run',
    name: 'workflow-runner',
    component: WorkflowRunnerView,
    props: route => ({ workflowId: route.query.workflowId }),
    meta: { title: 'Workflow Runner' }
  },
  {
    path: '/workflows/history',
    name: 'workflow-history',
    component: WorkflowHistoryView,
    props: route => ({ executionId: route.query.executionId }),
    meta: { title: 'Workflow History' }
  },
  {
    path: '/reverse-engineering',
    name: 'reverse-engineering',
    component: ReverseEngineeringView,
    meta: { title: 'Reverse Engineering' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Prompt Engineering Assistant'
  next()
})

export default router
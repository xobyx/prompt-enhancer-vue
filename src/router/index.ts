import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import WorkflowsView from '../views/WorkflowsView.vue'
import WorkflowBuilderView from '../views/WorkflowBuilderView.vue'
import WorkflowRunnerView from '../views/WorkflowRunnerView.vue'
import WorkflowHistoryView from '../views/WorkflowHistoryView.vue'
import ReverseEngineeringView from '../views/ReverseEngineeringView.vue'
import LogicAnalysisView from '../views/LogicAnalysisView.vue'
import a from '../views/a.vue'


const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: a,
    meta: { title: 'Prompt Engineering Assistant' }
  },
  {
    path: '/prompt-enhancer',
    name: 'prompt-enhancer',
    component: HomeView,
    meta: { title: 'Prompt Enhancer' } // Fixed typo: "Promp" -> "Prompt"
  },
  {
    path: '/workflows/build',
    name: 'workflow-builder',
    component: WorkflowBuilderView,
    props: route => ({ workflowId: route.query.workflowId }),
    meta: { title: 'Workflow Builder' }
  },
   {
    path: '/workflows',
    name: 'workflows',
    component: WorkflowsView,
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
  },
  {                                                            
    path: '/logic-analysis',
    name: 'logic-analysis',
    component: LogicAnalysisView,
    meta: { title: 'Logic Analysis' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title as string || 'Prompt Engineering Assistant'
  next()
})

export default router
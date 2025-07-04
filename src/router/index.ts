import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Views
import Welcome from '@/views/Welcome.vue'
import Login from '@/views/Login.vue'
import Cockpit from '@/components/Cockpit.vue'
import RulesetDetail from '@/views/RulesetDetail.vue'
import Search from '@/views/Search.vue'
import ManyToManyDemo from '@/views/ManyToManyDemo.vue'

// Cockpit Views (Admin)
import Dashboard from '@/views/cockpit/Dashboard.vue'
import RulesetManagement from '@/views/cockpit/RulesetManagement.vue'
import TypeManagement from '@/views/cockpit/TypeManagement.vue'
import TopicManagement from '@/views/cockpit/TopicManagement.vue'
import UserManagement from '@/views/cockpit/UserManagement.vue'
import RulesetEditor from '@/views/cockpit/RulesetEditor.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Welcome',
      component: Welcome,
      meta: { requiresAuth: false }
    },
    {
      path: '/search',
      name: 'Search',
      component: Search,
      meta: { requiresAuth: false }
    },

    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: { requiresAuth: false, hideForAuth: true }
    },
    {
      path: '/search',
      name: 'Search',
      component: Search,
      meta: { requiresAuth: false }
    },
    {
      path: '/ruleset/:id',
      name: 'RulesetDetail',
      component: RulesetDetail,
      meta: { requiresAuth: false },
      props: true
    },
    {
      path: '/cockpit',
      component: Cockpit,
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        {
          path: '',
          name: 'Dashboard',
          component: Dashboard
        },
        {
          path: 'rulesets',
          name: 'RulesetManagement',
          component: RulesetManagement
        },
        {
          path: 'rulesets/new',
          name: 'NewRuleset',
          component: RulesetEditor
        },
        {
          path: 'rulesets/:id/edit',
          name: 'EditRuleset',
          component: RulesetEditor,
          props: true
        },
        {
          path: 'rulesets/:id/manage',
          name: 'ManageRuleset',
          component: () => import('@/views/cockpit/RulesetEdit.vue'),
          props: true
        },
        {
          path: 'types',
          name: 'TypeManagement',
          component: TypeManagement
        },
        {
          path: 'topics',
          name: 'TopicManagement',
          component: TopicManagement
        },
        {
          path: 'users',
          name: 'UserManagement',
          component: UserManagement
        }
      ]
    },
    {
      path: '/demo',
      name: 'ManyToManyDemo',
      component: ManyToManyDemo,
      meta: { requiresAuth: false }
    },
    {
      path: '/demo/many-to-many',
      name: 'ManyToManyDemo',
      component: ManyToManyDemo,
      meta: { requiresAuth: true }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      redirect: '/'
    }
  ]
})

// Navigation Guards
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()

  // Token validieren falls vorhanden
  if (authStore.token && !authStore.user) {
    await authStore.validateToken()
  }

  // Überprüfe Authentifizierung
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  // Überprüfe Admin-Berechtigung
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next({ name: 'Welcome' })
    return
  }

  // Verstecke Route für authentifizierte Benutzer (z.B. Login-Seite)
  if (to.meta.hideForAuth && authStore.isAuthenticated) {
    next({ name: 'Welcome' })
    return
  }

  next()
})

export default router

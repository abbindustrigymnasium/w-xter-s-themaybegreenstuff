const routes = [
  {
    path: '/',
    component: () => import('src/pages/LoginPage.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') }
    ],
    meta: { title: 'Login' } 
  },

  // TODO: Remove this line when debugging is no longer needed
  {
    path: '/OriginalLayout',
    component: () => import('layouts/MainLayout.vue'),
    meta: { title: 'Original Layout' }
  },
  {
    path: '/dashboard',
    component: () => import('pages/DashboardPage.vue'),
    meta: { title: 'Dashboard' }
  },

  {
    path: '/userpage',
    component: () => import('layouts/UserLayout.vue'),
    meta: { title: 'User Page' }
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
    meta: { title: '404 Not Found' }
  }
]

export default routes

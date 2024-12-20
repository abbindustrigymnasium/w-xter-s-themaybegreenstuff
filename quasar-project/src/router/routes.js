const routes = [
  {
    path: '/',
    component: () => import('src/pages/LoginPage.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') }
    ]
  },

  // TODO: Remove this line when debugging is no longer needed
  {
    path: '/OriginalLayout',
    component: () => import('layouts/MainLayout.vue'),
  },
  {
    path: '/dashboard',
    component: () => import('pages/DashboardPage.vue'),
  },

  {
    path: '/userpage',
    component: () => import('layouts/UserLayout.vue'),
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes

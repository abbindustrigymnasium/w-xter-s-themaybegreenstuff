const routes = [
  {
    path: '/',
    redirect: '/user/userpage' // Redirect to the user page
  },
  {
    path: '/user/userpage',
    component: () => import('layouts/UserLayout.vue'),
    children: [
      { path: '', component: () => import('pages/UserPage.vue'), meta: { title: 'User Page', requiresAuth: false } }
    ]
  },
{
    path: '/user/adminpage',
    component: () => import('layouts/AdminLayout.vue'),
    children: [
      { path: '', component: () => import('pages/AdminPage.vue'), meta: { title: 'Admin Page', requiresAuth: true } }
    ]
  },
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue'),
    meta: { title: 'Login' }
  },
  {
    path: '/admin/usermanagement',
    component: () => import('layouts/MainLayout.vue'),
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
    meta: { title: '404 Not Found' }
  }

];

export default routes;
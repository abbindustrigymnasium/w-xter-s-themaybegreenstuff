import { createRouter, createWebHistory } from 'vue-router';
import { isAuthenticated } from '../auth'; // Import the authentication check function
import routes from './routes'; // Import the routes

const router = createRouter({
  history: createWebHistory(),
  routes // Ensure routes is correctly passed here
});

// Add a global beforeEach guard
router.beforeEach(async (to, from, next) => {
  const isAuth = await isAuthenticated();
  console.log(isAuth);
  if (to.meta.requiresAuth && (isAuth < 1)) {
    next('/login'); // Redirect to login page if not authenticated
  } else {
    next(); // Proceed to the route
  }
});

export default router; // Ensure router is exported
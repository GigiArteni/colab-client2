import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import { LocalStorage } from 'quasar';
import routes from './routes';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  // Navigation guard for authentication
  Router.beforeEach((to, from, next) => {
    const isAuthenticated = !!LocalStorage.getItem('access_token');

    // Check if route requires auth
    if (to.meta.requiresAuth && !isAuthenticated) {
      // Redirect to login with return URL
      return next({
        path: '/auth/login',
        query: { redirect: to.fullPath },
      });
    }

    // Check if route is for guests only
    if (to.meta.requiresGuest && isAuthenticated) {
      return next('/dashboard');
    }

    next();
  });

  return Router;
});

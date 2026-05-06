import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import { LocalStorage } from 'quasar';
import { useTenant } from 'src/composables/useTenant';
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

  // Navigation guard. Tenant slug is parsed from `window.location.hostname`
  // by `useTenant()`; this guard simply routes unresolved or invalid
  // workspaces to the appropriate landing pages. Routes opt out of the
  // tenant gate via `meta.allowsNoTenant`.
  Router.beforeEach((to, from, next) => {
    const isAuthenticated = !!LocalStorage.getItem('access_token');
    const tenant = useTenant();

    if (!to.meta.allowsNoTenant) {
      if (tenant.slug.value === null) {
        return next({ path: '/auth/no-workspace' });
      }
      if (
        tenant.lookupResult.value !== null &&
        (tenant.lookupResult.value.exists !== true ||
          tenant.lookupResult.value.status !== 'active')
      ) {
        return next({ path: '/auth/unknown-workspace' });
      }
    }

    if (to.meta.requiresAuth && !isAuthenticated) {
      return next({
        path: '/auth/login',
        query: { redirect: to.fullPath },
      });
    }

    if (to.meta.requiresGuest && isAuthenticated) {
      return next('/dashboard');
    }

    next();
  });

  return Router;
});

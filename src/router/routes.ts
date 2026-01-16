import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  // Auth routes (guest only)
  {
    path: '/auth',
    component: () => import('layouts/AuthLayout.vue'),
    meta: { requiresGuest: true },
    children: [
      {
        path: '',
        redirect: '/auth/login',
      },
      {
        path: 'login',
        name: 'login',
        component: () => import('pages/auth/LoginPage.vue'),
      },
      {
        path: 'forgot-password',
        name: 'forgot-password',
        component: () => import('pages/auth/ForgotPasswordPage.vue'),
      },
    ],
  },

  // Password Reset route (linked from email)
  // Backend sends: /password/reset?token=...&email=...
  {
    path: '/password',
    component: () => import('layouts/AuthLayout.vue'),
    meta: { requiresGuest: true },
    children: [
      {
        path: 'reset',
        name: 'password-reset',
        component: () => import('pages/auth/ResetPasswordPage.vue'),
      },
    ],
  },

  // Main app routes (authenticated)
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard',
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('pages/dashboard/DashboardPage.vue'),
      },
      // Invoices
      {
        path: 'invoices',
        name: 'invoices',
        component: () => import('pages/invoices/InvoiceListPage.vue'),
      },
      {
        path: 'invoices/:id',
        name: 'invoice-detail',
        component: () => import('pages/invoices/InvoiceDetailPage.vue'),
      },
      {
        path: 'invoices/:id/pay',
        name: 'invoice-pay',
        component: () => import('pages/payments/CheckoutPage.vue'),
      },
      // Subscriptions
      {
        path: 'subscriptions',
        name: 'subscriptions',
        component: () => import('pages/subscriptions/SubscriptionListPage.vue'),
      },
      {
        path: 'subscriptions/:id',
        name: 'subscription-detail',
        component: () => import('pages/subscriptions/SubscriptionDetailPage.vue'),
      },
      // Payments
      {
        path: 'payments/success',
        name: 'payment-success',
        component: () => import('pages/payments/PaymentSuccessPage.vue'),
      },
      // Profile
      {
        path: 'profile',
        name: 'profile',
        component: () => import('pages/profile/ProfilePage.vue'),
      },
      // Alert Preferences
      {
        path: 'alert-preferences',
        name: 'alert-preferences',
        component: () => import('pages/AlertPreferencesPage.vue'),
      },
    ],
  },

  // 404 - Always leave this as last one
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;

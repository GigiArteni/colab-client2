<template>
  <q-layout view="hHh lpR fFf">
    <!-- Minimal Header -->
    <q-header class="app-header">
      <q-toolbar class="app-toolbar">
        <!-- Entity Branding -->
        <div class="app-brand" @click="goToDashboard">
          <template v-if="entityStore.selectedEntity?.logo?.url">
            <img :src="entityStore.selectedEntity.logo.url" class="app-brand__logo" />
          </template>
          <template v-else>
            <div class="app-brand__icon">
              <q-icon name="las la-fire" size="20px" />
            </div>
          </template>
          <span class="app-brand__name">{{ entityStore.selectedEntity?.name || $t('app.name') }}</span>
        </div>

        <q-space />

        <!-- Alert Notifications -->
        <AlertNotificationCenter class="q-mr-xs" />

        <!-- Entity Switcher (if multiple) -->
        <q-btn
          v-if="entityStore.hasMultipleEntities"
          flat
          round
          dense
          class="app-header-btn q-mr-xs"
          @click="showEntitySwitcher = true"
        >
          <q-icon name="las la-exchange-alt" size="20px" />
          <q-tooltip>{{ $t('common.selectEntity') }}</q-tooltip>
        </q-btn>

        <!-- User Avatar -->
        <q-btn flat round dense class="app-header-btn" @click="showUserMenu = true">
          <q-avatar size="32px" class="app-avatar">
            {{ profileStore.initials }}
          </q-avatar>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- Page Container -->
    <q-page-container class="app-page-container">
      <!-- Notification Permission Banner -->
      <div class="notification-banner-wrapper">
        <NotificationPermissionBanner />
      </div>

      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>

    <!-- Bottom Navigation -->
    <q-footer class="app-footer">
      <nav class="app-nav">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="app-nav__item"
          :class="{ 'app-nav__item--active': isActiveRoute(item.to) }"
        >
          <div class="app-nav__icon">
            <q-icon :name="item.icon" size="24px" />
          </div>
          <span class="app-nav__label">{{ $t(item.labelShort) }}</span>
        </router-link>
      </nav>
    </q-footer>

    <!-- Entity Switcher Dialog -->
    <q-dialog v-model="showEntitySwitcher" position="bottom">
      <q-card class="entity-switcher-card">
        <q-card-section class="entity-switcher-header">
          <div class="text-h6">{{ $t('common.selectEntity') }}</div>
          <q-btn flat round dense icon="las la-times" v-close-popup />
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-list class="entity-list">
            <q-item
              v-for="entity in entityStore.entities"
              :key="entity.id"
              clickable
              v-close-popup
              class="entity-item"
              :class="{ 'entity-item--active': entity.id === entityStore.selectedEntityId }"
              @click="entityStore.selectEntity(entity.id)"
            >
              <q-item-section avatar>
                <q-avatar v-if="entity.logo?.url" size="40px">
                  <img :src="entity.logo.url" />
                </q-avatar>
                <q-avatar v-else size="40px" color="grey-3" text-color="grey-8">
                  {{ entity.name.charAt(0) }}
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ entity.name }}</q-item-label>
              </q-item-section>
              <q-item-section side v-if="entity.id === entityStore.selectedEntityId">
                <q-icon name="las la-check-circle" color="primary" size="24px" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- User Menu Dialog -->
    <q-dialog v-model="showUserMenu" position="bottom">
      <q-card class="user-menu-card">
        <q-card-section class="user-menu-header">
          <q-avatar size="56px" class="user-menu-avatar">
            {{ profileStore.initials }}
          </q-avatar>
          <div class="user-menu-info">
            <div class="user-menu-name">{{ profileStore.displayName }}</div>
            <div class="user-menu-email">{{ profileStore.email }}</div>
          </div>
        </q-card-section>
        <q-separator />
        <q-list class="user-menu-list">
          <q-item clickable v-close-popup to="/profile">
            <q-item-section avatar>
              <q-icon name="las la-user-circle" size="24px" />
            </q-item-section>
            <q-item-section>{{ $t('nav.profile') }}</q-item-section>
            <q-item-section side>
              <q-icon name="las la-chevron-right" size="20px" color="grey-5" />
            </q-item-section>
          </q-item>
          <q-item clickable v-close-popup to="/alert-preferences">
            <q-item-section avatar>
              <q-icon name="las la-cog" size="24px" />
            </q-item-section>
            <q-item-section>Preferințe Notificări</q-item-section>
            <q-item-section side>
              <q-icon name="las la-chevron-right" size="20px" color="grey-5" />
            </q-item-section>
          </q-item>
          <q-separator />
          <q-item clickable v-close-popup @click="confirmLogout">
            <q-item-section avatar>
              <q-icon name="las la-sign-out-alt" size="24px" color="negative" />
            </q-item-section>
            <q-item-section class="text-negative">{{ $t('auth.logout') }}</q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from 'src/stores/auth';
import { useProfileStore } from 'src/stores/profile';
import { useEntityStore } from 'src/stores/entity';
import { clearAppData } from 'src/boot/appInit';
import AlertNotificationCenter from 'src/components/AlertNotificationCenter.vue';
import NotificationPermissionBanner from 'src/components/NotificationPermissionBanner.vue';

const router = useRouter();
const route = useRoute();
const $q = useQuasar();
const { t } = useI18n();
const authStore = useAuthStore();
const profileStore = useProfileStore();
const entityStore = useEntityStore();

const showEntitySwitcher = ref(false);
const showUserMenu = ref(false);

const navItems = [
  { to: '/dashboard', icon: 'las la-home', labelShort: 'nav.dashboardShort' },
  { to: '/invoices', icon: 'las la-file-invoice-dollar', labelShort: 'nav.invoicesShort' },
  { to: '/subscriptions', icon: 'las la-clipboard-list', labelShort: 'nav.subscriptionsShort' },
  { to: '/profile', icon: 'las la-user', labelShort: 'nav.profileShort' },
];

function isActiveRoute(path: string): boolean {
  return route.path === path || route.path.startsWith(path + '/');
}

function goToDashboard(): void {
  void router.push('/dashboard');
}

function confirmLogout(): void {
  $q.dialog({
    title: t('auth.logoutConfirm'),
    message: t('auth.logoutConfirmMessage'),
    cancel: {
      label: t('common.cancel'),
      flat: true,
      color: 'grey',
    },
    ok: {
      label: t('auth.logout'),
      color: 'negative',
      unelevated: true,
    },
    persistent: true,
  }).onOk(() => {
    void handleLogout();
  });
}

async function handleLogout(): Promise<void> {
  await authStore.logout();
  clearAppData();
  void router.push('/auth/login');
}
</script>

<style lang="sass" scoped>
// Header
.app-header
  background: var(--color-surface)
  box-shadow: none
  border-bottom: 1px solid var(--color-border-light)

.app-toolbar
  min-height: 56px
  padding: 0 var(--space-md)

.app-brand
  display: flex
  align-items: center
  gap: var(--space-sm)
  cursor: pointer
  user-select: none

.app-brand__logo
  width: 32px
  height: 32px
  border-radius: var(--radius-md)
  object-fit: contain

.app-brand__icon
  width: 32px
  height: 32px
  border-radius: var(--radius-md)
  background: linear-gradient(135deg, #F97316 0%, #EA580C 100%)
  display: flex
  align-items: center
  justify-content: center
  color: white

.app-brand__name
  font-size: 1rem
  font-weight: 600
  color: var(--color-text-primary)
  max-width: 160px
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis

  @media (max-width: 380px)
    display: none

.app-header-btn
  color: var(--color-text-secondary)

.app-avatar
  background: var(--color-primary)
  color: white
  font-weight: 600
  font-size: 0.875rem

// Page Container
.app-page-container
  background: var(--color-background)

// Notification Banner
.notification-banner-wrapper
  padding: var(--space-md) var(--space-md) 0 var(--space-md)
  max-width: 800px
  margin: 0 auto

// Bottom Navigation
.app-footer
  background: var(--color-surface)
  border-top: 1px solid var(--color-border-light)
  padding-bottom: env(safe-area-inset-bottom, 0)

.app-nav
  display: flex
  justify-content: space-around
  align-items: center
  height: 60px
  max-width: 500px
  margin: 0 auto

.app-nav__item
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  gap: 2px
  flex: 1
  height: 100%
  text-decoration: none
  color: var(--color-text-muted)
  transition: all var(--transition-fast)
  position: relative

  &::before
    content: ''
    position: absolute
    top: 0
    left: 50%
    transform: translateX(-50%)
    width: 0
    height: 2px
    background: var(--color-primary)
    border-radius: 0 0 2px 2px
    transition: width var(--transition-fast)

  &:active
    background: rgba(0, 0, 0, 0.05)

.app-nav__item--active
  color: var(--color-primary)

  &::before
    width: 32px

  .app-nav__icon
    transform: scale(1.05)

.app-nav__icon
  transition: transform var(--transition-fast)

.app-nav__label
  font-size: 0.6875rem
  font-weight: 500
  letter-spacing: 0.01em

// Entity Switcher Dialog
.entity-switcher-card
  width: 100%
  max-width: 400px
  border-radius: var(--radius-xl) var(--radius-xl) 0 0

.entity-switcher-header
  display: flex
  align-items: center
  justify-content: space-between

.entity-list
  padding: 0

.entity-item
  border-radius: var(--radius-md)
  margin-bottom: var(--space-xs)

  &:last-child
    margin-bottom: 0

.entity-item--active
  background: rgba(37, 99, 235, 0.08)

// User Menu Dialog
.user-menu-card
  width: 100%
  max-width: 400px
  border-radius: var(--radius-xl) var(--radius-xl) 0 0

.user-menu-header
  display: flex
  align-items: center
  gap: var(--space-md)
  padding: var(--space-lg)

.user-menu-avatar
  background: var(--color-primary)
  color: white
  font-weight: 600
  font-size: 1.25rem

.user-menu-info
  flex: 1
  min-width: 0

.user-menu-name
  font-size: 1rem
  font-weight: 600
  color: var(--color-text-primary)

.user-menu-email
  font-size: 0.8125rem
  color: var(--color-text-secondary)
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis

.user-menu-list
  padding: var(--space-sm)

  .q-item
    border-radius: var(--radius-md)
    min-height: 48px

// Page transition
.fade-enter-active,
.fade-leave-active
  transition: opacity 150ms ease

.fade-enter-from,
.fade-leave-to
  opacity: 0
</style>

<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <q-page class="auth-page">
        <!-- Main content area -->
        <div class="auth-page__content">
          <div class="auth-card">
            <!-- Logo/Branding -->
            <div class="auth-header">
              <div class="auth-logo-utilities">
                <div class="utility-circle utility-circle--electricity" title="Electricity">
                  <q-icon name="las la-bolt" size="18px" />
                </div>
                <div class="utility-circle utility-circle--gas" title="Gas">
                  <q-icon name="las la-fire" size="18px" />
                </div>
                <div class="utility-circle utility-circle--water" title="Water">
                  <q-icon name="las la-tint" size="18px" />
                </div>
              </div>
              <h1 class="auth-title">{{ $t('app.name') }}</h1>
              <p class="auth-subtitle">{{ $t('app.tagline') }}</p>
            </div>

            <!-- Page content (login form, etc.) -->
            <router-view v-slot="{ Component }">
              <transition name="fade" mode="out-in">
                <component :is="Component" />
              </transition>
            </router-view>
          </div>

          <!-- Footer -->
          <div class="auth-footer">
            <span class="auth-footer__text">
              {{ $t('app.copyright', { year: new Date().getFullYear() }) }}
            </span>
          </div>
        </div>

        <!-- Decorative background (desktop only) -->
        <div class="auth-page__decoration" aria-hidden="true">
          <div class="decoration-circle decoration-circle--1"></div>
          <div class="decoration-circle decoration-circle--2"></div>
          <div class="decoration-circle decoration-circle--3"></div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
//
</script>

<style lang="sass" scoped>
.auth-page
  min-height: 100vh
  display: flex
  align-items: center
  justify-content: center
  background: var(--color-background)
  position: relative
  overflow: hidden

.auth-page__content
  position: relative
  z-index: 10
  width: 100%
  max-width: 420px
  padding: var(--space-md)
  display: flex
  flex-direction: column
  min-height: 100vh
  justify-content: center

  @media (min-width: 481px)
    min-height: auto
    padding: var(--space-xl)

.auth-card
  background: var(--color-surface)
  border-radius: var(--radius-xl)
  box-shadow: var(--shadow-xl)
  padding: var(--space-xl)

  @media (max-width: 480px)
    border-radius: 0
    box-shadow: none
    padding: var(--space-lg)
    flex: 1
    display: flex
    flex-direction: column

.auth-header
  text-align: center
  margin-bottom: var(--space-xl)

// Utility circles logo
.auth-logo-utilities
  display: flex
  justify-content: center
  gap: 8px
  margin-bottom: var(--space-md)

.utility-circle
  width: 40px
  height: 40px
  border-radius: 50%
  display: flex
  align-items: center
  justify-content: center
  transition: transform 0.2s ease, box-shadow 0.2s ease

  :deep(.q-icon)
    color: white

  &:hover
    transform: scale(1.1)

// Gas - Active (orange)
.utility-circle--gas
  background: linear-gradient(135deg, #F97316 0%, #EA580C 100%)
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3)

// Electricity - Inactive/Coming soon (grey)
.utility-circle--electricity
  background: linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)
  opacity: 0.6

  &:hover
    transform: scale(1.05)

// Water - Inactive/Coming soon (grey)
.utility-circle--water
  background: linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)
  opacity: 0.6

  &:hover
    transform: scale(1.05)

.auth-title
  font-size: 1.5rem
  font-weight: 700
  color: var(--color-text-primary)
  margin: 0 0 var(--space-xs)
  letter-spacing: -0.025em

.auth-subtitle
  font-size: 0.875rem
  color: var(--color-text-secondary)
  margin: 0

.auth-footer
  text-align: center
  margin-top: var(--space-lg)
  padding: var(--space-md) 0

.auth-footer__text
  font-size: 0.75rem
  color: var(--color-text-muted)

// Decorative background elements
.auth-page__decoration
  position: absolute
  inset: 0
  z-index: 1
  pointer-events: none
  overflow: hidden

  @media (max-width: 768px)
    display: none

.decoration-circle
  position: absolute
  border-radius: 50%
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)
  opacity: 0.03

.decoration-circle--1
  width: 600px
  height: 600px
  top: -200px
  right: -200px

.decoration-circle--2
  width: 400px
  height: 400px
  bottom: -100px
  left: -100px
  opacity: 0.05

.decoration-circle--3
  width: 200px
  height: 200px
  top: 50%
  left: 10%
  opacity: 0.04
</style>

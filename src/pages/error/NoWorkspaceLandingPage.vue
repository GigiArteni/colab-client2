<template>
  <div class="no-workspace-page">
    <div class="step-header">
      <q-icon
        name="las la-building"
        color="primary"
        size="48px"
        class="q-mb-sm"
      />
      <h2 class="step-title">{{ t('tenancyError.no_workspace_landing.title') }}</h2>
      <p class="step-description">{{ t('tenancyError.no_workspace_landing.description') }}</p>
      <code class="step-example">{{ t('tenancyError.no_workspace_landing.example') }}</code>
    </div>

    <q-banner
      v-if="marketingUrl"
      class="q-mt-md hint-banner"
      rounded
    >
      <template #avatar>
        <q-icon name="las la-info-circle" color="primary" />
      </template>
      {{ t('tenancyError.no_workspace_landing.cta') }}
    </q-banner>

    <q-btn
      v-if="marketingUrl"
      :label="t('tenancyError.no_workspace_landing.cta')"
      color="primary"
      unelevated
      class="full-width q-mt-lg portal-btn portal-btn--lg"
      :href="marketingUrl"
      type="a"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const marketingUrl = computed(() => {
  const raw = process.env.MARKETING_URL;
  return typeof raw === 'string' && raw.length > 0 ? raw : '';
});
</script>

<style lang="sass" scoped>
.no-workspace-page
  width: 100%
  text-align: center

.step-header
  display: flex
  flex-direction: column
  align-items: center
  gap: var(--space-xs)

.step-title
  font-size: 1.5rem
  font-weight: 600
  margin: 0

.step-description
  color: var(--color-text-secondary)
  margin: 0

.step-example
  display: inline-block
  padding: 6px 10px
  background: rgba(0, 102, 255, 0.08)
  border-radius: 6px
  font-family: monospace
  font-size: 0.875rem
  color: var(--color-text)

.hint-banner
  background: rgba(0, 102, 255, 0.06)
  text-align: left

.full-width
  width: 100%
</style>

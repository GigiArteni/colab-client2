<template>
  <div class="unknown-workspace-page" role="alert">
    <div class="step-header">
      <q-icon
        name="las la-exclamation-triangle"
        color="negative"
        size="48px"
        class="q-mb-sm"
      />
      <h2 class="step-title">{{ t('tenancyError.unknown_workspace_page.title') }}</h2>
      <p class="step-description">{{ description }}</p>
    </div>

    <div class="actions q-mt-lg">
      <q-btn
        :label="t('tenancyError.unknown_workspace_page.cta')"
        color="primary"
        unelevated
        class="full-width portal-btn portal-btn--lg"
        @click="goHome"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const route = useRoute();

const reason = computed(() => {
  const raw = typeof route.query.reason === 'string' ? route.query.reason : '';
  return raw.length > 0 ? raw : 'tenant_unknown';
});

const description = computed(() => {
  const specificKey = `tenancyError.${reason.value}`;
  const specific = t(specificKey);
  if (specific !== specificKey) return specific;
  return t('tenancyError.unknown_workspace_page.description');
});

function goHome(): void {
  if (typeof window === 'undefined') return;
  // Strip the tenant subdomain by replacing host with the apex.
  // Best-effort: drop the first segment of the hostname.
  const segments = window.location.hostname.split('.');
  if (segments.length > 1) {
    const apex = segments.slice(1).join('.');
    const port = window.location.port ? `:${window.location.port}` : '';
    window.location.href = `${window.location.protocol}//${apex}${port}/`;
  } else {
    window.location.href = '/';
  }
}
</script>

<style lang="sass" scoped>
.unknown-workspace-page
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

.actions
  display: flex
  flex-direction: column
  gap: var(--space-sm)

.full-width
  width: 100%
</style>

<template>
  <div role="status" :aria-label="t('common.loading')">
    <!-- list variant: repeating rows -->
    <template v-if="variant === 'list'">
      <div v-for="i in rows" :key="i" class="q-mb-sm">
        <q-skeleton type="rect" height="56px" />
      </div>
    </template>

    <!-- card variant: card with text lines -->
    <template v-else-if="variant === 'card'">
      <q-card flat bordered>
        <q-card-section>
          <q-skeleton type="text" width="60%" class="q-mb-sm" />
          <q-skeleton type="text" width="40%" />
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-skeleton type="text" class="q-mb-xs" />
          <q-skeleton type="text" class="q-mb-xs" />
          <q-skeleton type="text" width="80%" />
        </q-card-section>
      </q-card>
    </template>

    <!-- table variant: header + rows -->
    <template v-else-if="variant === 'table'">
      <q-skeleton type="rect" height="40px" class="q-mb-xs" />
      <div v-for="i in rows" :key="i" class="q-mb-xs">
        <q-skeleton type="rect" height="48px" />
      </div>
    </template>

    <!-- detail variant: full page skeleton -->
    <template v-else>
      <q-skeleton type="text" width="50%" height="28px" class="q-mb-md" />
      <q-skeleton type="rect" height="120px" class="q-mb-md" />
      <q-skeleton type="text" class="q-mb-xs" />
      <q-skeleton type="text" class="q-mb-xs" />
      <q-skeleton type="text" width="70%" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

withDefaults(defineProps<{
  variant?: 'list' | 'card' | 'table' | 'detail';
  rows?: number;
}>(), {
  variant: 'list',
  rows: 3,
});

const { t } = useI18n();
</script>

<template>
  <div class="page-header q-mb-md">
    <!-- Breadcrumbs -->
    <q-breadcrumbs v-if="breadcrumbs?.length" class="q-mb-xs text-caption text-grey">
      <q-breadcrumbs-el
        v-for="crumb in breadcrumbs"
        :key="crumb.label"
        :label="crumb.label"
        :to="crumb.to"
      />
    </q-breadcrumbs>

    <div class="row items-center">
      <div class="col">
        <div class="text-h5 text-weight-medium">{{ title }}</div>
        <div v-if="subtitle" class="text-caption text-grey q-mt-xs">{{ subtitle }}</div>
      </div>
      <!-- Actions slot — collapses to icon-only on narrow viewport -->
      <div v-if="$slots.default" class="col-auto q-ml-sm page-header__actions">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  subtitle?: string;
  breadcrumbs?: Array<{ label: string; to?: string }>;
}>();
</script>

<style lang="sass" scoped>
.page-header__actions
  @media (max-width: 599px)
    // On mobile, let action buttons collapse to icon-only (caller responsibility)
    font-size: 0.85em
</style>

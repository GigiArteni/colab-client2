<template>
  <div class="empty-state column items-center justify-center q-pa-xl text-grey" role="status" aria-live="polite">
    <q-icon v-if="icon" :name="icon" size="64px" class="q-mb-md" aria-hidden="true" />
    <div class="text-h6 q-mb-xs">{{ title }}</div>
    <div v-if="subtitle" class="text-body2 q-mb-md text-center">{{ subtitle }}</div>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon?: string;
  title: string;
  subtitle?: string;
}>();
</script>

<style lang="sass" scoped>
.empty-state
  min-height: 200px
</style>

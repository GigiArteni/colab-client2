<template>
  <!-- Category Tabs -->
  <q-tabs
    :model-value="selectedCategory"
    align="left"
    dense
    no-caps
    active-color="primary"
    indicator-color="primary"
    class="category-tabs"
    mobile-arrows
    @update:model-value="emit('update:selectedCategory', $event)"
  >
    <q-tab
      v-for="category in categories"
      :key="category.value"
      :name="category.value"
      :icon="category.icon"
      :label="category.label"
    >
      <q-badge
        v-if="countByCategory(category.value) > 0"
        color="grey-5"
        floating
        :label="countByCategory(category.value)"
        class="category-badge"
      />
    </q-tab>
  </q-tabs>

  <!-- Category Panels -->
  <q-tab-panels
    :model-value="selectedCategory"
    animated
    class="category-panels bg-transparent"
    @update:model-value="emit('update:selectedCategory', $event as AlertCategory)"
  >
    <q-tab-panel
      v-for="category in categories"
      :key="category.value"
      :name="category.value"
      class="q-pa-none"
    >
      <AlertCategoryGroup
        :alert-types="typesByCategory(category.value)"
        :channels="channels"
        :preferences="preferences"
        @toggle="(id, ch) => emit('toggle', id, ch)"
        @enable-all="emit('enable-all', category.value)"
        @disable-all="emit('disable-all', category.value)"
      />
    </q-tab-panel>
  </q-tab-panels>
</template>

<script setup lang="ts">
import AlertCategoryGroup from './AlertCategoryGroup.vue';
import type { AlertType, AlertCategory, CategoryInfo, ChannelInfo } from 'src/types/alertPreference.types';

interface ChannelState {
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
  print: boolean;
  in_app: boolean;
  [key: string]: unknown;
}

const props = defineProps<{
  selectedCategory: AlertCategory;
  categories: CategoryInfo[];
  channels: ChannelInfo[];
  alertTypes: AlertType[];
  preferences: Map<string, ChannelState>;
}>();

const emit = defineEmits<{
  'update:selectedCategory': [category: AlertCategory];
  toggle: [alertTypeId: string, channel: string];
  'enable-all': [category: AlertCategory];
  'disable-all': [category: AlertCategory];
}>();

function typesByCategory(category: AlertCategory): AlertType[] {
  return props.alertTypes.filter((at) => at.category === category);
}

function countByCategory(category: AlertCategory): number {
  return props.alertTypes.filter((at) => at.category === category).length;
}
</script>

<style lang="sass" scoped>
.category-tabs
  background: var(--color-surface)
  border-bottom: 1px solid var(--color-border-light)
  position: sticky
  top: 0
  z-index: 10

  :deep(.q-tab)
    min-height: 56px

.category-badge
  font-size: 0.625rem

.category-panels
  padding: var(--space-md)
</style>

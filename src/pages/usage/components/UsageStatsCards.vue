<template>
  <section class="usage-header">
    <div class="stats-card">
      <div class="stats-card__main">
        <span class="stats-card__label">{{ $t('usage.currentMonth') }}</span>
        <div class="stats-card__value">
          <LoadingSkeleton v-if="isLoading" variant="card" />
          <template v-else>
            {{ formatNumber(currentMonthUsage) }}
            <small>{{ usageUnit }}</small>
          </template>
        </div>
      </div>
      <div
        v-if="!isLoading"
        class="stats-card__trend"
        :class="`stats-card__trend--${usageTrend}`"
      >
        <q-icon :name="trendIcon" />
        <span>{{ Math.abs(usageChangePercent) }}%</span>
      </div>
    </div>

    <div v-if="meters.length > 1" class="meter-selector">
      <button
        v-for="meter in activeMeters"
        :key="meter.id"
        class="meter-chip"
        :class="{ 'meter-chip--active': selectedMeterId === meter.id }"
        :aria-pressed="selectedMeterId === meter.id"
        :aria-label="$t('usage.selectMeter') + ' ' + meter.serial_number"
        @click="emit('select-meter', meter.id)"
      >
        <q-icon name="las la-tachometer-alt" />
        {{ meter.serial_number }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LoadingSkeleton from 'src/components/ui/LoadingSkeleton.vue';
import type { Meter } from 'src/types';

const props = defineProps<{
  isLoading: boolean;
  currentMonthUsage: number;
  usageUnit: string;
  usageTrend: string;
  usageChangePercent: number;
  meters: Meter[];
  activeMeters: Meter[];
  selectedMeterId: string | null;
}>();

const emit = defineEmits<{
  'select-meter': [id: string];
}>();

const trendIcon = computed(() => {
  switch (props.usageTrend) {
    case 'up': return 'las la-arrow-up';
    case 'down': return 'las la-arrow-down';
    default: return 'las la-minus';
  }
});

function formatNumber(value: number): string {
  return value.toLocaleString('ro-RO', { maximumFractionDigits: 1 });
}
</script>

<style lang="sass" scoped>
$primary: #0066FF
$positive: #10B981
$negative: #EF4444
$gray-100: #F1F5F9
$gray-200: #E2E8F0
$gray-300: #CBD5E1
$gray-400: #94A3B8
$gray-500: #64748B
$gray-600: #475569
$gray-900: #0F172A
$radius-full: 9999px
$radius-lg: 16px

.usage-header
  background: white
  padding: 20px
  border-bottom: 1px solid $gray-100

.stats-card
  display: flex
  justify-content: space-between
  align-items: center
  padding: 20px
  background: linear-gradient(135deg, rgba($primary, 0.05) 0%, rgba($primary, 0.02) 100%)
  border: 1px solid rgba($primary, 0.1)
  border-radius: $radius-lg

  &__main
    display: flex
    flex-direction: column
    gap: 4px

  &__label
    font-size: 13px
    font-weight: 500
    color: $gray-500
    text-transform: uppercase
    letter-spacing: 0.03em

  &__value
    font-size: 32px
    font-weight: 700
    color: $gray-900

    small
      font-size: 14px
      font-weight: 500
      color: $gray-500
      margin-left: 4px

  &__trend
    display: flex
    align-items: center
    gap: 4px
    padding: 6px 12px
    border-radius: $radius-full
    font-size: 13px
    font-weight: 600

    &--up
      background: rgba($negative, 0.1)
      color: $negative

    &--down
      background: rgba($positive, 0.1)
      color: $positive

    &--stable
      background: $gray-100
      color: $gray-500

.meter-selector
  display: flex
  gap: 8px
  margin-top: 16px
  overflow-x: auto
  padding-bottom: 4px

  &::-webkit-scrollbar
    display: none

.meter-chip
  display: inline-flex
  align-items: center
  gap: 6px
  padding: 8px 14px
  border: 1px solid $gray-200
  border-radius: $radius-full
  background: white
  font-size: 13px
  font-weight: 500
  color: $gray-600
  cursor: pointer
  white-space: nowrap
  transition: all 0.2s ease

  &:hover
    border-color: $gray-300

  &--active
    background: $primary
    border-color: $primary
    color: white
</style>

<template>
  <section class="recent-section">
    <h2 class="section-title">{{ $t('usage.recentUsages') }}</h2>
    <div class="recent-card">
      <template v-if="usages.length > 0">
        <div
          v-for="usage in usages.slice(0, 6)"
          :key="usage.id"
          class="usage-item"
        >
          <div class="usage-item__icon">
            <q-icon name="las la-chart-bar" />
          </div>
          <div class="usage-item__content">
            <span class="usage-item__period">{{ formatPeriod(usage.period_start ?? usage.reading_start_date ?? '', usage.period_end ?? usage.reading_end_date ?? '') }}</span>
            <span class="usage-item__details">
              {{ usage.reading_start ?? usage.previous_reading ?? '-' }} &rarr; {{ usage.reading_end ?? usage.current_reading ?? '-' }} {{ usage.unit }}
              <span v-if="usage.is_estimated" class="usage-item__badge">{{ $t('usage.estimated') }}</span>
            </span>
          </div>
          <div class="usage-item__amount">
            <span class="usage-item__value">{{ usage.consumption != null ? formatNumber(usage.consumption) : '-' }}</span>
            <span class="usage-item__unit">{{ usage.unit }}</span>
          </div>
        </div>
      </template>
      <EmptyState
        v-else
        icon="las la-chart-line"
        :title="$t('usage.noUsages')"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import EmptyState from 'src/components/ui/EmptyState.vue';
import type { Usage } from 'src/types';

defineProps<{
  usages: Usage[];
}>();

function formatNumber(value: number): string {
  return value.toLocaleString('ro-RO', { maximumFractionDigits: 1 });
}

function formatPeriod(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return `${startDate.toLocaleDateString('ro-RO', { month: 'short' })} - ${endDate.toLocaleDateString('ro-RO', { month: 'short', year: 'numeric' })}`;
}
</script>

<style lang="sass" scoped>
$primary: #0066FF
$warning: #F59E0B
$gray-100: #F1F5F9
$gray-500: #64748B
$gray-800: #1E293B
$gray-900: #0F172A
$radius-sm: 8px
$radius-md: 12px
$radius-lg: 16px

.recent-section
  margin-bottom: 24px

.section-title
  margin: 0 0 12px
  font-size: 16px
  font-weight: 600
  color: $gray-800

.recent-card
  background: white
  border-radius: $radius-lg
  border: 1px solid $gray-100
  overflow: hidden

.usage-item
  display: flex
  align-items: center
  gap: 14px
  padding: 14px 16px
  border-bottom: 1px solid $gray-100

  &:last-child
    border-bottom: none

  &__icon
    width: 40px
    height: 40px
    border-radius: $radius-md
    background: rgba($primary, 0.1)
    color: $primary
    display: flex
    align-items: center
    justify-content: center
    font-size: 18px
    flex-shrink: 0

  &__content
    flex: 1
    min-width: 0

  &__period
    display: block
    font-size: 14px
    font-weight: 500
    color: $gray-900

  &__details
    display: block
    font-size: 12px
    color: $gray-500
    margin-top: 2px

  &__badge
    display: inline-block
    padding: 2px 6px
    background: rgba($warning, 0.1)
    color: $warning
    border-radius: $radius-sm
    font-size: 10px
    font-weight: 600
    margin-left: 6px

  &__amount
    text-align: right
    flex-shrink: 0

  &__value
    display: block
    font-size: 15px
    font-weight: 700
    color: $primary

  &__unit
    display: block
    font-size: 11px
    color: $gray-500
</style>

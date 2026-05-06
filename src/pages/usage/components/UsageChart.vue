<template>
  <section class="chart-section">
    <h2 class="section-title">{{ $t('usage.monthlyConsumption') }}</h2>
    <div class="chart-card">
      <div class="chart">
        <div
          v-for="(value, index) in chartData.data"
          :key="index"
          class="chart__bar-wrapper"
        >
          <div class="chart__bar" :style="{ height: getBarHeight(value) + '%' }">
            <span class="chart__value">{{ formatNumber(value) }}</span>
          </div>
          <span class="chart__label">{{ chartData.labels[index] }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  chartData: { labels: string[]; data: number[] };
}>();

const maxValue = computed(() => Math.max(...props.chartData.data, 1));

function getBarHeight(value: number): number {
  return Math.max((value / maxValue.value) * 100, 5);
}

function formatNumber(value: number): string {
  return value.toLocaleString('ro-RO', { maximumFractionDigits: 1 });
}
</script>

<style lang="sass" scoped>
$primary: #0066FF
$gray-100: #F1F5F9
$gray-500: #64748B
$gray-600: #475569
$gray-800: #1E293B
$radius-sm: 8px
$radius-lg: 16px

.chart-section
  margin-bottom: 24px

.section-title
  margin: 0 0 12px
  font-size: 16px
  font-weight: 600
  color: $gray-800

.chart-card
  background: white
  border-radius: $radius-lg
  border: 1px solid $gray-100
  padding: 20px

.chart
  display: flex
  align-items: flex-end
  justify-content: space-between
  height: 140px
  gap: 8px

  &__bar-wrapper
    flex: 1
    display: flex
    flex-direction: column
    align-items: center
    height: 100%
    max-width: 50px

  &__bar
    width: 100%
    max-width: 28px
    background: linear-gradient(180deg, $primary 0%, rgba($primary, 0.7) 100%)
    border-radius: $radius-sm $radius-sm 0 0
    position: relative
    transition: height 0.3s ease
    min-height: 8px

  &__value
    position: absolute
    top: -20px
    left: 50%
    transform: translateX(-50%)
    font-size: 10px
    font-weight: 600
    color: $gray-600
    white-space: nowrap

  &__label
    margin-top: 8px
    font-size: 11px
    color: $gray-500
    text-align: center
</style>

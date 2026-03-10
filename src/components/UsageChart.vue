<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-subtitle1 q-mb-md">{{ $t('usage.consumptionChart') }}</div>
      <div class="chart-container">
        <div class="chart-bars row items-end justify-around">
          <div
            v-for="(usage, index) in chartData"
            :key="index"
            class="chart-bar-wrapper text-center"
          >
            <div class="chart-value text-caption q-mb-xs">{{ usage.consumption }}</div>
            <div
              class="chart-bar bg-primary"
              :style="{ height: `${getBarHeight(usage.consumption)}px` }"
            />
            <div class="chart-label text-caption text-grey q-mt-xs">
              {{ usage.label }}
            </div>
          </div>
        </div>
      </div>
      <div class="text-center text-caption text-grey q-mt-sm">
        {{ $t('usage.unit') }}: {{ unit }}
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { UsageRecord } from 'src/types';

const props = defineProps<{
  usages: UsageRecord[];
  unit: string;
}>();

const chartData = computed(() => {
  // Take last 12 usages and reverse for chronological order
  return props.usages
    .slice(0, 12)
    .reverse()
    .map(usage => ({
      consumption: usage.consumption ?? 0,
      label: formatMonth(usage.reading_end_date),
    }));
});

const maxConsumption = computed(() => {
  if (chartData.value.length === 0) return 1;
  return Math.max(...chartData.value.map(d => d.consumption ?? 0));
});

function getBarHeight(value: number): number {
  const maxHeight = 150;
  const minHeight = 10;
  if (maxConsumption.value === 0) return minHeight;
  return Math.max(minHeight, (value / maxConsumption.value) * maxHeight);
}

function formatMonth(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString('ro-RO', { month: 'short' }).substring(0, 3);
}
</script>

<style lang="sass" scoped>
.chart-container
  min-height: 200px
  padding: 16px 0

.chart-bars
  min-height: 180px
  align-items: flex-end

.chart-bar-wrapper
  flex: 1
  max-width: 60px
  padding: 0 4px

.chart-bar
  width: 100%
  min-width: 20px
  max-width: 40px
  margin: 0 auto
  border-radius: 4px 4px 0 0
  transition: height 0.3s ease

.chart-value
  font-size: 10px
  font-weight: 500

.chart-label
  font-size: 10px
</style>

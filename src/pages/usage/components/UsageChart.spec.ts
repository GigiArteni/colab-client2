import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import UsageChart from './UsageChart.vue';

function mountChart(data = [100, 200, 150], labels = ['Jan', 'Feb', 'Mar']) {
  return mount(UsageChart, {
    props: { chartData: { data, labels } },
    global: { stubs: { 'q-icon': true } },
  });
}

describe('UsageChart', () => {
  it('renders one bar per data point', () => {
    const w = mountChart();
    expect(w.findAll('.chart__bar-wrapper').length).toBe(3);
  });

  it('renders labels for each bar', () => {
    const w = mountChart([10, 20], ['Jan', 'Feb']);
    const labels = w.findAll('.chart__label');
    expect(labels[0]!.text()).toBe('Jan');
    expect(labels[1]!.text()).toBe('Feb');
  });

  it('tallest bar gets 100% height', () => {
    const w = mountChart([50, 100, 75]);
    const bars = w.findAll('.chart__bar');
    expect(bars[1]!.attributes('style')).toContain('height: 100%');
  });

  it('renders empty chart without errors when data is empty', () => {
    const w = mountChart([], []);
    expect(w.findAll('.chart__bar-wrapper').length).toBe(0);
  });
});

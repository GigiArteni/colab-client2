<template>
  <div class="row q-col-gutter-md">
    <div
      v-for="channel in channels"
      :key="channel.value"
      class="col-6"
    >
      <q-item
        clickable
        :class="['channel-item', { 'channel-item--active': isEnabled(channel.value) }]"
        @click="emit('toggle', alertTypeId, channel.value)"
      >
        <q-item-section avatar>
          <q-icon :name="channel.icon" :color="channel.color" size="24px" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="channel-label">{{ channel.label }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle
            :model-value="isEnabled(channel.value)"
            :color="channel.color"
            @click.stop
            @update:model-value="emit('toggle', alertTypeId, channel.value)"
          />
        </q-item-section>
      </q-item>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChannelInfo } from 'src/types/alertPreference.types';

interface ChannelState {
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
  print: boolean;
  in_app: boolean;
  [key: string]: unknown;
}

const props = defineProps<{
  alertTypeId: string;
  channels: ChannelInfo[];
  preference: ChannelState | undefined;
}>();

const emit = defineEmits<{
  toggle: [alertTypeId: string, channel: string];
}>();

function isEnabled(channel: string): boolean {
  return props.preference ? Boolean(props.preference[channel]) : false;
}
</script>

<style lang="sass" scoped>
.channel-item
  border: 1px solid var(--color-border-light)
  border-radius: var(--radius-md)
  background: var(--color-surface)
  min-height: 60px
  transition: all 0.2s ease

  &:active
    background: rgba(0, 0, 0, 0.05)

  &--active
    border-color: var(--q-primary)
    background: rgba(37, 99, 235, 0.04)

.channel-label
  font-size: 0.9375rem
  font-weight: 500
</style>

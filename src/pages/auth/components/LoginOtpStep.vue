<template>
  <div class="step-content">
    <div class="step-header">
      <h2 class="step-title">{{ $t('auth.otp.chooseChannel') }}</h2>
      <p class="step-description">{{ $t('auth.otp.channelHint') }}</p>
    </div>

    <div class="identifier-badge" role="button" tabindex="0" :aria-label="$t('common.back')" @click="emit('back')" @keyup.enter="emit('back')" @keyup.space.prevent="emit('back')">
      <q-icon name="las la-user" size="18px" />
      <span class="identifier-badge__text">{{ identifier }}</span>
      <q-icon name="las la-pen" size="14px" class="identifier-badge__edit" />
    </div>

    <div class="channel-list" role="list">
      <div
        v-for="channel in channels"
        :key="channel.channel"
        class="channel-option"
        :class="{ loading: loadingChannel === channel.channel }"
        role="button"
        tabindex="0"
        :aria-label="$t(`auth.otp.channel.${channel.channel}`) + ': ' + channel.masked_destination"
        :aria-disabled="loadingChannel === channel.channel"
        @click="selectChannel(channel.channel)"
        @keyup.enter="selectChannel(channel.channel)"
        @keyup.space.prevent="selectChannel(channel.channel)"
      >
        <div class="channel-option__icon">
          <q-icon :name="channel.channel === 'sms' ? 'las la-mobile' : 'las la-envelope'" size="24px" />
        </div>
        <div class="channel-option__content">
          <div class="channel-option__label">
            {{ $t(`auth.otp.channel.${channel.channel}`) }}
          </div>
          <div class="channel-option__destination">{{ channel.masked_destination }}</div>
        </div>
        <div class="channel-option__action">
          <q-spinner v-if="loadingChannel === channel.channel" color="primary" size="20px" />
          <q-icon v-else name="las la-chevron-right" size="20px" />
        </div>
      </div>
    </div>

    <ErrorBanner :error="storeError" class="q-mt-md" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ErrorBanner from 'src/components/ui/ErrorBanner.vue';
import type { OtpChannel } from 'src/types';

defineOptions({ name: 'LoginOtpStep' });

defineProps<{
  identifier: string;
  channels: OtpChannel[];
  storeError: string | null;
}>();

const emit = defineEmits<{
  back: [];
  select: [channel: 'sms' | 'email'];
}>();

const loadingChannel = ref<string | null>(null);

function selectChannel(channel: 'sms' | 'email'): void {
  loadingChannel.value = channel;
  try {
    emit('select', channel);
  } finally {
    loadingChannel.value = null;
  }
}
</script>

<style lang="sass" scoped>
.step-content
  width: 100%

.step-header
  text-align: center
  margin-bottom: var(--space-lg)

.step-title
  font-size: 1.25rem
  font-weight: 600
  color: var(--color-text-primary)
  margin: 0 0 var(--space-xs)

.step-description
  font-size: 0.875rem
  color: var(--color-text-secondary)
  margin: 0

.identifier-badge
  display: flex
  align-items: center
  gap: var(--space-sm)
  padding: var(--space-sm) var(--space-md)
  background: var(--color-background)
  border-radius: var(--radius-md)
  margin-bottom: var(--space-lg)
  cursor: pointer
  transition: all var(--transition-fast)

  &:hover
    background: var(--color-border-light)

    .identifier-badge__edit
      opacity: 1

.identifier-badge__text
  flex: 1
  font-size: 0.875rem
  color: var(--color-text-primary)
  font-weight: 500

.identifier-badge__edit
  opacity: 0
  color: var(--color-text-muted)
  transition: opacity var(--transition-fast)

.channel-list
  display: flex
  flex-direction: column
  gap: var(--space-sm)

.channel-option
  display: flex
  align-items: center
  gap: var(--space-md)
  padding: var(--space-md)
  border: 2px solid var(--color-border)
  border-radius: var(--radius-lg)
  cursor: pointer
  transition: all var(--transition-fast)

  &:hover:not(.loading)
    border-color: var(--color-primary-light)
    background-color: rgba(37, 99, 235, 0.02)

  &.loading
    opacity: 0.7
    cursor: wait

.channel-option__icon
  width: 44px
  height: 44px
  border-radius: var(--radius-md)
  background: var(--color-background)
  display: flex
  align-items: center
  justify-content: center
  color: var(--color-primary)

.channel-option__content
  flex: 1

.channel-option__label
  font-size: 0.9375rem
  font-weight: 500
  color: var(--color-text-primary)
  margin-bottom: 2px

.channel-option__destination
  font-size: 0.8125rem
  color: var(--color-text-secondary)

.channel-option__action
  color: var(--color-text-muted)
</style>

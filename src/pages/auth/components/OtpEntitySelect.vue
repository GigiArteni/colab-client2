<template>
  <div class="step-content">
    <div class="entity-list">
      <div
        v-for="entity in entities"
        :key="entity.id"
        class="entity-card"
        :class="{ 'entity-card--selected': selectedId === entity.id }"
        @click="selectedId = entity.id"
      >
        <div class="entity-card__avatar">
          <img v-if="entity.logo" :src="entity.logo" :alt="entity.name" />
          <span v-else>{{ entity.name.charAt(0).toUpperCase() }}</span>
        </div>
        <div class="entity-card__content">
          <h4 class="entity-card__name">{{ entity.name }}</h4>
          <span class="entity-card__account">
            {{ $t('otp.accountNumber') }}: {{ entity.customer_number }}
          </span>
        </div>
        <div v-if="selectedId === entity.id" class="entity-card__check">
          <q-icon name="las la-check-circle" />
        </div>
      </div>
    </div>

    <button
      class="primary-btn"
      :disabled="!selectedId"
      @click="handleSelect"
    >
      {{ $t('common.continue') }}
      <q-icon name="las la-arrow-right" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Entity {
  id: number;
  name: string;
  logo?: string | null;
  customer_number: string;
}

defineProps<{
  entities: Entity[];
}>();

const emit = defineEmits<{
  select: [entityId: number];
}>();

const selectedId = ref<number | null>(null);

function handleSelect(): void {
  if (selectedId.value !== null) {
    emit('select', selectedId.value);
  }
}
</script>

<style lang="sass" scoped>
$primary: #0066FF
$gray-50: #F8FAFC
$gray-200: #E2E8F0
$gray-500: #64748B
$gray-900: #0F172A
$radius-md: 12px
$radius-sm: 8px

.step-content
  display: flex
  flex-direction: column
  gap: 16px

.entity-list
  display: flex
  flex-direction: column
  gap: 10px
  max-height: 280px
  overflow-y: auto
  margin-bottom: 8px

.entity-card
  display: flex
  align-items: center
  gap: 14px
  padding: 14px
  background: $gray-50
  border: 2px solid transparent
  border-radius: $radius-md
  cursor: pointer
  transition: all 0.2s ease

  &:hover
    border-color: $gray-200

  &--selected
    background: rgba($primary, 0.05)
    border-color: $primary

  &__avatar
    width: 44px
    height: 44px
    border-radius: $radius-sm
    background: $primary
    color: white
    display: flex
    align-items: center
    justify-content: center
    font-size: 18px
    font-weight: 600
    flex-shrink: 0
    overflow: hidden

    img
      width: 100%
      height: 100%
      object-fit: cover

  &__content
    flex: 1
    min-width: 0

  &__name
    margin: 0
    font-size: 14px
    font-weight: 600
    color: $gray-900

  &__account
    display: block
    font-size: 12px
    color: $gray-500
    margin-top: 2px

  &__check
    font-size: 22px
    color: $primary

.primary-btn
  display: flex
  align-items: center
  justify-content: center
  gap: 8px
  width: 100%
  padding: 14px 20px
  background: $primary
  color: white
  border: none
  border-radius: $radius-md
  font-size: 15px
  font-weight: 600
  cursor: pointer
  transition: all 0.2s ease

  &:disabled
    opacity: 0.6
    cursor: not-allowed
</style>

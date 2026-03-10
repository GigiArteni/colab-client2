<template>
  <div class="otp-input-container">
    <input
      v-for="(_, index) in length"
      :key="index"
      ref="inputRefs"
      type="text"
      inputmode="numeric"
      pattern="[0-9]*"
      maxlength="1"
      class="otp-input"
      :class="{ 'otp-input--error': hasError, 'otp-input--filled': digits[index] }"
      :value="digits[index] || ''"
      :disabled="disabled"
      @input="handleInput(index, $event)"
      @keydown="handleKeydown(index, $event)"
      @paste="handlePaste"
      @focus="handleFocus(index)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue';

interface Props {
  modelValue: string;
  length?: number;
  disabled?: boolean;
  hasError?: boolean;
  autofocus?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  length: 6,
  disabled: false,
  hasError: false,
  autofocus: true,
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  complete: [value: string];
}>();

const inputRefs = ref<HTMLInputElement[]>([]);
const digits = computed(() => props.modelValue.split(''));

onMounted(() => {
  if (props.autofocus && inputRefs.value[0]) {
    inputRefs.value[0].focus();
  }
});

// Watch for external value changes
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue === '') {
      // Reset focus to first input when value is cleared
      void nextTick(() => inputRefs.value[0]?.focus());
    }
  }
);

function handleInput(index: number, event: Event) {
  const target = event.target as HTMLInputElement;
  const value = target.value.replace(/\D/g, '');

  if (value) {
    const newDigits = [...digits.value];
    // Pad with empty strings if needed
    while (newDigits.length < props.length) {
      newDigits.push('');
    }
    newDigits[index] = value.charAt(0);
    const newValue = newDigits.join('').slice(0, props.length);
    emit('update:modelValue', newValue);

    // Move to next input
    if (index < props.length - 1) {
      void nextTick(() => inputRefs.value[index + 1]?.focus());
    }

    // Check if complete
    if (newValue.length === props.length && !newValue.includes('')) {
      emit('complete', newValue);
    }
  } else {
    // Clear the current digit
    const newDigits = [...digits.value];
    newDigits[index] = '';
    emit('update:modelValue', newDigits.join(''));
  }
}

function handleKeydown(index: number, event: KeyboardEvent) {
  if (event.key === 'Backspace') {
    event.preventDefault();
    const newDigits = [...digits.value];

    if (newDigits[index]) {
      // Clear current digit
      newDigits[index] = '';
      emit('update:modelValue', newDigits.join(''));
    } else if (index > 0) {
      // Move to previous and clear it
      newDigits[index - 1] = '';
      emit('update:modelValue', newDigits.join(''));
      void nextTick(() => inputRefs.value[index - 1]?.focus());
    }
  } else if (event.key === 'ArrowLeft' && index > 0) {
    event.preventDefault();
    inputRefs.value[index - 1]?.focus();
  } else if (event.key === 'ArrowRight' && index < props.length - 1) {
    event.preventDefault();
    inputRefs.value[index + 1]?.focus();
  } else if (event.key === 'Delete') {
    event.preventDefault();
    const newDigits = [...digits.value];
    newDigits[index] = '';
    emit('update:modelValue', newDigits.join(''));
  }
}

function handlePaste(event: ClipboardEvent) {
  event.preventDefault();
  const paste = event.clipboardData?.getData('text').replace(/\D/g, '') || '';
  const newValue = paste.slice(0, props.length);
  emit('update:modelValue', newValue);

  // Move focus to appropriate input
  const focusIndex = Math.min(newValue.length, props.length - 1);
  void nextTick(() => inputRefs.value[focusIndex]?.focus());

  if (newValue.length === props.length) {
    emit('complete', newValue);
  }
}

function handleFocus(index: number) {
  // Select the content when focusing
  inputRefs.value[index]?.select();
}

// Expose method to focus first input
defineExpose({
  focus: () => inputRefs.value[0]?.focus(),
  clear: () => {
    emit('update:modelValue', '');
    void nextTick(() => inputRefs.value[0]?.focus());
  },
});
</script>

<style lang="sass" scoped>
@import 'src/css/quasar.variables.sass'

.otp-input-container
  display: flex
  justify-content: center
  gap: 10px

.otp-input
  width: 46px
  height: 54px
  text-align: center
  font-size: 22px
  font-weight: 600
  border: 2px solid $gray-200
  border-radius: 12px
  outline: none
  transition: all 0.2s ease
  background: white
  color: $gray-900
  caret-color: $primary

  &:focus
    border-color: $primary
    box-shadow: 0 0 0 3px rgba($primary, 0.1)

  &--filled
    background: $gray-100
    border-color: $gray-200

    &:focus
      border-color: $primary
      background: white

  &:disabled
    background: $gray-100
    cursor: not-allowed
    opacity: 0.6

  &--error
    border-color: $negative
    animation: shake 0.4s ease-in-out

    &:focus
      box-shadow: 0 0 0 3px rgba($negative, 0.1)

@keyframes shake
  0%, 100%
    transform: translateX(0)
  20%, 60%
    transform: translateX(-4px)
  40%, 80%
    transform: translateX(4px)

// Responsive adjustments
@media (max-width: 380px)
  .otp-input-container
    gap: 6px

  .otp-input
    width: 40px
    height: 48px
    font-size: 20px
    border-radius: 10px
</style>

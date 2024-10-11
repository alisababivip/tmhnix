<template>
  <BaseRadioHeadless
    :value="value"
    :name="name"
    :modelValue="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
  >
    <slot></slot>
  </BaseRadioHeadless>
</template>

<script>
export default {
  props: ['modelValue', 'name', 'value'],
  emits: ['update:modelValue'],
}
</script>

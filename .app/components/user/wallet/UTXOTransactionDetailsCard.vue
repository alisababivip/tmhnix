<template>
  <BaseCard class="py-4 text-start px-8">
    <h2 class="text-lg font-semibold mb-4">Transaction Details</h2>
    <BaseList>
      <li><strong>Hash:</strong> {{ transaction.hash }}</li>
      <li>
        <strong>From (Inputs):</strong>
        <BaseList class="pl-5">
          <BaseListItem
            v-for="(input, index) in transaction.inputs"
            :key="index"
            :title="`${input.addresses.join(', ')}`"
            :subtitle="`${formatValue(input.value)} ${currency}`"
          />
        </BaseList>
      </li>
      <li>
        <strong>To (Outputs):</strong>
        <BaseList class="pl-5">
          <BaseListItem
            v-for="(output, index) in transaction.outputs"
            :key="index"
            :title="`${output.addresses.join(', ')}`"
            :subtitle="`${formatValue(output.value)} ${currency}`"
          />
        </BaseList>
      </li>
      <li class="mt-4">
        <strong>Total Amount:</strong> {{ formatValue(totalAmount) }}
        {{ currency }}
      </li>
    </BaseList>
  </BaseCard>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue'

const props = defineProps<{
  transaction: any // Adjust the type according to your project structure
  currency: string
  chain: string
}>()

const totalAmount = computed(() => {
  return props.transaction.outputs.reduce(
    (acc, output) => acc + output.value,
    0,
  )
})

// Formats the value to ensure all decimal places are shown
function formatValue(value: number) {
  return new Number(value).toFixed(8) // Adjust decimal places as needed
}
</script>

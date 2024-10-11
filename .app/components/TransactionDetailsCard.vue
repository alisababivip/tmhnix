<template>
  <BaseCard class="p-4 text-start">
    <h2 class="text-lg font-semibold mb-4">Transaction Details</h2>
    <ul>
      <li><strong>Hash:</strong> {{ transaction.hash }}</li>
      <li><strong>From:</strong> {{ transaction.from }}</li>
      <li><strong>To:</strong> {{ transaction.to }}</li>
      <li class="mt-4">
        <strong>Amount:</strong> {{ transaction.amount }} {{ currency }}
      </li>
      <li><strong>Gas Price:</strong> {{ transaction.gasPrice }}</li>
      <li>
        <strong>Gas Limit:</strong> {{ transaction.gasLimit }} ({{
          $t('Units')
        }})
      </li>
      <li>
        <strong>Gas Used:</strong> {{ transaction.gasUsed }} ({{ $t('Units') }})
      </li>
    </ul>
  </BaseCard>
</template>

<script setup lang="ts">
import { ref, defineProps } from 'vue'

const props = defineProps<{
  transaction: Deposit
  currency: string
  chain: string
}>()

const transaction = ref(props.transaction)
</script>

<style scoped>
/* Add your CSS styling here */
</style>

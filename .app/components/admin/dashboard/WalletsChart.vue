<script setup lang="ts">
import type { Transaction } from '~~/types'

const { getAdminTransactions } = useWallet()
const transactions = ref<Transaction>()
const income = ref(0)
const expenses = ref(0)

onMounted(async () => {
  const response = await getAdminTransactions(
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    true,
  )
  if (response.status === 'success') {
    transactions.value = response.data.result
  }
})

const countTransactions = (type: string, status: string[]) => {
  return transactions.value.filter(
    (transaction) =>
      transaction.type === type && status.includes(transaction.status),
  ).length
}

watch(transactions, () => {
  const completedOrPending = ['COMPLETED', 'PENDING']

  income.value =
    countTransactions('DEPOSIT', completedOrPending) +
    countTransactions('INCOMING_TRANSFER', completedOrPending)

  expenses.value =
    countTransactions('WITHDRAW', completedOrPending) +
    countTransactions('OUTGOING_TRANSFER', completedOrPending)
})
</script>
<template>
  <div>
    <AdminDashboardMonthlySummary
      v-if="transactions"
      incomeText="Deposits"
      expensesText="Withdrawals"
      :income="income"
      :expenses="expenses"
      :transactions="transactions"
    />
  </div>
</template>

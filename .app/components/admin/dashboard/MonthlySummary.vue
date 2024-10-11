<script setup lang="ts">
import type { Transaction } from '~~/types'

const props = defineProps<{
  incomeText: string
  expensesText: string
  income: number
  expenses: number
  transactions: any
}>()

const { incomeText, expensesText, income, expenses, transactions } = props
const { generateEmptyMonthData } = useUtils()

function filterTransactions(type: string, statuses: string[]) {
  return transactions.filter(
    (tx) => tx.type === type && statuses.includes(tx.status),
  )
}

// Generate transaction data for income and expenses
function generateTransactionData() {
  if (!transactions) return [[], []]

  const statuses = ['COMPLETED', 'PENDING']
  const incomeTransactions = filterTransactions('DEPOSIT', statuses).concat(
    filterTransactions('INCOMING_TRANSFER', statuses),
  )
  const expenseTransactions = filterTransactions('WITHDRAW', statuses).concat(
    filterTransactions('OUTGOING_TRANSFER', statuses),
  )

  return [
    aggregateByDate(incomeTransactions),
    aggregateByDate(expenseTransactions),
  ]
}

function aggregateByDate(transactions: Transaction[]) {
  const date = new Date()
  const year = date.getFullYear()
  const month = date.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const data = []

  for (let i = 0; i < daysInMonth; i++) {
    const day = new Date(year, month, i + 1).getTime() // get timestamp of the i-th day of the current month

    const transactionsOnDay = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.created_at)
      return (
        transactionDate.getDate() === i + 1 &&
        transactionDate.getMonth() === month &&
        transactionDate.getFullYear() === year
      )
    })

    const totalTransactionsOnDay = transactionsOnDay.length
    data.push([day, totalTransactionsOnDay])
  }

  return data
}

const areaExpenses = reactive(useAreaExpenses())
function useAreaExpenses() {
  const { primary, info, success } = useTailwindColors()
  const type = 'area'
  const height = 315

  const options = {
    chart: {
      type: 'area',
      stacked: true,
      toolbar: {
        show: false,
      },
    },
    colors: [primary.value, success.value, info.value],
    title: {
      text: '',
      align: 'left',
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: [2, 2, 2],
      curve: 'smooth',
    },
    xaxis: {
      type: 'datetime',
      tooltip: {
        enabled: false,
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        offsetX: 0,
        offsetY: -5,
      },
      tooltip: {
        enabled: true,
      },
    },
    tooltip: {
      x: {
        format: 'dd/MM/yy HH:mm',
      },
      y: {
        formatter: function (val: number) {
          return val
        },
      },
    },
  }

  const series = computed(() => {
    const [incomeData, expenseData] = transactions
      ? generateTransactionData(transactions as Transaction[])
      : [generateEmptyMonthData(), generateEmptyMonthData()]

    return [
      {
        name: incomeText,
        data: incomeData,
      },
      {
        name: expensesText,
        data: expenseData,
      },
    ]
  })

  return {
    type,
    height,
    options,
    series,
  }
}
</script>

<template>
  <BaseCard
    class="!bg-white dark:!bg-muted-800 gap-y-10 p-6 col-span-12 lg:col-span-8"
  >
    <div class="flex h-full w-full flex-col gap-8 sm:flex-row">
      <!-- Monthly Summary -->
      <div class="shrink-0">
        <BaseHeading
          as="h3"
          size="md"
          weight="semibold"
          lead="tight"
          class="text-muted-800 mb-6 dark:text-white"
        >
          <span>{{ $t('Monthly Summary') }}</span>
        </BaseHeading>
        <div
          class="border-muted-300 divide-muted-300 dark:border-muted-700 dark:divide-muted-700 flex flex-col divide-y rounded-lg border"
        >
          <div class="p-4">
            <div
              class="text-muted-400 mb-1 font-sans text-xs font-medium uppercase"
            >
              <span>{{ incomeText }}</span>
            </div>
            <div class="text-success-500 font-sans text-sm font-semibold">
              <span>+ {{ income }}</span>
            </div>
          </div>
          <div class="p-4">
            <div
              class="text-muted-400 mb-1 font-sans text-xs font-medium uppercase"
            >
              <span>{{ expensesText }}</span>
            </div>
            <div class="text-danger-500 font-sans text-sm font-semibold">
              <span>- {{ expenses }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- Chart -->
      <div class="flex h-full grow flex-col">
        <div class="mt-auto">
          <AddonApexcharts
            v-bind="areaExpenses"
            iconColor="primary"
            icon="solar:wallet-line-duotone"
          />
        </div>
      </div>
    </div>
  </BaseCard>
</template>

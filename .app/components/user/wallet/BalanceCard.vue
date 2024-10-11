<script setup lang="ts">
const props = defineProps<{
  balance: number | string
  currency: string
  uuid: string
  income: number | string
  expenses: number | string
  incomeText: string
  expensesText: string
  uuidFormated?: boolean
  currencyFormated?: boolean
}>()

const {
  balance,
  currency,
  uuid,
  income,
  expenses,
  incomeText,
  expensesText,
  uuidFormated,
  currencyFormated,
} = props

const { formatedPrice } = useUtils()
</script>

<template>
  <BaseCard>
    <div class="flex h-full flex-col">
      <div class="mb-4 mt-2">
        <BaseHeading
          as="h4"
          size="md"
          weight="semibold"
          lead="tight"
          class="text-muted-800 dark:text-white"
        >
          <span>{{ $t('Balance') }}</span>
        </BaseHeading>
      </div>
      <div class="my-auto">
        <div class="ptablet:mb-0 mb-6 leading-relaxed">
          <span
            class="text-muted-800 dark:text-muted-100 block font-sans text-3xl font-semibold"
          >
            {{
              currencyFormated
                ? formatedPrice(balance, currency)
                : balance + ' ' + currency
            }}
          </span>
          <span class="text-muted-400 block font-sans text-sm">
            {{ uuid }}
          </span>
        </div>
        <div class="flex items-center gap-12 mt-5">
          <div class="card-balance-stat">
            <div
              class="text-muted-400 mb-1 font-sans text-xs font-medium uppercase"
            >
              <span>{{ incomeText }}</span>
            </div>
            <div class="flex items-center gap-2">
              <div
                class="bg-muted-100 dark:bg-muted-700 flex h-10 w-10 items-center justify-center rounded-full"
              >
                <Icon
                  name="lucide:arrow-right"
                  class="text-success-500 h-4 w-4 -rotate-45"
                />
              </div>
              <div class="text-muted-500 dark:text-muted-400 font-sans text-sm">
                <span
                  >+
                  {{
                    currencyFormated
                      ? formatedPrice(income, currency)
                      : income + ' ' + currency
                  }}</span
                >
              </div>
            </div>
          </div>
          <div class="card-balance-stat">
            <div
              class="text-muted-400 mb-1 font-sans text-xs font-medium uppercase"
            >
              <span>{{ expensesText }}</span>
            </div>
            <div class="flex items-center gap-2">
              <div
                class="bg-muted-100 dark:bg-muted-700 flex h-10 w-10 items-center justify-center rounded-full"
              >
                <Icon
                  name="lucide:arrow-right"
                  class="text-danger-500 h-4 w-4 rotate-45"
                />
              </div>
              <div class="text-muted-500 dark:text-muted-400 font-sans text-sm">
                <span
                  >-
                  {{
                    currencyFormated
                      ? formatedPrice(expenses, currency)
                      : expenses + ' ' + currency
                  }}</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseCard>
</template>

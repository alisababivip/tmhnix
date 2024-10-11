<script setup lang="ts">
definePageMeta({
  permissions: ['Access Cron'],
  title: 'Cron Management',
})

const extensionStore = useExtensionStore()
const extensions = computed(() => extensionStore.extensionsUser)

const crons = ref([
  {
    title: 'Deposit Cron',
    description: 'Runs every 15 minutes.',
    time: '*/15 * * * *',
    link: '/api/cron/wallets/spot/deposit',
  },
  {
    title: 'Withdraw Cron',
    description: 'Runs every 30 minutes.',
    time: '*/30 * * * *',
    link: '/api/cron/wallets/spot/withdraw',
  },
  {
    title: 'Investments',
    description: 'Runs once every hour, at the beginning of the hour.',
    time: '0 * * * *',
    link: '/api/cron/investment',
  },
  {
    title: 'Binary Orders',
    description: 'Runs once every hour, at the beginning of the hour.',
    time: '0 * * * *',
    link: '/api/cron/binary/orders',
  },
  {
    title: 'Exchange Currencies',
    description: 'Runs every 2 minutes.',
    time: '*/2 * * * *',
    link: '/api/cron/exchange/currencies',
  },
  {
    title: 'Fiat Currencies',
    description: 'Runs once every hour, at the beginning of the hour.',
    time: '0 * * * *',
    link: '/api/cron/fiat/currencies',
  },
])

onMounted(async () => {
  if (extensionStore.extensions.length === 0) {
    await extensionStore.fetchExtensionsUser()
  }

  if (extensions.value['ai_trading']) {
    crons.value.push({
      title: 'AI Investments',
      description: 'Runs once every hour, at the beginning of the hour.',
      time: '0 * * * *',
      link: '/api/cron/ai-trading/investment',
    })
  }

  if (extensions.value['forex']) {
    crons.value.push({
      title: 'Forex Investments',
      description: 'Runs once every hour, at the beginning of the hour.',
      time: '0 * * * *',
      link: '/api/cron/forex/investment',
    })
  }

  if (extensions.value['ico']) {
    crons.value.push({
      title: 'ICO Phases',
      description: 'Runs once every hour, at the beginning of the hour.',
      time: '0 * * * *',
      link: '/api/cron/ico/phase',
    })
  }

  if (extensions.value['staking']) {
    crons.value.push({
      title: 'Staking Logs',
      description: 'Runs once every hour, at the beginning of the hour.',
      time: '0 * * * *',
      link: '/api/cron/staking',
    })
  }

  if (extensions.value['mailwizard']) {
    crons.value.push({
      title: 'Mailwizard Campaigns',
      description: 'Runs once every hour, at the beginning of the hour.',
      time: '0 * * * *',
      link: '/api/cron/mailwizard/send',
    })
  }
})
</script>

<template>
  <div>
    <TairoContentWrapper>
      <div>
        <div class="w-full">
          <TairoFlexTable class="md:pt-0 sm:pt-5 md:mt-0 sm:mt-5">
            <TableFlexTableRow
              v-for="(item, index) in crons"
              :key="item.id"
              spaced
            >
              <template #start>
                <TableFlexTableStart
                  label="Cron"
                  :hide-label="index > 0"
                  class="w-1/2 xs:w-full"
                  :title="item.title"
                  :subtitle="item.description"
                />
                <TableFlexTableStart
                  label="Link"
                  class="w-1/2 xs:w-full"
                  :hide-label="index > 0"
                  :title="item.link"
                  :subtitle="item.time"
                />
              </template>
            </TableFlexTableRow>
          </TairoFlexTable>
        </div>
      </div>
    </TairoContentWrapper>
  </div>
</template>

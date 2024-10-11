<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    shape?: 'straight' | 'rounded' | 'curved' | 'full'
    livePositions: BinaryOrder[]
    practicePositions: BinaryOrder[]
  }>(),
  {
    shape: 'rounded',
  },
)
const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)
const status = (status: string) => {
  switch (status) {
    case 'WIN':
      return 'success'
    case 'PENDING':
      return 'warning'
    case 'LOSS':
      return 'danger'
    case 'CANCELLED':
      return 'danger'
    case 'REJECTED':
      return 'danger'
    case 'DRAW':
      return 'info'
    default:
      return 'info'
  }
}

const profit = (item: any) => {
  const pair = item.symbol.split('/')[1]
  if (item.status === 'PENDING') return 'Pending'
  let profit, classColor
  if (item.status === 'WIN') {
    profit = `+${item.amount * (item.profit / 100)}`
    classColor = 'text-success-500'
  }
  if (item.status === 'LOSS') {
    profit = `${-item.amount}`
    classColor = 'text-danger-500'
  }
  if (item.status === 'DRAW') {
    profit = '0'
    classColor = 'text-muted'
  }
  return `<span class="${classColor}">${profit} ${pair}</span>`
}
</script>

<template>
  <div>
    <TabbedContent
      title="Positions"
      :labels="['Live', 'Practice']"
      :shape="settings.binary_trading_practice ? props.shape : 'notTabbed'"
    >
      <template #tab-1>
        <div
          class="space-y-6 no-scrollbar overflow-y-auto xs:h-64 sm:h-80 pr-2"
        >
          <div
            v-for="item in livePositions"
            :key="item.id"
            class="flex items-center gap-2"
          >
            <BaseIconBox
              size="md"
              :color="item.side === 'RISE' ? 'success' : 'danger'"
            >
              <Icon
                :name="`ph:trend-${
                  item.side === 'RISE' ? 'up' : 'down'
                }-duotone`"
                class="h-6 w-6"
                :class="
                  item.side === 'RISE' ? 'text-green-500' : 'text-red-500'
                "
              />
            </BaseIconBox>
            <div>
              <BaseHeading
                as="h3"
                size="sm"
                weight="medium"
                lead="tight"
                class="text-muted-800 dark:text-muted-100"
              >
                <span>{{ item.symbol }}</span>
              </BaseHeading>
              <BaseText size="xs" class="text-muted-400">
                <span>{{ formatDate(item.created_at) }}</span>
              </BaseText>
            </div>
            <div class="ms-auto">
              <BaseTag :color="status(item.status)" size="sm" flavor="pastel">
                <span v-html="profit(item)"></span>
              </BaseTag>
            </div>
          </div>
          <div
            v-if="livePositions?.length === 0"
            class="flex w-full justify-center items-center flex-col text-gray-500 dark:text-gray-500 xs:h-64 sm:h-80"
          >
            <Icon name="ph:files-thin" class="h-16 w-16" />
            {{ $t('No Positons Found') }}
          </div>
        </div>
      </template>
      <template #tab-2 v-if="settings.binary_trading_practice">
        <div
          class="space-y-6 no-scrollbar overflow-y-auto xs:h-64 sm:h-80 pr-2"
        >
          <div
            v-for="item in practicePositions"
            :key="item.id"
            class="flex items-center gap-2"
          >
            <BaseIconBox
              size="md"
              :color="item.side === 'RISE' ? 'success' : 'danger'"
            >
              <Icon
                :name="`ph:trend-${
                  item.side === 'RISE' ? 'up' : 'down'
                }-duotone`"
                class="h-6 w-6"
                :class="
                  item.side === 'RISE' ? 'text-green-500' : 'text-red-500'
                "
              />
            </BaseIconBox>
            <div>
              <BaseHeading
                as="h3"
                size="sm"
                weight="medium"
                lead="tight"
                class="text-muted-800 dark:text-muted-100"
              >
                <span>{{ item.symbol }}</span>
              </BaseHeading>
              <BaseText size="xs" class="text-muted-400">
                <span>{{ formatDate(item.created_at) }}</span>
              </BaseText>
            </div>
            <div class="ms-auto">
              <BaseTag :color="status(item.status)" size="sm" flavor="pastel">
                <span v-html="profit(item)"></span>
              </BaseTag>
            </div>
          </div>
          <div
            v-if="practicePositions?.length === 0"
            class="flex w-full justify-center items-center flex-col text-gray-500 dark:text-gray-500 xs:h-64 sm:h-80"
          >
            <Icon name="ph:files-thin" class="h-16 w-16" />
            {{ $t('No Positons Found') }}
          </div>
        </div>
      </template>
    </TabbedContent>
  </div>
</template>

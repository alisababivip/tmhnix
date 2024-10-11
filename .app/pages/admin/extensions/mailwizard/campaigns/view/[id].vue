<script setup lang="ts">
import { useAdminMailWizardCampaignsStore } from '~~/store/extensions/mailwizard/admin/campaigns'

definePageMeta({
  title: 'View Mailwizard Campaign',
  permissions: ['View Mailwizard Campaign Details'],
})

const adminCampaignsStore = useAdminMailWizardCampaignsStore()
const { toast } = useUtils()
const { updateCampaignStatus, getCampaign } = useMailwizard()
const campaign = ref(null)
const route = useRoute()
const { id } = route.params

const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const items = computed(() => campaign.value?.targets ?? [])

const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return items.value.slice(start, end)
})

onMounted(async () => {
  const response = await getCampaign(id)
  if (response.status === 'success') {
    campaign.value = response.data.result
  }
})

// Update Method
const update = async (status) => {
  try {
    const response = await updateCampaignStatus(campaign.value.id, status)
    toast.response(response)
    if (response.status === 'success') {
      await adminCampaignsStore.fetchCampaigns()
    }
  } catch (error) {
    toast.danger(error as any)
  }
}

const statusClass = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'warning'
    case 'ACTIVE':
      return 'primary'
    case 'PAUSED':
      return 'info'
    case 'COMPLETED':
      return 'success'
    case 'CANCELED':
      return 'danger'
    case 'STOPPED':
      return 'danger'
    default:
      return 'primary'
  }
}

const statusText = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'Pending'
    case 'ACTIVE':
      return 'Active'
    case 'PAUSED':
      return 'Paused'
    case 'COMPLETED':
      return 'Completed'
    case 'CANCELED':
      return 'Canceled'
    case 'STOPPED':
      return 'Stopped'
    default:
      return 'Pending'
  }
}

const targetStatusClass = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'warning'
    case 'SENT':
      return 'primary'
    case 'OPENED':
      return 'info'
    case 'CLICKED':
      return 'success'
    case 'BOUNCED':
      return 'danger'
    case 'UNSUBSCRIBED':
      return 'danger'
    default:
      return 'primary'
  }
}

const targetStatusText = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'Pending'
    case 'SENT':
      return 'Sent'
    case 'OPENED':
      return 'Opened'
    case 'CLICKED':
      return 'Clicked'
    case 'BOUNCED':
      return 'Bounced'
    case 'UNSUBSCRIBED':
      return 'Unsubscribed'
    default:
      return 'Pending'
  }
}
</script>

<template>
  <TairoContentWrapper>
    <template #left>
      <BaseHeading size="lg">{{ campaign?.name }} Campaign</BaseHeading>
    </template>
    <template #right>
      <BaseButton
        type="button"
        color="muted"
        class="hover:bg-gray-300 dark:hover:bg-gray-800"
        :to="'/admin/extensions/mailwizard/campaigns'"
      >
        <Icon name="line-md:chevron-left" class="h-4 w-4 mr-2" />
        {{ $t('Back') }}
      </BaseButton>
    </template>

    <BaseCard class="p-3 mb-5">
      <div class="flex items-center justify-between gap-3 flex-col sm:flex-row">
        <BaseButton
          type="button"
          color="success"
          class="w-full"
          @click="update('ACTIVE')"
          :disabled="
            ['ACTIVE', 'COMPLETED', 'CANCELED'].includes(campaign?.status)
          "
        >
          <Icon name="line-md:play" class="h-4 w-4 mr-2" />
          {{ $t('Run') }}
        </BaseButton>
        <BaseButton
          type="button"
          color="warning"
          class="w-full"
          @click="update('PAUSED')"
          :disabled="
            ['PENDING', 'STOPPED', 'PAUSED', 'COMPLETED', 'CANCELED'].includes(
              campaign?.status,
            )
          "
        >
          <Icon name="line-md:pause" class="h-4 w-4 mr-2" />
          {{ $t('Pause') }}
        </BaseButton>
        <BaseButton
          type="button"
          color="danger"
          class="w-full"
          @click="update('STOPPED')"
          :disabled="
            ['PENDING', 'COMPLETED', 'CANCELED', 'STOPPED'].includes(
              campaign?.status,
            )
          "
        >
          <Icon name="mdi:stop" class="h-4 w-4 mr-2" />
          {{ $t('Stop') }}
        </BaseButton>
        <BaseButton
          type="button"
          color="danger"
          class="w-full"
          @click="update('CANCELED')"
          :disabled="
            ['ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELED'].includes(
              campaign?.status,
            )
          "
        >
          <Icon name="line-md:close" class="h-4 w-4 mr-2" />
          {{ $t('Cancel') }}
        </BaseButton>
      </div>
    </BaseCard>
    <BaseCard class="p-5">
      <div class="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <div>
          <span
            class="text-gray-500 dark:text-gray-400 font-semibold uppercase text-xs tracking-wide"
            >Name</span
          >
          <BaseHeading size="md" class="mt-1">
            {{ campaign?.name }}
          </BaseHeading>
        </div>
        <div>
          <span
            class="text-gray-500 dark:text-gray-400 font-semibold uppercase text-xs tracking-wide"
            >Subject</span
          >
          <BaseHeading size="md" class="mt-1">
            {{ campaign?.subject }}
          </BaseHeading>
        </div>
        <div>
          <span
            class="text-gray-500 dark:text-gray-400 font-semibold uppercase text-xs tracking-wide"
            >Speed</span
          >
          <BaseHeading size="md" class="mt-1">
            {{ campaign?.speed }}
          </BaseHeading>
        </div>
        <div>
          <span
            class="text-gray-500 dark:text-gray-400 font-semibold uppercase text-xs tracking-wide"
            >Template</span
          >
          <BaseHeading size="md" class="mt-1">
            {{ campaign?.template.name }}
          </BaseHeading>
        </div>
        <div>
          <span
            class="text-gray-500 dark:text-gray-400 font-semibold uppercase text-xs tracking-wide"
            >Status</span
          >
          <BaseHeading
            size="md"
            class="mt-1"
            :class="`text-${statusClass(campaign?.status)}-500`"
          >
            {{ statusText(campaign?.status) }}
          </BaseHeading>
        </div>
        <div>
          <span
            class="text-gray-500 dark:text-gray-400 font-semibold uppercase text-xs tracking-wide"
            >Created At</span
          >
          <BaseHeading size="md" class="mt-1">
            {{ formatDate(campaign?.created_at) }}
          </BaseHeading>
        </div>
      </div>
    </BaseCard>

    <TairoContentWrapper class="mt-5">
      <template #left>
        <BaseInput
          v-model="filter"
          icon="lucide:search"
          :classes="{
            wrapper: 'w-full sm:w-auto',
          }"
          placeholder="Filter targets..."
        />
      </template>
      <template #right>
        <BaseSelect
          v-model="perPage"
          label=""
          :classes="{
            wrapper: 'w-full sm:w-40',
          }"
        >
          <option :value="10">10 {{ $t('per page') }}</option>
          <option :value="25">25 {{ $t('per page') }}</option>
          <option :value="50">50 {{ $t('per page') }}</option>
          <option :value="100">100 {{ $t('per page') }}</option>
        </BaseSelect>
      </template>
      <div>
        <template
          v-if="!adminCampaignsStore?.loading && paginatedItems?.length === 0"
        >
          <BasePlaceholderPage
            :title="
              filter && filter !== '' ? 'No matching results' : 'No results'
            "
            :subtitle="
              filter && filter !== ''
                ? 'Looks like we couldn\'t find any matching results for your search terms. Try other search terms.'
                : 'Looks like we don\'t have any data here yet.'
            "
          >
            <template #image>
              <img
                class="block dark:hidden"
                src="/img/illustrations/placeholders/flat/placeholder-search-4.svg"
                alt="Placeholder image"
              />
              <img
                class="hidden dark:block"
                src="/img/illustrations/placeholders/flat/placeholder-search-4-dark.svg"
                alt="Placeholder image"
              />
            </template>
          </BasePlaceholderPage>
        </template>
        <div v-else class="w-full">
          <TairoFlexTable class="pt-5">
            <TableFlexTableRow
              v-for="(item, index) in paginatedItems"
              :key="item.id"
              spaced
            >
              <template #start>
                <TableFlexTableStart
                  label="Target"
                  :hide-label="index > 0"
                  :title="`${item.first_name} ${item.last_name}`"
                  :subtitle="item.email"
                />
              </template>
              <template #end>
                <TableFlexTableCell
                  label="Status"
                  :hide-label="index > 0"
                  class="w-20 xs:w-full"
                >
                  <BaseTag
                    :color="targetStatusClass(item.status)"
                    flavor="pastel"
                    condensed
                    >{{ targetStatusText(item.status) }}</BaseTag
                  >
                </TableFlexTableCell>
              </template>
            </TableFlexTableRow>
          </TairoFlexTable>
        </div>

        <div class="mt-6">
          <BasePagination
            v-if="items.length > perPage"
            :total-items="items.length"
            :current-page="page"
            :item-per-page="perPage"
          />
        </div>
      </div>
    </TairoContentWrapper>
  </TairoContentWrapper>
</template>

<script setup lang="ts">
import type { NotificationTemplate } from '~~/types'
definePageMeta({
  permissions: ['Access Notification Templates Management'],
  title: 'Notification Templates Management',
})

const route = useRoute()

const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))
const loading = ref(false)

const { getNotificationTemplates } = useNotification()
const templates = ref<NotificationTemplate[]>([])

onMounted(async () => {
  loading.value = true
  try {
    const response = await getNotificationTemplates()
    templates.value = response.data.result
  } catch (error) {
    console.log(error)
  }
  loading.value = false
})

const items = computed(() =>
  templates.value
    .filter((template) => {
      // Reference ID Filter
      return !filter.value || template.title?.includes(filter.value)
    })
    .sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }),
)

const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return items.value.slice(start, end)
})
</script>

<template>
  <div class="pb-10">
    <TairoContentWrapper>
      <template #left>
        <BaseInput
          v-model="filter"
          icon="lucide:search"
          :classes="{
            wrapper: 'w-full sm:w-auto',
          }"
          placeholder="Search Template Title..."
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
        <template v-if="!loading && paginatedItems?.length === 0">
          <BasePlaceholderPage
            title="No matching results"
            subtitle="Looks like we couldn't find any matching results for your search terms. Try other search terms."
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
        <div v-else class="w-full sm:pt-5">
          <TairoFlexTable>
            <TransitionGroup
              enter-active-class="transform-gpu"
              enter-from-class="opacity-0 translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transform-gpu"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 translate-y-2"
            >
              <TableFlexTableRow
                v-for="(item, index) in paginatedItems"
                :key="item.id"
                spaced
              >
                <template #start>
                  <TableFlexTableStart
                    label="Template"
                    :hide-label="index > 0"
                    :title="item.name"
                    :subtitle="item.subject"
                  />
                </template>
                <template #end>
                  <TableFlexTableCell
                    label="Email"
                    :hide-label="index > 0"
                    class="w-20 xs:w-full"
                  >
                    <Icon
                      :name="
                        item.email
                          ? 'line-md:confirm-circle'
                          : 'line-md:close-circle'
                      "
                      class="h-5 w-5"
                      :class="{
                        'text-success-500': item.email,
                        'text-danger-500': !item.email,
                      }"
                    />
                  </TableFlexTableCell>
                  <TableFlexTableCell
                    label="SMS"
                    :hide-label="index > 0"
                    class="w-20 xs:w-full"
                  >
                    <Icon
                      :name="
                        item.sms
                          ? 'line-md:confirm-circle'
                          : 'line-md:close-circle'
                      "
                      class="h-5 w-5"
                      :class="{
                        'text-success-500': item.sms,
                        'text-danger-500': !item.sms,
                      }"
                    />
                  </TableFlexTableCell>
                  <TableFlexTableCell
                    label="Push"
                    :hide-label="index > 0"
                    class="w-20 xs:w-full"
                  >
                    <Icon
                      :name="
                        item.push
                          ? 'line-md:confirm-circle'
                          : 'line-md:close-circle'
                      "
                      class="h-5 w-5"
                      :class="{
                        'text-success-500': item.push,
                        'text-danger-500': !item.push,
                      }"
                    />
                  </TableFlexTableCell>
                  <TableFlexTableCell
                    label="Actions"
                    :hide-label="index > 0"
                    class="w-20 xs:justify-end xs:w-full"
                  >
                    <TairoButtonIcon
                      :to="`/admin/notifications/template/${item.id}`"
                      data-nui-tooltip="Edit Template"
                      condensed
                    >
                      <Icon name="line-md:edit-twotone" class="h-4 w-4" />
                    </TairoButtonIcon>
                  </TableFlexTableCell>
                </template>
              </TableFlexTableRow>
            </TransitionGroup>
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
  </div>
</template>

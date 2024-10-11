<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'

import { Field, useForm } from 'vee-validate'
import { useRoute, useRouter } from 'vue-router'
import { z } from 'zod'
import type { JSONResponse, Role, User } from '~~/types'

definePageMeta({
  permissions: ['Access Roles Management'],
  title: 'Roles Management',
})

// General Constants
const {
  activeRole,
  selectRole,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  deleteRoles,
} = useRoles()

async function setRoles() {
  const response = await getRoles()
  roles.value = response.data.result
}

onMounted(async () => {
  if (roles.value.length === 0) {
    loading.value = true
    await setRoles()
    loading.value = false
  }
})

const roles = ref<Role[]>([])
const loading = ref(true)

const route = useRoute()
const router = useRouter()
const { toast } = useUtils()

// Pagination Constants
const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

// Modals Constants
const isCreateOpen = ref(false)
const isEditOpen = ref(false)
const isDeleteOpen = ref(false)

// Filter
const items = computed(() => {
  if (roles.value && Array.isArray(roles.value)) {
    return roles.value.filter(
      (item) => item.name.includes(filter.value) && item.name !== 'Super Admin',
    )
  } else {
    return []
  }
})

// Pagination
const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return items.value.slice(start, end)
})

// Selection
const selected = ref<number[]>([])
const isAllVisibleSelected = computed(() => {
  return selected.value.length === items.value.length
})

function toggleAllVisibleSelection() {
  if (isAllVisibleSelected.value) {
    selected.value = []
  } else {
    selected.value = items.value.map((item) => item.id) ?? []
  }
}

// Validation
const zodSchema = z.object({
  name: z.string().nonempty('Name is required'),
})
type FormInput = z.infer<typeof zodSchema>

const initialValues = computed<FormInput>(() => ({ name: '' }))
const { handleSubmit, isSubmitting, resetForm, setFieldValue } = useForm({
  validationSchema: toTypedSchema(zodSchema),
  initialValues,
})

// Routes
const view = (item: any) => {
  selectRole(item)
  const id = item.id
  router.push({ path: `/admin/roles/${id}` })
}

// Create
const create = handleSubmit(async (values: any) => {
  try {
    const response = await createRole(values)

    toast.response(response as JSONResponse)
    if (response.status === 'success') {
      roles.value.push(response.data.result)
      resetForm()
    }
  } catch (error) {
    toast.danger(error as any)
  }
  isCreateOpen.value = false
})

// Edit
const update = handleSubmit(async (values: any) => {
  try {
    // Check if there are any changes
    if (
      JSON.stringify(values.name) === JSON.stringify(activeRole.value?.name)
    ) {
      toast.info('No changes detected.')
      isEditOpen.value = false
      selectRole(null)
      return
    }

    const response = await updateRole(activeRole.value?.id as number, values)

    toast.response(response as JSONResponse)
    if (response.status === 'success') {
      // Find the index of the role in the roles array
      const index = roles.value.findIndex(
        (role) => role.id === response.data.result.id,
      )

      // Replace the role at the found index with the updated role
      if (index !== -1) {
        roles.value[index] = response.data.result
      }

      resetForm()
      selectRole(null)
    }
  } catch (error) {
    toast.danger(error as any)
  }
  isEditOpen.value = false
})

const openEditModal = (item: any) => {
  selectRole(item)
  setFieldValue('name', item.name)
  isEditOpen.value = true
}

const closeEditModal = () => {
  isEditOpen.value = false
  selectRole(null)
  resetForm()
}

// Delete
const deleteItem = async () => {
  try {
    const response = await deleteRole(activeRole.value?.id as number)

    toast.response(response)

    if (response.status === 'success') {
      // Filter out the deleted role from the roles array
      roles.value = roles.value.filter(
        (role) => role.id !== activeRole.value?.id,
      )
    }

    selectRole(null)
  } catch (error) {
    toast.danger(error as any)
  }
  isDeleteOpen.value = false
}

const deleteItems = async () => {
  try {
    const ids = selected.value.map((id) => id)

    const response = await deleteRoles(ids as number[])
    roles.value = roles.value.filter((role) => !ids.includes(role.id))
    selected.value = []
    toast.response(response)
  } catch (error) {
    toast.danger(error as any)
  }
  isDeleteOpen.value = false
}

const openDeleteModal = (item: any) => {
  selectRole(item)
  isDeleteOpen.value = true
}

const openDeleteModalBulk = (user: User) => {
  isDeleteOpen.value = true
}
</script>

<template>
  <div class="pb-10">
    <TairoContentWrapper>
      <template #left>
        <BaseInput
          v-model="filter"
          icon="lucide:search"
          placeholder="Filter roles..."
          :classes="{
            wrapper: 'w-full sm:w-auto',
          }"
        />
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
      <template #right>
        <div class="w-full">
          <BaseButton
            color="success"
            class="w-full"
            @click="isCreateOpen = true"
            flavor="outline"
          >
            <Icon name="line-md:plus" class="h-4 w-4" />
            <span>{{ $t('Create Role') }}</span>
          </BaseButton>
        </div>
      </template>
      <div>
        <template v-if="!loading && paginatedItems?.length === 0">
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
          <TairoFlexTable>
            <template #header>
              <TairoFlexTableHeading type="shrink">
                <div class="flex items-center">
                  <BaseCheckbox
                    :model-value="isAllVisibleSelected"
                    :indeterminate="
                      selected.length > 0 && !isAllVisibleSelected
                    "
                    shape="curved"
                    class="text-primary-500"
                    @click="toggleAllVisibleSelection"
                  />
                </div>
              </TairoFlexTableHeading>
              <TairoFlexTableHeading type="grow" class="md:justify-start">
                <div class="w-full w:sm-40">
                  {{ $t('Name') }}
                </div></TairoFlexTableHeading
              >
              <TairoFlexTableHeading class="text-end md:text-start">{{
                $t('Permissions')
              }}</TairoFlexTableHeading>
              <TairoFlexTableHeading
                type="grow"
                class="md:justify-end text-end"
                >{{ $t('Actions') }}</TairoFlexTableHeading
              >
            </template>

            <TairoFlexTableRow
              v-if="!loading && selected.length > 0"
              shape="rounded"
            >
              <TairoFlexTableCell
                type="grow"
                class="bg-info-100 text-info-700 dark:bg-info-700 dark:text-info-100 rounded-lg"
              >
                <div class="flex justify-between items-center w-full">
                  <span>
                    {{ $t('You have selected') }} {{ selected.length }}
                    {{ $t('items of the total') }} {{ items.length }}
                    {{ $t('items') }}.
                  </span>
                  <TairoButtonIcon
                    color="danger"
                    size="xs"
                    shape="curved"
                    @click="openDeleteModalBulk(selected as any)"
                    data-nui-tooltip="Delete roles"
                  >
                    <Icon name="line-md:close-small" class="h-5 w-5" />
                  </TairoButtonIcon>
                </div>
              </TairoFlexTableCell>
            </TairoFlexTableRow>

            <TairoFlexTableRow
              v-if="loading"
              v-for="index in 5"
              :key="index"
              shape="rounded"
            >
              <TairoFlexTableCell type="shrink" data-content="Selection">
                <div class="flex items-center">
                  <BaseCheckbox
                    v-model="selected"
                    :name="`placeload-item-checkbox-${index}`"
                    shape="curved"
                    class="text-primary-500"
                  />
                </div>
              </TairoFlexTableCell>
              <TairoFlexTableCell
                type="grow"
                class="md:justify-start"
                data-content="Name"
              >
                <BasePlaceload class="h-[46px] w-[46px] shrink-0 rounded-xl" />
              </TairoFlexTableCell>
              <TairoFlexTableCell
                class="text-end md:text-start"
                data-content="Permissions"
                light
              >
                <BasePlaceload class="h-3 w-24 rounded-lg" />
              </TairoFlexTableCell>
              <TairoFlexTableCell
                type="grow"
                class="md:justify-end text-end"
                data-content="Actions"
              >
                <BasePlaceload class="h-8 w-16 rounded-lg" />
              </TairoFlexTableCell>
            </TairoFlexTableRow>

            <TairoFlexTableRow
              v-else
              v-for="item in paginatedItems"
              :key="item.id"
              shape="rounded"
            >
              <TairoFlexTableCell data-content="Selection" type="shrink">
                <div class="flex items-center">
                  <BaseCheckbox
                    v-model="selected"
                    :value="item.id"
                    :name="`item-checkbox-${item.id}`"
                    shape="rounded"
                    class="text-primary-500"
                  />
                </div>
              </TairoFlexTableCell>
              <TairoFlexTableCell
                data-content="Name"
                type="grow"
                class="text-end md:text-start md:justify-start"
              >
                <div class="w-full sm:w-40">{{ item.name }}</div>
              </TairoFlexTableCell>
              <TairoFlexTableCell
                class="text-end md:text-start"
                data-content="Permissions"
                light
              >
                {{ item.rolepermission?.length ?? 0 }}
              </TairoFlexTableCell>
              <TairoFlexTableCell
                data-content="Actions"
                type="grow"
                class="md:justify-end text-end"
              >
                <span class="flex gap-2">
                  <TairoButtonIcon
                    flavor="outline"
                    color="info"
                    shadow="hover"
                    @click="view(item)"
                    data-nui-tooltip="View Role"
                  >
                    <icon name="line-md:computer" class="h-4 w-4" />
                  </TairoButtonIcon>
                  <TairoButtonIcon
                    color="warning"
                    flavor="outline"
                    shadow="hover"
                    @click="openEditModal(item)"
                    data-nui-tooltip="Edit Role"
                  >
                    <Icon name="line-md:edit" class="h-4 w-4" />
                  </TairoButtonIcon>
                  <TairoButtonIcon
                    :disabled="item.name === 'User'"
                    :color="item.name === 'User' ? 'muted' : 'danger'"
                    flavor="outline"
                    shadow="hover"
                    @click="openDeleteModal(item)"
                    data-nui-tooltip="Delete Role"
                  >
                    <Icon name="line-md:close-small" class="h-5 w-5" />
                  </TairoButtonIcon>
                </span>
              </TairoFlexTableCell>
            </TairoFlexTableRow>
          </TairoFlexTable>
        </div>
        <div class="mt-6">
          <BasePagination
            v-if="items.length > perPage"
            :total-items="items.length"
            :item-per-page="perPage"
            :current-page="page"
          />
        </div>
      </div>
    </TairoContentWrapper>

    <TairoModal :open="isCreateOpen" size="sm" @close="isCreateOpen = false">
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Create New Role') }}
          </h3>

          <BaseButtonClose @click="isCreateOpen = false" />
        </div>
      </template>
      <!-- Body -->
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-start">
          <p
            class="font-alt text-muted-500 dark:text-muted-400 text-sm leading-5 mb-3"
          >
            {{ $t('Please provide a unique name for the new role') }}.
          </p>

          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="name"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="text"
              label="Role Name"
              placeholder="Enter role name"
              :classes="{ input: 'h-12', wrapper: 'max-w-xs' }"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </div>
      </div>

      <template #footer>
        <!-- Footer -->
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isCreateOpen = false">{{
              $t('Cancel')
            }}</BaseButton>
            <BaseButton
              color="primary"
              flavor="solid"
              @click="create"
              :disabled="isSubmitting"
              :loading="isSubmitting"
            >
              {{ $t('Create') }}
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>
    <TairoModal :open="isEditOpen" size="sm" @close="closeEditModal">
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Edit Role') }}
          </h3>
          <BaseButtonClose @click="isEditOpen = false" />
        </div>
      </template>
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-start">
          <p
            class="font-alt text-muted-500 dark:text-muted-400 text-sm leading-5 mb-3"
          >
            {{ $t('Please update the role information') }}.
          </p>
          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="name"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="text"
              label="Role Name"
              placeholder="Enter role name"
              :classes="{ input: 'h-12', wrapper: 'max-w-xs' }"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </div>
      </div>
      <template #footer>
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isEditOpen = false">{{
              $t('Cancel')
            }}</BaseButton>
            <BaseButton
              color="primary"
              flavor="solid"
              @click="update"
              :disabled="isSubmitting"
              :loading="isSubmitting"
            >
              {{ $t('Update') }}
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>
    <TairoModal :open="isDeleteOpen" size="sm" @close="isDeleteOpen = false">
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Delete') }} {{ selected.length > 0 ? 'Roles' : 'Role' }}
          </h3>
          <BaseButtonClose @click="isDeleteOpen = false" />
        </div>
      </template>
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-center">
          <p
            class="font-alt text-muted-500 dark:text-muted-400 text-sm leading-5 mb-3"
          >
            {{ $t('Do you really want to delete this') }}
            {{ selected.length > 0 ? 'these roles' : 'this role' }}?
            {{ $t('This process cannot be undone') }}.
          </p>
        </div>
      </div>
      <template #footer>
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isDeleteOpen = false">{{
              $t('Cancel')
            }}</BaseButton>
            <BaseButton
              color="danger"
              flavor="solid"
              @click="selected.length > 0 ? deleteItems() : deleteItem()"
              :disabled="isSubmitting"
              :loading="isSubmitting"
            >
              {{ $t('Delete') }}
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>
  </div>
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import type { Role, User } from '~~/types'
import { useForm, Field } from 'vee-validate'
import { z } from 'zod'

definePageMeta({
  permissions: ['Access Users Management'],
  title: 'Users Management',
})

// Composables
const { getUsers, updateUser, deleteUser, deleteUsers, updateUsersStatus } =
  useUsers()
const { getRoles } = useRoles()
const { toast } = useUtils()

// Fetch Users and Roles
onMounted(async () => {
  await fetchUsers()

  const response = await getRoles()
  roles.value = response.data.result

  loading.value = false
})

// User Store
const userStore = useUserStore()
const user = userStore.getProfile as User

// Constants
const activeUser = ref<User | null>(null)
const users = ref<User[]>([])
const roles = ref<Role[]>([])

const router = useRouter()
const route = useRoute()
const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))
const totalItems = ref(0)
const totalPages = ref(0)
const loading = ref(false)

// Function to fetch tokens with query parameters
async function fetchUsers() {
  loading.value = true
  const response = await getUsers({
    filter: filter.value,
    perPage: perPage.value,
    page: page.value,
  })
  if (response.status === 'success') {
    // Update this line to match the actual structure of your response
    users.value = response.data.result.data
    totalItems.value = response.data.result.pagination.totalItems
    totalPages.value = response.data.result.pagination.totalPages
  }
  loading.value = false
}

// Watch for changes in the query parameters and refetch the tokens
watch([filter, perPage, page], fetchUsers)

// Update the router's query parameters whenever filter, perPage, or page changes
watch([filter, perPage, page], () => {
  router.push({
    query: {
      ...route.query,
      filter: filter.value,
      perPage: perPage.value.toString(),
      page: page.value.toString(),
    },
  })
})

// Modals Constants
const isEditOpen = ref(false)
const isDeleteOpen = ref(false)
const isUpdateStatusOpen = ref(false)
const updateStatusAction = ref('')

// Selection
const selected = ref<number[]>([])
const isAllVisibleSelected = computed(() => {
  return selected.value.length === users.value.length
})

function toggleAllVisibleSelection() {
  if (isAllVisibleSelected.value) {
    selected.value = []
  } else {
    selected.value = users.value.map((item) => item.id) ?? []
  }
}

// Validation
const zodSchema = z.object({
  first_name: z.string().nonempty('First Name is required'),
  last_name: z.string().nonempty('Last Name is required'),
  email: z.string().email('Invalid email').nonempty('Email is required'),
  role_id: z.string().nonempty('Role is required'),
})
type FormInput = z.infer<typeof zodSchema>

const initialValues = computed<FormInput>(() => ({
  first_name: '',
  last_name: '',
  email: '',
  role_id: '',
}))

const { handleSubmit, isSubmitting, meta, resetForm, setFieldValue } = useForm({
  validationSchema: toTypedSchema(zodSchema),
  initialValues,
})

const currentAvatar = computed(
  () => activeUser.value?.avatar ?? '/img/avatars/10.svg',
)
const inputFile = ref<FileList | null>(null)

// Edit User
const openEditModal = (user: User) => {
  activeUser.value = user
  setFieldValue('first_name', user.first_name)
  setFieldValue('last_name', user.last_name)
  setFieldValue('email', user.email)
  setFieldValue('role_id', `${user.role_id}`)
  isEditOpen.value = true
}

const update = handleSubmit(async (values) => {
  if (!activeUser.value?.uuid) {
    toast.dangerText('User not selected')
    return
  }
  try {
    const response = await updateUser(
      activeUser.value.uuid,
      values.first_name,
      values.last_name,
      values.email,
      values.role_id,
    )
    toast.response(response)

    if (response.status === 'success') {
      await fetchUsers()
      isEditOpen.value = false
      resetForm()
    }
  } catch (error) {
    toast.danger(error as any)
  }
})

const closeEditModal = () => {
  isEditOpen.value = false
  resetForm()
}

// Delete User
const openDeleteModal = (user: User) => {
  activeUser.value = user
  isDeleteOpen.value = true
}

const openDeleteModalBulk = (user: User) => {
  isDeleteOpen.value = true
}
const openUpdateStatus = (action: string) => {
  updateStatusAction.value = action
  isUpdateStatusOpen.value = true
}

const confirmDelete = async () => {
  try {
    const response = await deleteUser(activeUser.value?.uuid as string)
    toast.response(response)
    if (response.status === 'success') {
      await fetchUsers()
    }
    isDeleteOpen.value = false
  } catch (error) {
    toast.danger(error as any)
  }
}

const confirmDeleteBulk = async () => {
  try {
    const ids = selected.value.map((id) => id)

    const response = await deleteUsers(ids as number[])
    users.value = users.value.filter((user) => !ids.includes(user.id as number))
    selected.value = []
    toast.response(response)
  } catch (error) {
    toast.danger(error as any)
  }
  isDeleteOpen.value = false
}

const confirmUpdateStatus = async (status: string) => {
  try {
    const ids = selected.value.map((id) => id)

    const response = await updateUsersStatus(ids as number[], status)
    // update users status in users.valye
    users.value = users.value.map((user) => {
      if (ids.includes(user.id as number)) {
        user.status = status
      }
      return user
    })

    selected.value = []
    toast.response(response)
  } catch (error) {
    toast.danger(error as any)
  }
  isUpdateStatusOpen.value = false
}

onBeforeMount(() => {
  window.addEventListener('beforeunload', beforeUnloadListener)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', beforeUnloadListener)
})

onBeforeRouteLeave(() => {
  if (meta.value.dirty) {
    return confirm('You have unsaved changes. Are you sure you want to leave?')
  }
})

const beforeUnloadListener = (event: any) => {
  if (meta.value.dirty) {
    event.preventDefault()
    event.returnValue = ''
  }
}

const statusClass = (status: string) => {
  if (status === 'ACTIVE') {
    return 'success'
  } else if (status === 'BANNED') {
    return 'danger'
  } else {
    return 'muted'
  }
}

const actionClass = (action: string) => {
  if (action === 'ACTIVE') {
    return 'success'
  } else if (action === 'BANNED') {
    return 'warning'
  } else {
    return 'muted'
  }
}

const actionText = (action: string) => {
  if (action === 'ACTIVE') {
    return 'Activate'
  } else if (action === 'BANNED') {
    return 'Ban'
  } else {
    return 'Mute'
  }
}
const isValidFile = (file: any) => file instanceof File || file instanceof Blob
</script>

<template>
  <div>
    <TairoContentWrapper>
      <template #left>
        <BaseInput
          v-model="filter"
          icon="lucide:search"
          placeholder="Filter users..."
          :classes="{
            wrapper: 'w-full sm:w-auto',
          }"
          shape="curved"
        />
      </template>
      <template #right>
        <BaseSelect
          v-model="perPage"
          label=""
          :classes="{
            wrapper: 'w-full sm:w-40',
          }"
          shape="curved"
        >
          <option :value="10">10 {{ $t('per page') }}</option>
          <option :value="25">25 {{ $t('per page') }}</option>
          <option :value="50">50 {{ $t('per page') }}</option>
          <option :value="100">100 {{ $t('per page') }}</option>
        </BaseSelect>
      </template>
      <div>
        <template v-if="!loading && users?.length === 0">
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
          <div
            class="bg-info-100 text-info-700 dark:bg-info-700 dark:text-info-100 rounded-lg p-4 flex justify-between users-center w-full"
            v-if="!loading && selected.length > 0"
          >
            <span>
              {{ $t('You have selected') }} {{ selected.length }}
              {{ $t('users of the total') }} {{ users.length }}
              {{ $t('users') }}
            </span>
            <div class="flex gap-2">
              <TairoButtonIcon
                color="warning"
                shape="curved"
                @click="openUpdateStatus('BANNED')"
                data-nui-tooltip="Ban users"
              >
                <Icon name="line-md:cancel" class="h-5 w-5" />
              </TairoButtonIcon>
              <TairoButtonIcon
                color="success"
                shape="curved"
                @click="openUpdateStatus('ACTIVE')"
                data-nui-tooltip="Activate users"
              >
                <Icon name="line-md:confirm" class="h-5 w-5" />
              </TairoButtonIcon>
              <TairoButtonIcon
                color="danger"
                shape="curved"
                @click="openDeleteModalBulk(selected as any)"
                data-nui-tooltip="Delete users"
              >
                <Icon name="line-md:close-small" class="h-5 w-5" />
              </TairoButtonIcon>
            </div>
          </div>
          <TairoFlexTable class="md:pt-0 sm:pt-5 md:mt-0 sm:mt-5">
            <template #header>
              <div class="relative">
                <span class="pl-4">
                  <BaseCheckbox
                    :model-value="isAllVisibleSelected"
                    :indeterminate="
                      selected.length > 0 && !isAllVisibleSelected
                    "
                    name="table-1-main"
                    shape="rounded"
                    class="text-primary-500"
                    @click="toggleAllVisibleSelection"
                  />
                </span>
              </div>
            </template>

            <div class="space-y-3" v-if="loading">
              <BaseCard
                v-for="index in 10"
                :key="index"
                shape="curved"
                class="flex flex-col px-4 py-3 sm:flex-row sm:items-center"
              >
                <div
                  class="flex flex-col items-center justify-center gap-3 text-center sm:flex-row sm:justify-start sm:text-left"
                >
                  <BasePlaceload class="h-12 w-12 shrink-0 rounded-full" />
                  <div class="space-y-2">
                    <BasePlaceload
                      class="mx-auto h-3 w-[100px] rounded-lg sm:mx-0"
                    />
                    <BasePlaceload
                      class="mx-auto h-3 w-[75px] rounded-lg sm:mx-0"
                    />
                  </div>
                </div>
                <div
                  class="flex flex-col gap-4 pt-4 sm:ms-auto sm:flex-row sm:items-center sm:justify-end sm:pt-0"
                >
                  <div
                    class="ptablet:hidden divide-muted-200 dark:divide-muted-700 flex items-center justify-center divide-x"
                  >
                    <div class="flex flex-col gap-1 px-4 text-center">
                      <BasePlaceload class="h-3 w-16 rounded-lg" />
                    </div>
                    <div class="flex flex-col gap-1 px-4 text-center">
                      <BasePlaceload class="h-3 w-16 rounded-lg" />
                    </div>
                    <div class="flex flex-col gap-1 px-4 text-center">
                      <BasePlaceload class="h-3 w-16 rounded-lg" />
                    </div>
                  </div>
                  <div class="sm:ms-6">
                    <BasePlaceload
                      class="mx-auto h-8 w-40 rounded-lg sm:mx-0 sm:w-20"
                    />
                  </div>
                </div>
              </BaseCard>
            </div>

            <TableFlexTableRow
              v-else
              v-for="(item, index) in users"
              :key="item.id"
              spaced
            >
              <template #start>
                <TableFlexTableCell
                  data-content="Selection"
                  class="xs:absolute right-2 ml-2"
                >
                  <BaseCheckbox
                    v-model="selected"
                    :value="item.id"
                    :name="`item-checkbox-${item.id}`"
                    shape="rounded"
                    class="text-primary-500"
                  />
                </TableFlexTableCell>
                <TableFlexTableStart
                  label="User"
                  :hide-label="index > 0"
                  :title="`${item.first_name} ${item.last_name}`"
                  :logo="item.avatar"
                  :subtitle="item.uuid"
                />
              </template>
              <template #end>
                <TableFlexTableCell
                  label="Role"
                  :hide-label="index > 0"
                  class="w-full sm:w-40"
                >
                  {{ item?.role?.name }}
                </TableFlexTableCell>
                <TableFlexTableCell
                  label="Country"
                  :hide-label="index > 0"
                  class="w-full sm:w-20"
                >
                  {{ item?.metadata?.location?.country }}
                </TableFlexTableCell>
                <TableFlexTableCell
                  label="Status"
                  :hide-label="index > 0"
                  class="w-full sm:w-20"
                >
                  <BaseTag
                    v-if="item.status"
                    :color="statusClass(item.status)"
                    flavor="pastel"
                    shape="full"
                    condensed
                    class="font-medium"
                  >
                    {{ item.status }}
                  </BaseTag>
                  <BaseTag
                    v-else
                    color="danger"
                    flavor="pastel"
                    shape="full"
                    condensed
                    class="font-medium"
                  >
                    {{ $t('Banned') }}
                  </BaseTag>
                </TableFlexTableCell>

                <TableFlexTableCell label="action" :hide-label="index > 0">
                  <div class="flex gap-2">
                    <TairoButtonIcon
                      :disabled="
                        item.role_id ==
                          roles.find((role) => role.name == 'Super Admin')
                            ?.id && user?.id === item.id
                      "
                      :color="
                        item.role_id ==
                          roles.find((role) => role.name == 'Super Admin')
                            ?.id && user?.id === item.id
                          ? 'muted'
                          : 'warning'
                      "
                      @click="openEditModal(item)"
                      shape="curved"
                      data-nui-tooltip="Edit user"
                    >
                      <Icon name="line-md:edit" class="h-4 w-4" />
                    </TairoButtonIcon>
                    <TairoButtonIcon
                      :disabled="
                        item.role_id ==
                          roles.find((role) => role.name == 'Super Admin')
                            ?.id && user?.id === item.id
                      "
                      :color="
                        item.role_id ==
                          roles.find((role) => role.name == 'Super Admin')
                            ?.id && user?.id === item.id
                          ? 'muted'
                          : 'danger'
                      "
                      size="xs"
                      shape="curved"
                      @click="openDeleteModal(item)"
                      data-nui-tooltip="Delete user"
                    >
                      <Icon name="line-md:close-small" class="h-5 w-5" />
                    </TairoButtonIcon>
                  </div>
                </TableFlexTableCell>
              </template>
            </TableFlexTableRow>
          </TairoFlexTable>
        </div>
        <div class="mt-6">
          <BasePagination
            v-if="totalPages > 1"
            :current-page="page"
            :total-items="totalItems"
            :itemPerPage="perPage"
            :total-pages="totalPages"
            @page-changed="
              (newPage) =>
                router.push({
                  query: { ...route.query, page: newPage.toString() },
                })
            "
          />
        </div>
      </div>
    </TairoContentWrapper>

    <TairoModal :open="isEditOpen" size="2xl" @close="closeEditModal">
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Edit User') }}
          </h3>
          <BaseButtonClose @click="isEditOpen = false" />
        </div>
      </template>
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-start">
          <div class="grid gap-5 sm:grid-cols-1 md:grid-cols-2">
            <div>
              <p
                class="font-alt text-muted-500 dark:text-muted-400 text-sm leading-5"
              >
                {{ $t('Please update the user information') }}.
              </p>
            </div>

            <!-- Avatar File Upload -->
            <BaseInputFileHeadless
              accept="image/*"
              type="file"
              v-model="inputFile"
              v-slot="{ open, remove, preview, files }"
              name="image"
            >
              <div class="relative h-20 w-20">
                <img
                  v-if="files?.length && isValidFile(files[0])"
                  :src="preview(files.item(0)!).value"
                  alt="Upload preview"
                  class="bg-muted-200 dark:bg-muted-700/60 h-20 w-20 rounded-full object-cover object-center"
                />
                <img
                  v-else
                  :src="currentAvatar"
                  alt="Upload preview"
                  class="bg-muted-200 dark:bg-muted-700/60 h-20 w-20 rounded-full object-cover object-center dark:invert"
                />
                <div
                  v-if="files?.length && isValidFile(files[0])"
                  class="absolute bottom-0 end-0 z-20"
                >
                  <BaseButtonIcon
                    condensed
                    shape="full"
                    @click="remove(files.item(0)!)"
                    data-nui-tooltip="Remove image"
                    class="scale-90"
                  >
                    <Icon name="lucide:x" class="h-4 w-4" />
                  </BaseButtonIcon>
                </div>
                <div v-else class="absolute bottom-0 end-0 z-20">
                  <div class="relative" data-nui-tooltip="Upload image">
                    <BaseButtonIcon condensed shape="full" @click="open">
                      <Icon name="lucide:plus" class="h-4 w-4" />
                    </BaseButtonIcon>
                  </div>
                </div>
              </div>
            </BaseInputFileHeadless>
            <!-- Name Field -->
            <Field
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
              name="first_name"
            >
              <BaseInput
                v-model="field.value"
                :error="errorMessage"
                :disabled="isSubmitting"
                type="text"
                label="User First Name"
                placeholder="Enter user first name"
                shape="curved"
                :classes="{ input: 'h-12', wrapper: 'max-w-xs' }"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
            </Field>
            <Field
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
              name="last_name"
            >
              <BaseInput
                v-model="field.value"
                :error="errorMessage"
                :disabled="isSubmitting"
                type="text"
                label="User Last Name"
                placeholder="Enter user last name"
                shape="curved"
                :classes="{ input: 'h-12', wrapper: 'max-w-xs' }"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
            </Field>

            <!-- Email Field -->
            <Field
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
              name="email"
            >
              <BaseInput
                v-model="field.value"
                :error="errorMessage"
                :disabled="isSubmitting"
                type="email"
                label="Email"
                placeholder="Enter email"
                shape="curved"
                :classes="{ input: 'h-12', wrapper: 'max-w-xs' }"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
            </Field>

            <!-- Role Select Field -->
            <Field
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
              name="role_id"
            >
              <BaseSelect
                v-model="field.value"
                :error="errorMessage"
                :disabled="isSubmitting"
                label="Role"
                shape="curved"
                :classes="{ input: 'h-12', wrapper: 'max-w-xs' }"
                @update:model-value="handleChange"
                @blur="handleBlur"
                placeholder="Select role"
              >
                <option
                  v-for="(item, index) in roles"
                  :key="index"
                  :value="`${item.id}`"
                  :selected="item.id === field.value"
                >
                  {{ item.name }}
                </option>
              </BaseSelect>
            </Field>
          </div>
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
            {{ $t('Delete') }} {{ selected.length > 0 ? 'Users' : 'User' }}
          </h3>
          <BaseButtonClose @click="isDeleteOpen = false" />
        </div>
      </template>
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-center">
          <h3
            class="font-heading text-muted-800 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Are you sure') }}?
          </h3>
          <p
            class="font-alt text-muted-500 dark:text-muted-400 text-sm leading-5 mb-3"
          >
            {{ $t('Do you really want to delete') }}
            {{ selected.length > 0 ? 'these users' : 'this user' }}?
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
              @click="
                selected.length > 0 ? confirmDeleteBulk() : confirmDelete()
              "
              :disabled="isSubmitting"
              :loading="isSubmitting"
            >
              {{ $t('Delete') }}
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>
    <TairoModal
      :open="isUpdateStatusOpen"
      size="sm"
      @close="isUpdateStatusOpen = false"
    >
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ updateStatusAction }}
            {{ selected.length > 0 ? 'Users' : 'User' }}
          </h3>
          <BaseButtonClose @click="isUpdateStatusOpen = false" />
        </div>
      </template>
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-center">
          <h3
            class="font-heading text-muted-800 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Are you sure') }}?
          </h3>
          <p
            class="font-alt text-muted-500 dark:text-muted-400 text-sm leading-5 mb-3"
          >
            {{ $t('Do you really want to') }}
            {{ actionText(updateStatusAction) }}
            {{ selected.length > 0 ? 'these users' : 'this user' }}?
            {{ $t('This process cannot be undone') }}.
          </p>
        </div>
      </div>
      <template #footer>
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isUpdateStatusOpen = false">{{
              $t('Cancel')
            }}</BaseButton>
            <BaseButton
              :color="actionClass(updateStatusAction)"
              flavor="solid"
              @click="confirmUpdateStatus(updateStatusAction)"
              :disabled="isSubmitting"
              :loading="isSubmitting"
            >
              {{ actionText(updateStatusAction) }}
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>
  </div>
</template>

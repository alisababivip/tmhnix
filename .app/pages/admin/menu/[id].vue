<script setup lang="ts">
import navigationData from '~~/data/navigation.json'
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'

definePageMeta({
  permissions: ['Edit Menu'],
  title: 'Menu Management',
})

const route = useRoute()
const { id } = route.params as number
const navigation = ref([...navigationData])
const parentMenu = ref(navigationData[id] || {})
const childNavigation = ref([...(parentMenu.value.children || [])])
const isModalOpen = ref(false)
const roles = ref([])
const permissions = ref([])
const loading = ref(false)

const { toast } = useUtils()

const { getRoles } = useRoles()
const { getPermissions } = usePermissions()
const { updateNavigation } = useSystem()

async function setRoles() {
  const response = await getRoles()
  roles.value = response.data.result
}

async function setPermissions() {
  const response = await getPermissions()
  permissions.value = [
    {
      name: 'None',
    },
    ...response.data.result,
  ]
}

const router = useRouter()
onMounted(async () => {
  if (!parentMenu.value) {
    toast.dangerText('Invalid menu ID')
    router.push('/admin/menu')
  }
  loading.value = true
  await setRoles()
  await setPermissions()
  loading.value = false
})

const zodSchema = z.object({
  name: z.string().nonempty('Name is required'),
  permission: z.string().nullable().optional(),
})

type FormInput = z.infer<typeof zodSchema>

const initialValues = computed<FormInput>(() => ({
  name: '',
  permission: '',
}))

const { handleSubmit, isSubmitting, values, setFieldValue } = useForm({
  validationSchema: toTypedSchema(zodSchema),
  initialValues,
})

const selectedIndex = ref(null)

const openEditModel = (item: any, index: any) => {
  selectedIndex.value = index
  setFieldValue('name', item.name)
  setFieldValue('permission', item.permission)
  isModalOpen.value = true
}

const edit = handleSubmit(async (values: any) => {
  if (selectedIndex.value === null) {
    toast.dangerText('Please select a menu item')
    isModalOpen.value = false
    return
  }

  childNavigation.value[selectedIndex.value].name = values.name
  childNavigation.value[selectedIndex.value].permission =
    values.permission === 'None' ? null : values.permission

  // Update parent menu in the original navigationData
  navigationData[id].children = childNavigation.value

  try {
    const response = await updateNavigation(navigationData) // Send the entire updated navigationData
    toast.response(response)
    isModalOpen.value = false
  } catch (err) {
    toast.danger(err as any)
  }
})

const changeOrder = async (item: any, index: any, direction: any) => {
  if (direction === 'up') {
    ;[childNavigation.value[index], childNavigation.value[index - 1]] = [
      childNavigation.value[index - 1],
      childNavigation.value[index],
    ]
  } else {
    ;[childNavigation.value[index], childNavigation.value[index + 1]] = [
      childNavigation.value[index + 1],
      childNavigation.value[index],
    ]
  }

  // Update parent menu in the original navigationData
  navigationData[id].children = childNavigation.value

  try {
    const response = await updateNavigation(navigationData)
    toast.response(response)
  } catch (error) {
    toast.danger(error as any)
  }
}
</script>

<template>
  <div class="pb-10">
    <TairoContentWrapper>
      <template #left>
        <BaseHeading>
          {{ $t('Editing') }}
          {{ parentMenu?.name }} {{ $t('Menu') }}
        </BaseHeading>
      </template>
      <template #right>
        <BaseButton color="muted" to="/admin/menu">
          <Icon name="line-md:arrow-small-left" class="w-5 h-5 mr-2" />
          {{ $t('Back') }}
        </BaseButton>
      </template>
      <div>
        <template v-if="!loading && navigation?.length === 0">
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
                v-for="(item, index) in childNavigation"
                :key="index"
                spaced
              >
                <template #start>
                  <TableFlexTableStart
                    label="Language"
                    :hide-label="index > 0"
                    :title="item.name ?? '---------------'"
                    :subtitle="item.to"
                  />
                </template>
                <template #end>
                  <TableFlexTableCell
                    label="Permission"
                    :hide-label="index > 0"
                    class="w-64 xs:w-full"
                  >
                    {{ item.permission }}
                  </TableFlexTableCell>
                  <TableFlexTableCell
                    label="Actions"
                    :hide-label="index > 0"
                    class="w-64 xs:justify-end xs:w-full"
                  >
                    <div class="flex gap-2">
                      <!-- <TairoButtonIcon
                        @click="changeOrder(item, index, 'up')"
                        color="success"
                        data-nui-tooltip="Move up"
                        v-if="index > 0"
                      >
                        <Icon name="line-md:arrow-up" class="h-4 w-4" />
                      </TairoButtonIcon>
                      <TairoButtonIcon
                        @click="changeOrder(item, index, 'down')"
                        color="danger"
                        data-nui-tooltip="Move down"
                        v-if="index < childNavigation.length - 1"
                      >
                        <Icon name="line-md:arrow-down" class="h-4 w-4" />
                      </TairoButtonIcon> -->
                      <TairoButtonIcon
                        @click="openEditModel(item, index)"
                        color="warning"
                        data-nui-tooltip="Edit"
                      >
                        <Icon name="line-md:edit" class="h-4 w-4" />
                      </TairoButtonIcon>
                    </div>
                  </TableFlexTableCell>
                </template>
              </TableFlexTableRow>
            </TransitionGroup>
          </TairoFlexTable>
        </div>
      </div>
    </TairoContentWrapper>
    <TairoModal :open="isModalOpen" size="sm" @close="isModalOpen = false">
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Edit Menu Item') }}
          </h3>
        </div>
      </template>

      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-start space-y-2">
          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="name"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="text"
              label="Menu Item Name"
              placeholder="Enter menu item name"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="permission"
          >
            <BaseListbox
              v-model="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              label="Permission"
              :items="permissions.map((item) => item.name)"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </div>
      </div>

      <template #footer>
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isModalOpen = false">{{
              $t('Cancel')
            }}</BaseButton>
            <BaseButton
              color="primary"
              flavor="solid"
              @click="edit"
              :disabled="isSubmitting"
              :loading="isSubmitting"
            >
              {{ $t('Save') }}
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>
  </div>
</template>

<script setup lang="ts">
import { useForm, Field } from 'vee-validate'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { useAdminMailWizardCampaignsStore } from '~~/store/extensions/mailwizard/admin/campaigns'
import { useAdminMailWizardTemplatesStore } from '~~/store/extensions/mailwizard/admin/templates'

definePageMeta({
  title: 'Edit Mailwizard Campaign',
  permissions: ['Edit Mailwizard Campaign'],
})

const adminTemplatesStore = useAdminMailWizardTemplatesStore()
const adminCampaignsStore = useAdminMailWizardCampaignsStore()
const { fetchUsers } = useUsers()
const { toast } = useUtils()
const router = useRouter()
const { updateCampaign, getCampaign } = useMailwizard()
const users = ref([])
const campaign = ref(null)
const route = useRoute()
const { id } = route.params

onMounted(async () => {
  const campaignResponse = await getCampaign(id)
  if (campaignResponse.status === 'success') {
    campaign.value = campaignResponse.data.result
  }
  if (adminTemplatesStore.templates.length === 0) {
    await adminTemplatesStore.fetchTemplates()
  }
  const response = await fetchUsers()
  if (response.status === 'success') {
    users.value = response.data.result.map((user) => ({
      label: user.first_name + ' ' + user.last_name,
      text: user.email,
      value: {
        ...user,
        status: 'PENDING',
      },
    }))
  }
  if (campaign.value?.targets) {
    selectedTargets.value = campaign.value.targets
      .map((target) => {
        return users.value.find((user) => user.value.id === target.id)
      })
      .filter((target) => target !== undefined)
  }
  resetForm()
})

const templates = computed(() => adminTemplatesStore.templates)

const zodSchema = z.object({
  name: z.string().nonempty('Name is required'),
  subject: z.string().nonempty('Subject is required'),
  template: z.object({
    label: z.string(),
    value: z.number().positive('Template is required'),
  }),
  speed: z
    .number()
    .positive('Speed is required')
    .min(1, 'Speed must be at least 1')
    .max(100, 'Speed must be at most 100'),
})

type FormInput = z.infer<typeof zodSchema>

const initialValues = computed(() => {
  return {
    ...campaign.value,
    template: {
      label: templates.value?.find(
        (template) => template.id === campaign.value?.template_id,
      )?.name,
      value: campaign.value?.template_id,
    },
    targets: campaign.value?.targets.map((target) => ({
      label: target.first_name + ' ' + target.last_name,
      text: target.email,
      value: target,
    })),
  }
})

const { handleSubmit, isSubmitting, values, resetForm } = useForm({
  validationSchema: toTypedSchema(zodSchema),
  initialValues,
})

// Update Method
const update = handleSubmit(async (values: FormInput) => {
  if (!selectedTargets.value.length || selectedTargets.value.length === 0) {
    toast.danger('Please select at least one target')
    return
  }

  try {
    const response = await updateCampaign(
      campaign.value.id,
      values.name,
      values.subject,
      values.speed,
      values.template.value,
      selectedTargets.value.map((target) => target.value),
    )
    toast.response(response)
    if (response.status === 'success') {
      await adminCampaignsStore.fetchCampaigns()
      router.push('/admin/extensions/mailwizard/campaigns')
    }
  } catch (error) {
    toast.danger(error as any)
  }
})

const selectedTargets = ref([])
type MultipleLabelData =
  | string
  | ((value: any[], labelProperty?: string | undefined) => string)
  | undefined

const multipleLabel = ref<MultipleLabelData>(
  (value: any[], labelProperty?: string): string => {
    if (value.length === 0) {
      return 'No targets selected'
    } else if (value.length > 1) {
      return `${value.length} targets selected`
    }
    return labelProperty ? String(value[0][labelProperty]) : String(value[0])
  },
)

const selectAllTargets = () => {
  selectedTargets.value = users.value
}

const clearSelection = () => {
  selectedTargets.value = []
}
</script>

<template>
  <TairoContentWrapper>
    <template #left>
      <BaseHeading size="lg"
        >{{ $t('Edit Campaign') }}: {{ campaign?.name }}</BaseHeading
      >
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
      <BaseButton
        type="submit"
        color="primary"
        :disabled="isSubmitting"
        class="w-full"
        @click="update"
      >
        {{ $t('Update') }}
      </BaseButton>
    </template>
    <form @submit.prevent="update" class="space-y-8">
      <BaseCard class="p-5 space-y-5">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <!-- Category -->
          <Field
            name="template"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseListbox
              :model-value="field.value"
              :error="errorMessage"
              :items="
                templates?.map((category) => ({
                  label: category.name,
                  value: category.id,
                }))
              "
              :properties="{ label: 'label', value: 'value' }"
              placeholder="Select a template"
              label="Template"
              shape="rounded"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <!-- Name -->
          <Field
            name="name"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              label="Name"
              placeholder="Enter campaign name"
              shape="rounded"
              class="w-full"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <!-- Subject -->
          <Field
            name="subject"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              label="Subject"
              placeholder="Enter campaign subject"
              shape="rounded"
              class="w-full"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <!-- Speed -->
          <Field
            name="speed"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              type="number"
              label="Speed"
              placeholder="Enter campaign speed"
              shape="rounded"
              class="w-full"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <BaseListbox
            v-model="selectedTargets"
            :multiple-label="multipleLabel"
            label="Targets"
            :items="users"
            shape="rounded"
            :properties="{ label: 'label', value: 'value', sublabel: 'text' }"
            multiple
            :disabled="users?.length === 0"
            :loading="!users"
          />
          <div class="flex justify-between mt-6 w-full gap-5">
            <BaseButton
              @click="selectAllTargets"
              shape="curved"
              color="primary"
              class="w-full"
              >{{ $t('Select All') }}</BaseButton
            >
            <BaseButton
              @click="clearSelection"
              shape="curved"
              color="danger"
              class="w-full"
              >{{ $t('Clear Selection') }}</BaseButton
            >
          </div>
        </div>
      </BaseCard>

      <BaseCard
        class="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border-t-2 p-5 border-gray-200 dark:border-gray-700"
        v-if="selectedTargets && selectedTargets.length > 0"
      >
        <BaseTag
          v-for="item in selectedTargets"
          :key="item.value.id"
          shape="rounded"
          color="default"
          shadow="hover"
        >
          {{ item.value.first_name }} {{ item.value.last_name }}
        </BaseTag></BaseCard
      >

      <TairoFormSave>
        <BaseButton
          type="submit"
          color="primary"
          :disabled="isSubmitting"
          class="w-full"
        >
          {{ $t('Update Campaign') }}
        </BaseButton>
      </TairoFormSave>
    </form>
  </TairoContentWrapper>
</template>

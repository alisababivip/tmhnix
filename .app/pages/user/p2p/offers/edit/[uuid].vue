<script setup lang="ts">
import { useForm, Field } from 'vee-validate'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'

import { useUserP2POffersStore } from '~~/store/extensions/p2p/user/offers'
import type { P2POffer } from '~~/types'
definePageMeta({
  title: 'Edit P2P Offer',
})
const { toast } = useUtils()
const router = useRouter()
const route = useRoute()
const { uuid } = route.params

const p2pOfferStore = useUserP2POffersStore()
const { editP2POffer, getUserP2POffer } = useP2P()

const offer = ref<P2POffer | null>(null)

onMounted(async () => {
  const response = (await getUserP2POffer(uuid)) as any
  offer.value = response.data.result
  resetForm()
})

// Validation
const zodSchema = z.object({
  min_amount: z.number().positive('Minimum amount must be positive'),
  max_amount: z.number().positive('Maximum amount must be positive'),
})

type FormInput = z.infer<typeof zodSchema>

const initialValues = computed<FormInput>(() => {
  return {
    ...offer.value,
  }
})

const { handleSubmit, isSubmitting, resetForm, values, setFieldValue } =
  useForm({
    validationSchema: toTypedSchema(zodSchema),
    initialValues,
  })

// Create Method
const update = handleSubmit(async (values: FormInput) => {
  if (values.min_amount > values.max_amount) {
    toast.dangerText(
      'Minimum trade amount cannot be greater than maximum trade amount',
    )
    return
  }
  try {
    const response = await editP2POffer(
      uuid,
      values.min_amount,
      values.max_amount,
    )
    toast.response(response)
    if (response.status === 'success') {
      await p2pOfferStore.fetchP2POffers()
      await p2pOfferStore.fetchUserP2POffers()
      router.push('/user/p2p/offers')
    }
  } catch (error) {
    toast.danger(error as any)
  }
})
</script>

<template>
  <TairoContentWrapper>
    <template #left
      ><BaseHeading size="lg">{{
        $t(`
        Editing Offer: #${uuid}
      `)
      }}</BaseHeading>
    </template>
    <template #right>
      <BaseButton
        type="button"
        color="muted"
        class="hover:bg-gray-300 dark:hover:bg-gray-800"
        to="/user/p2p/offers"
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
    <form @submit="create" class="space-y-8">
      <BaseCard class="p-5">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <!-- Min Amount -->
          <div>
            <Field
              name="min_amount"
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
            >
              <BaseInput
                v-model="field.value"
                :error="errorMessage"
                label="Minimum Amount"
                shape="rounded"
                placeholder="Enter minimum amount"
                type="number"
                min="0"
                step="0.00000001"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
              <small>
                <span class="text-xs text-warning-500">
                  Enter the minimum amount you want to sell
                </span>
              </small>
            </Field>
          </div>

          <!-- Max Amount -->
          <div>
            <Field
              name="max_amount"
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
            >
              <BaseInput
                v-model="field.value"
                :error="errorMessage"
                label="Maximum Amount"
                shape="rounded"
                placeholder="Enter maximum amount"
                type="number"
                min="0"
                step="0.00000001"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
              <small>
                <span class="text-xs text-warning-500">
                  Enter the maximum amount you want to sell
                </span>
              </small>
            </Field>
          </div>
        </div>
      </BaseCard>

      <TairoFormSave>
        <BaseButton
          type="submit"
          color="primary"
          :disabled="isSubmitting"
          class="w-full"
        >
          {{ $t('Update Offer') }}
        </BaseButton>
      </TairoFormSave>
    </form>
  </TairoContentWrapper>
</template>

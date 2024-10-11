<script setup lang="ts">
import { useForm, Field } from 'vee-validate'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { useUserP2POffersStore } from '~~/store/extensions/p2p/user/offers'
import type { P2POffer } from '~~/types'

definePageMeta({
  title: 'P2P Offers',
})

const p2pOfferStore = useUserP2POffersStore()
const { getP2POffer, createUserP2PTrade } = useP2P()
const route = useRoute()
const router = useRouter()
const { uuid } = route.params
const userStore = useUserStore()
const user = computed(() => userStore.getProfile)

const offer = ref<P2POffer | null>(null)

onMounted(async () => {
  await fetchProduct()
})

const fetchProduct = async () => {
  const response = (await getP2POffer(uuid)) as any
  offer.value = response.data.result
}

const { toast } = useUtils()

// Validation
const zodSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
})

type FormInput = z.infer<typeof zodSchema>

const initialValues = computed<FormInput>(() => ({
  amount: 0,
}))

const { handleSubmit, isSubmitting, resetForm, values, setFieldValue } =
  useForm({
    validationSchema: toTypedSchema(zodSchema),
    initialValues,
  })

// Create Method
const purchase = handleSubmit(async (values: FormInput) => {
  try {
    const response = await createUserP2PTrade(offer.value!.uuid, values.amount)
    toast.response(response)
    if (response.status === 'success') {
      await p2pOfferStore.fetchP2POffers()
      await p2pOfferStore.fetchUserP2POffers()
      router.push(`/user/p2p/trades/${response.data.result.uuid}`)
    }
  } catch (error) {
    toast.danger(error as any)
  }
})

// Computed property for completion rate
const completionRate = computed(() => {
  const totalTrades = offer.value?.trades.length || 0
  const completedTrades =
    offer.value?.trades.filter((trade) => trade.status === 'COMPLETED')
      .length || 0
  return totalTrades > 0 ? (completedTrades / totalTrades) * 100 : 0
})

// Computed property for average completion duration
const averageCompletionDuration = computed(() => {
  const completedTrades =
    offer.value?.trades.filter((trade) => trade.status === 'COMPLETED') || []
  const totalDuration = completedTrades.reduce((total, trade) => {
    const duration =
      new Date(trade.updated_at).getTime() -
      new Date(trade.created_at).getTime()
    return total + duration
  }, 0)
  return completedTrades.length > 0 ? totalDuration / completedTrades.length : 0
})

// Convert duration from milliseconds to a more readable format (e.g., hours, minutes)
const formatDuration = (milliseconds) => {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  if (hours > 0) {
    return `${hours} hours ${minutes % 60} minutes`
  }
  return `${minutes} minutes`
}

const avgRating = computed(() => {
  const reviews = offer.value?.reviews || []
  const total = reviews.reduce((acc, review) => acc + review.rating, 0)
  return reviews.length ? total / reviews.length : 0
})

function starType(index: number): 'full' | 'half' | 'empty' {
  const ratingFloor = Math.floor(avgRating.value)
  if (index <= ratingFloor) {
    return 'full'
  } else if (index === ratingFloor + 1 && avgRating.value % 1 >= 0.5) {
    return 'half'
  } else {
    return 'empty'
  }
}
</script>

<template>
  <div>
    <TairoContentWrapper>
      <template #left>
        <h3 class="text-lg font-bold">Offer #{{ offer?.uuid }}</h3>
      </template>
      <template #right>
        <BaseButton
          type="button"
          color="muted"
          class="hover:bg-gray-300 dark:hover:bg-gray-800"
          to="/user/p2p"
        >
          <Icon name="line-md:chevron-left" class="h-4 w-4 mr-2" />
          {{ $t('Back') }}
        </BaseButton>
      </template>
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1 space-y-5">
          <!-- Seller Info -->
          <BaseCard class="">
            <div class="flex items-center justify-start p-5 gap-5">
              <img
                :src="offer?.user?.avatar || '/img/placeholder.png'"
                alt="Avatar"
                class="w-20 h-20 rounded-full"
              />
              <span
                >{{ offer?.user.first_name }} {{ offer?.user.last_name }}</span
              >
            </div>
            <hr class="border-gray-300 dark:border-gray-700" />
            <div class="flex items-start justify-between p-5 flex-col">
              <p>
                <strong>Completion Rate:</strong>
                {{ completionRate.toFixed(2) }}%
              </p>
              <p>
                <strong>Average Completion Duration:</strong>
                {{ formatDuration(averageCompletionDuration) }}
              </p>
            </div>
          </BaseCard>
          <!-- Offer Info -->
          <BaseCard class="">
            <h3 class="text-lg font-semibold p-5">Offer Details</h3>
            <div class="grid gap-3 grid-cols-2 p-5">
              <p>
                <strong>Offer Currency: </strong>
                <BaseTag
                  data-nui-tooltip="You will receive the amount in this currency"
                  >{{ offer?.currency }}</BaseTag
                >
              </p>
              <p>
                <strong>Purchase Currency: </strong>
                <BaseTag
                  data-nui-tooltip="You will pay the amount in this currency"
                  >{{ offer?.payment_method?.currency }}</BaseTag
                >
              </p>
              <p>
                <strong>Available:</strong> {{ offer?.amount }}
                {{ offer?.currency }}
              </p>
              <p>
                <strong>Price:</strong> {{ offer?.price }}
                {{ offer?.payment_method?.currency }}
              </p>
              <p>
                <strong>Minimum Amount:</strong> {{ offer?.min_amount }}
                {{ offer?.currency }}
              </p>
              <p>
                <strong>Maximum Amount:</strong>
                {{ offer?.max_amount || offer?.amount }}
                {{ offer?.currency }}
              </p>
              <div class="flex gap-2">
                <strong>Rating:</strong>
                <span class="flex items-end">
                  <span v-for="i in 5" :key="i">
                    <Icon
                      v-if="starType(i) === 'full'"
                      name="uim:star"
                      class="w-4 h-4 text-yellow-400"
                    />
                    <Icon
                      v-else-if="starType(i) === 'half'"
                      name="uim:star-half-alt"
                      class="w-4 h-4 text-yellow-400"
                    />
                    <Icon
                      v-else
                      name="uim:star"
                      class="w-4 h-4 text-gray-300"
                    />
                  </span>
                  <span class="ml-2 text-sm text-gray-500 dark:text-gray-400">{{
                    avgRating.toFixed(1)
                  }}</span>
                </span>
              </div>
            </div>
          </BaseCard>
        </div>

        <!-- Purchase Card (2/5) -->
        <div class="w-full md:w-2/5 space-y-5 flex flex-col justify-between">
          <BaseCard class="p-5 space-y-3">
            <Field
              name="amount"
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
            >
              <BaseInput
                v-model="field.value"
                :error="errorMessage"
                label="Amount"
                shape="rounded"
                placeholder="Enter amount"
                type="number"
                :min="offer?.min_amount"
                :max="offer?.max_amount || offer?.amount"
                step="0.00000001"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
            </Field>
            <div>
              <p class="text-red-500 text-sm">
                Warning: Multiple cancelled trades without fulfilling them may
                result in a ban.

                <br />

                <br />

                <strong
                  >Do not cancel a trade unless you have a valid reason.</strong
                >
              </p>
            </div>
            <BaseButton
              color="primary"
              class="w-full"
              @click="purchase"
              :disabled="
                isSubmitting ||
                offer?.user_id === user?.id ||
                (offer?.max_amount && offer?.max_amount === 0) ||
                offer?.min_amount > values.amount ||
                (offer?.max_amount && offer?.max_amount < values.amount) ||
                offer?.amount < values.amount
              "
              v-if="offer?.user_id !== user?.id"
            >
              Purchase
            </BaseButton>
            <BaseButton
              color="primary"
              class="w-full"
              @click="purchase"
              v-else
              disabled
            >
              You cannot purchase your own offer
            </BaseButton>
          </BaseCard>
        </div>
      </div>
    </TairoContentWrapper>
  </div>
</template>

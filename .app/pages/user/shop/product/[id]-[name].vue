<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'
const { getUserProduct, applyDiscount, createOrder } = useEcommerce()
const { fetchWallet } = useWallet()
const route = useRoute()
const { id, name } = route.params
const product = ref({})
const wallet = ref({})

onMounted(async () => {
  await fetchProduct()
})

const fetchProduct = async () => {
  const response = await getUserProduct(id)
  product.value = response.data.result
  const walletResponse = await fetchWallet(
    product.value?.currency,
    product.value?.wallet_type,
  )
  wallet.value = walletResponse.data.result
}

const avgRating = computed(() => {
  const reviews = product.value.reviews || []
  const total = reviews.reduce((acc, review) => acc + review.rating, 0)
  return reviews.length ? total / reviews.length : 0
})

const zodSchema = z.object({
  code: z.string().min(1, 'The code field is required.'),
})

type FormInput = z.infer<typeof zodSchema>

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => ({
  code: '',
}))

const { handleSubmit, isSubmitting, resetForm } = useForm({
  validationSchema,
  initialValues,
})

const { toast, formatedPrice } = useUtils()

const isCartOpen = ref(false)
const closeModal = () => {
  isCartOpen.value = false
  resetForm()
}
const discount = ref(null)
const discountErrorMessage = ref(null)
const onSubmit = handleSubmit(async (values) => {
  try {
    const response = await applyDiscount(id, values.code)
    if (response.status === 'success') {
      discount.value = response.data.result
    } else {
      discountErrorMessage.value = response.error.message
    }
  } catch (error) {
    discountErrorMessage.value = error.message
    toast.danger(error)
  }
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

const router = useRouter()
const pay = async () => {
  try {
    const response = await createOrder(product.value?.id, discount.value?.id)
    toast.response(response)
    if (response.status === 'success') {
      await fetchProduct()
      router.push(`/user/shop/orders`)
    }
  } catch (error) {
    toast.danger(error)
  }
  isCartOpen.value = false
}
</script>

<template>
  <TairoContentWrapper>
    <template #left> </template>
    <template #right>
      <BaseButton
        type="button"
        color="muted"
        class="hover:bg-gray-300 dark:hover:bg-gray-800"
        :to="'/user/shop'"
      >
        <Icon name="line-md:chevron-left" class="h-4 w-4 mr-2" />
        {{ $t('Back') }}
      </BaseButton>
    </template>
    <div class="px-5">
      <div
        class="grid max-w-screen-xl py-8 mx-auto lg:gap-8 xl:gap-0 lg:py-16 lg:grid-cols-12 px-5"
      >
        <div class="mr-auto place-self-center lg:col-span-6">
          <h1
            class="max-w-2xl mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl xl:text-6xl dark:text-white"
          >
            {{ product.name }}
          </h1>
          <p
            class="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl dark:text-gray-400"
          >
            {{ product.description }}
          </p>
          <div class="mb-5 flex items-end">
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
              <Icon v-else name="uim:star" class="w-4 h-4 text-gray-300" />
            </span>
            <span class="ml-2 text-sm text-gray-500 dark:text-gray-400">{{
              avgRating.toFixed(1)
            }}</span>
          </div>
          <div
            class="divide-muted-200 dark:divide-muted-700 flex items-center justify-center divide-x"
          >
            <div class="flex flex-col gap-1 pr-4">
              <BaseButton
                class="text-base font-medium"
                color="primary"
                @click="isCartOpen = true"
                :disabled="product.inventory_quantity === 0"
              >
                <Icon name="solar:cart-bold-duotone" class="w-5 h-5 mr-2" />
                {{
                  product.inventory_quantity === 0
                    ? $t('Out of stock')
                    : $t('Add to cart')
                }}
              </BaseButton>
            </div>
            <div class="flex flex-col gap-1 pl-4 text-center font-bold text-xl">
              <span v-if="product.wallet_type !== 'FIAT'">
                {{ product.price }} {{ product.currency }}
              </span>
              <span v-else>
                {{ formatedPrice(product.price, product.currency) }}
              </span>
            </div>
          </div>
        </div>
        <div class="lg:mt-0 lg:col-span-6 rounded-2xl max-w-xl mt-5 md:mt-0">
          <img
            :src="product.image ?? '/img/banner/store.svg'"
            :alt="product.name"
            class="rounded-2xl transform hover:scale-110 transition duration-500 ease-in-out"
          />
        </div>
      </div>

      <div class="grid grid-col-1 gap-5 md:grid-cols-4">
        <BaseCard class="p-2 mb-2 col-span-1 md:col-span-3">
          <BaseTabs
            model-value="description"
            :tabs="[
              {
                label: 'Description',
                value: 'description',
                icon: 'fluent:text-description-16-regular',
              },
              {
                label: 'Reviews ' + `(${product.reviews?.length})`,
                value: 'reviews',
                icon: 'carbon:review',
              },
            ]"
          >
            <template #tab="{ activeValue }">
              <div v-if="activeValue === 'description'" class="px-5">
                <p
                  class="font-sans text-sm text-gray-500 dark:text-gray-400"
                  v-html="product.description"
                ></p>
              </div>
              <p
                v-else-if="activeValue === 'reviews'"
                class="font-sans text-sm text-gray-500 dark:text-gray-400"
              >
                <ShopProductReview
                  :product="product"
                  :fetch-product="fetchProduct"
                  v-if="product.id"
                />
              </p>
            </template>
          </BaseTabs>
        </BaseCard>
        <div>
          <BaseCard>
            <div class="font-bold p-2">Details</div>
            <div class="divide-y divide-muted-200 dark:divide-muted-700">
              <div class="text-xs flex justify-between p-2">
                <span class="font-bold">Category</span>
                <span>{{ product.category?.name }}</span>
              </div>
              <div class="text-xs flex justify-between p-2">
                <span class="font-bold">Type</span>
                <span>{{ product.type?.toLowerCase() }}</span>
              </div>
              <div class="text-xs flex justify-between p-2">
                <span class="font-bold">Inventory</span>
                <span>{{ product.inventory_quantity }}</span>
              </div>
              <div class="text-xs flex justify-between p-2">
                <span class="font-bold">Created at</span>
                <span>{{ formatDate(product.created_at) }}</span>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>

      <TairoModal :open="isCartOpen" size="lg" @close="closeModal">
        <template #header>
          <div class="flex w-full items-center justify-between p-4 md:p-6">
            <h3
              class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
            >
              {{ $t('Cart') }}
            </h3>
            <BaseButtonClose @click="isCartOpen = false" />
          </div>
        </template>
        <div class="px-4 md:px-6 space-y-5">
          <div
            class="flex items-start gap-2 w-full"
            v-if="!discount || discount.length === 0"
          >
            <div class="w-full">
              <Field
                v-slot="{ field, errorMessage, handleChange, handleBlur }"
                name="code"
              >
                <BaseInput
                  v-model="field.value"
                  :error="errorMessage"
                  :placeholder="$t('Discount code')"
                  :label="$t('Discount code')"
                  :disabled="isSubmitting"
                  @input="handleChange"
                  @blur="handleBlur"
                />
                <small v-if="discountErrorMessage"
                  ><span class="text-xs text-danger-500">{{
                    discountErrorMessage
                  }}</span></small
                >
              </Field>
            </div>
            <span>
              <BaseButton
                class="mt-6"
                color="warning"
                flavor="solid"
                @click="onSubmit"
                :disabled="isSubmitting"
                :loading="isSubmitting"
              >
                {{ $t('Apply') }}
              </BaseButton></span
            >
          </div>
          <div v-else>
            <div class="flex justify-between items-center">
              <span class="text-success-500 dark:text-success-400"
                >{{ $t('Discount code') }} ({{ discount?.code }}) applied
                successfully
              </span>
            </div>
          </div>
          <div class="space-y-1">
            <span class="flex justify-between items-center text-sm">
              <span class="text-muted-800 dark:text-muted-200">{{
                $t('Balance')
              }}</span>
              <span
                class="text-muted-800 dark:text-muted-200 items-center flex gap-1"
              >
                {{ wallet?.balance ?? 0 }} {{ product?.currency
                }}<NuxtLink
                  :to="`/user/wallets/${product?.wallet_type?.toLowerCase()}/${product?.currency?.toLowerCase()}`"
                  data-nui-tooltip="Wallets"
                >
                  <Icon name="ei:plus" class="h-5 w-5 text-success-500" />
                </NuxtLink>
              </span>
            </span>
            <!-- price -->
            <span class="flex justify-between items-center text-sm">
              <span class="text-muted-800 dark:text-muted-200">{{
                $t('Price')
              }}</span>
              <span
                class="text-muted-800 dark:text-muted-200 items-center flex gap-1"
              >
                {{ product?.price ?? 0 }} {{ product?.currency }}
              </span>
            </span>
            <!-- discount -->
            <span class="flex justify-between items-center text-sm">
              <span class="text-muted-800 dark:text-muted-200">{{
                $t('Discount')
              }}</span>
              <span
                class="text-muted-800 dark:text-muted-200 items-center flex gap-1"
              >
                {{ discount?.percentage ?? 0 }}%
              </span>
            </span>
            <hr class="border-gray-200 dark:border-gray-700" />
            <!-- total -->
            <span class="flex justify-between items-center text-sm">
              <span class="text-muted-800 dark:text-muted-200">{{
                $t('Total to pay')
              }}</span>
              <span
                class="text-muted-800 dark:text-muted-200 items-center flex gap-1"
              >
                {{
                  product?.price -
                  (product?.price * (discount?.percentage ?? 0)) / 100
                }}
                {{ product?.currency }}
              </span>
            </span>
          </div>
        </div>
        <template #footer>
          <div class="p-4 md:p-6">
            <div class="flex gap-x-2">
              <BaseButton @click="isCartOpen = false">{{
                $t('Cancel')
              }}</BaseButton>
              <BaseButton
                color="primary"
                flavor="solid"
                @click="pay"
                :disabled="isSubmitting"
                :loading="isSubmitting"
              >
                {{ $t('Pay') }}
              </BaseButton>
            </div>
          </div>
        </template>
      </TairoModal>
    </div>
  </TairoContentWrapper>
</template>

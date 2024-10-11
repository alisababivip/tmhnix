<script setup lang="ts">
// Define the props that the component will receive
const props = defineProps({
  item: Object,
  user: Object,
  categoryName: String,
})
</script>

<template>
  <NuxtLink :to="`/blog/${item.slug}`">
    <BaseCard
      shape="curved"
      class="group p-3 transition duration-300 ease-in-out transform hover:-translate-y-1"
    >
      <div class="relative">
        <img
          loading="lazy"
          sizes="sm:1024px"
          :src="
            item?.image || '/img/illustrations/dashboards/writer/post-1.svg'
          "
          class="h-60 w-full rounded-lg object-cover"
        />
        <BaseTag
          shape="full"
          color="primary"
          flavor="pastel"
          condensed
          class="absolute start-3 top-3 translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
        >
          {{ categoryName }}
        </BaseTag>
      </div>
      <div>
        <div class="mb-6 mt-3">
          <BaseHeading
            tag="h3"
            size="md"
            weight="medium"
            lead="snug"
            class="line-clamp-2 text-gray-800 dark:text-gray-100"
          >
            {{ item.title }}
          </BaseHeading>
        </div>
        <div class="mt-auto flex items-center gap-2">
          <BaseAvatar
            :src="item.author?.user?.avatar"
            :text="item.author?.user?.first_name"
            size="xs"
            class="bg-muted-500/20 text-muted-500"
          />
          <div class="leading-none">
            <h4
              class="text-muted-800 dark:text-muted-100 font-sans text-sm font-medium leading-tight"
            >
              {{ item.author?.user?.first_name }}
            </h4>
            <p class="text-muted-400 font-sans text-xs">
              {{ new Date(item.created_at).toISOString().split('T')[0] }}
            </p>
          </div>
          <div class="ms-auto" v-if="user?.id === item.author?.user?.id">
            <BaseButtonAction
              :to="`/blog/author/post?type=edit&slug=${item.slug}`"
              shape="rounded"
            >
              <Icon name="lucide:edit-3" />
              <span>{{ $t('Edit') }}</span>
            </BaseButtonAction>
          </div>
        </div>
      </div>
    </BaseCard>
  </NuxtLink>
</template>

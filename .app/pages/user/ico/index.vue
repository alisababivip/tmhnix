<script setup lang="ts">
import { useIcoProjectStore } from '~~/store/extensions/ico/user/projects'
import type { User } from '~~/types'
definePageMeta({
  title: 'Ico',
})
const userStore = useUserStore()
const user = computed(() => userStore.getProfile as User)
const icoProjectStore = useIcoProjectStore()
const projects = computed(() => icoProjectStore.projects)
onMounted(async () => {
  if (icoProjectStore.projects.length == 0) {
    await icoProjectStore.fetchIcoProjects()
  }
})
</script>

<template>
  <div class="relative">
    <div
      class="bg-primary-800 flex flex-col items-center rounded-2xl p-4 sm:flex-row w-full mb-10"
    >
      <div
        class="relative w-[320px]"
        :class="{
          'h-[170px]': $viewport.isLessThan('sm'),
          'h-[175px]': $viewport.isGreaterOrEquals('sm'),
        }"
      >
        <LottieWithdraw
          classes="pointer-events-none absolute -top-6 start-3 sm:-start-5 sm:-top-8"
          height="280px"
        />
      </div>
      <div class="mt-20 grow sm:mt-0">
        <div
          class="pb-4 text-center sm:pb-0 sm:text-left max-w-xs md:max-w-md lg:max-w-2xl"
        >
          <BaseHeading tag="h1" class="mb-2 text-white opacity-90">
            <span>
              {{ $t('Check out our top trending ico projects') }}
              <span class="text-3xl">📈</span>
            </span>
          </BaseHeading>
          <BaseParagraph size="sm" class="text-white opacity-70">
            <span>
              {{
                $t(
                  'We have a wide range of ico projects that you can invest in.',
                )
              }}
            </span>
          </BaseParagraph>
        </div>
      </div>
    </div>
    <div class="relative pt-2">
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-12">
        <div
          v-if="projects.length > 0"
          v-for="project in projects.slice(0, 1)"
          :key="project.id"
          class="col-span-1 sm:col-span-4 md:col-span-6"
        >
          <NuxtLink :to="`/user/ico/${project.uuid}`">
            <div class="flex h-full flex-col">
              <div
                class="bg-muted-200 dark:bg-muted-800 group relative h-full w-full overflow-hidden rounded-2xl"
              >
                <img
                  :src="project.image"
                  :alt="project.name"
                  class="h-full w-full object-cover object-center"
                />
                <div
                  class="absolute inset-x-0 bottom-0 z-10 h-3/5 w-full bg-gradient-to-t from-black transition-all duration-500 ease-in-out group-hover:h-full"
                ></div>
                <div
                  class="absolute inset-0 z-20 flex h-full w-full flex-col justify-between"
                >
                  <div></div>
                  <div class="ptablet:p-10 p-6">
                    <BaseHeading
                      as="h3"
                      size="3xl"
                      weight="bold"
                      lead="tight"
                      class="xs:text-xl hover:text-primary-300 mb-4 line-clamp-2 text-white transition-colors duration-300"
                    >
                      <span>{{ project.name }}</span>
                    </BaseHeading>
                    <div class="flex gap-3">
                      <div>
                        <BaseParagraph size="xs">
                          <span class="text-muted-400">{{
                            formatDate(project.created_at)
                          }}</span>
                        </BaseParagraph>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </NuxtLink>
        </div>
        <div
          class="col-span-1 sm:col-span-8 sm:grid sm:grid-cols-2 sm:gap-5 md:col-span-6"
        >
          <div
            v-for="(project, index) in projects.slice(1, 5)"
            :key="project.id"
          >
            <NuxtLink :to="`/user/ico/${project.uuid}`">
              <div class="group flex h-full flex-col">
                <div
                  class="bg-muted-200 dark:bg-muted-800 relative h-full w-full overflow-hidden rounded-2xl"
                >
                  <img
                    :src="project.image"
                    :alt="project.name"
                    class="h-full w-full object-cover object-center"
                  />
                  <div
                    class="absolute inset-x-0 bottom-0 z-10 h-3/5 w-full bg-gradient-to-t from-black transition-all duration-500 ease-in-out group-hover:h-full"
                  ></div>
                  <div
                    class="absolute inset-0 z-20 flex h-full w-full flex-col justify-between"
                  >
                    <div class="p-4"></div>
                    <div class="p-4">
                      <NuxtLink to="#">
                        <BaseHeading
                          as="h3"
                          size="md"
                          weight="medium"
                          lead="tight"
                          class="xs:text-xl ptablet:text-xl ptablet:font-bold xs:font-bold hover:text-primary-300 mb-4 line-clamp-2 text-white transition-colors duration-300"
                        >
                          <span>{{ project.name }}</span>
                        </BaseHeading>
                      </NuxtLink>
                      <div class="flex gap-3">
                        <div>
                          <BaseParagraph size="xs">
                            <span class="text-muted-400"
                              >{{ formatDate(project.created_at) }}
                            </span>
                          </BaseParagraph>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
      <div class="grid gap-6 grid-cols-1 sm:grid-cols-3 mt-6">
        <div
          v-for="project in projects.slice(5)"
          :key="project.id"
          class="col-span-1"
        >
          <NuxtLink :to="`/user/ico/${project.uuid}`">
            <div class="group flex h-full flex-col">
              <div
                class="bg-muted-200 dark:bg-muted-800 relative h-full w-full overflow-hidden rounded-2xl"
              >
                <img
                  :src="project.image"
                  :alt="project.name"
                  class="h-full w-full object-cover object-center"
                />
                <div
                  class="absolute inset-x-0 bottom-0 z-10 h-3/5 w-full bg-gradient-to-t from-black transition-all duration-500 ease-in-out group-hover:h-full"
                ></div>
                <div
                  class="absolute inset-0 z-20 flex h-full w-full flex-col justify-between"
                >
                  <div class="p-4"></div>
                  <div class="p-4">
                    <NuxtLink to="#">
                      <BaseHeading
                        as="h3"
                        size="md"
                        weight="medium"
                        lead="tight"
                        class="xs:text-xl ptablet:text-xl ptablet:font-bold xs:font-bold hover:text-primary-300 mb-4 line-clamp-2 text-white transition-colors duration-300"
                      >
                        <span>{{ project.name }}</span>
                      </BaseHeading>
                    </NuxtLink>
                    <div class="flex gap-3">
                      <div>
                        <BaseParagraph size="xs">
                          <span class="text-muted-400"
                            >{{ formatDate(project.created_at) }}
                          </span>
                        </BaseParagraph>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
    <Faqs category="ICO" />
  </div>
</template>

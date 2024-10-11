<script setup lang="ts">
import { useRoute } from 'vue-router'
import type { Permission, Role, RolePermission } from '~~/types'

definePageMeta({
  permissions: ['Edit Role Permissions'],
  title: 'Role Permissions',
})

const { activeRole, getRole, syncPermissions, selectRole } = useRoles()
const { getPermissions } = usePermissions()
const { toast } = useUtils()

const role = computed<Role | null>(() => activeRole.value)

const selectedPermissions = ref<Permission[]>([])
const route = useRoute()

const permissions = ref<Permission[]>([])

let initialSelectedPermissions: Permission[] = []

onMounted(async () => {
  if (permissions.value.length === 0) {
    await setPermissions()
  }
  if (!role.value) {
    const response = await getRole(Number(route.params.id))
    selectRole(response.data.result)
  }
  if (role.value?.rolepermission) {
    selectedPermissions.value = role.value?.rolepermission.map(
      (item: RolePermission) => item.permission,
    )

    // clone the initial selected permissions
    initialSelectedPermissions = [...selectedPermissions.value]
  }
})

async function setPermissions() {
  const response = await getPermissions()
  permissions.value = response.data.result
}

type MultipleLabelData =
  | string
  | ((value: any[], labelProperty?: string | undefined) => string)
  | undefined

const multipleLabel = ref<MultipleLabelData>(
  (value: any[], labelProperty?: string): string => {
    if (value.length === 0) {
      return 'No permissions selected'
    } else if (value.length > 1) {
      return `${value.length} permissions selected`
    }
    return labelProperty ? String(value[0][labelProperty]) : String(value[0])
  },
)

const submit = async () => {
  if (
    JSON.stringify(initialSelectedPermissions) ===
    JSON.stringify(selectedPermissions.value)
  ) {
    // permissions have not changed, do not submit
    toast.info('No changes detected.')
    return
  }
  try {
    const response = await syncPermissions(
      role.value?.id as number,
      selectedPermissions.value,
    )
    toast.response(response)

    selectRole(response.data.result)

    if (role.value?.rolepermission) {
      selectedPermissions.value = role.value?.rolepermission.map(
        (item: RolePermission) => item.permission,
      )
      // update the initial selected permissions
      initialSelectedPermissions = [...selectedPermissions.value]
    }
  } catch (error) {
    toast.danger(error as any)
  }
}

const selectAllPermissions = () => {
  selectedPermissions.value = permissions.value
}

const clearSelection = () => {
  selectedPermissions.value = []
}
</script>

<template>
  <TairoContentWrapper class="pb-10">
    <template #left>
      <BaseHeading
        v-if="role"
        as="h3"
        size="2xl"
        weight="bold"
        class="text-muted-800 dark:text-white"
      >
        {{ $t('Role') }}: {{ role.name }}
      </BaseHeading>
      <div v-else class="max-w-sm space-y-2">
        <BasePlaceload class="h-4 w-full rounded" />

        <BasePlaceload class="h-4 w-[85%] rounded" /></div
    ></template>
    <template #right>
      <BaseButton color="primary" @click="() => $router.push('/admin/roles')">
        <Icon name="line-md:arrow-small-left" class="w-5 h-5 mr-2" />
        {{ $t('Back') }}
      </BaseButton>
    </template>
    <div class="space-y-5">
      <div class="grid md:grid-cols-2 gap-5 items-center">
        <div class="grid gap-6">
          <BaseListbox
            shape="curved"
            v-model="selectedPermissions"
            :multiple-label="multipleLabel"
            label="Permissions"
            :items="permissions"
            :properties="{
              value: 'id',
              label: 'name',
            }"
            multiple
            :disabled="permissions?.length === 0"
            :loading="!role"
          />
        </div>
        <div class="flex justify-between mt-5">
          <div class="flex justify-start gap-2">
            <BaseButton
              @click="selectAllPermissions"
              shape="curved"
              color="primary"
              >{{ $t('Select All') }}</BaseButton
            >
            <BaseButton @click="clearSelection" shape="curved" color="danger">{{
              $t('Clear Selection')
            }}</BaseButton>
          </div>
          <BaseButton @click="submit" shape="curved" color="success">{{
            $t('Submit')
          }}</BaseButton>
        </div>
      </div>
      <div
        class="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border-t-2 pt-5 border-gray-200 dark:border-gray-700"
        v-if="role && role.rolepermission"
      >
        <BaseTag
          v-for="item in role.rolepermission"
          :key="item.permission.id"
          shape="rounded"
          color="default"
          shadow="hover"
        >
          {{ item.permission.name }}
        </BaseTag>
      </div>
    </div>
  </TairoContentWrapper>
</template>

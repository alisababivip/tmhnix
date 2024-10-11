<script setup lang="ts">
definePageMeta({
  title: 'MLM Settings',
  permissions: ['Access MLM Management'],
})
import * as d3 from 'd3'
import type { User } from '~~/types'

const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)
const mlmSystem = computed(() => {
  if (settings.value && settings.value.mlm_system) {
    return settings.value.mlm_system.toLowerCase()
  }
  return 'direct'
})

const extensionStore = useExtensionStore()
const extensions = computed(() => extensionStore.extensionsUser)

const { getReferralConditions } = useMlm()
const { toast } = useUtils()
const loading = ref(false)
const tree = ref([])
const conditions = ref([])
const networkContainer: Ref<HTMLDivElement | null> = ref(null)
const selectedUser: Ref<User | null> = ref(null)
const nodeWidth = 72
const nodeHeight = 72
const margin = { top: 40, right: 120, bottom: 20, left: 160 }
let svg: any, zoom: any
const isTransformed = ref(false)
const conditionsData = ref([])

// Usage example based on your code
onMounted(async () => {
  loading.value = true

  try {
    const response = await getReferralConditions()
    if (response.status === 'success') {
      conditionsData.value = response.data.result.filter((c) => c.status)
      conditions.value = conditionsData.value.filter((condition) => {
        switch (condition.name) {
          case 'STAKING_LOYALTY':
            return extensions.value['staking']
          case 'FOREX_INVESTMENT':
            return extensions.value['forex']
          case 'AI_INVESTMENT':
            return extensions.value['ai_trading']
          case 'P2P_TRADE':
            return extensions.value['p2p']
          case 'ECOMMERCE_PURCHASE':
            return extensions.value['ecommerce']
          case 'ICO_CONTRIBUTION':
            return extensions.value['ico']
          default:
            return true
        }
      })
    } else {
      toast.danger(response.message)
    }

    // Check if MLM settings exist, if not, create a default for 'direct'
    if (!settings.value || !settings.value.mlm_settings) {
      // Assuming default settings for 'direct' system
      tree.value = generateSampleTree(2)
    } else {
      // Generate tree based on existing settings
      tree.value = generateSampleTree(
        mlmSystem.value === 'direct'
          ? 2
          : settings.value.mlm_settings[mlmSystem.value].levels,
      )
    }

    if (networkContainer.value) {
      createBinaryTree(networkContainer.value, tree.value)
    }

    loading.value = false
  } catch (error) {
    toast.danger(error)
  }
})

function generateSampleTree(levels = 3, downlinesPerLevel = 3) {
  let levelsPercentage: any
  if (
    mlmSystem.value !== 'direct' &&
    settings.value &&
    settings.value.mlm_settings &&
    settings.value.mlm_settings[mlmSystem.value]
  ) {
    levelsPercentage =
      settings.value.mlm_settings[mlmSystem.value].levels_percentage
  } else {
    levelsPercentage = [
      { level: 1, value: 100 },
      { level: 2, value: 0 },
    ]
  }

  // Update downlinesPerLevel for 'direct' type
  downlinesPerLevel = mlmSystem.value === 'binary' ? 2 : downlinesPerLevel

  function createDownlines(level, maxLevel, downlinesCount, parentUuid = '') {
    // Check if the current level is beyond the max level
    if (level > maxLevel) {
      return []
    }

    // Generate downlines for the current level
    return Array.from({ length: downlinesCount }, (_, i) => {
      const uuid = `${parentUuid}user${level}-${i}`
      const firstName = `User ${String.fromCharCode(64 + level)}${i}`

      const percentage =
        levelsPercentage.length > 0
          ? levelsPercentage.find((l) => l.level === level)?.value || 0
          : 0
      const rewards = conditions.value.reduce((acc, condition) => {
        acc[condition.title] = `${Number(
          (condition.reward * percentage) / 100,
        ).toFixed(2)}${
          condition.reward_type === 'PERCENTAGE'
            ? '%'
            : ' ' + condition.reward_currency
        }`
        return acc
      }, {})

      return {
        uuid,
        first_name: firstName,
        level: level,
        avatar: `/img/avatars/${i + 1 + level}.svg`,
        percentage,
        downlines: createDownlines(
          level + 1,
          maxLevel,
          mlmSystem.value === 'unilevel'
            ? Math.floor(Math.random() * 3) + 1
            : downlinesCount,
          `${uuid}-`,
        ),
        rewards,
      }
    })
  }

  let maxLevels

  switch (mlmSystem.value) {
    case 'binary':
      maxLevels = settings.value.mlm_settings?.binary?.levels || levels
      break
    case 'unilevel':
      maxLevels = settings.value.mlm_settings?.unilevel?.levels || levels
      break
    case 'direct':
    default:
      maxLevels = 2
      break
  }

  const percentage =
    levelsPercentage.length > 0
      ? levelsPercentage.find((l) => l.level === 1)?.value || 0
      : 0
  const rewards = conditions.value.reduce((acc, condition) => {
    acc[condition.title] = `${Number(
      (condition.reward * percentage) / 100,
    ).toFixed(2)}${
      condition.reward_type === 'PERCENTAGE'
        ? '%'
        : ' ' + condition.reward_currency
    }`
    return acc
  }, {})

  // Create the root node with level 1
  return {
    uuid: 'user1', // Change the user level to 1
    first_name: 'Root Referrer',
    level: 1, // Change the level to 1
    avatar: '/img/avatars/1.svg',
    percentage,
    downlines: createDownlines(2, maxLevels, downlinesPerLevel),
    rewards,
  }
}

async function updateTree() {
  loading.value = true
  try {
    // Use the current MLM system setting to generate the tree
    const updatedTree = generateSampleTree()
    tree.value = updatedTree

    // Clear the existing tree before creating a new one
    if (networkContainer.value) {
      d3.select(networkContainer.value).selectAll('svg').remove()
      createBinaryTree(
        networkContainer.value,
        tree.value,
        mlmSystem.value === 'direct'
          ? 1
          : settings.value.mlm_settings[mlmSystem.value].levels,
      )
    }

    loading.value = false
  } catch (error) {
    console.error('Error updating tree:', error)
  }
}

watch(
  () => settings.value.mlm_system,
  (newSystem, oldSystem) => {
    if (newSystem !== oldSystem) {
      updateTree()
    }
  },
)

// This watch effect tracks changes to the MLM settings specifically
watch(
  () => settings.value.mlm_settings,
  (newSettings, oldSettings) => {
    if (newSettings !== oldSettings) {
      const updatedTree = generateSampleTree(
        mlmSystem.value === 'direct'
          ? 1
          : settings.value.mlm_settings[mlmSystem.value].levels,
      )

      // Update the tree reactive property
      tree.value = updatedTree

      // Redraw the tree based on the new structure
      if (networkContainer.value) {
        d3.select(networkContainer.value).selectAll('svg').remove()
        createBinaryTree(networkContainer.value, tree.value)
      }
    }
  },
  { deep: true },
)

function createBinaryTree(
  container: HTMLDivElement,
  rootUser: any,
  levels = 3,
) {
  // Convert the plain rootUser object into a hierarchy
  const hierarchyRoot = d3.hierarchy(rootUser, (d) => d.downlines)

  // Calculate the width required based on the number of leaves (deepest nodes)
  const leaves = hierarchyRoot.leaves()
  const numLeaves = leaves.length
  const spacingBetweenLeaves = 40 // Adjust as needed
  const totalWidthNeeded = numLeaves * (nodeWidth + spacingBetweenLeaves)

  // Ensure the width is at least as wide as the container
  const dynamicWidth = Math.max(container.clientWidth, totalWidthNeeded)

  // Calculate the maximum depth of the tree for height adjustment
  const maxDepth = hierarchyRoot.height
  const verticalSpacing = 100 // Vertical spacing between levels, adjust as needed
  // Calculate total height needed including the top and bottom margins
  const totalHeightNeeded =
    (maxDepth + 1) * (nodeHeight + verticalSpacing) + margin.top + margin.bottom

  // Ensure the height is proportional to the depth of the tree
  const dynamicHeight = Math.max(container.clientHeight, totalHeightNeeded)

  // Set the dimensions and margins of the diagram
  const width = dynamicWidth - margin.left - margin.right
  const height = dynamicHeight - margin.top - margin.bottom

  // Clear any previous SVG to avoid duplication
  d3.select(container).selectAll('svg').remove()

  // Calculate the height based on the container's height
  const containerHeight = container.clientHeight

  // Clear any previous SVG to avoid duplication
  d3.select(container).selectAll('svg').remove()

  // Define the SVG container, setting its height to 100% of the container div
  svg = d3
    .select(container)
    .append('svg')
    .style('width', '100%') // Set SVG width to 100% of the container
    .style('height', '100%') // Set SVG height to 100% of the container
    .attr(
      'viewBox',
      `0 0 ${width + margin.left + margin.right} ${containerHeight}`,
    )
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  // Grid properties
  const gridSpacing = 50
  const gridLimit = 3000 * levels // Arbitrary large value for grid size
  const gridOrigin = gridLimit / 2 // Middle of the grid

  // Horizontal lines
  for (let y = -gridOrigin; y <= gridOrigin; y += gridSpacing) {
    svg
      .append('line')
      .attr('x1', -gridOrigin)
      .attr('y1', y)
      .attr('x2', gridOrigin)
      .attr('y2', y)
      .attr('stroke-width', 0.1)
      .attr('class', 'stroke-gray-600 dark:stroke-gray-400')
  }

  // Vertical lines
  for (let x = -gridOrigin; x <= gridOrigin; x += gridSpacing) {
    svg
      .append('line')
      .attr('x1', x)
      .attr('y1', -gridOrigin)
      .attr('x2', x)
      .attr('y2', gridOrigin)
      .attr('stroke-width', 0.1)
      .attr('class', 'stroke-gray-600 dark:stroke-gray-400')
  }

  const treeWidth = Math.max(width, dynamicWidth)

  // Define tree layout
  const treemap = d3.tree().size([treeWidth, height])

  // Convert the data to a hierarchy and assign parent, children, height, depth
  const nodes = d3.hierarchy(rootUser, (d) => d.downlines)

  // Calculate the new tree layout
  treemap(nodes)

  // Normalize for fixed-depth and update all nodes
  nodes.descendants().forEach((d) => {
    d.y = d.depth * (nodeHeight + verticalSpacing) // Adjust the y distance between levels
    d.x = d.x - dynamicWidth / 2 + width / 2 // Center the nodes horizontally
  })

  svg
    .selectAll('.link')
    .data(nodes.links())
    .enter()
    .append('path')
    .attr('class', 'link')
    .style('fill', 'none')
    .style('stroke', '#ccc')
    .style('stroke-width', '1px')
    .attr(
      'd',
      d3
        .linkVertical()
        .x((d) => d.x)
        .y((d) => d.y),
    )

  // Add each node as a group
  const node = svg
    .selectAll('.node')
    .data(nodes.descendants())
    .enter()
    .append('g')
    .attr('transform', (d) => `translate(${d.x},${d.y})`)
    .attr('class', 'node grayscale')

  // Add avatar images
  node
    .append('foreignObject')
    .attr('width', nodeWidth)
    .attr('height', nodeHeight)
    .attr('x', -nodeWidth / 2)
    .attr('y', -nodeHeight / 2)
    .append('xhtml:body')
    .style('margin', '0')
    .style('padding', '0')
    .style('background-color', 'none')
    .style('width', `${nodeWidth}px`)
    .style('height', `${nodeHeight}px`)
    .attr(
      'class',
      'transform hover:scale-110 transition-all duration-300 cursor-pointer',
    )
    .html(
      (d) => `<img src='${d.data.avatar || `/img/placeholder.png`}'
                alt='User Avatar'
                style='border-radius: 50%; width: 100%; height: 100%; object-fit: cover;'
                class='p-1'
                />`,
    )

  // Add event listeners for nodes
  node.on('click', (event, d) => selectUser(d.data))

  // Add zoom and pan functionality
  const minX = -gridOrigin + width / 2
  const minY = -gridOrigin + height / 2
  const maxX = gridOrigin - width / 2
  const maxY = gridOrigin - height / 2

  // Store the initial transform
  const initialTransform = d3.zoomIdentity.translate(margin.left, margin.top)

  // Define zoom behavior
  zoom = d3
    .zoom()
    .scaleExtent([0.7, 3])
    .on('zoom', (event) => {
      const transform = event.transform
      const tX = Math.max(
        Math.min(transform.x, maxX * transform.k),
        minX * transform.k,
      )
      const tY = Math.max(
        Math.min(transform.y, maxY * transform.k),
        minY * transform.k,
      )

      svg.attr('transform', `translate(${tX},${tY}) scale(${transform.k})`)
      isTransformed.value = !(
        transform.x === initialTransform.x &&
        transform.y === initialTransform.y &&
        transform.k === 1
      )
    })

  // Apply the zoom behavior to the SVG and set the initial zoom state
  d3.select(container)
    .select('svg')
    .call(zoom)
    .call(zoom.transform, initialTransform) // Set the initial zoom state
    .on('dblclick.zoom', null)
}

function selectUser(user: User): void {
  selectedUser.value = user

  // Reset styles for all nodes and links
  d3.selectAll('.node').classed('grayscale-0', false)
  d3.selectAll('.link').style('stroke', '#ccc')

  // Find the selected D3 node
  const selectedD3Node = d3
    .selectAll('.node')
    .filter((d) => d.data.uuid === user.uuid)

  if (!selectedD3Node.empty()) {
    // Highlight the selected node
    selectedD3Node.classed('grayscale-0', true)

    // Get all ancestors of the selected node
    const ancestors = selectedD3Node.datum().ancestors()

    // Highlight the links that are part of the path to the selected node
    d3.selectAll('.link')
      .style('stroke', (d) => {
        // Check if the link is part of the ancestors' path
        return ancestors.includes(d.target) ? '#EE4E34' : '#ccc'
      })
      .style('stroke-width', (d) =>
        ancestors.includes(d.target) ? '2px' : '1px',
      )

    d3.selectAll('.node')
      .filter((d) => ancestors.includes(d))
      .classed('grayscale-0', true)
  }
}

function resetView() {
  // Reset the zoom state
  d3.select(networkContainer.value)
    .select('svg')
    .call(zoom.transform, d3.zoomIdentity)

  // Transition the graph back to the original position and scale
  svg
    .transition()
    .duration(750)
    .attr('transform', `translate(${margin.left},${margin.top}) scale(1)`)

  // After reset, set isTransformed to false
  isTransformed.value = false
}

function deselectUser() {
  selectedUser.value = null

  // Reset styles for all nodes
  d3.selectAll('.node').classed('grayscale-0', false)

  // Reset styles for all links
  d3.selectAll('.link').style('stroke', '#ccc').style('stroke-width', '1px')
}
</script>

<template>
  <div class="overflow-hidden space-y-5">
    <BaseCard class="flex justify-center items-center relative" shape="curved">
      <BaseButtonIcon
        v-if="isTransformed"
        size="sm"
        @click="resetView"
        class="absolute top-3 right-3 z-50 shadow-md"
      >
        <Icon name="fluent:resize-small-20-regular" class="w-8 h-8" />
      </BaseButtonIcon>
      <BaseCard
        v-if="selectedUser"
        elevated
        color="white-contrast"
        class="p-5 w-auto absolute top-3 left-3 mr-5 z-50"
      >
        <Icon
          name="fluent:dismiss-24-regular"
          @click="deselectUser"
          class="absolute top-1 right-1 w-4 h-4 cursor-pointer text-gray-500 dark:text-gray-400 hover:text-danger-500 dark:hover:text-danger-500"
        />
        <div class="flex gap-5 items-center mb-5">
          <img
            :src="selectedUser.avatar || '/img/placeholder.png'"
            alt="User Avatar"
            class="rounded-full w-16 h-16"
          />
          <div>
            <h3 class="text-gray-700 dark:text-gray-300">
              {{ selectedUser.first_name }} {{ selectedUser.last_name }}
            </h3>
            <p class="text-gray-600 dark:text-gray-400">
              Level: {{ selectedUser.level }}
            </p>
          </div>
        </div>
        <div class="flex flex-col text-xs">
          <div class="flex justify-between gap-5">
            <span class="text-gray-700 dark:text-gray-300"
              >Level Percentage</span
            >
            <span class="text-gray-600 dark:text-gray-400">
              {{ selectedUser.percentage }}%
            </span>
          </div>
        </div>
        <hr class="my-2 border-gray-200 dark:border-gray-700" />
        <div
          class="flex flex-col text-xs"
          v-for="(reward, name) in selectedUser.rewards"
          :key="name"
        >
          <div class="flex justify-between gap-5">
            <span class="text-gray-700 dark:text-gray-300">{{ name }}</span>
            <span class="text-gray-600 dark:text-gray-400">
              {{ reward }}
            </span>
          </div>
        </div>
      </BaseCard>
      <div
        class="relative w-full overflow-hidden z-0 rounded-2xl h-[40vh]"
        ref="networkContainer"
      ></div>
    </BaseCard>
    <div class="grid gap-8 grid-cols-1 sm:grid-cols-12 pb-20">
      <div class="col-span-1 sm:col-span-3">
        <div class="max-w-[240px]">
          <ul class="space-y-1 font-sans text-sm">
            <li>
              <NuxtLink
                to="/admin/extensions/affiliate/settings"
                exact-active-class="!text-primary-500 !bg-primary-500/10"
                class="text-muted-400 hover:text-muted-600 dark:hover:text-muted-200 hover:bg-muted-50 dark:hover:bg-muted-700/50 flex items-center gap-2 rounded-lg p-3 transition-colors duration-300"
              >
                <Icon name="ph:gear-six-duotone" class="h-4 w-4" />
                <span>{{ $t('Affiliate System') }}</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                v-if="settings.mlm_system !== 'DIRECT'"
                to="/admin/extensions/affiliate/settings/levels"
                exact-active-class="!text-primary-500 !bg-primary-500/10"
                class="text-muted-400 hover:text-muted-600 dark:hover:text-muted-200 hover:bg-muted-50 dark:hover:bg-muted-700/50 flex items-center gap-2 rounded-lg p-3 transition-colors duration-300"
              >
                <Icon name="ph:users-three-duotone" class="h-4 w-4" />
                <span>{{ $t('Levels') }}</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/admin/extensions/affiliate/settings/conditions"
                exact-active-class="!text-primary-500 !bg-primary-500/10"
                class="text-muted-400 hover:text-muted-600 dark:hover:text-muted-200 hover:bg-muted-50 dark:hover:bg-muted-700/50 flex items-center gap-2 rounded-lg p-3 transition-colors duration-300"
              >
                <Icon name="material-symbols:rule-rounded" class="h-4 w-4" />
                <span>{{ $t('Conditions') }}</span>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
      <div class="col-span-1 sm:col-span-9">
        <RouterView v-slot="{ Component }">
          <Transition
            enter-active-class="transition-all duration-500 ease-out"
            enter-from-class="translate-y-20 opacity-0"
            enter-to-class="translate-y-0 opacity-100"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="translate-y-0 opacity-100"
            leave-to-class="translate-y-20 opacity-0"
          >
            <component :is="Component" />
          </Transition>
        </RouterView>
      </div>
    </div>
  </div>
</template>

<style scoped>
.link {
  fill: none;
  stroke: #ccc;
  stroke-width: 2px;
}
.networkContainer {
  overflow: visible; /* or auto if you want scrollbars */
  min-height: 100vh; /* Adjust the minimum height as needed */
}
</style>

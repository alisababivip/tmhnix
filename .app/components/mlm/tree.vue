<script setup lang="ts">
import * as d3 from 'd3'
import type { User } from '~~/types'

const props = defineProps({
  uuid: {
    type: String,
    required: false,
  },
  isAdmin: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const { getReferralTree, getNodeByUserId } = useMlm()

const loading = ref(false)
const tree = ref([])
const userStore = useUserStore()
const user = computed(() => userStore.getProfile)

onMounted(async () => {
  loading.value = true

  let response
  if (props.isAdmin) {
    response = await getNodeByUserId(props.uuid)
  } else {
    response = await getReferralTree()
  }

  if (
    response.status === 'success' &&
    response.data.result?.downlines?.length > 0
  ) {
    // Use the response data if it exists
    tree.value = response.data.result
  } else {
    console.log('No referral tree found. Creating a new one.')

    tree.value = {
      uuid: user.value?.uuid,
      first_name: user.value?.first_name,
      last_name: user.value?.last_name,
      avatar: user.value?.avatar,
      level: 0, // Root level
      rewardsCount: 0, // Assuming no rewards initially
      referredCount: 0, // Assuming no referrals initially
      downlines: [], // No downlines initially
    }
  }

  if (networkContainer.value) {
    createTree(networkContainer.value, tree.value)
  }

  loading.value = false
})

const networkContainer: Ref<HTMLDivElement | null> = ref(null)
const selectedUser: Ref<User | null> = ref(null)
const nodeWidth = 72
const nodeHeight = 72
const margin = { top: 40, right: 120, bottom: 20, left: 160 }
let svg: any, zoom: any
const isTransformed = ref(false)

function createTree(container: HTMLDivElement, rootUser: any) {
  // Define node size

  // Set the dimensions and margins of the diagram
  const width = container.clientWidth - margin.left - margin.right
  const height = container.clientHeight - margin.top - margin.bottom

  // Clear any previous SVG to avoid duplication
  d3.select(container).selectAll('svg').remove()

  // Use viewbox for responsiveness
  svg = d3
    .select(container)
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height + margin.top + margin.bottom}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  // Grid properties
  const gridSpacing = 50 // Spacing between grid lines
  const gridLimit = 5000 // Arbitrary large value for grid size
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

  // Declare a tree layout and assign the size
  const treemap = d3.tree().size([height, width])

  // Convert the data to a hierarchy and assign parent, children, height, depth
  const nodes = d3.hierarchy(rootUser, (d) => d.downlines)

  // Calculate the new tree layout
  treemap(nodes)

  // Normalize for fixed-depth and update all nodes
  nodes.descendants().forEach((d) => {
    d.y = d.depth * (nodeHeight + 40) // Increase y distance between levels
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
      (d) => `<img src='${
        d.data.avatar || `/img/avatars/${d.data.level + 1}.svg`
      }'
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

  selectUser(rootUser)
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

const router = useRouter()
const view = (uuid: string) => {
  router.push(`/admin/extensions/affiliate/nodes/${uuid}`)
}
</script>

<template>
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
          :src="
            selectedUser.avatar ?? `/img/avatars/${selectedUser.level + 1}.svg`
          "
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
      <div class="flex flex-col">
        <div class="flex justify-between gap-2">
          <span class="text-gray-700 dark:text-gray-300">Referred</span>
          <span class="text-gray-600 dark:text-gray-400">
            {{ selectedUser.referredCount }}
          </span>
        </div>
        <div class="flex justify-between gap-2">
          <span class="text-gray-700 dark:text-gray-300">Rewards</span>
          <span class="text-gray-600 dark:text-gray-400">
            {{ selectedUser.rewardsCount }}
          </span>
        </div>
        <BaseButton
          v-if="isAdmin && selectedUser.uuid !== uuid"
          @click="view(selectedUser.uuid)"
          color="primary"
          class="mt-5"
        >
          View Node
        </BaseButton>
      </div>
    </BaseCard>
    <div
      class="relative w-full overflow-hidden z-0 rounded-2xl h-[60vh]"
      ref="networkContainer"
    ></div>
  </BaseCard>
</template>

<style scoped>
.link {
  fill: none;
  stroke: #ccc;
  stroke-width: 2px;
}
</style>

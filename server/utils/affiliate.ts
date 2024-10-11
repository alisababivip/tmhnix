/* eslint-disable prettier-vue/prettier */
import { createLogger } from '~~/logger'
import prisma from './prisma'
const logger = createLogger('MLM Affiliate')

export async function getMlmSettings() {
  const settings = await prisma.settings.findMany({
    where: {
      key: {
        in: ['mlm_system', 'mlm_settings'],
      },
    },
  })

  return settings.reduce((acc, setting) => {
    acc[setting.key] = setting.value
    return acc
  }, {})
}

export async function processRewards(
  userId: string,
  amount: number,
  conditionName: string,
  currency: string,
  settingsObject: any = null,
) {
  if (!settingsObject) {
    settingsObject = await getMlmSettings()
  }

  if (!settingsObject['mlm_system']) {
    return
  }

  const mlmSystem = settingsObject['mlm_system']
  const mlmSettings = settingsObject['mlm_settings']
    ? JSON.parse(settingsObject['mlm_settings'])
    : null

  if (!mlmSettings) {
    logger.error('MLM settings not found')
    return // MLM settings not found
  }

  // Validate transaction type and currency
  if (!isValidTransaction(conditionName, amount, currency)) {
    return
  }

  const condition = await prisma.mlm_referral_condition.findFirst({
    where: { name: conditionName, status: true },
  })

  if (!condition) {
    return
  }

  switch (mlmSystem) {
    case 'DIRECT':
      await processDirectRewards(condition, userId, amount)
      break
    case 'BINARY':
      await processBinaryRewards(condition, userId, amount, mlmSettings)
      break
    case 'UNILEVEL':
      await processUnilevelRewards(condition, userId, amount, mlmSettings)
      break
    default:
      logger.error('Invalid MLM system type')
      break
  }
}

function isValidTransaction(conditionName, amount, currency) {
  switch (conditionName) {
    case 'WELCOME_BONUS':
      return currency === 'USDT' && amount >= 100
    case 'MONTHLY_TRADE_VOLUME':
      return currency === 'USDT' && amount > 1000
    case 'TRADE_COMMISSION':
    case 'INVESTMENT':
    case 'AI_INVESTMENT':
    case 'FOREX_INVESTMENT':
    case 'ICO_CONTRIBUTION':
    case 'STAKING_LOYALTY':
    case 'ECOMMERCE_PURCHASE':
    case 'P2P_TRADE':
      return true
    default:
      return false
  }
}

async function processDirectRewards(condition, referredUuid, amount) {
  // Find the referral record where the user is referred
  const referral = await prisma.mlm_referral.findFirst({
    where: { referredUuid },
  })

  if (!referral) {
    return
  }

  // Check if the user's referrer has already received this reward
  const hasReceivedReward =
    (await prisma.mlm_referral_reward.count({
      where: {
        referrerUuid: referral.referrerUuid,
        condition_id: condition.id,
      },
    })) > 0

  if (hasReceivedReward) {
    return
  }

  // Calculate the reward amount based on the condition's reward type and transaction amount
  let rewardAmount
  if (condition.reward_type === 'PERCENTAGE') {
    rewardAmount = amount * (condition.reward / 100)
  } else if (condition.reward_type === 'FIXED') {
    rewardAmount = condition.reward
  } else {
    return
  }

  // Grant the reward to the referrer
  await prisma.mlm_referral_reward.create({
    data: {
      referrerUuid: referral.referrerUuid,
      condition_id: condition.id,
      reward: rewardAmount,
    },
  })
}

// Helper function to find uplines
async function findUplines(userId, systemType, levels) {
  const uplines = []
  let currentUserId = userId

  for (let i = 0; i < levels; i++) {
    let referral
    if (systemType === 'BINARY') {
      referral = await prisma.mlm_binary_node.findFirst({
        where: { referral: { referredUuid: currentUserId } },
        include: { referral: { include: { referrer: true } } },
      })
    } else {
      referral = await prisma.mlm_unilevel_node.findFirst({
        where: { referral: { referredUuid: currentUserId } },
        include: { referral: { include: { referrer: true } } },
      })
    }

    if (!referral || !referral.referral.referrerUuid) break

    uplines.push({ level: i + 1, referrerUuid: referral.referral.referrerUuid })
    currentUserId = referral.referral.referrerUuid
  }

  return uplines
}

// Common function to create reward record
async function createRewardRecord(referrerUuid, rewardAmount, conditionId) {
  await prisma.mlm_referral_reward.create({
    data: {
      referrerUuid: referrerUuid,
      reward: rewardAmount,
      condition_id: conditionId,
    },
  })
}

// Binary Rewards Processing
async function processBinaryRewards(
  condition,
  userId,
  depositAmount,
  mlmSettings,
) {
  const binaryLevels = mlmSettings.binary.levels
  const uplines = await findUplines(userId, 'BINARY', binaryLevels)

  // Distribute rewards starting from the closest upline
  for (let i = uplines.length - 1; i >= 0; i--) {
    const upline = uplines[i]
    const levelIndex = binaryLevels - i // Reverse the index for percentage lookup
    const levelRewardPercentage = mlmSettings.binary.levels_percentage.find(
      (l) => l.level === levelIndex,
    )?.value

    if (levelRewardPercentage === undefined) {
      continue
    }

    const rewardAmount = depositAmount * (levelRewardPercentage / 100)
    await createRewardRecord(upline.referrerUuid, rewardAmount, condition.id)
  }
}

// Unilevel Rewards Processing
async function processUnilevelRewards(
  condition,
  userId,
  depositAmount,
  mlmSettings,
) {
  const unilevelLevels = mlmSettings.unilevel.levels
  const uplines = await findUplines(userId, 'UNILEVEL', unilevelLevels)

  // Distribute rewards starting from the closest upline
  for (let i = uplines.length - 1; i >= 0; i--) {
    const upline = uplines[i]
    const levelIndex = unilevelLevels - i // Reverse the index for percentage lookup
    const levelRewardPercentage = mlmSettings.unilevel.levels_percentage.find(
      (l) => l.level === levelIndex,
    )?.value

    if (levelRewardPercentage === undefined) {
      continue
    }

    const rewardAmount = depositAmount * (levelRewardPercentage / 100)
    await createRewardRecord(upline.referrerUuid, rewardAmount, condition.id)
  }
}

export const handleReferralRegister = async (refUuid, userUuid) => {
  const referrer = await prisma.user.findUnique({
    where: { uuid: refUuid },
  })

  if (referrer) {
    const referral = await prisma.mlm_referral.create({
      data: {
        referrerUuid: referrer.uuid,
        referredUuid: userUuid,
        status: 'PENDING',
      },
    })

    const mlmSystem = (
      await prisma.settings.findFirst({ where: { key: 'mlm_system' } })
    ).value

    if (mlmSystem === 'BINARY') {
      await handleBinaryMlmReferralRegister(referral.referrerUuid, referral.id)
    } else if (mlmSystem === 'UNILEVEL') {
      await handleUnilevelMlmReferralRegister(
        referral.referrerUuid,
        referral.id,
      )
    }
  }
}

const handleBinaryMlmReferralRegister = async (referrerUuid, referralId) => {
  // Logic to find the position in binary tree (left or right)
  // This logic can be more complex based on your binary tree balancing strategy
  const referrerNode = await prisma.mlm_binary_node.findFirst({
    where: { referral: { referredUuid: referrerUuid } },
  })

  const placement =
    referrerNode && referrerNode.left_child_id ? 'right' : 'left'

  // Create a new binary node for the new user
  await prisma.mlm_binary_node.create({
    data: {
      referral_id: referralId,
      [`${placement}_child_id`]: referrerNode ? referrerNode.id : null,
    },
  })
}

const handleUnilevelMlmReferralRegister = async (referrerUuid, referralId) => {
  // Create a unilevel node for the new user
  await prisma.mlm_unilevel_node.create({
    data: {
      referral_id: referralId,
      parent_id: referrerUuid,
    },
  })
}

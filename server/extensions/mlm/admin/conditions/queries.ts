import type {
  MlmReferralCondition,
  MlmReferralConditionRewardType,
} from '~~/types'
import prisma from '~~/utils/prisma'

// List all referral conditions
export async function listReferralConditions(): Promise<
  MlmReferralCondition[]
> {
  return prisma.mlm_referral_condition.findMany() as unknown as MlmReferralCondition[]
}

// Get a referral condition by ID
export async function getReferralConditionById(
  id: string,
): Promise<MlmReferralCondition | null> {
  return prisma.mlm_referral_condition.findUnique({
    where: {
      id: id,
    },
  }) as unknown as MlmReferralCondition
}

export async function updateReferralConditionStatus(
  id: string,
  status: boolean,
): Promise<MlmReferralCondition> {
  return prisma.mlm_referral_condition.update({
    where: {
      id: id,
    },
    data: {
      status,
    },
  }) as unknown as MlmReferralCondition
}

// Update a referral condition by ID
export async function updateReferralConditionById(
  id: string,
  title?: string,
  description?: string,
  reward?: number,
  reward_type?: MlmReferralConditionRewardType,
  reward_currency?: string,
): Promise<MlmReferralCondition> {
  return prisma.mlm_referral_condition.update({
    where: {
      id: id,
    },
    data: {
      title,
      description,
      reward,
      reward_type,
      reward_currency,
    },
  }) as unknown as MlmReferralCondition
}

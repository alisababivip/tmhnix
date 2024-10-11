import type { TwoFactor, TwoFactorType, User } from '~~/types'
import { createError } from '~~/utils'

import prisma from '~~/utils/prisma'

export async function saveOTPQuery(
  userId: number,
  secret: string,
  type: TwoFactorType,
): Promise<TwoFactor | Error> {
  let otpDetails = {}
  let saveOTPError = null

  if (!secret || !type)
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required parameters',
    })

  const existingTwoFactor = await prisma.twofactor.findUnique({
    where: { user_id: userId },
  })

  if (existingTwoFactor) {
    // If a 2FA record already exists for the user, update it
    await prisma.twofactor
      .update({
        where: { id: existingTwoFactor.id },
        data: {
          secret: secret,
          type: type, // This will update the type even if it's the same, but that's okay
          enabled: true,
        },
      })
      .then((response) => {
        otpDetails = response
      })
      .catch((e) => {
        console.error(e)
        saveOTPError = e
      })
  } else {
    // If no 2FA record exists for the user, create one
    await prisma.twofactor
      .create({
        data: {
          user_id: userId,
          secret: secret,
          type: type,
          enabled: true,
        },
      })
      .then((response) => {
        otpDetails = response
      })
      .catch((e) => {
        console.error(e)
        saveOTPError = e
      })
  }

  if (saveOTPError)
    throw createError({
      statusCode: 500,
      statusMessage: 'Server error',
    })

  // Create api result
  const newOTPDetails = otpDetails as TwoFactor
  return newOTPDetails
}

export async function savePhoneQuery(
  userId: number,
  phone: string,
): Promise<User> {
  return (await prisma.user.update({
    where: { id: userId },
    data: {
      phone: phone,
    },
  })) as unknown as User
}

export async function toggleOTPQuery(
  userId: number,
  status: boolean,
): Promise<TwoFactor> {
  return (await prisma.twofactor.update({
    where: { user_id: userId },
    data: {
      enabled: status,
    },
  })) as unknown as TwoFactor
}

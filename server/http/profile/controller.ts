import { authenticator } from 'otplib'
import QRCode from 'qrcode'
import { createError, handleController } from '~~/utils'
import { saveOTPQuery, savePhoneQuery, toggleOTPQuery } from './queries'

const APP_TWILIO_ACCOUNT_SID = process.env.APP_TWILIO_ACCOUNT_SID
const APP_TWILIO_AUTH_TOKEN = process.env.APP_TWILIO_AUTH_TOKEN
const APP_TWILIO_PHONE_NUMBER = process.env.APP_TWILIO_PHONE_NUMBER
const APP_PUBLIC_SITE_NAME = process.env.APP_PUBLIC_SITE_NAME

export const controllers = {
  generateOTPSecret: handleController(async (_, __, ___, ____, body, user) => {
    if (!user)
      throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
    const type = body.type
    const secret = authenticator.generateSecret()
    let otp, qrCode

    try {
      if (type === 'SMS') {
        const phoneNumber = body.phoneNumber
        try {
          await savePhoneQuery(user.id, phoneNumber)
        } catch (error) {
          throw createError({
            statusCode: 500,
            statusMessage: error.message,
          })
        }
        otp = authenticator.generate(secret)

        try {
          const twilio = require('twilio')
          const twilioClient = twilio(
            APP_TWILIO_ACCOUNT_SID,
            APP_TWILIO_AUTH_TOKEN,
          )
          await twilioClient.messages.create({
            body: `Your OTP is: ${otp}`,
            from: APP_TWILIO_PHONE_NUMBER,
            to: phoneNumber,
          })
        } catch (error) {
          throw createError({
            statusCode: 500,
            statusMessage: error.message,
          })
        }

        return {
          secret,
        }
      } else {
        const email = body?.email
        const otpAuth = authenticator.keyuri(
          email,
          APP_PUBLIC_SITE_NAME,
          secret,
        )
        qrCode = await QRCode.toDataURL(otpAuth)

        return { secret, qrCode }
      }
    } catch (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message,
      })
    }
  }),

  verifyOTP: handleController(async (_, __, ___, ____, body, user) => {
    if (!user)
      throw createError({ statusCode: 401, statusMessage: 'unauthorized' })

    // Verify
    const isValid = await authenticator.verify({
      token: body.otp,
      secret: body.secret,
    })

    if (!isValid) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid OTP',
      })
    }

    return await saveOTPQuery(user.id, body.secret, body.type)
  }),

  saveOTP: handleController(async (_, __, ___, ____, body, user) => {
    if (!user)
      throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
    return await saveOTPQuery(user.id, body.secret, body.type)
  }),
  toggleOtp: handleController(async (_, __, ___, ____, body, user) => {
    if (!user)
      throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
    return await toggleOTPQuery(user.id, body.status)
  }),
}

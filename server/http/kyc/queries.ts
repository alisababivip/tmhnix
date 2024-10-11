import type { Kyc, User } from '~~/types'
import { sendKycEmail } from '~~/utils/emails'
import prisma from '~~/utils/prisma'

export async function getKyc(userId: number): Promise<Kyc> {
  return (await prisma.kyc.findUnique({
    where: {
      user_id: userId,
    },
  })) as unknown as Kyc
}

export async function createKyc(
  userId: number,
  templateId: number,
  templateData: any,
  level: number,
): Promise<Kyc> {
  const user = (await prisma.user.findUnique({
    where: {
      id: userId,
    },
  })) as unknown as User
  if (!user) {
    throw new Error('User not found')
  }

  const template = await prisma.kyc_template.findUnique({
    where: {
      id: templateId,
    },
  })

  if (!template) {
    throw new Error('KYC template not found')
  }

  const existingKyc = await prisma.kyc.findFirst({
    where: {
      user_id: user.id,
      template_id: template.id,
    },
  })

  // Scenario 1: No existing KYC
  if (!existingKyc) {
    const newKyc = await prisma.kyc.create({
      data: {
        user_id: user.id,
        template_id: template.id,
        data: templateData,
        level: level,
        status: 'PENDING',
      },
    })
    await sendKycEmail(user, newKyc, 'KycSubmission')
    return newKyc as unknown as Kyc
  }

  // Scenario 2: Existing KYC with same or higher level and not REJECTED
  if (existingKyc.level >= level && existingKyc.status !== 'REJECTED') {
    throw new Error(
      'You have already submitted a KYC application at this level or higher. Please wait for it to be reviewed.',
    )
  }

  // Scenario 3: Existing KYC with status REJECTED but level not matching the parameter
  if (existingKyc.status === 'REJECTED' && existingKyc.level !== level) {
    throw new Error(
      'Your existing KYC application was rejected. You can only resubmit at the same level.',
    )
  }

  // Scenario 4: Existing KYC with lower level but not APPROVED and not REJECTED
  if (existingKyc.status === 'PENDING') {
    throw new Error(
      'Your existing KYC application is still under review. Please wait for it to be approved before submitting a new one.',
    )
  }

  // Scenario 5: Existing KYC with lower level and APPROVED
  const existingKycData = existingKyc.data as any // Type cast to any
  const mergedCustomFields = mergeCustomFields(
    existingKycData.custom_fields,
    templateData.custom_fields,
  )
  const mergedData = deepMerge(existingKycData, templateData)
  mergedData.custom_fields = mergedCustomFields

  // Update existing KYC record
  const updatedKyc = (await prisma.kyc.update({
    where: {
      id: existingKyc.id,
    },
    data: {
      data: mergedData,
      level: level,
      status: 'PENDING',
    },
  })) as unknown as Kyc

  // Send update email
  await sendKycEmail(user, updatedKyc, 'KycUpdate')

  return updatedKyc
}

export async function updateKyc(id: number, data: Kyc): Promise<Kyc> {
  return (await prisma.kyc.update({
    where: {
      id: id,
    },
    data: data,
  })) as unknown as Kyc
}

function deepMerge(obj1: any, obj2: any): any {
  if (obj1 === null) return obj2
  if (obj2 === null) return obj1

  if (typeof obj1 !== 'object') return obj2
  if (typeof obj2 !== 'object') return obj2

  const output = { ...obj1 }
  Object.keys(obj2).forEach((key) => {
    if (obj2[key] === null) {
      output[key] = null
    } else if (Array.isArray(obj2[key])) {
      output[key] = obj2[key]
    } else if (typeof obj2[key] === 'object') {
      output[key] = deepMerge(obj1[key], obj2[key])
    } else {
      output[key] = obj2[key]
    }
  })

  return output
}

function mergeCustomFields(existingFields: any[], newFields: any[]) {
  const mergedFields = [...existingFields] // Start with existing fields

  newFields.forEach((newField) => {
    const existingFieldIndex = mergedFields.findIndex(
      (existingField) => existingField.title === newField.title,
    )

    if (existingFieldIndex > -1) {
      // Update existing field
      mergedFields[existingFieldIndex] = {
        ...mergedFields[existingFieldIndex],
        ...newField,
      }
    } else {
      // Add new field
      mergedFields.push(newField)
    }
  })

  return mergedFields
}

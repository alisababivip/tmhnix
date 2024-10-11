import { handleController } from '~~/utils'
import { sendEmail } from '~~/utils/emails'
import { storeSystemReport } from '~~/utils/system'
import {
  getTemplateQuery,
  getTemplatesQuery,
  updateTemplateQuery,
} from './queries'

export const controllers = {
  index: handleController(async () => {
    return await getTemplatesQuery()
  }),

  show: handleController(async (_, __, params) => {
    return await getTemplateQuery(Number(params.id))
  }),

  update: handleController(async (_, __, params, ____, body) => {
    try {
      const response = await updateTemplateQuery(Number(params.id), body.data)
      return {
        ...response,
        message: 'Email template updated successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),

  testMailer: handleController(async (_, __, ___, query) => {
    const { name, email } = query
    const currentTime = new Date().toISOString()

    const errorOrSent = await sendEmail(
      {
        TO: email,
        FIRSTNAME: name,
        TIME: currentTime,
      },
      'EmailTest',
    )

    if (errorOrSent instanceof Error) {
      await storeSystemReport(
        'email',
        `Test email failed at ${currentTime} with error: ${errorOrSent.message}`,
        false,
      )
      throw errorOrSent
    }

    await storeSystemReport('email', `Test email sent at ${currentTime}`, true)

    return 'Email sent successfully'
  }),
}

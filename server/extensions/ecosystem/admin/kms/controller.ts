// controller.ts
import { handleController } from '~~/utils'
import { setEncryptionKey } from '~~/utils/encrypt'
import { removeSystemReport, storeSystemReport } from '~~/utils/system'

export const controllers = {
  setPassphrase: handleController(async (_, __, ___, ____, body, user) => {
    if (!user) {
      throw new Error('Unauthorized')
    }

    const { passphrase } = body
    if (!passphrase) {
      throw new Error('Passphrase is required')
    }

    try {
      const success = await setEncryptionKey(passphrase)
      if (success) {
        // Remove any existing system report for this operation
        try {
          await removeSystemReport('SetEncryptionKey')
        } catch (error) {}

        return { message: 'Encryption key set successfully.' }
      } else {
        throw new Error('Wrong passphrase')
      }
    } catch (error) {
      // Save a system report indicating that the operation failed
      await storeSystemReport(
        'SetEncryptionKey',
        `Failed to set the encryption key: ${error.message}`,
        false,
      )

      throw new Error(`${error.message}`)
    }
  }),
}

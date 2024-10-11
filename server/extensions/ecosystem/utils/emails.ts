import { createLogger } from '~~/logger'
import { sendEmail } from '~~/utils/emails'
const logger = createLogger('Ecosystem Emails')

export async function sendWithdrawalStatusEmail(
  user: any,
  status: string,
  reason: string,
  transactionId: string,
  amount: number,
  currency: string,
) {
  const emailTemplate = 'WithdrawalStatus'
  const emailData = {
    TO: user.email,
    FIRSTNAME: user.first_name,
    STATUS: status,
    REASON: reason,
    TRANSACTION_ID: transactionId,
    AMOUNT: amount,
    CURRENCY: currency,
  }

  const errorOrSent = await sendEmail(emailData, emailTemplate)

  if (errorOrSent instanceof Error) {
    logger.error(`Failed to send Withdrawal Status email:`, errorOrSent)
    return errorOrSent
  }

  return true
}

export async function sendDepositConfirmationEmail(
  user: any,
  transactionId: string,
  amount: number,
  currency: string,
) {
  const emailTemplate = 'DepositConfirmation'
  const emailData = {
    TO: user.email,
    FIRSTNAME: user.first_name,
    TRANSACTION_ID: transactionId,
    AMOUNT: amount,
    CURRENCY: currency,
  }

  const errorOrSent = await sendEmail(emailData, emailTemplate)

  if (errorOrSent instanceof Error) {
    logger.error(`Failed to send Deposit Confirmation email:`, errorOrSent)
    return errorOrSent
  }

  return true
}

export async function sendTransferConfirmationEmail(
  user: any,
  recipient: any,
  transactionId: string,
  amount: number,
  currency: string,
) {
  const emailTemplate = 'TransferConfirmation'
  const emailData = {
    TO: user.email,
    FIRSTNAME: user.first_name,
    TRANSACTION_ID: transactionId,
    AMOUNT: amount,
    CURRENCY: currency,
    RECIPIENT_NAME: `${recipient.first_name} ${recipient.last_name}`,
  }

  const errorOrSent = await sendEmail(emailData, emailTemplate)

  if (errorOrSent instanceof Error) {
    logger.error(`Failed to send Transfer Confirmation email:`, errorOrSent)
    return errorOrSent
  }

  return true
}

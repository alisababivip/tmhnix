import type { JSONResponse, User } from '~~/types'

// Composable to make authentication tasks easier
export default function useAuth() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    register,
    login,
    loginWithWallet,
    generateNonce,
    verifyMessage,
    logout,
    getProfile,
    loginWithGoogle,
    updateProfile,
    resetPassword,
    verifyReset,
    sendEmailVerification,
    verifyEmailToken,
    generateOTPSecret,
    verifyOTP,
    saveOTP,
    loginOtp,
    resendOtp,
    toggleOtp,
  }

  /**
   * @desc Register new user
   * @param user User to register
   * @returns {Promise<JSONResponse>}
   */
  async function register(
    first_name: string,
    last_name: string,
    email: string,
    password: string,
    ref?: string,
  ): Promise<JSONResponse> {
    // Attempt register
    const response = await $fetch(apiPath + '/api/auth/register', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        first_name,
        last_name,
        email,
        password,
        ref,
      },
    })

    return response
  }

  /**
   * @desc Register new user
   * @param user User to log in
   * @returns {Promise<JSONResponse>}
   */
  async function login(user: User): Promise<JSONResponse> {
    const response = await $fetch(apiPath + '/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: user,
    })

    return response
  }

  /**
   * @desc Log in user with wallet address
   * @param walletAddress User's wallet address for login
   * @returns {Promise<JSONResponse>}
   */
  async function loginWithWallet(walletAddress: string): Promise<JSONResponse> {
    const response = await $fetch(apiPath + '/api/auth/login/wallet', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: { walletAddress },
    })

    return response
  }

  async function generateNonce(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + '/api/auth/nonce', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })

    return response
  }

  async function verifyMessage(
    message: string,
    signature: string,
    walletAddress: string,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + '/api/auth/wallet/verify', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        message,
        signature,
        walletAddress,
      },
    })

    return response
  }

  async function loginOtp(uuid: string, otp: string): Promise<JSONResponse> {
    const response = await $fetch(apiPath + '/api/auth/login/otp', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        uuid: uuid,
        otp: otp,
      },
    })

    return response
  }

  async function resendOtp(
    uuid: string,
    secret: string,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + '/api/auth/login/otp/resend', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        uuid: uuid,
        secret: secret,
      },
    })

    return response
  }

  /**
   * @desc Update user profile
   * @returns {Promise<JSONResponse>}
   */

  async function updateProfile(
    first_name?: string,
    last_name?: string,
    email?: string,
    metadata?: any,
    avatar?: string,
    current_password?: string,
    new_password?: string,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + '/api/auth/profile', {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        first_name,
        last_name,
        email,
        metadata,
        avatar,
        current_password,
        new_password,
      },
    })

    return response
  }

  /**
   * @desc Get user profile
   * @returns {Promise<JSONResponse>}
   */
  async function getProfile(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + '/api/auth/profile', {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })

    return response
  }

  /**
   * @desc Attempt to log user out
   * @returns {Promise<JSONResponse>}
   */
  async function logout(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + '/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })

    return response
  }

  /**
   * @desc Receives user token from Google login, and signs user
   * @param token Access token received from Google after login
   * @returns {Promise<JSONResponse>}
   */
  async function loginWithGoogle(token: string): Promise<JSONResponse> {
    const response = await $fetch(apiPath + '/api/auth/login-google', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        token: token,
      },
    })

    return response
  }

  /**
   * @desc Reset user's password
   * @returns {Promise<JSONResponse>}
   */
  async function resetPassword(email: string): Promise<JSONResponse> {
    const response = await $fetch(apiPath + '/api/auth/reset', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        email: email,
      },
    })

    return response
  }

  /**
   * @desc Verify reset password token sent by user
   * @returns {Promise<JSONResponse>}
   */
  async function verifyReset(token: string): Promise<JSONResponse> {
    const response = await $fetch(apiPath + '/api/auth/verifyreset', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        token: token,
      },
    })

    return response
  }

  async function sendEmailVerification(email: string): Promise<JSONResponse> {
    const response = await $fetch(apiPath + '/api/auth/verify/email/send', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        email: email,
      },
    })

    return response
  }

  /**
   * @desc Verify user email after registration
   * @returns {Promise<JSONResponse>}
   */
  async function verifyEmailToken(token: string): Promise<JSONResponse> {
    const response = await $fetch(apiPath + '/api/auth/verify/email/token', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        token,
      },
    })

    return response
  }

  /**
   * @desc Generates the OTP for SMS-based 2FA and sends it to the user's phone number
   * @param email The user's email
   * @param phoneNumber The user's phone number
   * @returns {Promise<JSONResponse>}
   */
  async function generateOTPSecret(
    type: string,
    email: string,
    phoneNumber?: string,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + '/api/profile/generateOTPSecret', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        email: email,
        type: type,
        phoneNumber: phoneNumber,
      },
    })

    return response
  }

  /**
   * @desc Verifies the OTP entered by the user
   * @param otp The OTP entered by the user
   * @returns {Promise<JSONResponse>}
   */
  async function verifyOTP(
    otp: string,
    secret: string,
    type: string,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + '/api/profile/verifyOTP', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        otp: otp,
        secret: secret,
        type: type,
      },
    })

    return response
  }

  /**
   * @desc Save the OTP secret to the user's profile
   * @param secret The OTP secret
   * @returns {Promise<JSONResponse>}
   */
  async function saveOTP(secret: string, type: string): Promise<JSONResponse> {
    const response = await $fetch(apiPath + '/api/profile/saveOTP', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        secret: secret,
        type: type,
      },
    })

    return response
  }

  async function toggleOtp(status: boolean): Promise<JSONResponse> {
    const response = await $fetch(apiPath + '/api/profile/toggleOtp', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        status: status,
      },
    })

    return response
  }
}

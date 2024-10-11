import type { JSONResponse } from '~~/types'

// Composable to make system management tasks easier
export default function useSystem() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    getExtensions,
    checkLatestVersion,
    updateExtensionStatus,
    checkUpdate,
    verifyLicense,
    activateLicense,
    downloadUpdate,
    getProduct,
    updateNavigation,
    activateExchangeLicense,
  }
  /**
   * @desc Get Extensions
   * @returns {Promise<JSONResponse>}
   */
  async function getExtensions(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/system/extensions`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  /**
   * @desc update extension status
   * @returns {Promise<JSONResponse>}
   */
  async function updateExtensionStatus(
    productId: string,
    status: boolean,
  ): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + '/api/admin/system/extensions/status',
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
        body: {
          productId: productId,
          status: status,
        },
      },
    )
    return response
  }

  /**
   * @desc Check latest version of product
   * @returns {Promise<JSONResponse>}
   */
  async function checkLatestVersion(productId: string): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + '/api/admin/system/check-latest-version',
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
        body: {
          productId: productId,
        },
      },
    )
    return response
  }

  /**
   * @desc Check for update
   * @returns {Promise<JSONResponse>}
   */
  async function checkUpdate(
    productId: string,
    currentVersion: string,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + '/api/admin/system/check-update', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        productId: productId,
        currentVersion: currentVersion,
      },
    })
    return response
  }

  /**
   * @desc Verify License
   * @returns {Promise<JSONResponse>}
   */
  async function verifyLicense(
    productId: string,
    purchaseCode?: string,
    envatoUsername?: string,
  ): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + '/api/admin/system/verify/license',
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
        body: {
          productId: productId,
          purchaseCode: purchaseCode,
          envatoUsername: envatoUsername,
        },
      },
    )
    return response
  }

  /**
   * @desc Activate License
   * @returns {Promise<JSONResponse>}
   */
  async function activateLicense(
    productId: string,
    purchaseCode: string,
    envatoUsername: string,
  ): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + '/api/admin/system/activate/license',
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
        body: {
          productId: productId,
          purchaseCode: purchaseCode,
          envatoUsername: envatoUsername,
        },
      },
    )
    return response
  }

  async function activateExchangeLicense(
    productId: string,
    purchaseCode: string,
    envatoUsername: string,
  ): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + '/api/exchange/settings/activate/license',
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
        body: {
          productId: productId,
          purchaseCode: purchaseCode,
          envatoUsername: envatoUsername,
        },
      },
    )
    return response
  }

  /**
   * @desc Download Update
   * @returns {Promise<JSONResponse>}
   */
  async function downloadUpdate(
    productId: string,
    updateId: string,
    version: string,
    product: string,
    type?: string,
  ): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + '/api/admin/system/download-update',
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
        body: {
          productId: productId,
          updateId: updateId,
          version: version,
          product: product,
          type: type,
        },
      },
    )
    return response
  }

  /**
   * @desc Get Product by name
   * @returns {Promise<JSONResponse>}
   */
  async function getProduct(name: string): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/system/get-product/${name}`,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
      },
    )
    return response
  }

  /**
   * @desc update Navigation menu
   * @returns {Promise<JSONResponse>}
   */
  async function updateNavigation(
    navigationMenu: any[],
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + '/api/admin/system/navigation', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        data: navigationMenu,
      },
    })
    return response
  }
}

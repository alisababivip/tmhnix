import type { JSONResponse } from '~~/types'

// Composable to make authentication tasks easier
export default function useSettings() {
  const apiPath = useRuntimeConfig().public.apiPath

  return {
    getSettings,
    getExtensions,
    updateSettings,
    getCurrencies,
    getAllCurrencies,
    getCurrency,
    updateCurrency,
    updateCurrenciesStatus,
    editLocale,
    toggleLocaleStatus,
    batchTranslate,
  }

  /**
   * @desc Get settings
   * @returns {Promise<JSONResponse>}
   *
   * */
  async function getSettings(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + '/api/settings', {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })

    return response
  }

  /**
   * @desc Get Extensions
   * @returns {Promise<JSONResponse>}
   */
  async function getExtensions(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/settings/extensions`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  /**
   * @desc update settings
   * @param {Array} newSettings - An array of new settings
   * @returns {Promise<JSONResponse>}
   */

  async function updateSettings(
    newSettings: Array<any>,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + '/api/admin/settings', {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        data: newSettings,
      },
    })
    return response
  }

  async function editLocale(
    code: string,
    updates: Record<string, any>,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/settings/locales`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        code,
        updates,
      },
    })

    return response
  }

  async function toggleLocaleStatus(
    code: string,
    newStatus: number,
  ): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/settings/locales/status`,
      {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
        body: {
          code,
          status: newStatus,
        },
      },
    )

    return response
  }

  async function batchTranslate(
    keys: string[],
    targetLang: string,
  ): Promise<Record<string, string>> {
    const response = await $fetch(
      apiPath + `/api/admin/settings/locales/translate`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
        body: JSON.stringify({
          keys,
          targetLang,
        }),
      },
    )

    return response
  }

  /**
   * @desc Get all currencies
   * @returns {Promise<JSONResponse>}
   */
  async function getCurrencies(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + '/api/currencies', {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function getAllCurrencies(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + '/api/admin/currencies', {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  /**
   * @desc Get a single currency by ID
   * @param {string} currencyId - The ID of the currency
   * @returns {Promise<JSONResponse>}
   */
  async function getCurrency(currencyId: string): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/currencies/${currencyId}`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  /**
   * @desc Update a currency
   * @param {string} currencyId - The ID of the currency to update
   * @param {Object} newCurrencyData - The new data for the currency
   * @returns {Promise<JSONResponse>}
   */
  async function updateCurrency(
    currencyId: string,
    newCurrencyData: any,
  ): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/currencies/${currencyId}`,
      {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
        body: {
          data: newCurrencyData,
        },
      },
    )
    return response
  }

  async function updateCurrenciesStatus(
    ids: number[],
    status: boolean,
  ): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/currencies/update-status`,
      {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
        body: {
          ids: ids,
          status: status,
        },
      },
    )
    return response
  }
}

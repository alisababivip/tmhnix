import _ from 'lodash'
import type { JSONResponse, Transaction } from '~~/types'

export const useUtils = () => {
  const toaster = useToaster()
  /**
   * Perform a sleep as a Promise
   * ex: await this.$sleep(200)
   * @param milliseconds
   */
  const sleep = (milliseconds: number) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds))
  }

  /**
   * Generate a random integer similar to php's rand()
   * @see https://www.php.net/rand
   * @param min - The lowest value to return
   * @param max - The highest value to return
   */
  const rand = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  /**
   * Capitalize the first letter of a string
   * @param string
   */
  const ucFirst = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  /**
   * Scroll to an element on the page
   * @param id
   * @param offset
   */
  const properScroll = (id: string, offset: number) => {
    const el = document.getElementById(id)
    if (!el) return true
    const y = el.getBoundingClientRect().top + window.pageYOffset + offset
    window.scrollTo(0, y)
  }

  const toast = {
    response: (result: JSONResponse) => {
      toaster.clearAll()
      const status = result?.status === 'success' ? 'success' : 'danger'
      const resultData = status === 'success' ? result?.data : result.error
      const resultMessage =
        resultData?.message ||
        (status === 'success' ? 'Operation Successful' : 'Operation Failed')
      const title = status === 'success' ? 'Success' : 'Failed'
      toaster.show({
        color: status,
        title: title,
        message: resultMessage,
        icon:
          status === 'success'
            ? 'line-md:confirm-circle'
            : 'line-md:alert-circle',
        closable: true,
        duration: 3000,
      })
    },

    success: (result: JSONResponse) => {
      toaster.clearAll()
      const resultMessage = result?.error || result
      toaster.show({
        color: 'success',
        title: 'Success',
        message: resultMessage.message,
        icon: 'line-md:confirm-circle',
        closable: true,
        duration: 3000,
      })
    },
    successText: (message: string) => {
      toaster.clearAll()
      toaster.show({
        color: 'success',
        title: 'Success',
        message: message,
        icon: 'line-md:confirm-circle',
        closable: true,
        duration: 3000,
      })
    },

    danger: (result: JSONResponse) => {
      toaster.clearAll()
      const errorJSON = result?.error || result
      toaster.show({
        color: 'danger',
        title: 'Failed',
        message: errorJSON.message,
        icon: 'line-md:alert-circle',
        closable: true,
        duration: 3000,
      })
    },

    dangerText: (message: string) => {
      toaster.clearAll()
      toaster.show({
        color: 'danger',
        title: 'Failed',
        message: message,
        icon: 'line-md:alert-circle',
        closable: true,
        duration: 3000,
      })
    },

    muted: (message: string) => {
      toaster.clearAll()
      toaster.show({
        color: 'muted',
        title: 'Alert',
        message: message,
        icon: 'line-md:alert-circle',
        closable: true,
        duration: 3000,
      })
    },

    info: (message: string) => {
      toaster.clearAll()
      toaster.show({
        color: 'info',
        title: 'Info',
        message: message,
        icon: 'line-md:alert',
        closable: true,
        duration: 3000,
      })
    },

    warning: (message: string) => {
      toaster.clearAll()
      toaster.show({
        color: 'warning',
        title: 'Warning',
        message: message,
        icon: 'line-md:alert-circle',
        closable: true,
        duration: 3000,
      })
    },
  }

  const countDecimals = (num: number) => {
    if (Math.floor(num) === num) return 0
    const str = num.toString()
    const scientificNotationMatch = /^(\d+\.?\d*|\.\d+)e([\+\-]\d+)$/.exec(str)
    if (scientificNotationMatch) {
      const decimalStr = scientificNotationMatch[1].split('.')[1] || ''
      const decimalCount =
        decimalStr.length + parseInt(scientificNotationMatch[2])
      return Math.min(decimalCount, 8)
    } else {
      const decimalStr = str.split('.')[1] || ''
      return Math.min(decimalStr.length, 8)
    }
  }

  // Memoize priceFormatter function to improve performance
  const priceFormatter = _.memoize(
    (p, decimalPlaces = 8, d = ',') => {
      if (p == null || isNaN(p)) {
        return 0
      }
      if (decimalPlaces < 0 || decimalPlaces > 100) {
        decimalPlaces = 8
      }
      p = parseFloat(p).toFixed(decimalPlaces)
      let [integerPart, decimalPart] = p.toString().split('.')
      integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, d)
      p = decimalPart ? `${integerPart}.${decimalPart}` : integerPart
      return p
    },
    (p, decimalPlaces = 8, d = ',') => `${p}-${decimalPlaces}-${d}`,
  )

  const truncateText = (value, length = 135) => {
    if (value.length > length) {
      const substr = value.substring(0, length)
      return substr.substring(0, substr.lastIndexOf(' ')) + ' ...'
    } else {
      return value
    }
  }
  function time_since(val) {
    if (val) {
      return ago(val)
    } else {
      return ''
    }
  }

  const ago = function (val) {
    // Check if val is a number (Unix timestamp)
    if (!isNaN(val)) {
      val = 0 | ((Date.now() - new Date(val * 1000).getTime()) / 1000)
    } else {
      // Otherwise, assume val is an ISO 8601 date string
      val = 0 | ((Date.now() - new Date(val).getTime()) / 1000)
    }

    var unit,
      length = {
        sec: 60,
        min: 60,
        hr: 24,
        day: 7,
        week: 4.35,
        month: 12,
        year: 10000,
      },
      result

    for (unit in length) {
      result = val % length[unit]
      if (!(val = 0 | (val / length[unit])))
        return result + ' ' + (result - 1 ? unit + 's' : unit) + ' ago'
    }
  }

  const formatedDate = (date, showTime = false) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }

    if (showTime) {
      options.hour = '2-digit'
      options.minute = '2-digit'
      options.second = '2-digit'
    }

    return new Date(date).toLocaleDateString('en-US', options)
  }

  const sciToPrecision = function (value, precision) {
    // Convert -0 to 0
    if (Object.is(value, -0)) {
      value = 0
    }

    // Ensure value is a number
    value = Number(value)

    // If precision is provided and is a number
    if (precision && !isNaN(precision)) {
      return value.toFixed(precision)
    }

    // Default behavior if no precision is provided
    return value.toString()
  }

  function generateTransactionData(transactions: Transaction[]) {
    if (!transactions) return [[], []]

    const incomeTransactions = transactions.filter(
      (transaction) =>
        (transaction.type === 'DEPOSIT' ||
          transaction.type === 'INCOMING_TRANSFER') &&
        (transaction.status === 'COMPLETED' ||
          transaction.status === 'PENDING'),
    )
    const expenseTransactions = transactions.filter(
      (transaction) =>
        (transaction.type === 'WITHDRAW' ||
          transaction.type === 'OUTGOING_TRANSFER') &&
        (transaction.status === 'COMPLETED' ||
          transaction.status === 'PENDING'),
    )

    const incomeData = aggregateByDate(incomeTransactions)
    const expenseData = aggregateByDate(expenseTransactions)

    return [incomeData, expenseData]
  }

  function aggregateByDate(transactions: Transaction[]) {
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const data = []

    for (let i = 0; i < daysInMonth; i++) {
      const day = new Date(year, month, i + 1).getTime() // get timestamp of the i-th day of the current month
      const transactionsOnDay = transactions.filter((transaction) => {
        const transactionDate = new Date(transaction.created_at)
        return (
          transactionDate.getDate() === i + 1 &&
          transactionDate.getMonth() === month &&
          transactionDate.getFullYear() === year
        )
      })

      const totalAmountOnDay = transactionsOnDay.reduce(
        (total, transaction) => total + transaction.amount,
        0,
      )
      data.push([day, totalAmountOnDay])
    }

    return data
  }

  function generateEmptyMonthData() {
    const daysInMonth = new Date().getDate()
    return Array(daysInMonth).fill(0)
  }

  const statusMap = {
    COMPLETED: {
      title: 'Completed',
      color: 'success',
    },
    PENDING: {
      title: 'Pending',
      color: 'warning',
    },
    FAILED: {
      title: 'Failed',
      color: 'danger',
    },
    REJECTED: {
      title: 'Rejected',
      color: 'danger',
    },
    CANCELLED: {
      title: 'Cancelled',
      color: 'danger',
    },
    EXPIRED: {
      title: 'Expired',
      color: 'danger',
    },
  }

  const transactionItemDetails = {
    FAILED: {
      title: 'Transaction Failed',
      icon: 'solar:close-line',
      color: 'danger',
    },
    PAYMENT: {
      title: 'Payment',
      icon: 'mdi:instant-deposit',
      color: 'primary',
    },
    DEPOSIT: {
      title: 'Deposit',
      icon: 'solar:card-recive-bold-duotone',
      color: 'success',
    },
    INCOMING_TRANSFER: {
      title: 'Incoming Transfer',
      icon: 'solar:card-recive-bold-duotone',
      color: 'success',
    },
    WITHDRAW: {
      title: 'Withdraw',
      icon: 'solar:card-send-bold-duotone',
      color: 'danger',
    },
    OUTGOING_TRANSFER: {
      title: 'Outgoing Transfer',
      icon: 'solar:card-send-bold-duotone',
      color: 'danger',
    },
    BINARY_ORDER: {
      title: 'Binary Order',
      icon: 'streamline:money-graph-bar-increase-up-product-performance-increase-arrow-graph-business-chart',
      color: 'danger',
    },
    INVESTMENT: {
      title: 'Investment',
      icon: 'streamline:money-cash-file-dollar-common-money-currency-cash-file',
      color: 'danger',
    },
    INVESTMENT_ROI: {
      title: 'Investment ROI',
      icon: 'streamline:money-cash-bag-dollar-bag-payment-cash-money-finance',
      color: 'success',
    },
    AI_INVESTMENT: {
      title: 'AI Investment',
      icon: 'streamline:money-cash-file-dollar-common-money-currency-cash-file',
      color: 'danger',
    },
    AI_INVESTMENT_ROI: {
      title: 'AI Investment ROI',
      icon: 'streamline:money-cash-bag-dollar-bag-payment-cash-money-finance',
      color: 'success',
    },
    FOREX_DEPOSIT: {
      title: 'Forex Deposit',
      icon: 'streamline:money-cash-file-dollar-common-money-currency-cash-file',
      color: 'success',
    },
    FOREX_WITHDRAW: {
      title: 'Forex Withdraw',
      icon: 'streamline:money-cash-file-dollar-common-money-currency-cash-file',
      color: 'danger',
    },
    ICO_CONTRIBUTION: {
      title: 'ICO Contribution',
      icon: 'streamline:money-cash-file-dollar-common-money-currency-cash-file',
      color: 'success',
    },
    STAKING: {
      title: 'Staking',
      icon: 'streamline:money-cash-file-dollar-common-money-currency-cash-file',
      color: 'success',
    },
    STAKING_REWARD: {
      title: 'Staking Reward',
      icon: 'streamline:money-cash-bag-dollar-bag-payment-cash-money-finance',
      color: 'success',
    },
    P2P_OFFER_TRANSFER: {
      title: 'P2P Offer Transfer',
      icon: 'streamline:money-cash-file-dollar-common-money-currency-cash-file',
      color: 'success',
    },
    P2P_TRADE: {
      title: 'P2P Trade',
      icon: 'streamline:money-cash-bag-dollar-bag-payment-cash-money-finance',
      color: 'success',
    },
    REFERRAL_REWARD: {
      title: 'Referral Reward',
      icon: 'streamline:money-cash-bag-dollar-bag-payment-cash-money-finance',
      color: 'success',
    },
  }

  function formatUUID(uuid: string | undefined) {
    if (!uuid) return ''
    uuid = uuid.replace(/-/g, '')
    let last12Digits = uuid.slice(-12)
    return '******** **** **** **** ' + last12Digits
  }

  function useSparklineConfiguration(
    items: string | any[],
    group: string,
    chartTitle: string,
    color: string = 'primary',
    counts?: any[],
  ) {
    const type = 'area'
    const height = 130

    const { primary, title, subtitle, warning, success, danger, info, yellow } =
      useTailwindColors()
    const colorMapping = {
      primary: primary.value,
      warning: warning.value,
      success: success.value,
      danger: danger.value,
      info: info.value,
      yellow: yellow.value,
    }

    const itemCounts = items ? countItemsPerDay(items) : []

    // Generate last 30 dates
    const last30Days = [...Array(30)]
      .map((_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - i)
        return `${('0' + (d.getUTCMonth() + 1)).slice(-2)}-${(
          '0' + d.getUTCDate()
        ).slice(-2)}`
      })
      .reverse()

    const options = {
      chart: {
        id: 'sparkline1',
        group: group,
        sparkline: {
          enabled: true,
        },
      },
      colors: [colorMapping[color]],
      stroke: {
        width: [2],
        curve: 'straight',
      },
      fill: {
        opacity: 1,
      },
      yaxis: {
        min: 0,
        labels: {
          minWidth: 100,
        },
      },
      xaxis: {
        type: 'category',
        categories: last30Days,
      },
      title: {
        text: chartTitle,
        offsetX: 5,
        style: {
          fontFamily: 'Roboto, sans-serif',
          fontSize: '12px',
          fontWeight: '500',
          color: subtitle.value,
          cssClass: 'apexcharts-spark-title',
        },
      },
      subtitle: {
        text: counts
          ? counts.reduce((total, count) => total + count, 0).toString()
          : items.length.toString(),
        offsetX: 5,
        offsetY: 15,
        style: {
          fontFamily: 'Roboto, sans-serif',
          fontSize: '22px',
          fontWeight: '500',
          color: colorMapping[color],
          cssClass: 'apexcharts-spark-subtitle',
        },
      },
    }

    // Merge counts with the last 30 days
    const data = last30Days.map((date) => {
      const count = itemCounts.find((item) => item.date === date)?.count || 0

      return count
    })

    const series = [
      {
        name: chartTitle,
        data: counts ? counts : data,
      },
    ]

    return {
      type,
      height,
      options,
      series,
    }
  }

  function countItemsPerDay(items: any) {
    const counts = {}

    for (let item of items) {
      const date = new Date(item.created_at)
      const key = `${('0' + (date.getUTCMonth() + 1)).slice(-2)}-${(
        '0' + date.getUTCDate()
      ).slice(-2)}`

      if (counts[key]) {
        counts[key]++
      } else {
        counts[key] = 1
      }
    }

    const countsArray = Object.keys(counts).map((key) => {
      return {
        date: key,
        count: counts[key],
      }
    })

    countsArray.sort((a, b) => a.date.localeCompare(b.date))

    return countsArray
  }

  const FiatCurrencies: {
    code: string
    name: string
    symbol: string
    precision: number
  }[] = [
    {
      code: 'AED',
      name: 'United Arab Emirates Dirham',
      symbol: 'د.إ',
      precision: 2,
    },
    { code: 'AFN', name: 'Afghan Afghani', symbol: '؋', precision: 2 },
    { code: 'ALL', name: 'Albanian Lek', symbol: 'L', precision: 2 },
    { code: 'AMD', name: 'Armenian Dram', symbol: '֏', precision: 2 },
    {
      code: 'ANG',
      name: 'Netherlands Antillean Guilder',
      symbol: 'ƒ',
      precision: 2,
    },
    { code: 'AOA', name: 'Angolan Kwanza', symbol: 'Kz', precision: 2 },
    { code: 'ARS', name: 'Argentine Peso', symbol: '$', precision: 2 },
    { code: 'AUD', name: 'Australian Dollar', symbol: '$', precision: 2 },
    { code: 'AWG', name: 'Aruban Florin', symbol: 'ƒ', precision: 2 },
    { code: 'AZN', name: 'Azerbaijani Manat', symbol: '₼', precision: 2 },
    {
      code: 'BAM',
      name: 'Bosnia-Herzegovina Convertible Mark',
      symbol: 'KM',
      precision: 2,
    },
    { code: 'BBD', name: 'Barbadian Dollar', symbol: '$', precision: 2 },
    { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', precision: 2 },
    { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв', precision: 2 },
    { code: 'BHD', name: 'Bahraini Dinar', symbol: '.د.ب', precision: 3 },
    { code: 'BIF', name: 'Burundian Franc', symbol: 'FBu', precision: 0 },
    { code: 'BMD', name: 'Bermudian Dollar', symbol: '$', precision: 2 },
    { code: 'BND', name: 'Brunei Dollar', symbol: '$', precision: 2 },
    { code: 'BOB', name: 'Bolivian Boliviano', symbol: 'Bs.', precision: 2 },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', precision: 2 },
    { code: 'BSD', name: 'Bahamian Dollar', symbol: '$', precision: 2 },
    { code: 'BTN', name: 'Bhutanese Ngultrum', symbol: 'Nu.', precision: 2 },
    { code: 'BWP', name: 'Botswanan Pula', symbol: 'P', precision: 2 },
    { code: 'BYN', name: 'New Belarusian Ruble', symbol: 'Br', precision: 2 },
    { code: 'BZD', name: 'Belize Dollar', symbol: 'BZ$', precision: 2 },
    { code: 'CAD', name: 'Canadian Dollar', symbol: '$', precision: 2 },
    { code: 'CDF', name: 'Congolese Franc', symbol: 'FC', precision: 2 },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', precision: 2 },
    {
      code: 'CLF',
      name: 'Chilean Unit of Account (UF)',
      symbol: 'UF',
      precision: 4,
    },
    { code: 'CLP', name: 'Chilean Peso', symbol: '$', precision: 0 },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', precision: 2 },
    { code: 'COP', name: 'Colombian Peso', symbol: '$', precision: 2 },
    { code: 'CRC', name: 'Costa Rican Colón', symbol: '₡', precision: 2 },
    { code: 'CUC', name: 'Cuban Convertible Peso', symbol: '$', precision: 2 },
    { code: 'CUP', name: 'Cuban Peso', symbol: '₱', precision: 2 },
    { code: 'CVE', name: 'Cape Verdean Escudo', symbol: '$', precision: 2 },
    { code: 'CZK', name: 'Czech Republic Koruna', symbol: 'Kč', precision: 2 },
    { code: 'DJF', name: 'Djiboutian Franc', symbol: 'Fdj', precision: 0 },
    { code: 'DKK', name: 'Danish Krone', symbol: 'kr', precision: 2 },
    { code: 'DOP', name: 'Dominican Peso', symbol: 'RD$', precision: 2 },
    { code: 'DZD', name: 'Algerian Dinar', symbol: 'د.ج', precision: 2 },
    { code: 'EGP', name: 'Egyptian Pound', symbol: '£', precision: 2 },
    { code: 'ERN', name: 'Eritrean Nakfa', symbol: 'Nfk', precision: 2 },
    { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br', precision: 2 },
    { code: 'EUR', name: 'Euro', symbol: '€', precision: 2 },
    { code: 'FJD', name: 'Fijian Dollar', symbol: '$', precision: 2 },
    { code: 'FKP', name: 'Falkland Islands Pound', symbol: '£', precision: 2 },
    { code: 'GBP', name: 'British Pound Sterling', symbol: '£', precision: 2 },
    { code: 'GEL', name: 'Georgian Lari', symbol: '₾', precision: 2 },
    { code: 'GGP', name: 'Guernsey Pound', symbol: '£', precision: 2 },
    { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵', precision: 2 },
    { code: 'GIP', name: 'Gibraltar Pound', symbol: '£', precision: 2 },
    { code: 'GMD', name: 'Gambian Dalasi', symbol: 'D', precision: 2 },
    { code: 'GNF', name: 'Guinean Franc', symbol: 'FG', precision: 0 },
    { code: 'GTQ', name: 'Guatemalan Quetzal', symbol: 'Q', precision: 2 },
    { code: 'GYD', name: 'Guyanaese Dollar', symbol: '$', precision: 2 },
    { code: 'HKD', name: 'Hong Kong Dollar', symbol: '$', precision: 2 },
    { code: 'HNL', name: 'Honduran Lempira', symbol: 'L', precision: 2 },
    { code: 'HRK', name: 'Croatian Kuna', symbol: 'kn', precision: 2 },
    { code: 'HTG', name: 'Haitian Gourde', symbol: 'G', precision: 2 },
    { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', precision: 2 },
    { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', precision: 2 },
    { code: 'ILS', name: 'Israeli New Sheqel', symbol: '₪', precision: 2 },
    { code: 'IMP', name: 'Manx pound', symbol: '£', precision: 2 },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', precision: 2 },
    { code: 'IQD', name: 'Iraqi Dinar', symbol: 'ع.د', precision: 3 },
    { code: 'IRR', name: 'Iranian Rial', symbol: '﷼', precision: 2 },
    { code: 'ISK', name: 'Icelandic Króna', symbol: 'kr', precision: 0 },
    { code: 'JEP', name: 'Jersey Pound', symbol: '£', precision: 2 },
    { code: 'JMD', name: 'Jamaican Dollar', symbol: 'J$', precision: 2 },
    { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.ا', precision: 3 },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', precision: 0 },
    { code: 'KES', name: 'Kenyan Shilling', symbol: 'Sh', precision: 2 },
    { code: 'KGS', name: 'Kyrgystani Som', symbol: 'с', precision: 2 },
    { code: 'KHR', name: 'Cambodian Riel', symbol: '៛', precision: 2 },
    { code: 'KMF', name: 'Comorian Franc', symbol: 'CF', precision: 0 },
    { code: 'KPW', name: 'North Korean Won', symbol: '₩', precision: 2 },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩', precision: 0 },
    { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', precision: 3 },
    { code: 'KYD', name: 'Cayman Islands Dollar', symbol: '$', precision: 2 },
    { code: 'KZT', name: 'Kazakhstani Tenge', symbol: '₸', precision: 2 },
    { code: 'LAK', name: 'Laotian Kip', symbol: '₭', precision: 2 },
    { code: 'LBP', name: 'Lebanese Pound', symbol: 'ل.ل', precision: 2 },
    { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs', precision: 2 },
    { code: 'LRD', name: 'Liberian Dollar', symbol: '$', precision: 2 },
    { code: 'LSL', name: 'Lesotho Loti', symbol: 'L', precision: 2 },
    { code: 'LYD', name: 'Libyan Dinar', symbol: 'ل.د', precision: 3 },
    { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م.', precision: 2 },
    { code: 'MDL', name: 'Moldovan Leu', symbol: 'L', precision: 2 },
    { code: 'MGA', name: 'Malagasy Ariary', symbol: 'Ar', precision: 2 },
    { code: 'MKD', name: 'Macedonian Denar', symbol: 'ден', precision: 2 },
    { code: 'MMK', name: 'Myanma Kyat', symbol: 'Ks', precision: 2 },
    { code: 'MNT', name: 'Mongolian Tugrik', symbol: '₮', precision: 2 },
    { code: 'MOP', name: 'Macanese Pataca', symbol: 'MOP$', precision: 2 },
    { code: 'MUR', name: 'Mauritian Rupee', symbol: '₨', precision: 2 },
    { code: 'MVR', name: 'Maldivian Rufiyaa', symbol: 'Rf', precision: 2 },
    { code: 'MWK', name: 'Malawian Kwacha', symbol: 'MK', precision: 2 },
    { code: 'MXN', name: 'Mexican Peso', symbol: '$', precision: 2 },
    { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', precision: 2 },
    { code: 'MZN', name: 'Mozambican Metical', symbol: 'MT', precision: 2 },
    { code: 'NAD', name: 'Namibian Dollar', symbol: '$', precision: 2 },
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', precision: 2 },
    { code: 'NIO', name: 'Nicaraguan Córdoba', symbol: 'C$', precision: 2 },
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', precision: 2 },
    { code: 'NPR', name: 'Nepalese Rupee', symbol: '₨', precision: 2 },
    { code: 'NZD', name: 'New Zealand Dollar', symbol: '$', precision: 2 },
    { code: 'OMR', name: 'Omani Rial', symbol: 'ر.ع.', precision: 3 },
    { code: 'PAB', name: 'Panamanian Balboa', symbol: 'B/.', precision: 2 },
    { code: 'PEN', name: 'Peruvian Nuevo Sol', symbol: 'S/', precision: 2 },
    { code: 'PGK', name: 'Papua New Guinean Kina', symbol: 'K', precision: 2 },
    { code: 'PHP', name: 'Philippine Peso', symbol: '₱', precision: 2 },
    { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', precision: 2 },
    { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', precision: 2 },
    { code: 'PYG', name: 'Paraguayan Guarani', symbol: '₲', precision: 0 },
    { code: 'QAR', name: 'Qatari Rial', symbol: 'ر.ق', precision: 2 },
    { code: 'RON', name: 'Romanian Leu', symbol: 'lei', precision: 2 },
    { code: 'RSD', name: 'Serbian Dinar', symbol: 'дин', precision: 2 },
    { code: 'AMD', name: 'Armenian Dram', symbol: '֏', precision: 2 },
    {
      code: 'ANG',
      name: 'Netherlands Antillean Guilder',
      symbol: 'ƒ',
      precision: 2,
    },
    { code: 'RUB', name: 'Russian Ruble', symbol: '₽', precision: 2 },
    { code: 'RWF', name: 'Rwandan Franc', symbol: 'FRw', precision: 0 },
    { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', precision: 2 },
    {
      code: 'MRU',
      name: 'Mauritanian Ouguiya',
      symbol: 'UM',
      precision: 2,
    },
    {
      code: 'SBD',
      name: 'Solomon Islands Dollar',
      symbol: '$',
      precision: 2,
    },
    {
      code: 'SCR',
      name: 'Seychellois Rupee',
      symbol: '₨',
      precision: 2,
    },
    {
      code: 'SDG',
      name: 'Sudanese Pound',
      symbol: '£',
      precision: 2,
    },
    {
      code: 'SEK',
      name: 'Swedish Krona',
      symbol: 'kr',
      precision: 2,
    },
    {
      code: 'SGD',
      name: 'Singapore Dollar',
      symbol: '$',
      precision: 2,
    },
    {
      code: 'SHP',
      name: 'Saint Helena Pound',
      symbol: '£',
      precision: 2,
    },
    {
      code: 'SLL',
      name: 'Sierra Leonean Leone',
      symbol: 'Le',
      precision: 2,
    },
    {
      code: 'SOS',
      name: 'Somali Shilling',
      symbol: 'Sh',
      precision: 2,
    },
    {
      code: 'SRD',
      name: 'Surinamese Dollar',
      symbol: '$',
      precision: 2,
    },
    {
      code: 'SSP',
      name: 'South Sudanese Pound',
      symbol: '£',
      precision: 2,
    },
    {
      code: 'STN',
      name: 'São Tomé and Príncipe Dobra',
      symbol: 'Db',
      precision: 2,
    },
    {
      code: 'SYP',
      name: 'Syrian Pound',
      symbol: '£',
      precision: 2,
    },
    {
      code: 'SZL',
      name: 'Swazi Lilangeni',
      symbol: 'L',
      precision: 2,
    },
    {
      code: 'THB',
      name: 'Thai Baht',
      symbol: '฿',
      precision: 2,
    },
    {
      code: 'TJS',
      name: 'Tajikistani Somoni',
      symbol: 'SM',
      precision: 2,
    },
    {
      code: 'TMT',
      name: 'Turkmenistani Manat',
      symbol: 'T',
      precision: 2,
    },
    {
      code: 'TND',
      name: 'Tunisian Dinar',
      symbol: 'د.ت',
      precision: 3,
    },
    {
      code: 'TOP',
      name: 'Tongan Paʻanga',
      symbol: 'T$',
      precision: 2,
    },
    {
      code: 'TRY',
      name: 'Turkish Lira',
      symbol: '₺',
      precision: 2,
    },
    {
      code: 'TTD',
      name: 'Trinidad and Tobago Dollar',
      symbol: 'TT$',
      precision: 2,
    },
    {
      code: 'TWD',
      name: 'New Taiwan Dollar',
      symbol: 'NT$',
      precision: 2,
    },
    {
      code: 'TZS',
      name: 'Tanzanian Shilling',
      symbol: 'Sh',
      precision: 2,
    },
    {
      code: 'UAH',
      name: 'Ukrainian Hryvnia',
      symbol: '₴',
      precision: 2,
    },
    {
      code: 'UGX',
      name: 'Ugandan Shilling',
      symbol: 'USh',
      precision: 0,
    },
    { code: 'USD', name: 'United States Dollar', symbol: '$', precision: 2 },
    { code: 'UYU', name: 'Uruguayan Peso', symbol: '$U', precision: 2 },
    { code: 'UZS', name: 'Uzbekistani Som', symbol: 'soʻm', precision: 2 },
    { code: 'VES', name: 'Venezuelan Bolívar', symbol: 'Bs.S.', precision: 2 },
    { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', precision: 0 },
    { code: 'VUV', name: 'Vanuatu Vatu', symbol: 'VT', precision: 0 },
    { code: 'WST', name: 'Samoan Tala', symbol: 'WS$', precision: 2 },
    {
      code: 'XAF',
      name: 'Central African CFA Franc',
      symbol: 'FCFA',
      precision: 0,
    },
    { code: 'XCD', name: 'East Caribbean Dollar', symbol: '$', precision: 2 },
    {
      code: 'XOF',
      name: 'West African CFA Franc',
      symbol: 'CFA',
      precision: 0,
    },
    { code: 'XPF', name: 'CFP Franc', symbol: '₣', precision: 0 },
    { code: 'YER', name: 'Yemeni Rial', symbol: '﷼', precision: 2 },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R', precision: 2 },
    { code: 'ZMW', name: 'Zambian Kwacha', symbol: 'ZK', precision: 2 },
    { code: 'ZWL', name: 'Zimbabwean Dollar', symbol: '$', precision: 2 },
  ]

  const formatedPrice = (price: number, fiatCurrency: string): string => {
    // Get the currency symbol for the given fiat currency
    const symbol = FiatCurrencies.find(
      (currency) => currency.code === fiatCurrency,
    )?.symbol

    // Use Intl.NumberFormat to format the price
    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)

    return `${symbol}${formattedPrice}`
  }

  return {
    sleep,
    rand,
    ucFirst,
    properScroll,
    toast,
    countDecimals,
    priceFormatter,
    truncateText,
    time_since,
    formatedDate,
    sciToPrecision,
    generateTransactionData,
    generateEmptyMonthData,
    transactionItemDetails,
    formatUUID,
    useSparklineConfiguration,
    FiatCurrencies,
    formatedPrice,
    statusMap,
  }
}

export function toBigInt(value: number): bigint {
  return BigInt(Math.round(value * Math.pow(10, 18)))
}

export function fromBigInt(value: bigint): number {
  return Number(value) / Math.pow(10, 18)
}

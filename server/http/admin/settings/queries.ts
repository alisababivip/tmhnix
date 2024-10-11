import prisma from '~~/utils/prisma'

export async function updateSettings(data: any): Promise<void> {
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      let value = data[key]

      // Convert boolean values to 'Enabled' or 'Disabled'
      if (typeof value === 'boolean') {
        value = value ? 'Enabled' : 'Disabled'
      }

      // Convert number values to strings
      if (typeof value === 'number') {
        value = value.toString()
      }

      await prisma.settings.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    }
  }
}

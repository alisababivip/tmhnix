import colors from 'tailwindcss/colors'
export const useColors = () => {
  const primaryPresets = [
    {
      name: 'indigo',
      label: 'Indigo',
      shades: colors.indigo,
      class: 'bg-indigo-500',
    },
    {
      name: 'sky',
      label: 'Sky',
      shades: colors.sky,
      class: 'bg-sky-500',
    },
    {
      name: 'purple',
      label: 'Purple',
      shades: colors.purple,
      class: 'bg-purple-500',
    },
    {
      name: 'violet',
      label: 'Violet',
      shades: colors.violet,
      class: 'bg-violet-500',
    },
    {
      name: 'lime',
      label: 'Lime',
      shades: colors.lime,
      class: 'bg-lime-500',
    },
    {
      name: 'teal',
      label: 'Teal',
      shades: colors.teal,
      class: 'bg-teal-500',
    },
    {
      name: 'emerald',
      label: 'Emerald',
      shades: colors.emerald,
      class: 'bg-emerald-500',
    },
    {
      name: 'rose',
      label: 'Rose',
      shades: colors.rose,
      class: 'bg-rose-500',
    },
    {
      name: 'pink',
      label: 'Pink',
      shades: colors.pink,
      class: 'bg-pink-500',
    },
    {
      name: 'yellow',
      label: 'Yellow',
      shades: colors.yellow,
      class: 'bg-yellow-500',
    },
    {
      name: 'orange',
      label: 'Orange',
      shades: colors.orange,
      class: 'bg-orange-500',
    },
    {
      name: 'mauve',
      label: 'Custom',
      shades: {
        50: '#EEECF9',
        100: '#DCD8F3',
        200: '#B6AEE5',
        300: '#9488D8',
        400: '#6E5DCB',
        500: '#4E3CB9',
        600: '#3E2F92',
        700: '#302470',
        800: '#1F1849',
        900: '#100C27',
        950: '#080613',
      },
      class: 'bg-mauve-500',
    },
  ] as const

  const mutedPresets = [
    {
      name: 'gray',
      label: 'Gray',
      shades: colors.gray,
      class: 'bg-gray-300 dark:bg-gray-900',
    },
    {
      name: 'slate',
      label: 'Slate',
      shades: colors.slate,
      class: 'bg-slate-300 dark:bg-slate-900',
    },
    {
      name: 'stone',
      label: 'Stone',
      shades: colors.stone,
      class: 'bg-stone-300 dark:bg-stone-900',
    },
    {
      name: 'zinc',
      label: 'Zinc',
      shades: colors.zinc,
      class: 'bg-zinc-300 dark:bg-zinc-900',
    },
    {
      name: 'neutral',
      label: 'Neutral',
      shades: colors.neutral,
      class: 'bg-neutral-300 dark:bg-neutral-900',
    },
  ] as const

  return {
    primaryPresets,
    mutedPresets,
  }
}

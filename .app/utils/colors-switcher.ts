import chroma from 'chroma-js'

type ColorName = 'primary' | 'muted'
type ColorShade =
  | '50'
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900'
  | '950'

const shades = [
  '50',
  '100',
  '200',
  '300',
  '400',
  '500',
  '600',
  '700',
  '800',
  '900',
  '950',
] as const

const EMPTY_COLOR = '0 0 0'

/**
 * Convert color to RGB values, for use with Tailwind CSS variables.
 */
export const colorToRgb = (color: string): string => {
  if (!color) {
    return EMPTY_COLOR
  }

  return chroma(color)
    .rgb()
    .map((v) => {
      if (Number.isNaN(v)) {
        return 0
      }

      return Math.round(v)
    })
    .slice(0, 3) // Remove alpha channel if present
    .join(' ')
}

/**
 * Save a single color shade to localStorage.
 */
function saveColorToLocalStorage(
  name: ColorName,
  shade: ColorShade,
  color: string,
) {
  localStorage.setItem(`color-${name}-${shade}`, color)
}

/**
 * Load a single color shade from localStorage and apply it.
 */
function loadColorFromLocalStorage(name: ColorName, shade: ColorShade) {
  const color = localStorage.getItem(`color-${name}-${shade}`)
  if (color) {
    switchColor(name, shade, color)
  }
}

/**
 * Load all color shades from localStorage for a given ColorName.
 */
function loadAllShadesFromLocalStorage(name: ColorName) {
  for (const shade of shades) {
    loadColorFromLocalStorage(name, shade)
  }
}

/**
 * Set a tailwind color complete shade and save it to localStorage.
 */
export function switchColorShades(
  name: ColorName,
  shades: Record<ColorShade, string>,
) {
  Object.entries(shades).forEach(([shade, color]) => {
    switchColor(name, shade as ColorShade, color)
    saveColorToLocalStorage(name, shade as ColorShade, color)
  })
}

/**
 * Set a single tailwind color shade from a hex value and save it to localStorage.
 */
export function switchColor(name: ColorName, shade: ColorShade, color: string) {
  const rgb = colorToRgb(color)
  window.document.documentElement.style.setProperty(
    `--color-${name}-${shade}`,
    rgb,
  )
  saveColorToLocalStorage(name, shade, color)
}

/**
 * Reset all shades of a color and remove them from localStorage.
 */
export function resetColor(name: ColorName) {
  for (const shade of shades) {
    window.document.documentElement.style.removeProperty(
      `--color-${name}-${shade}`,
    )
    localStorage.removeItem(`color-${name}-${shade}`)
  }
}

// Load all shades from localStorage when the script runs.
// You may choose a more appropriate place to call this.
;['primary', 'muted'].forEach((name) => {
  loadAllShadesFromLocalStorage(name as ColorName)
})

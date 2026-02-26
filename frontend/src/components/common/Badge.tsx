const statusColors: Record<string, string> = {
  'aktív': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  'megszűnt': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  'felszámolás alatt': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  'csődeljárás alatt': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  'végelszámolás alatt': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  'kényszertörlés alatt': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

export function Badge({ text, variant }: { text: string; variant?: 'success' | 'danger' | 'warning' | 'neutral' }) {
  let colorClass: string
  if (variant) {
    const variants = {
      success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      warning: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    }
    colorClass = variants[variant]
  } else {
    colorClass = statusColors[text.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }

  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {text}
    </span>
  )
}

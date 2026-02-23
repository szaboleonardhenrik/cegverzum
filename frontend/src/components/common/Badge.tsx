const statusColors: Record<string, string> = {
  'aktív': 'bg-green-100 text-green-800',
  'megszűnt': 'bg-gray-100 text-gray-800',
  'felszámolás alatt': 'bg-red-100 text-red-800',
  'csődeljárás alatt': 'bg-red-100 text-red-800',
  'végelszámolás alatt': 'bg-orange-100 text-orange-800',
  'kényszertörlés alatt': 'bg-red-100 text-red-800',
}

export function Badge({ text, variant }: { text: string; variant?: 'success' | 'danger' | 'warning' | 'neutral' }) {
  let colorClass: string
  if (variant) {
    const variants = {
      success: 'bg-green-100 text-green-800',
      danger: 'bg-red-100 text-red-800',
      warning: 'bg-orange-100 text-orange-800',
      neutral: 'bg-gray-100 text-gray-800',
    }
    colorClass = variants[variant]
  } else {
    colorClass = statusColors[text.toLowerCase()] || 'bg-gray-100 text-gray-800'
  }

  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {text}
    </span>
  )
}

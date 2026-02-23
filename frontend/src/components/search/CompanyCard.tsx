import { Link } from 'react-router-dom'
import type { CompanyListItem } from '../../types'
import { Badge } from '../common/Badge'

const negativeEvents: { key: keyof CompanyListItem; label: string }[] = [
  { key: 'felszamolas', label: 'Felszámolás' },
  { key: 'csodeljras', label: 'Csődeljárás' },
  { key: 'vegelszamolas', label: 'Végelszámolás' },
  { key: 'kenyszertorles', label: 'Kényszertörlés' },
]

interface CompanyCardProps {
  company: CompanyListItem
  isWatched?: boolean
  onToggleWatch?: (companyId: number) => void
}

export function CompanyCard({ company, isWatched, onToggleWatch }: CompanyCardProps) {
  const activeNegatives = negativeEvents.filter(e => company[e.key] === true)

  return (
    <div className="relative group">
      <Link
        to={`/company/${company.id}`}
        className="block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 hover:shadow-md hover:border-teal/30 dark:hover:border-teal/30 transition-all no-underline text-inherit"
      >
        <div className="flex items-start justify-between mb-2 gap-2">
          <h3 className="text-lg font-semibold text-navy dark:text-blue-300 leading-tight pr-8">{company.nev}</h3>
          <div className="flex flex-wrap gap-1 shrink-0">
            <Badge text={company.statusz} />
            {activeNegatives.map(e => (
              <Badge key={e.key} text={e.label} variant="danger" />
            ))}
          </div>
        </div>
        {company.cegforma && (
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{company.cegforma}</span>
        )}
        <div className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-300">
          {company.adoszam && (
            <p><span className="text-gray-400 dark:text-gray-500">Adószám:</span> {company.adoszam}</p>
          )}
          {company.cegjegyzekszam && (
            <p><span className="text-gray-400 dark:text-gray-500">Cégjegyzékszám:</span> {company.cegjegyzekszam}</p>
          )}
          {company.szekhely && (
            <p><span className="text-gray-400 dark:text-gray-500">Székhely:</span> {company.szekhely}</p>
          )}
          {company.teaor_kod && (
            <p><span className="text-gray-400 dark:text-gray-500">TEÁOR:</span> {company.teaor_kod}</p>
          )}
          {company.fotevekenyseg && (
            <p><span className="text-gray-400 dark:text-gray-500">Fő tevékenység:</span> {company.fotevekenyseg}</p>
          )}
          {company.alapitas_datuma && (
            <p><span className="text-gray-400 dark:text-gray-500">Alapítás:</span> {company.alapitas_datuma}</p>
          )}
        </div>
      </Link>

      {/* Watch toggle — absolute positioned, outside the Link */}
      {onToggleWatch && (
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onToggleWatch(company.id)
          }}
          className={`absolute top-3 right-3 z-10 p-2 rounded-xl transition-all border-none cursor-pointer ${
            isWatched
              ? 'bg-yellow-50 text-yellow-500 hover:bg-yellow-100 hover:text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/50'
              : 'bg-gray-50 text-gray-300 hover:bg-yellow-50 hover:text-yellow-500 dark:bg-gray-700 dark:text-gray-500 dark:hover:bg-yellow-900/30 dark:hover:text-yellow-400 opacity-0 group-hover:opacity-100'
          } ${isWatched ? '' : 'sm:opacity-0 sm:group-hover:opacity-100 opacity-100'}`}
          title={isWatched ? 'Eltávolítás a figyelőlistáról' : 'Hozzáadás a figyelőlistához'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isWatched ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
          </svg>
        </button>
      )}
    </div>
  )
}

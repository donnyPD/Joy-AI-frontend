import { useState, Fragment } from 'react'
import { useTeamMetricsSummary } from '../features/team-members/teamMembersApi'
import {
  AlertTriangle,
  Clock,
  Calendar,
  MessageSquare,
  Star,
  ThumbsDown,
  ChevronDown,
  ChevronRight,
  Users,
  Loader2,
} from 'lucide-react'

interface KpiEntry {
  id: string
  teamMemberId: string
  kpiType: string
  date: string
  description?: string | null
  cost?: number | null
  createdAt: string
}

interface MemberMetrics {
  count: number
  entries: KpiEntry[]
}

interface TeamMemberSummary {
  id: string
  name: string
  photo?: string | null
  status: string
  metrics: Record<string, MemberMetrics>
}

const metricLabels: Record<
  string,
  { label: string; icon: typeof AlertTriangle; color: string }
> = {
  lastMinuteCallOffs: {
    label: 'Last Minute Call Offs',
    icon: AlertTriangle,
    color: 'text-red-500',
  },
  arrivingLate: { label: 'Arriving Late', icon: Clock, color: 'text-orange-500' },
  excusedTimeOffs: {
    label: 'Excused Time Offs',
    icon: Calendar,
    color: 'text-blue-500',
  },
  complaints: { label: 'Complaints', icon: MessageSquare, color: 'text-purple-500' },
  npsMonthly: { label: 'NPS Monthly', icon: Star, color: 'text-yellow-500' },
  googleReviewsObtained: {
    label: 'Google Reviews',
    icon: Star,
    color: 'text-green-500',
  },
  damages: { label: 'Damages', icon: ThumbsDown, color: 'text-red-600' },
}

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

export default function TeamMetricsSummary() {
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>(
    new Date().getMonth() + 1,
  )
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [expandedRows, setExpandedRows] = useState<Record<string, string | null>>(
    {},
  )
  const [showDismissed, setShowDismissed] = useState(false)

  const monthParam =
    selectedMonth === 'all'
      ? `${selectedYear}-all`
      : `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`

  const { data, isLoading } = useTeamMetricsSummary(monthParam)

  const toggleRowExpand = (memberId: string, metricType: string) => {
    setExpandedRows((prev) => {
      const currentExpanded = prev[memberId]
      if (currentExpanded === metricType) {
        return { ...prev, [memberId]: null }
      }
      return { ...prev, [memberId]: metricType }
    })
  }

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      const month = date.toLocaleString('default', { month: 'short' })
      const day = date.getDate()
      const year = date.getFullYear()
      return `${month} ${day}, ${year}`
    } catch {
      return dateString
    }
  }

  const renderMetricsTable = (
    members: TeamMemberSummary[],
    isDismissed: boolean = false,
  ) => {
    if (members.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          {isDismissed ? 'No dismissed team members' : 'No cleaning techs found'}
        </div>
      )
    }

    // Sort members: those with entries first, then by total count descending
    const sortedMembers = [...members].sort((a, b) => {
      const getTotalCount = (member: TeamMemberSummary) =>
        Object.values(member.metrics).reduce(
          (sum, m) => sum + (m?.count || 0),
          0,
        )
      return getTotalCount(b) - getTotalCount(a)
    })

    return (
      <div className="border rounded-md">
        <div className="bg-white border-b">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-[200px]">
                  Team Member
                </th>
                {Object.entries(metricLabels).map(([key, { label }]) => (
                  <th
                    key={key}
                    className="px-4 py-3 text-center text-sm font-medium text-gray-700 min-w-[100px]"
                  >
                    <span className="text-xs">{label}</span>
                  </th>
                ))}
              </tr>
            </thead>
          </table>
        </div>
        <div className="overflow-auto max-h-[50vh]">
          <table className="min-w-full divide-y divide-gray-200">
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedMembers.map((member) => {
                const expandedMetric = expandedRows[member.id]
                const expandedData = expandedMetric
                  ? member.metrics[expandedMetric]
                  : null

                return (
                  <Fragment key={member.id}>
                    <tr className={isDismissed ? 'opacity-60' : ''}>
                      <td className="px-4 py-3 whitespace-nowrap w-[200px]">
                        <div className="flex items-center gap-3">
                          {member.photo ? (
                            <img
                              src={member.photo}
                              alt={member.name}
                              className="h-8 w-8 rounded-full"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-medium">
                              {member.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <span className="font-medium text-gray-900">
                              {member.name}
                            </span>
                            {isDismissed && (
                              <span className="ml-2 text-xs text-red-500">
                                (Dismissed)
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      {Object.entries(metricLabels).map(([key, { color }]) => {
                        const metricData = member.metrics[key]
                        const count = metricData?.count || 0
                        const isExpanded = expandedMetric === key

                        return (
                          <td
                            key={key}
                            className="px-4 py-3 text-center min-w-[100px]"
                          >
                            {count > 0 ? (
                              <button
                                onClick={() => toggleRowExpand(member.id, key)}
                                className={`${color} hover:bg-blue-50 hover:text-blue-600 px-3 py-1 rounded-md transition-colors flex items-center justify-center gap-1 mx-auto`}
                              >
                                <span className="font-semibold">{count}</span>
                                {isExpanded ? (
                                  <ChevronDown className="h-3 w-3" />
                                ) : (
                                  <ChevronRight className="h-3 w-3" />
                                )}
                              </button>
                            ) : (
                              <span className="text-gray-400">0</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                    {expandedData && expandedData.entries.length > 0 && (
                      <tr key={`${member.id}-expanded`} className="bg-gray-50">
                        <td colSpan={8} className="px-4 py-4">
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm mb-2 text-gray-900">
                              {metricLabels[expandedMetric!]?.label} Details for{' '}
                              {member.name}
                            </h4>
                            <div className="space-y-2">
                              {expandedData.entries.map((entry) => (
                                <div
                                  key={entry.id}
                                  className="bg-white rounded-lg p-3 border border-gray-200"
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <p className="text-sm text-gray-900">
                                        {entry.description || 'No description'}
                                      </p>
                                      {entry.cost && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          Cost: ${entry.cost}
                                        </p>
                                      )}
                                    </div>
                                    <span className="text-xs text-gray-500 ml-4">
                                      {formatDate(entry.date)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Team Metrics Summary
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={String(selectedYear)}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm w-[100px]"
            >
              {years.map((year) => (
                <option key={year} value={String(year)}>
                  {year}
                </option>
              ))}
            </select>
            <select
              value={String(selectedMonth)}
              onChange={(e) =>
                setSelectedMonth(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="px-3 py-2 border border-gray-300 rounded-md text-sm w-[140px]"
            >
              <option value="all">All Months</option>
              {months.map((month, index) => (
                <option key={month} value={String(index + 1)}>
                  {month}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="space-y-6">
            {renderMetricsTable(data?.active || [])}

            {data?.dismissed && data.dismissed.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowDismissed(!showDismissed)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <span className="text-lg font-semibold text-gray-600">
                    History (Dismissed Team Members)
                  </span>
                  {showDismissed ? (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                {showDismissed && (
                  <div className="mt-4">
                    {renderMetricsTable(data.dismissed, true)}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

import { useState, useMemo } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../store/hooks'
import { logout } from '../features/auth/authSlice'
import { useTeamMember } from '../features/team-members/teamMembersApi'
import { useKpiEntries, useUpdateKpiEntry, useDeleteKpiEntry } from '../features/kpi-entries/kpiEntriesApi'
import { useInventoryNotes } from '../features/inventory-notes/inventoryNotesApi'
import { useInventoryPurchases } from '../features/inventory-purchases/inventoryPurchasesApi'
import UserFormDrawer from '../components/UserFormDrawer'
import KpiEntryDialog from '../components/KpiEntryDialog'
import NoteEntryDialog from '../components/NoteEntryDialog'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
const PINK_COLOR = '#E91E63'

const kpiTypes = [
  { type: 'lastMinuteCallOffs', name: 'Last Minute Call Offs', icon: '⚠️', color: 'text-red-500' },
  { type: 'arrivingLate', name: 'Arriving Late', icon: '🕐', color: 'text-orange-500' },
  { type: 'excusedTimeOffs', name: 'Excused Time Offs', icon: '📅', color: 'text-blue-500' },
  { type: 'complaints', name: 'Complaints', icon: '👎', color: 'text-red-600' },
  { type: 'npsMonthly', name: 'NPS Monthly', icon: '📈', color: 'text-green-500' },
  { type: 'googleReviewsObtained', name: 'Google Reviews Obtained', icon: '⭐', color: 'text-yellow-500' },
  { type: 'damages', name: 'Damages', icon: '⚠️', color: 'text-purple-500' },
]

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function getCurrentYear(): number {
  return new Date().getFullYear()
}

function generateYearOptions(): Array<{ value: string; label: string }> {
  const options: Array<{ value: string; label: string }> = []
  const currentYear = getCurrentYear()
  
  for (let i = 0; i < 5; i++) {
    const year = currentYear - i
    options.push({
      value: year.toString(),
      label: year.toString()
    })
  }
  return options
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatDate(dateString: string): string {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateString
  }
}

export default function TeamMemberDetail() {
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const { data: member, isLoading } = useTeamMember(id)

  const handleSignOut = () => {
    dispatch(logout())
    navigate('/signin')
  }

  const handleEdit = () => {
    setDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setDrawerOpen(false)
  }

  const [activeTab, setActiveTab] = useState<'metrics' | 'notes' | 'inventory'>('metrics')
  const [filterYear, setFilterYear] = useState<string>(getCurrentYear().toString())
  const [selectedKpi, setSelectedKpi] = useState<{ type: string; name: string } | null>(null)
  const [selectedNote, setSelectedNote] = useState<any | null>(null)
  const [selectedPurchase, setSelectedPurchase] = useState<any | null>(null)
  const [kpiDialogOpen, setKpiDialogOpen] = useState(false)
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [entryToEdit, setEntryToEdit] = useState<any | null>(null)
  const [editDescription, setEditDescription] = useState('')
  const [editCost, setEditCost] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null)

  const { data: kpiEntries = [] } = useKpiEntries(id)
  const { data: notes = [] } = useInventoryNotes(id)
  const { data: inventoryPurchases = [] } = useInventoryPurchases(id, parseInt(filterYear))
  const updateKpiEntryMutation = useUpdateKpiEntry()
  const deleteKpiEntryMutation = useDeleteKpiEntry()

  const validFilter = filterYear && !isNaN(parseInt(filterYear))
  const filterYearNum = validFilter ? parseInt(filterYear) : null

  const parseYear = (dateStr: string): number | null => {
    if (!dateStr) return null
    const isoMatch = dateStr.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/)
    if (isoMatch) return parseInt(isoMatch[1])
    const usMatch = dateStr.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})$/)
    if (usMatch) return parseInt(usMatch[3])
    const year4Match = dateStr.match(/\b(20[0-9]{2})\b/)
    if (year4Match) return parseInt(year4Match[1])
    return null
  }

  const matchesYear = (dateStr: string): boolean => {
    if (!validFilter || !dateStr) return false
    const year = parseYear(dateStr)
    return year === filterYearNum
  }

  const filteredKpiEntries = useMemo(() => {
    if (!validFilter) return []
    return kpiEntries.filter(entry => matchesYear(entry.date))
  }, [kpiEntries, filterYear, validFilter])

  const filteredNotes = useMemo(() => {
    if (!validFilter) return []
    return notes.filter(note => matchesYear(note.nyTimestamp))
  }, [notes, filterYear, validFilter])

  const getFilteredKpiEntriesByType = (type: string) => {
    return filteredKpiEntries.filter((entry) => entry.kpiType === type)
  }

  const parseMonth = (dateStr: string): number | null => {
    if (!dateStr) return null
    const isoMatch = dateStr.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/)
    if (isoMatch) return parseInt(isoMatch[2]) - 1
    const usMatch = dateStr.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})$/)
    if (usMatch) return parseInt(usMatch[1]) - 1
    for (let i = 0; i < monthNames.length; i++) {
      if (dateStr.includes(monthNames[i])) return i
    }
    return null
  }

  const getChartDataForKpi = (type: string) => {
    const entries = getFilteredKpiEntriesByType(type)
    const monthlyData: Record<number, number> = {}
    for (let i = 0; i < 12; i++) {
      monthlyData[i] = 0
    }
    entries.forEach((entry) => {
      const month = parseMonth(entry.date)
      if (month !== null && month >= 0 && month < 12) {
        if (type === 'damages' && entry.cost) {
          monthlyData[month] += parseFloat(entry.cost) || 0
        } else {
          monthlyData[month] += 1
        }
      }
    })
    return Object.entries(monthlyData).map(([monthIndex, value]) => ({
      month: monthNames[parseInt(monthIndex)],
      value: value,
    }))
  }

  const getKpiColor = (type: string) => {
    const kpi = kpiTypes.find(k => k.type === type)
    const colorMap: Record<string, string> = {
      'text-red-500': '#ef4444',
      'text-orange-500': '#f97316',
      'text-blue-500': '#3b82f6',
      'text-red-600': '#dc2626',
      'text-green-500': '#22c55e',
      'text-yellow-500': '#eab308',
      'text-purple-500': '#a855f7',
    }
    return colorMap[kpi?.color || 'text-primary'] || '#3b82f6'
  }

  const handleOpenKpiDialog = (type: string, name: string) => {
    setSelectedKpi({ type, name })
    setKpiDialogOpen(true)
  }

  const handleEditKpiEntry = (entry: any) => {
    setEntryToEdit(entry)
    setEditDescription(entry.description || '')
    setEditCost(entry.cost || '')
    setEditDialogOpen(true)
  }

  const handleDeleteKpiEntry = (entryId: string) => {
    setEntryToDelete(entryId)
    setDeleteDialogOpen(true)
  }

  const confirmEditEntry = () => {
    if (entryToEdit && id) {
      updateKpiEntryMutation.mutate({
        id: entryToEdit.id,
        data: { description: editDescription, cost: editCost || undefined },
        teamMemberId: id,
      }, {
        onSuccess: () => {
          setEditDialogOpen(false)
          setEntryToEdit(null)
        }
      })
    }
  }

  const confirmDeleteEntry = () => {
    if (entryToDelete && id) {
      deleteKpiEntryMutation.mutate({
        id: entryToDelete,
        teamMemberId: id,
      }, {
        onSuccess: () => {
          setDeleteDialogOpen(false)
          setEntryToDelete(null)
        }
      })
    }
  }

  const yearOptions = generateYearOptions()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="h-32 bg-gray-200 rounded mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="text-center text-gray-500">
              Team member not found
            </div>
            <div className="mt-4 text-center">
              <Link
                to="/operations/team"
                className="text-blue-600 hover:text-blue-800"
              >
                Back to Team
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link to="/dashboard" className="text-xl font-bold text-gray-900">
                JOY AI
              </Link>
              <Link to="/clients" className="text-gray-700 hover:text-gray-900 font-medium">
                Clients
              </Link>
              <Link to="/quotes" className="text-gray-700 hover:text-gray-900 font-medium">
                Quotes
              </Link>
              <Link to="/jobs" className="text-gray-700 hover:text-gray-900 font-medium">
                Jobs
              </Link>
              <Link to="/operations" className="text-gray-700 hover:text-gray-900 font-medium">
                Operations
              </Link>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-joy-pink border border-gray-300 rounded-lg hover:border-joy-pink transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            to="/operations/team"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Team
          </Link>
        </div>

        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {member.photo ? (
              <img
                src={member.photo}
                alt={member.name}
                className="w-24 h-24 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                {getInitials(member.name)}
              </div>
            )}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {member.name}
                    {member.slackId && (
                      <span className="text-gray-500 font-normal text-lg ml-2">
                        ({member.slackId})
                      </span>
                    )}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        member.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : member.status === 'On Leave'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {member.status}
                    </span>
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      {member.type}
                    </span>
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      {member.employmentType}
                    </span>
                    {member.starOfMonth && (
                      <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                        <svg className="w-4 h-4 fill-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        <span className="text-sm font-semibold">Star of the Month</span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center"
                  style={{ backgroundColor: PINK_COLOR }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#C2185B')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = PINK_COLOR)}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <svg className="h-5 w-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900">{member.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="h-5 w-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-gray-900">{member.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="h-5 w-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-gray-900">{member.address || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <svg className="h-5 w-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">Birthday</p>
                  <p className="text-gray-900">{member.birthday ? formatDate(member.birthday) : 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="h-5 w-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">Primary Language</p>
                  <p className="text-gray-900">{member.primaryLanguage || 'Not provided'}</p>
                </div>
              </div>
              {member.workStartDate && (
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">Work Start Date</p>
                    <p className="text-gray-900">{formatDate(member.workStartDate)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Employment Details */}
        {(member.trainingStartDate || member.trainingEndDate || member.workStartDate) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Employment Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {member.trainingStartDate && (
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v6.055" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">Training Start Date</p>
                    <p className="text-gray-900">{formatDate(member.trainingStartDate)}</p>
                  </div>
                </div>
              )}
              {member.trainingEndDate && (
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v6.055" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">Training End Date</p>
                    <p className="text-gray-900">{formatDate(member.trainingEndDate)}</p>
                  </div>
                </div>
              )}
              {member.workStartDate && (
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">Joining Date</p>
                    <p className="text-gray-900">{formatDate(member.workStartDate)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tabs Section */}
        <div className="mt-8">
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('metrics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'metrics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Metrics
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'notes'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Notes
              </button>
              <button
                onClick={() => setActiveTab('inventory')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'inventory'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Inventory
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="grid grid-cols-1 lg:grid-cols-[0.3fr,0.7fr] gap-6">
            {/* Left Panel - List */}
            <div>
              {activeTab === 'metrics' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4">Metrics</h3>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {kpiTypes.map((kpi) => {
                      const entries = getFilteredKpiEntriesByType(kpi.type)
                      const isSelected = selectedKpi?.type === kpi.type
                      return (
                        <div
                          key={kpi.type}
                          onClick={() => setSelectedKpi({ type: kpi.type, name: kpi.name })}
                          className={`p-3 rounded-lg cursor-pointer transition-all border ${
                            isSelected
                              ? 'bg-blue-50 border-blue-500'
                              : 'bg-white hover:bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{kpi.icon}</span>
                              <span className="text-sm font-medium">{kpi.name}</span>
                            </div>
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs">{entries.length}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4">Notes</h3>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {filteredNotes.length === 0 ? (
                      <p className="text-sm text-gray-500 italic text-center py-8">
                        No notes for {filterYear}
                      </p>
                    ) : (
                      filteredNotes.map((note) => {
                        const isSelected = selectedNote?.id === note.id
                        return (
                          <div
                            key={note.id}
                            onClick={() => setSelectedNote(note)}
                            className={`p-3 rounded-lg cursor-pointer transition-all border ${
                              isSelected
                                ? 'bg-blue-50 border-blue-500'
                                : 'bg-white hover:bg-gray-50 border-gray-200'
                            }`}
                          >
                            <p className="text-xs text-gray-500 mb-1">{note.nyTimestamp}</p>
                            <p className="text-sm line-clamp-2">{note.noteText}</p>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'inventory' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4">Inventory Purchases</h3>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {inventoryPurchases.length === 0 ? (
                      <p className="text-sm text-gray-500 italic text-center py-8">
                        No inventory purchases for {filterYear}
                      </p>
                    ) : (
                      inventoryPurchases.map((purchase) => {
                        const isSelected = selectedPurchase?.id === purchase.id
                        return (
                          <div
                            key={purchase.id}
                            onClick={() => setSelectedPurchase(purchase)}
                            className={`p-3 rounded-lg cursor-pointer transition-all border ${
                              isSelected
                                ? 'bg-blue-50 border-blue-500'
                                : 'bg-white hover:bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs text-gray-500">{purchase.purchaseDate}</p>
                              {purchase.isCompleted && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Completed</span>
                              )}
                            </div>
                            <p className="text-sm line-clamp-2">{purchase.itemsRaw}</p>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel - Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {activeTab === 'metrics'
                    ? (selectedKpi ? selectedKpi.name : 'Select an item')
                    : activeTab === 'notes'
                    ? (selectedNote ? 'Note Details' : 'Select a Note')
                    : (selectedPurchase ? 'Purchase Details' : 'Select a Purchase')}
                </h3>
                <div className="flex items-center gap-2">
                  <select
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                  >
                    {yearOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {activeTab === 'metrics' && selectedKpi && (
                    <button
                      onClick={() => handleOpenKpiDialog(selectedKpi.type, selectedKpi.name)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Add Entry
                    </button>
                  )}
                  {activeTab === 'notes' && (
                    <button
                      onClick={() => setNoteDialogOpen(true)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Add Note
                    </button>
                  )}
                </div>
              </div>

              <div className="h-[500px] flex flex-col">
                {activeTab === 'metrics' ? (
                  !selectedKpi ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                      <p className="text-gray-500">Select an item from the list to view its entries</p>
                    </div>
                  ) : (
                    <div className="flex flex-col h-full">
                      <div className="h-1/2 min-h-[180px] mb-4">
                        {getChartDataForKpi(selectedKpi.type).every(d => d.value === 0) ? (
                          <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border border-dashed">
                            <p className="text-gray-500 text-sm">No data to display</p>
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={getChartDataForKpi(selectedKpi.type)}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                              <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 11 }} />
                              <YAxis
                                stroke="#6b7280"
                                tick={{ fontSize: 11 }}
                                allowDecimals={selectedKpi.type === 'damages'}
                                tickFormatter={selectedKpi.type === 'damages' ? (value) => `$${value}` : undefined}
                              />
                              <Tooltip
                                formatter={(value: any) => [
                                  selectedKpi.type === 'damages' ? `$${value}` : value,
                                  selectedKpi.type === 'damages' ? 'Cost' : 'Count'
                                ]}
                              />
                              <Line
                                type="monotone"
                                dataKey="value"
                                stroke={getKpiColor(selectedKpi.type)}
                                strokeWidth={2}
                                dot={{ r: 5, fill: getKpiColor(selectedKpi.type), strokeWidth: 2 }}
                                activeDot={{ r: 7 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                      <div className="h-1/2 flex-1 overflow-y-auto">
                        <div className="space-y-3">
                          {getFilteredKpiEntriesByType(selectedKpi.type).length === 0 ? (
                            <div className="text-center py-8">
                              <p className="text-gray-500 italic">No entries for {selectedKpi.name} in {filterYear}</p>
                              <button
                                onClick={() => handleOpenKpiDialog(selectedKpi.type, selectedKpi.name)}
                                className="mt-4 px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
                              >
                                Add Entry
                              </button>
                            </div>
                          ) : (
                            getFilteredKpiEntriesByType(selectedKpi.type).map((entry) => (
                              <div key={entry.id} className="p-4 bg-gray-50 rounded-lg border">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium">{entry.date}</p>
                                  <div className="flex items-center gap-2">
                                    {selectedKpi.type === 'damages' && entry.cost && (
                                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                                        ${parseFloat(entry.cost).toFixed(2)}
                                      </span>
                                    )}
                                    <button
                                      onClick={() => handleEditKpiEntry(entry)}
                                      className="p-1 text-gray-500 hover:text-blue-600"
                                      disabled={updateKpiEntryMutation.isPending}
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      onClick={() => handleDeleteKpiEntry(entry.id)}
                                      className="p-1 text-gray-500 hover:text-red-600"
                                      disabled={deleteKpiEntryMutation.isPending}
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{entry.description}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )
                ) : activeTab === 'notes' ? (
                  <div className="h-full overflow-y-auto">
                    {!selectedNote ? (
                      <div className="flex flex-col items-center justify-center h-full text-center py-12">
                        <p className="text-gray-500">Select a note from the list to view its full content</p>
                      </div>
                    ) : (
                      <div>
                        <div className="mb-4">
                          <p className="text-sm text-gray-500">{selectedNote.nyTimestamp}</p>
                        </div>
                        <div className="border-t border-gray-200 mb-4"></div>
                        <p className="text-gray-900 whitespace-pre-wrap">{selectedNote.noteText}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full overflow-y-auto">
                    {!selectedPurchase ? (
                      <div className="flex flex-col items-center justify-center h-full text-center py-12">
                        <p className="text-gray-500">Select a purchase from the list to view its details</p>
                      </div>
                    ) : (
                      <div>
                        <div className="mb-4">
                          <p className="text-sm text-gray-500">{selectedPurchase.purchaseDate}</p>
                          {selectedPurchase.isCompleted && (
                            <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Completed</span>
                          )}
                        </div>
                        <div className="border-t border-gray-200 mb-4"></div>
                        <p className="text-gray-900 whitespace-pre-wrap">{selectedPurchase.itemsRaw}</p>
                        {selectedPurchase.itemsParsed && (
                          <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Parsed Items:</p>
                            <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto">
                              {JSON.stringify(selectedPurchase.itemsParsed, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      
      {/* Dialogs */}
      {kpiDialogOpen && selectedKpi && (
        <KpiEntryDialog
          open={kpiDialogOpen}
          onClose={() => {
            setKpiDialogOpen(false)
            setSelectedKpi(null)
          }}
          teamMemberId={id || ''}
          kpiType={selectedKpi.type}
          kpiTypeName={selectedKpi.name}
        />
      )}

      {noteDialogOpen && (
        <NoteEntryDialog
          open={noteDialogOpen}
          onClose={() => setNoteDialogOpen(false)}
          teamMemberId={id || ''}
          teamMemberName={member?.name}
        />
      )}

      {/* Edit KPI Entry Dialog */}
      {editDialogOpen && entryToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-semibold mb-4">Edit Entry</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              {entryToEdit.kpiType === 'damages' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editCost}
                    onChange={(e) => setEditCost(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setEditDialogOpen(false)
                    setEntryToEdit(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmEditEntry}
                  disabled={updateKpiEntryMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {updateKpiEntryMutation.isPending ? 'Updating...' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-semibold mb-4">Delete Entry</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this entry? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteDialogOpen(false)
                  setEntryToDelete(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteEntry}
                disabled={deleteKpiEntryMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {deleteKpiEntryMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

<UserFormDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        mode="edit"
        memberId={id}
      />
    </div>
  )
}

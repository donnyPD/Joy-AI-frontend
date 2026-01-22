import { useState, useMemo, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../store/hooks'
import { logout } from '../features/auth/authSlice'
import { useTeamMember, useUpdateTeamMember, useCustomMetricDefinitions, type CustomMetricDefinition, type MetricField } from '../features/team-members/teamMembersApi'
import { useKpiEntries, useUpdateKpiEntry, useDeleteKpiEntry } from '../features/kpi-entries/kpiEntriesApi'
import { useInventoryNotes, useDeleteInventoryNote } from '../features/inventory-notes/inventoryNotesApi'
import { useInventoryPurchases, useUpdateInventoryPurchase, useDeleteInventoryPurchase } from '../features/inventory-purchases/inventoryPurchasesApi'
import UserFormDrawer from '../components/UserFormDrawer'
import NoteEntryDialog from '../components/NoteEntryDialog'
import CustomMetricEntryDialog from '../components/CustomMetricEntryDialog'
import { CalendarDays, Type, Upload, DollarSign, Hash, Image, X, Edit, TrendingUp, StickyNote, Package, Pencil, Trash2 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

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

const compressImage = (file: File, maxWidth: number = 800, maxHeight: number = 800, quality: number = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = document.createElement('img')
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        
        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }
        
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)
        
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality)
        resolve(compressedBase64)
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function TeamMemberDetail() {
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const { data: member, isLoading } = useTeamMember(id)
  const updateMutation = useUpdateTeamMember()

  // Edit state for sections
  const [editingSection, setEditingSection] = useState<'contact' | 'personal' | 'employment' | null>(null)
  const [editFormData, setEditFormData] = useState<{
    email?: string
    phone?: string
    address?: string
    birthday?: string
    primaryLanguage?: string
    workStartDate?: string
    trainingStartDate?: string
    trainingEndDate?: string
  }>({})

  const handleSignOut = () => {
    dispatch(logout())
    navigate('/signin')
  }

  const handleCloseDrawer = () => {
    setDrawerOpen(false)
  }

  // Helper function to convert date to YYYY-MM-DD format for date inputs
  const formatDateForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    } catch {
      return ''
    }
  }

  // Start editing a section
  const handleStartEdit = (section: 'contact' | 'personal' | 'employment') => {
    if (!member) return

    if (section === 'contact') {
      setEditFormData({
        email: member.email || '',
        phone: member.phone || '',
        address: member.address || '',
      })
    } else if (section === 'personal') {
      setEditFormData({
        birthday: formatDateForInput(member.birthday),
        primaryLanguage: member.primaryLanguage || '',
        workStartDate: formatDateForInput(member.workStartDate),
      })
    } else if (section === 'employment') {
      setEditFormData({
        trainingStartDate: formatDateForInput(member.trainingStartDate),
        trainingEndDate: formatDateForInput(member.trainingEndDate),
        workStartDate: formatDateForInput(member.workStartDate),
      })
    }
    setEditingSection(section)
  }

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingSection(null)
    setEditFormData({})
  }

  // Handle field change
  const handleFieldChange = (field: string, value: string) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Save changes
  const handleSaveEdit = () => {
    if (!member || !editingSection) return

    const updateData: any = {}

    if (editingSection === 'contact') {
      updateData.email = editFormData.email
      updateData.phone = editFormData.phone
      updateData.address = editFormData.address
    } else if (editingSection === 'personal') {
      updateData.birthday = editFormData.birthday || null
      updateData.primaryLanguage = editFormData.primaryLanguage
      updateData.workStartDate = editFormData.workStartDate || null
    } else if (editingSection === 'employment') {
      updateData.trainingStartDate = editFormData.trainingStartDate || null
      updateData.trainingEndDate = editFormData.trainingEndDate || null
      updateData.workStartDate = editFormData.workStartDate || null
    }

    updateMutation.mutate(
      { id: member.id, data: updateData },
      {
        onSuccess: () => {
          setEditingSection(null)
          setEditFormData({})
        },
      },
    )
  }

  const [activeTab, setActiveTab] = useState<'metrics' | 'notes' | 'inventory'>('metrics')
  const [filterYear, setFilterYear] = useState<string>(getCurrentYear().toString())
  const [selectedKpi, setSelectedKpi] = useState<{ type: string; name: string; isCustom?: boolean; customMetric?: CustomMetricDefinition } | null>(null)
  const [selectedNote, setSelectedNote] = useState<any | null>(null)
  const [selectedPurchase, setSelectedPurchase] = useState<any | null>(null)
  const [customMetricDialogOpen, setCustomMetricDialogOpen] = useState(false)
  const [selectedCustomMetric, setSelectedCustomMetric] = useState<CustomMetricDefinition | null>(null)
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)
  const [noteToEdit, setNoteToEdit] = useState<any | null>(null)
  const [noteDeleteDialogOpen, setNoteDeleteDialogOpen] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null)
  const [purchaseEditDialogOpen, setPurchaseEditDialogOpen] = useState(false)
  const [purchaseToEdit, setPurchaseToEdit] = useState<any | null>(null)
  const [editPurchaseDate, setEditPurchaseDate] = useState('')
  const [editPurchaseItems, setEditPurchaseItems] = useState('')
  const [editPurchaseCompleted, setEditPurchaseCompleted] = useState(false)
  const [purchaseDeleteDialogOpen, setPurchaseDeleteDialogOpen] = useState(false)
  const [purchaseToDelete, setPurchaseToDelete] = useState<string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [entryToEdit, setEntryToEdit] = useState<any | null>(null)
  const [editDescription, setEditDescription] = useState('')
  const [editCost, setEditCost] = useState('')
  const [editingCustomMetric, setEditingCustomMetric] = useState<CustomMetricDefinition | null>(null)
  const [editFieldValues, setEditFieldValues] = useState<Record<string, string>>({})
  const [editEntryDate, setEditEntryDate] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null)

  const { data: kpiEntries = [] } = useKpiEntries(id)
  const { data: notes = [] } = useInventoryNotes(id)
  const { data: inventoryPurchases = [] } = useInventoryPurchases(id, parseInt(filterYear))
  const { data: customMetricDefinitions = [] } = useCustomMetricDefinitions()
  const updateKpiEntryMutation = useUpdateKpiEntry()
  const deleteKpiEntryMutation = useDeleteKpiEntry()
  const deleteNoteMutation = useDeleteInventoryNote()
  const updatePurchaseMutation = useUpdateInventoryPurchase()
  const deletePurchaseMutation = useDeleteInventoryPurchase()
  
  // Filter to only active custom metrics
  const activeCustomMetrics = useMemo(() => {
    return customMetricDefinitions.filter(metric => metric.isActive)
  }, [customMetricDefinitions])

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

  // Sync selectedNote with updated notes from the notes array
  useEffect(() => {
    if (selectedNote && notes.length > 0) {
      const updatedNote = notes.find(n => n.id === selectedNote.id)
      if (updatedNote) {
        // Update if noteText or nyTimestamp changed
        if (updatedNote.noteText !== selectedNote.noteText || updatedNote.nyTimestamp !== selectedNote.nyTimestamp) {
          setSelectedNote(updatedNote)
        }
      }
    }
  }, [notes]) // Only depend on notes to avoid infinite loops

  const getFilteredKpiEntriesByType = (type: string) => {
    return filteredKpiEntries.filter((entry) => entry.kpiType === type)
  }

  // Chart data preparation
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const parseMonth = (dateStr: string): number | null => {
    if (!dateStr) return null
    
    const isoMatch = dateStr.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/)
    if (isoMatch) {
      return parseInt(isoMatch[2]) - 1
    }
    
    const usMatch = dateStr.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})$/)
    if (usMatch) {
      return parseInt(usMatch[1]) - 1
    }
    
    for (let i = 0; i < monthNames.length; i++) {
      if (dateStr.includes(monthNames[i])) {
        return i
      }
    }
    
    return null
  }

  const getChartDataForKpi = (type: string) => {
    const entries = getFilteredKpiEntriesByType(type)
    const monthlyData: Record<number, number> = {}
    
    // Initialize all months to 0
    for (let i = 0; i < 12; i++) {
      monthlyData[i] = 0
    }
    
    // Check if this metric has a dollarValue field
    const customMetric = activeCustomMetrics.find(m => m.id === type)
    const hasDollarValueField = customMetric?.fields.some(f => f.type === 'dollarValue')
    
    entries.forEach((entry) => {
      const month = parseMonth(entry.date)
      if (month !== null && month >= 0 && month < 12) {
        if (hasDollarValueField && entry.cost) {
          // Sum dollar values
          monthlyData[month] += parseFloat(entry.cost) || 0
        } else {
          // Count entries
          monthlyData[month] += 1
        }
      }
    })
    
    const chartData = Object.entries(monthlyData)
      .map(([monthIndex, value]) => ({
        month: monthNames[parseInt(monthIndex)],
        value: value,
      }))
    
    return chartData
  }

  const getMetricColor = (metric: CustomMetricDefinition | undefined): string => {
    if (!metric) return '#3b82f6' // Default blue
    
    const colorMap: Record<string, string> = {
      red: '#ef4444',
      orange: '#f97316',
      yellow: '#eab308',
      green: '#22c55e',
      blue: '#3b82f6',
      purple: '#a855f7',
      pink: '#ec4899',
    }
    
    return colorMap[metric.color || 'blue'] || '#3b82f6'
  }

  // Get field type icon helper
  const getFieldTypeIcon = (type: MetricField['type']) => {
    switch (type) {
      case 'date':
        return CalendarDays
      case 'text':
        return Type
      case 'upload':
        return Upload
      case 'dollarValue':
        return DollarSign
      case 'number':
        return Hash
      case 'image':
        return Image
      default:
        return Type
    }
  }

  const handleEditFieldChange = (fieldId: string, value: string) => {
    setEditFieldValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }))
  }


  const handleEditKpiEntry = (entry: any) => {
    setEntryToEdit(entry)
    
    // Check if this is a custom metric entry
    const customMetric = activeCustomMetrics.find(m => m.id === entry.kpiType)
    
    if (customMetric) {
      // It's a custom metric entry
      setEditingCustomMetric(customMetric)
      
      // Parse JSON from description
      let parsedValues: Record<string, any> = {}
      try {
        parsedValues = JSON.parse(entry.description || '{}')
      } catch {
        // If parsing fails, try to use description as-is
        parsedValues = { description: entry.description || '' }
      }
      
      // Initialize field values from parsed JSON
      const fieldValues: Record<string, string> = {}
      customMetric.fields.forEach((field) => {
        // Try to get value by field ID first, then by field name
        fieldValues[field.id] = String(parsedValues[field.id] || parsedValues[field.name] || '')
      })
      
      setEditFieldValues(fieldValues)
      
      // Find date field or use entry.date
      const dateField = customMetric.fields.find((f) => f.type === 'date')
      setEditEntryDate(dateField ? fieldValues[dateField.id] : entry.date || '')
      
      // Find dollarValue field for cost
      const dollarValueField = customMetric.fields.find((f) => f.type === 'dollarValue')
      if (dollarValueField && fieldValues[dollarValueField.id]) {
        setEditCost(fieldValues[dollarValueField.id])
      } else {
        setEditCost(entry.cost || '')
      }
      
      // Clear standard description/cost for custom metrics
      setEditDescription('')
    } else {
      // It's a standard entry
      setEditingCustomMetric(null)
      setEditFieldValues({})
      setEditEntryDate('')
      setEditDescription(entry.description || '')
      setEditCost(entry.cost || '')
    }
    
    setEditDialogOpen(true)
  }

  const handleDeleteKpiEntry = (entryId: string) => {
    setEntryToDelete(entryId)
    setDeleteDialogOpen(true)
  }

  const confirmEditEntry = () => {
    if (entryToEdit && id) {
      if (editingCustomMetric) {
        // Handle custom metric entry
        // Find dollarValue field for cost
        const dollarValueField = editingCustomMetric.fields.find((f) => f.type === 'dollarValue')
        const cost = dollarValueField && editFieldValues[dollarValueField.id]
          ? parseFloat(editFieldValues[dollarValueField.id]).toFixed(2)
          : undefined
        
        // Reconstruct JSON from field values
        const descriptionData: Record<string, any> = {}
        editingCustomMetric.fields.forEach((field) => {
          descriptionData[field.id] = editFieldValues[field.id] || ''
          descriptionData[field.name] = editFieldValues[field.id] || '' // Also store by name for easier access
        })
        
        updateKpiEntryMutation.mutate({
          id: entryToEdit.id,
          data: {
            description: JSON.stringify(descriptionData),
            cost: cost,
          },
          teamMemberId: id,
        }, {
          onSuccess: () => {
            setEditDialogOpen(false)
            setEntryToEdit(null)
            setEditingCustomMetric(null)
            setEditFieldValues({})
            setEditEntryDate('')
          }
        })
      } else {
        // Handle standard entry
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

  const handleEditNote = (note: any) => {
    setNoteToEdit(note)
    setNoteDialogOpen(true)
  }

  const handleDeleteNote = (noteId: string) => {
    setNoteToDelete(noteId)
    setNoteDeleteDialogOpen(true)
  }

  const confirmDeleteNote = () => {
    if (noteToDelete && id) {
      deleteNoteMutation.mutate({
        id: noteToDelete,
        teamMemberId: id,
      }, {
        onSuccess: () => {
          setNoteDeleteDialogOpen(false)
          setNoteToDelete(null)
        }
      })
    }
  }

  const handleEditPurchase = (purchase: any) => {
    setPurchaseToEdit(purchase)
    setEditPurchaseDate(purchase.purchaseDate || '')
    setEditPurchaseItems(purchase.itemsRaw || '')
    setEditPurchaseCompleted(purchase.isCompleted || false)
    setPurchaseEditDialogOpen(true)
  }

  const handleDeletePurchase = (purchaseId: string) => {
    setPurchaseToDelete(purchaseId)
    setPurchaseDeleteDialogOpen(true)
  }

  const confirmEditPurchase = () => {
    if (purchaseToEdit && id) {
      updatePurchaseMutation.mutate({
        id: purchaseToEdit.id,
        data: {
          purchaseDate: editPurchaseDate,
          itemsRaw: editPurchaseItems,
          isCompleted: editPurchaseCompleted,
        },
        teamMemberId: id,
        year: filterYearNum || undefined,
      }, {
        onSuccess: () => {
          setPurchaseEditDialogOpen(false)
          setPurchaseToEdit(null)
        }
      })
    }
  }

  const confirmDeletePurchase = () => {
    if (purchaseToDelete && id) {
      deletePurchaseMutation.mutate({
        id: purchaseToDelete,
        teamMemberId: id,
        year: filterYearNum || undefined,
      }, {
        onSuccess: () => {
          setPurchaseDeleteDialogOpen(false)
          setPurchaseToDelete(null)
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
              <Link to="/services" className="text-gray-700 hover:text-gray-900 font-medium">
                Services
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/settings"
                className="p-2 text-gray-800 hover:text-gray-900 transition-colors"
                title="Settings"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </Link>
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
            className="inline-flex items-center text-gray-800 hover:text-gray-900"
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
                  onClick={() => setDrawerOpen(true)}
                  className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2"
                  style={{ backgroundColor: '#E91E63' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#C2185B')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#E91E63')}
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
              {editingSection !== 'contact' && (
                <button
                  onClick={() => handleStartEdit('contact')}
                  className="text-gray-800 hover:text-gray-900 transition-colors"
                  title="Edit Contact Information"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              )}
            </div>
            {editingSection === 'contact' ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-gray-800 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div className="flex-1">
                    <label className="block text-sm text-gray-800 mb-1">Email</label>
                    <input
                      type="email"
                      value={editFormData.email || ''}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-gray-800 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div className="flex-1">
                    <label className="block text-sm text-gray-800 mb-1">Phone</label>
                    <input
                      type="text"
                      value={editFormData.phone || ''}
                      onChange={(e) => handleFieldChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-gray-800 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="flex-1">
                    <label className="block text-sm text-gray-800 mb-1">Address</label>
                    <textarea
                      value={editFormData.address || ''}
                      onChange={(e) => handleFieldChange('address', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={updateMutation.isPending}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {updateMutation.isPending ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-gray-800 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-800">Email</p>
                    <p className="text-gray-900">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-gray-800 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-800">Phone</p>
                    <p className="text-gray-900">{member.phone || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-gray-800 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-800">Address</p>
                    <p className="text-gray-900">{member.address || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
              {editingSection !== 'personal' && (
                <button
                  onClick={() => handleStartEdit('personal')}
                  className="text-gray-800 hover:text-gray-900 transition-colors"
                  title="Edit Personal Information"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              )}
            </div>
            {editingSection === 'personal' ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-gray-800 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <label className="block text-sm text-gray-800 mb-1">Birthday</label>
                    <input
                      type="date"
                      value={editFormData.birthday || ''}
                      onChange={(e) => handleFieldChange('birthday', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-gray-800 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <label className="block text-sm text-gray-800 mb-1">Primary Language</label>
                    <input
                      type="text"
                      value={editFormData.primaryLanguage || ''}
                      onChange={(e) => handleFieldChange('primaryLanguage', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-gray-800 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div className="flex-1">
                    <label className="block text-sm text-gray-800 mb-1">Work Start Date</label>
                    <input
                      type="date"
                      value={editFormData.workStartDate || ''}
                      onChange={(e) => handleFieldChange('workStartDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={updateMutation.isPending}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {updateMutation.isPending ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-gray-800 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-800">Birthday</p>
                    <p className="text-gray-900">{member.birthday ? formatDate(member.birthday) : 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-gray-800 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-800">Primary Language</p>
                    <p className="text-gray-900">{member.primaryLanguage || 'Not provided'}</p>
                  </div>
                </div>
                {member.workStartDate && (
                  <div className="flex items-start gap-3">
                    <svg className="h-5 w-5 text-gray-800 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-800">Work Start Date</p>
                      <p className="text-gray-900">{formatDate(member.workStartDate)}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Employment Details */}
        {(member.trainingStartDate || member.trainingEndDate || member.workStartDate || editingSection === 'employment') && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg className="h-5 w-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Employment Details
              </h2>
              {editingSection !== 'employment' && (
                <button
                  onClick={() => handleStartEdit('employment')}
                  className="text-gray-800 hover:text-gray-900 transition-colors"
                  title="Edit Employment Details"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              )}
            </div>
            {editingSection === 'employment' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-gray-800 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v6.055" />
                  </svg>
                    <div className="flex-1">
                      <label className="block text-sm text-gray-800 mb-1">Training Start Date</label>
                      <input
                        type="date"
                        value={editFormData.trainingStartDate || ''}
                        onChange={(e) => handleFieldChange('trainingStartDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-gray-800 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v6.055" />
                  </svg>
                    <div className="flex-1">
                      <label className="block text-sm text-gray-800 mb-1">Training End Date</label>
                      <input
                        type="date"
                        value={editFormData.trainingEndDate || ''}
                        onChange={(e) => handleFieldChange('trainingEndDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="h-5 w-5 text-gray-800 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div className="flex-1">
                      <label className="block text-sm text-gray-800 mb-1">Joining Date</label>
                      <input
                        type="date"
                        value={editFormData.workStartDate || ''}
                        onChange={(e) => handleFieldChange('workStartDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={updateMutation.isPending}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {updateMutation.isPending ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {member.trainingStartDate && (
                  <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-gray-800 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v6.055" />
                  </svg>
                    <div>
                      <p className="text-sm text-gray-800">Training Start Date</p>
                      <p className="text-gray-900">{formatDate(member.trainingStartDate)}</p>
                    </div>
                  </div>
                )}
                {member.trainingEndDate && (
                  <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-gray-800 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v6.055" />
                  </svg>
                    <div>
                      <p className="text-sm text-gray-800">Training End Date</p>
                      <p className="text-gray-900">{formatDate(member.trainingEndDate)}</p>
                    </div>
                  </div>
                )}
                {member.workStartDate && (
                  <div className="flex items-start gap-3">
                    <svg className="h-5 w-5 text-gray-800 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-800">Joining Date</p>
                      <p className="text-gray-900">{formatDate(member.workStartDate)}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tabs Section */}
        <div className="mt-8">
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => setActiveTab('metrics')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 shadow-sm ${
                activeTab === 'metrics'
                  ? 'bg-[#E91E63] text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <TrendingUp className={`h-4 w-4 ${activeTab === 'metrics' ? 'text-white' : 'text-gray-800'}`} />
              Metrics
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 shadow-sm ${
                activeTab === 'notes'
                  ? 'bg-[#E91E63] text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <StickyNote className={`h-4 w-4 ${activeTab === 'notes' ? 'text-white' : 'text-gray-800'}`} />
              Notes ({notes.length})
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 shadow-sm ${
                activeTab === 'inventory'
                  ? 'bg-[#E91E63] text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Package className={`h-4 w-4 ${activeTab === 'inventory' ? 'text-white' : 'text-gray-800'}`} />
              Inventory ({inventoryPurchases.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="grid grid-cols-1 lg:grid-cols-[0.3fr,0.7fr] gap-6">
            {/* Left Panel - List */}
            <div>
              {activeTab === 'metrics' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4">Metrics</h3>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {activeCustomMetrics.length > 0 ? (
                      activeCustomMetrics.map((metric) => {
                        const entries = getFilteredKpiEntriesByType(metric.id)
                        const isSelected = selectedKpi?.type === metric.id
                        // const metricColor = getCustomMetricColor(metric.color)
                        return (
                          <div
                            key={metric.id}
                            onClick={() => setSelectedKpi({ type: metric.id, name: metric.name, isCustom: true, customMetric: metric })}
                            className={`p-3 rounded-lg cursor-pointer transition-all border ${
                              isSelected
                                ? 'bg-blue-50 border-blue-500'
                                : 'bg-white hover:bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {/* <div 
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: metricColor }}
                                /> */}
                                <span className="text-sm font-medium">{metric.name}</span>
                              </div>
                              <span className="px-2 py-1 bg-gray-100 rounded text-xs">{entries.length}</span>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-sm text-gray-500 italic">No custom metrics defined yet.</p>
                        <p className="text-xs text-gray-400 mt-1">Create custom metrics in the Services section.</p>
                      </div>
                    )}
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
                            className={`p-3 rounded-lg transition-all border cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50 border-blue-500'
                                : 'bg-white hover:bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div>
                              <p className="text-xs text-gray-500 mb-1">{note.nyTimestamp}</p>
                              <p className="text-sm line-clamp-2">{note.noteText}</p>
                            </div>
                            <div className="flex items-center justify-end gap-2 mt-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEditNote(note)
                                }}
                                className="p-1 text-gray-800 hover:text-blue-600 transition-colors"
                                disabled={deleteNoteMutation.isPending}
                                title="Edit note"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteNote(note.id)
                                }}
                                className="p-1 text-gray-800 hover:text-red-600 transition-colors"
                                disabled={deleteNoteMutation.isPending}
                                title="Delete note"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
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
                            className={`p-3 rounded-lg transition-all border ${
                              isSelected
                                ? 'bg-blue-50 border-blue-500'
                                : 'bg-white hover:bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div
                              onClick={() => setSelectedPurchase(purchase)}
                              className="cursor-pointer"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-xs text-gray-500">{purchase.purchaseDate}</p>
                                {purchase.isCompleted && (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Completed</span>
                                )}
                              </div>
                              <p className="text-sm line-clamp-2">{purchase.itemsRaw}</p>
                            </div>
                            <div className="flex items-center justify-end gap-2 mt-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEditPurchase(purchase)
                                }}
                                className="p-1 text-gray-800 hover:text-blue-600 transition-colors"
                                disabled={updatePurchaseMutation.isPending || deletePurchaseMutation.isPending}
                                title="Edit purchase"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeletePurchase(purchase.id)
                                }}
                                className="p-1 text-gray-800 hover:text-red-600 transition-colors"
                                disabled={updatePurchaseMutation.isPending || deletePurchaseMutation.isPending}
                                title="Delete purchase"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
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
                  {activeTab === 'metrics' && selectedKpi && selectedKpi.customMetric && (
                    <button
                      onClick={() => {
                        setSelectedCustomMetric(selectedKpi.customMetric!)
                        setCustomMetricDialogOpen(true)
                      }}
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
                    <div className="h-full flex flex-col">
                      {/* Chart Section */}
                      <div className="h-[250px] mb-4 flex-shrink-0">
                        {(() => {
                          const chartData = getChartDataForKpi(selectedKpi.type)
                          const hasData = chartData.some(d => d.value > 0)
                          const metricColor = getMetricColor(selectedKpi.customMetric)
                          const hasDollarValueField = selectedKpi.customMetric?.fields.some(f => f.type === 'dollarValue')
                          
                          if (!hasData) {
                            return (
                              <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                <p className="text-gray-500 text-sm">No data to display</p>
                              </div>
                            )
                          }
                          
                          return (
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis 
                                  dataKey="month" 
                                  tick={{ fontSize: 11, fill: '#6b7280' }}
                                  axisLine={{ stroke: '#e5e7eb' }}
                                  tickLine={{ stroke: '#e5e7eb' }}
                                />
                                <YAxis 
                                  tick={{ fontSize: 11, fill: '#6b7280' }}
                                  axisLine={{ stroke: '#e5e7eb' }}
                                  tickLine={{ stroke: '#e5e7eb' }}
                                  allowDecimals={hasDollarValueField}
                                  tickFormatter={hasDollarValueField ? (value) => `$${value}` : undefined}
                                />
                                <Tooltip
                                  formatter={(value: any) => [
                                    hasDollarValueField ? `$${Number(value).toFixed(2)}` : value, 
                                    hasDollarValueField ? 'Total' : 'Count'
                                  ]}
                                  contentStyle={{ 
                                    backgroundColor: '#ffffff', 
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    padding: '8px'
                                  }}
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="value" 
                                  stroke={metricColor}
                                  strokeWidth={2}
                                  dot={{ r: 5, fill: metricColor, strokeWidth: 2 }}
                                  activeDot={{ r: 7 }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          )
                        })()}
                      </div>
                      
                      {/* Entries List Section */}
                      <div className="flex-1 overflow-y-auto">
                        {getFilteredKpiEntriesByType(selectedKpi.type).length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-gray-500 italic">No entries for {selectedKpi.name} in {filterYear}</p>
                            <button
                              onClick={() => {
                                if (selectedKpi.customMetric) {
                                  setSelectedCustomMetric(selectedKpi.customMetric)
                                  setCustomMetricDialogOpen(true)
                                }
                              }}
                              className="mt-4 px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
                            >
                              Add Entry
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                          {getFilteredKpiEntriesByType(selectedKpi.type).map((entry) => {
                            let fieldValues: Record<string, any> = {}
                            try {
                              fieldValues = JSON.parse(entry.description || '{}')
                            } catch {
                              fieldValues = { description: entry.description }
                            }
                            return (
                              <div key={entry.id} className="p-4 bg-gray-50 rounded-lg border">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-sm font-medium">{entry.date}</p>
                                  <div className="flex items-center gap-2">
                                    {entry.cost && (
                                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                                        ${parseFloat(entry.cost).toFixed(2)}
                                      </span>
                                    )}
                                    <button
                                      onClick={() => handleEditKpiEntry(entry)}
                                      className="p-1 text-gray-800 hover:text-blue-600 transition-colors"
                                      disabled={updateKpiEntryMutation.isPending}
                                      title="Edit entry"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteKpiEntry(entry.id)}
                                      className="p-1 text-gray-800 hover:text-red-600 transition-colors"
                                      disabled={deleteKpiEntryMutation.isPending}
                                      title="Delete entry"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  {selectedKpi.customMetric?.fields.map((field) => {
                                    // Try multiple ways to extract the value
                                    const value = fieldValues[field.id] || fieldValues[field.name] || ''
                                    
                                    // Validate value exists and is a string
                                    if (!value || typeof value !== 'string' || value.trim() === '') {
                                      return null
                                    }
                                    
                                    const stringValue = String(value).trim()
                                    
                                    // Check if this is an image field
                                    const isImageField = field.type === 'image'
                                    
                                    // Check for different image formats
                                    const isUrl = stringValue.startsWith('http://') || stringValue.startsWith('https://')
                                    const isBase64 = stringValue.startsWith('data:image/')
                                    
                                    // Determine if we should display as image
                                    const isImageValue = isImageField && (isUrl || isBase64)
                                    
                                    // Use the value directly as image source (base64 or URL)
                                    const imageSrc = stringValue
                                    
                                    return (
                                      <div key={field.id} className="text-sm">
                                        <span className="font-medium text-gray-700">{field.name}:</span>{' '}
                                        {isImageValue ? (
                                          <div className="mt-2">
                                            <img 
                                              src={imageSrc} 
                                              alt={field.name}
                                              className="max-w-full h-auto rounded-lg border border-gray-200 max-h-64 object-contain"
                                              onError={(e) => {
                                                // Fallback to text if image fails to load
                                                const target = e.target as HTMLImageElement
                                                const parent = target.parentElement
                                                if (parent && !parent.querySelector('.image-fallback')) {
                                                  target.style.display = 'none'
                                                  const fallback = document.createElement('span')
                                                  fallback.className = 'image-fallback text-gray-600 text-xs italic'
                                                  fallback.textContent = `(Image failed to load)`
                                                  parent.appendChild(fallback)
                                                }
                                              }}
                                            />
                                          </div>
                                        ) : (
                                          <span className="text-gray-600">{stringValue}</span>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
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
      {noteDialogOpen && (
        <NoteEntryDialog
          open={noteDialogOpen}
          onClose={() => {
            setNoteDialogOpen(false)
            setNoteToEdit(null)
          }}
          teamMemberId={id || ''}
          teamMemberName={member?.name}
          note={noteToEdit}
        />
      )}

      {customMetricDialogOpen && selectedCustomMetric && (
        <CustomMetricEntryDialog
          open={customMetricDialogOpen}
          onClose={() => {
            setCustomMetricDialogOpen(false)
            setSelectedCustomMetric(null)
          }}
          teamMemberId={id || ''}
          customMetric={selectedCustomMetric}
        />
      )}

      {/* Delete Note Confirmation Dialog */}
      {noteDeleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-semibold mb-4">Delete Note</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this note? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setNoteDeleteDialogOpen(false)
                  setNoteToDelete(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteNote}
                disabled={deleteNoteMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {deleteNoteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Purchase Dialog */}
      {purchaseEditDialogOpen && purchaseToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-semibold mb-4">Edit Purchase</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                <input
                  type="text"
                  value={editPurchaseDate}
                  onChange={(e) => setEditPurchaseDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="MM/DD/YYYY"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Items</label>
                <textarea
                  value={editPurchaseItems}
                  onChange={(e) => setEditPurchaseItems(e.target.value)}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter purchase items..."
                />
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editPurchaseCompleted}
                    onChange={(e) => setEditPurchaseCompleted(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">Completed</span>
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setPurchaseEditDialogOpen(false)
                    setPurchaseToEdit(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmEditPurchase}
                  disabled={updatePurchaseMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {updatePurchaseMutation.isPending ? 'Updating...' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Purchase Confirmation Dialog */}
      {purchaseDeleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-semibold mb-4">Delete Purchase</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this purchase? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setPurchaseDeleteDialogOpen(false)
                  setPurchaseToDelete(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeletePurchase}
                disabled={deletePurchaseMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {deletePurchaseMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit KPI Entry Dialog */}
      {editDialogOpen && entryToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className={`bg-white rounded-lg shadow-xl ${editingCustomMetric ? 'max-w-2xl' : 'max-w-md'} w-full mx-4 ${editingCustomMetric ? 'max-h-[90vh] overflow-y-auto' : 'p-6'}`}>
            <div className={`${editingCustomMetric ? 'sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">
                    {editingCustomMetric ? `Edit ${editingCustomMetric.name} Entry` : 'Edit Entry'}
                  </h2>
                  {editingCustomMetric?.description && (
                    <p className="text-sm text-gray-500 mt-1">{editingCustomMetric.description}</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setEditDialogOpen(false)
                    setEntryToEdit(null)
                    setEditingCustomMetric(null)
                    setEditFieldValues({})
                    setEditEntryDate('')
                  }}
                  className="text-gray-800 hover:text-gray-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className={`${editingCustomMetric ? 'p-6' : ''} space-y-4`}>
              {editingCustomMetric ? (
                // Custom metric entry form
                <>
                  {/* Date field (if not in custom fields, show separate date input) */}
                  {!editingCustomMetric.fields.find((f) => f.type === 'date') && (
                    <div className="space-y-2">
                      <label htmlFor="edit-entry-date" className="block text-sm font-medium text-gray-700">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="edit-entry-date"
                        type="date"
                        value={editEntryDate}
                        onChange={(e) => setEditEntryDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  {/* Dynamic fields based on custom metric definition */}
                  {editingCustomMetric.fields.map((field) => {
                    const Icon = getFieldTypeIcon(field.type)
                    const value = editFieldValues[field.id] || ''

                    return (
                      <div key={field.id} className="space-y-2">
                        <label htmlFor={`edit-${field.id}`} className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {field.name}
                          {field.required && <span className="text-red-500">*</span>}
                        </label>

                        {field.type === 'date' && (
                          <input
                            id={`edit-${field.id}`}
                            type="date"
                            value={value}
                            onChange={(e) => handleEditFieldChange(field.id, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        )}

                        {field.type === 'text' && (
                          <textarea
                            id={`edit-${field.id}`}
                            value={value}
                            onChange={(e) => handleEditFieldChange(field.id, e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={`Enter ${field.name.toLowerCase()}...`}
                          />
                        )}

                        {(field.type === 'dollarValue' || field.type === 'number') && (
                          <input
                            id={`edit-${field.id}`}
                            type="number"
                            step={field.type === 'dollarValue' ? '0.01' : '1'}
                            min="0"
                            value={value}
                            onChange={(e) => handleEditFieldChange(field.id, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={field.type === 'dollarValue' ? '0.00' : '0'}
                          />
                        )}

                        {(field.type === 'upload' || field.type === 'image') && (
                          <div className="space-y-2">
                            {field.type === 'image' && value && (value.startsWith('data:image/') || value.startsWith('http://') || value.startsWith('https://')) && (
                              <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-sm font-medium text-gray-700 mb-2">Current Image</p>
                                <img 
                                  src={value} 
                                  alt="Current" 
                                  className="max-w-full h-auto rounded-lg border border-gray-200 max-h-32 object-contain"
                                />
                              </div>
                            )}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                {field.type === 'image' && value && (value.startsWith('data:image/') || value.startsWith('http://') || value.startsWith('https://'))
                                  ? 'Replace Image'
                                  : field.type === 'image'
                                  ? 'Select Image'
                                  : 'Select File'}
                              </label>
                              <input
                                id={`edit-${field.id}`}
                                type="file"
                                accept={field.type === 'image' ? 'image/*' : '*'}
                                onChange={async (e) => {
                                  const file = e.target.files?.[0]
                                  if (file) {
                                    if (field.type === 'image') {
                                      // Compress and convert image to base64
                                      try {
                                        const compressedBase64 = await compressImage(file)
                                        handleEditFieldChange(field.id, compressedBase64)
                                      } catch (error) {
                                        console.error('Error compressing image:', error)
                                        // Fallback to regular base64 if compression fails
                                        const reader = new FileReader()
                                        reader.onloadend = () => {
                                          const result = reader.result as string
                                          handleEditFieldChange(field.id, result)
                                        }
                                        reader.readAsDataURL(file)
                                      }
                                    } else {
                                      // For non-image uploads, store file name
                                      handleEditFieldChange(field.id, file.name)
                                    }
                                  }
                                  // Reset the input so the same file can be selected again
                                  e.target.value = ''
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              {field.type === 'image' && value && (value.startsWith('data:image/') || value.startsWith('http://') || value.startsWith('https://')) && (
                                <p className="mt-1 text-xs text-gray-500">
                                  Select a new image file to replace the current one
                                </p>
                              )}
                              {value && field.type === 'image' && !value.startsWith('data:image/') && !value.startsWith('http://') && !value.startsWith('https://') && (
                                <p className="mt-1 text-sm text-gray-500">Selected: {value}</p>
                              )}
                              {value && field.type !== 'image' && (
                                <p className="mt-1 text-sm text-gray-500">Selected: {value}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </>
              ) : (
                // Standard entry form
                <>
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
                </>
              )}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setEditDialogOpen(false)
                    setEntryToEdit(null)
                    setEditingCustomMetric(null)
                    setEditFieldValues({})
                    setEditEntryDate('')
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

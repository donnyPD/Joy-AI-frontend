import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../store/hooks'
import { logout } from '../features/auth/authSlice'
import {
  useInventory,
  useInventoryCategories,
  useCreateInventoryItem,
  useUpdateInventoryItem,
  useDeleteInventoryItem,
  useDeleteInventoryCategory,
  useCreateInventoryCategory,
  useTechniciansByMonth,
  useInventoryNotes,
  useInventorySnapshot,
  useAutoSnapshot,
  useInventoryPurchases,
  useInventoryFormSubmissions,
  type Inventory as InventoryType,
  type InventoryCategory,
  type InventoryPurchase,
  type InventoryFormSubmission,
} from '../features/inventory/inventoryApi'
import toast from 'react-hot-toast'

const monthNames = [
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

// Helper types and interfaces
interface MetricRow {
  row_number: number
  col_1: string
  'Snapshot KPIs': string
  [key: string]: string | number
}

interface OrderGroup {
  orderId: string
  date: string
  store: string
  totalAmount: number
  items: InventoryPurchase[]
}

interface ParsedItem {
  name: string
  quantity: number
}

interface TechnicianWithPurchase {
  id: string
  techName: string
  latestPurchaseDate?: string | null
  latestPurchase?: {
    id: string
    purchaseDate: string
    itemsRaw: string
    itemsParsed?: any | null
    isCompleted: boolean
  } | null
}

// Helper function to get month revenue from snapshot data
function getMonthRevenue(
  snapshotData: MetricRow[] | undefined,
  month: number,
  year: number,
): { revenue: number; month: string; year: number } {
  const monthName = monthNames[month - 1]

  if (!snapshotData || !Array.isArray(snapshotData)) {
    return { revenue: 0, month: monthName, year }
  }

  const grossRevenueRow = snapshotData.find(
    (row) => row.col_1 === 'TOP' && row['Snapshot KPIs'] === 'Gross Revenue',
  )

  if (!grossRevenueRow) {
    return { revenue: 0, month: monthName, year }
  }

  const monthKey = `${month}/1/${year}`
  const value = parseFloat((grossRevenueRow[monthKey] as string) || '0') || 0

  return {
    revenue: value,
    month: monthName,
    year,
  }
}

// InventoryBudgetCards Component
function InventoryBudgetCards({
  snapshotData,
  selectedMonth,
  selectedYear,
  isCurrentMonth,
}: {
  snapshotData: MetricRow[] | undefined
  selectedMonth: number
  selectedYear: number
  isCurrentMonth: boolean
}) {
  const revenueData = getMonthRevenue(snapshotData, selectedMonth, selectedYear)

  const { data: purchases = [] } = useInventoryPurchases(selectedMonth, selectedYear)

  const totalAmount = useMemo(() => {
    if (!purchases || purchases.length === 0) return 0

    const orderMap = new Map<string, InventoryPurchase[]>()
    purchases.forEach((purchase) => {
      const orderId = purchase.orderId || `LEGACY-${purchase.id}`
      if (!orderMap.has(orderId)) {
        orderMap.set(orderId, [])
      }
      orderMap.get(orderId)!.push(purchase)
    })

    return Array.from(orderMap.values()).reduce((sum, items) => {
      const orderTotal = items.reduce(
        (itemSum, item) => itemSum + parseFloat(item.amount || '0'),
        0,
      )
      return sum + orderTotal
    }, 0)
  }, [purchases])

  const inventoryBudget = revenueData.revenue * 0.03

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const displayPeriod = `${revenueData.month} ${revenueData.year}`

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
        <div className="text-sm font-medium text-green-700 flex items-center gap-2 mb-2">
          <span>💰</span>
          {displayPeriod} Revenue
        </div>
        <div className="text-2xl font-bold text-green-800">
          {formatCurrency(revenueData.revenue)}
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
        <div className="text-sm font-medium text-blue-700 flex items-center gap-2 mb-2">
          <span>📦</span>
          3% of {revenueData.month} Revenue
        </div>
        <div className="text-2xl font-bold text-blue-800">
          {formatCurrency(inventoryBudget)}
        </div>
      </div>

      <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-4">
        <div className="text-sm font-medium text-red-700 flex items-center gap-2 mb-2">
          <span>📦</span>
          {revenueData.month} Inventory Bought
        </div>
        <div className="text-2xl font-bold text-red-800">
          ${totalAmount !== 0 ? totalAmount.toFixed(2) : '0.00'}
        </div>
      </div>
    </div>
  )
}

export default function Inventory() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [editingState, setEditingState] = useState<{
    id: string
    field: string
    value: string
  } | null>(null)
  const [itemToDelete, setItemToDelete] = useState<InventoryType | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<InventoryCategory | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showDeleteCategoryDialog, setShowDeleteCategoryDialog] = useState(false)
  const [showAddItemDialog, setShowAddItemDialog] = useState(false)
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<InventoryCategory | null>(null)

  const isCurrentMonth = selectedMonth === currentMonth && selectedYear === currentYear

  // Auto-create snapshot on mount (non-blocking, handle errors gracefully)
  const autoSnapshot = useAutoSnapshot()
  useEffect(() => {
    // Call auto-snapshot but don't block rendering if it fails
    autoSnapshot.mutate(undefined, {
      onError: (error) => {
        // Silently handle error - don't show toast for background operation
        console.warn('Auto-snapshot failed:', error)
      },
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch data with error handling
  const {
    data: inventory = [],
    isLoading: isLoadingInventory,
    error: inventoryError,
  } = useInventory(undefined, undefined)
  const {
    data: categories = [],
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useInventoryCategories()
  const { data: techniciansData } = useTechniciansByMonth(selectedMonth, selectedYear, false)
  const { data: notesData } = useInventoryNotes(selectedMonth, selectedYear)
  const { data: snapshot } = useInventorySnapshot(
    !isCurrentMonth ? selectedMonth : undefined,
    !isCurrentMonth ? selectedYear : undefined
  )

  // Ensure technicians is always an array (handle error responses and undefined)
  const technicians = Array.isArray(techniciansData) ? techniciansData : []
  // Ensure notes is always an array (handle error responses and undefined)
  const notes = Array.isArray(notesData) ? notesData : []

  const updateMutation = useUpdateInventoryItem()
  const deleteMutation = useDeleteInventoryItem()
  const deleteCategoryMutation = useDeleteInventoryCategory()

  const handleSignOut = () => {
    dispatch(logout())
    navigate('/signin')
  }

  const handleMonthYearChange = (month: number, year: number) => {
    setSelectedMonth(month)
    setSelectedYear(year)
    setEditingState(null)
  }

  const getItemsForCategory = (categoryId: string): InventoryType[] => {
    if (isCurrentMonth) {
      return inventory.filter((item) => item.categoryId === categoryId)
    } else {
      const snapshotItems = (snapshot?.snapshotData as any[]) || []
      return snapshotItems
        .filter(() => {
          // Match items by category - this is simplified, actual matching would be more complex
          return true // For now, return all items
        })
        .map((item: any) => ({
          id: item.name,
          name: item.name,
          type: item.type,
          categoryId,
          totalRequested: item.totalRequested || 0,
          totalInventory: item.totalInventory || 0,
          pricePerUnit: item.pricePerUnit || null,
          idealTotalInventory: 0,
          toBeOrdered: 0,
          threshold: item.threshold || 3,
          rowNumber: item.rowNumber || null,
          preferredStore: null,
          createdAt: '',
          updatedAt: '',
        }))
    }
  }

  const handleStartEdit = (id: string, field: string, currentValue: string | number) => {
    setEditingState({ id, field, value: String(currentValue) })
  }

  const handleCancelEdit = () => {
    setEditingState(null)
  }

  const handleSaveEdit = () => {
    if (!editingState) return

    const updateData: any = {}
    if (editingState.field === 'name') {
      updateData.name = editingState.value
    } else if (editingState.field === 'totalRequested') {
      updateData.totalRequested = parseInt(editingState.value) || 0
    } else if (editingState.field === 'totalInventory') {
      updateData.totalInventory = parseInt(editingState.value) || 0
    } else if (editingState.field === 'idealTotalInventory') {
      updateData.idealTotalInventory = parseInt(editingState.value) || 0
    } else if (editingState.field === 'toBeOrdered') {
      updateData.toBeOrdered = parseInt(editingState.value) || 0
    } else if (editingState.field === 'preferredStore') {
      updateData.preferredStore = editingState.value || null
    }

    updateMutation.mutate(
      { id: editingState.id, data: updateData },
      {
        onSuccess: () => {
          setEditingState(null)
        },
      }
    )
  }

  const handleDeleteClick = (item: InventoryType) => {
    setItemToDelete(item)
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete.id, {
        onSuccess: () => {
          setShowDeleteDialog(false)
          setItemToDelete(null)
        },
      })
    }
  }

  const handleDeleteCategoryClick = (category: InventoryCategory) => {
    setCategoryToDelete(category)
    setShowDeleteCategoryDialog(true)
  }

  const handleConfirmDeleteCategory = () => {
    if (categoryToDelete) {
      deleteCategoryMutation.mutate(categoryToDelete.id, {
        onSuccess: () => {
          setShowDeleteCategoryDialog(false)
          setCategoryToDelete(null)
        },
      })
    }
  }

  // Show error state if critical queries fail
  const hasCriticalError = categoriesError || inventoryError
  const errorMessage =
    categoriesError?.message || inventoryError?.message || 'Failed to load inventory data'

  // Early return for loading state
  if (isLoadingInventory || isLoadingCategories) {
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading inventory...</span>
          </div>
        </div>
      </div>
    )
  }

  // Early return for error state
  if (hasCriticalError) {
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Inventory</h2>
            <p className="text-red-700 mb-4">{errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
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
            <div className="flex items-center gap-3">
              <Link
                to="/settings"
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Inventory Management</h1>

          {/* Month/Year Selector */}
          <div className="flex items-center gap-4 mb-4">
            <label className="text-sm font-medium text-gray-700">Month:</label>
            <select
              value={selectedMonth}
              onChange={(e) => handleMonthYearChange(parseInt(e.target.value), selectedYear)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              {monthNames.map((name, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {name}
                </option>
              ))}
            </select>

            <label className="text-sm font-medium text-gray-700">Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => handleMonthYearChange(selectedMonth, parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            {!isCurrentMonth && (
              <span className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded">
                Historical Snapshot (Read Only)
              </span>
            )}
          </div>
        </div>

        {isLoadingInventory || isLoadingCategories ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Budget Cards */}
            <InventoryBudgetCards
              snapshotData={snapshot?.snapshotData as MetricRow[] | undefined}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              isCurrentMonth={isCurrentMonth}
            />

            {/* Categories */}
            {categories.map((category) => (
              <div key={category.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">{category.name.toUpperCase()}</h2>
                  <div className="flex items-center gap-2">
                    {!isCurrentMonth && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                        Read Only
                      </span>
                    )}
                    {isCurrentMonth && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedCategory(category)
                            setShowAddItemDialog(true)
                          }}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          + Add Item
                        </button>
                        <button
                          onClick={() => handleDeleteCategoryClick(category)}
                          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Delete Category
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Item Name
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                          Total Requested
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                          Total Inventory
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                          Ideal Total
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                          To Be Ordered
                        </th>
                        {isCurrentMonth && (
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                            Actions
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {getItemsForCategory(category.id).map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3">
                            {editingState?.id === item.id && editingState?.field === 'name' ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={editingState.value}
                                  onChange={(e) =>
                                    setEditingState({ ...editingState, value: e.target.value })
                                  }
                                  className="px-2 py-1 border border-gray-300 rounded"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveEdit()
                                    if (e.key === 'Escape') handleCancelEdit()
                                  }}
                                  autoFocus
                                />
                                <button
                                  onClick={handleSaveEdit}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span>{item.name}</span>
                                {isCurrentMonth && (
                                  <button
                                    onClick={() => handleStartEdit(item.id, 'name', item.name)}
                                    className="text-gray-400 hover:text-gray-600"
                                  >
                                    ✏️
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {editingState?.id === item.id &&
                            editingState?.field === 'totalRequested' ? (
                              <input
                                type="number"
                                value={editingState.value}
                                onChange={(e) =>
                                  setEditingState({ ...editingState, value: e.target.value })
                                }
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEdit()
                                  if (e.key === 'Escape') handleCancelEdit()
                                }}
                                autoFocus
                              />
                            ) : (
                              <span
                                className={isCurrentMonth ? 'cursor-pointer hover:bg-gray-50' : ''}
                                onClick={() =>
                                  isCurrentMonth &&
                                  handleStartEdit(item.id, 'totalRequested', item.totalRequested)
                                }
                              >
                                {item.totalRequested}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {editingState?.id === item.id &&
                            editingState?.field === 'totalInventory' ? (
                              <input
                                type="number"
                                value={editingState.value}
                                onChange={(e) =>
                                  setEditingState({ ...editingState, value: e.target.value })
                                }
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEdit()
                                  if (e.key === 'Escape') handleCancelEdit()
                                }}
                                autoFocus
                              />
                            ) : (
                              <span
                                className={isCurrentMonth ? 'cursor-pointer hover:bg-gray-50' : ''}
                                onClick={() =>
                                  isCurrentMonth &&
                                  handleStartEdit(item.id, 'totalInventory', item.totalInventory)
                                }
                              >
                                {item.totalInventory}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {editingState?.id === item.id &&
                            editingState?.field === 'idealTotalInventory' ? (
                              <input
                                type="number"
                                value={editingState.value}
                                onChange={(e) =>
                                  setEditingState({ ...editingState, value: e.target.value })
                                }
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEdit()
                                  if (e.key === 'Escape') handleCancelEdit()
                                }}
                                autoFocus
                              />
                            ) : (
                              <span
                                className={isCurrentMonth ? 'cursor-pointer hover:bg-gray-50' : ''}
                                onClick={() =>
                                  isCurrentMonth &&
                                  handleStartEdit(
                                    item.id,
                                    'idealTotalInventory',
                                    item.idealTotalInventory
                                  )
                                }
                              >
                                {item.idealTotalInventory}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {editingState?.id === item.id &&
                            editingState?.field === 'toBeOrdered' ? (
                              <input
                                type="number"
                                value={editingState.value}
                                onChange={(e) =>
                                  setEditingState({ ...editingState, value: e.target.value })
                                }
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEdit()
                                  if (e.key === 'Escape') handleCancelEdit()
                                }}
                                autoFocus
                              />
                            ) : (
                              <span
                                className={isCurrentMonth ? 'cursor-pointer hover:bg-gray-50' : ''}
                                onClick={() =>
                                  isCurrentMonth &&
                                  handleStartEdit(item.id, 'toBeOrdered', item.toBeOrdered)
                                }
                              >
                                {item.toBeOrdered}
                              </span>
                            )}
                          </td>
                          {isCurrentMonth && (
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => handleDeleteClick(item)}
                                className="text-red-600 hover:text-red-700"
                              >
                                🗑️
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                      {getItemsForCategory(category.id).length === 0 && (
                        <tr>
                          <td colSpan={isCurrentMonth ? 6 : 5} className="px-4 py-8 text-center text-gray-500">
                            No items in this category
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            {/* Add Category Button */}
            {isCurrentMonth && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <button
                  onClick={() => setShowAddCategoryDialog(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  + Add New Category
                </button>
              </div>
            )}

            {/* Technician Purchases Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Technician Purchases</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Technician
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Purchase Date
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Items
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {technicians.map((tech) => (
                      <tr key={tech.id}>
                        <td className="px-4 py-3">{tech.techName}</td>
                        <td className="px-4 py-3">
                          {tech.latestPurchase?.purchaseDate || 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          {tech.latestPurchase?.itemsRaw || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {tech.latestPurchase?.isCompleted ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                              Completed
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {technicians.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                          No purchases for this period
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notes Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Notes</h2>
              </div>
              <div className="p-4">
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {notes.map((note) => (
                    <div key={note.id} className="p-3 bg-gray-50 rounded border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">{note.nyTimestamp}</p>
                      <p className="text-sm">{note.noteText}</p>
                    </div>
                  ))}
                  {notes.length === 0 && (
                    <p className="text-center text-gray-500 py-8">
                      No notes for {monthNames[selectedMonth - 1]} {selectedYear}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Item Dialog */}
        {showDeleteDialog && itemToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
              <h2 className="text-xl font-semibold mb-4">Delete Item</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{itemToDelete.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteDialog(false)
                    setItemToDelete(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleteMutation.isPending}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Category Dialog */}
        {showDeleteCategoryDialog && categoryToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
              <h2 className="text-xl font-semibold mb-4">Delete Category</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete the "{categoryToDelete.name}" category? This action
                cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteCategoryDialog(false)
                    setCategoryToDelete(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDeleteCategory}
                  disabled={deleteCategoryMutation.isPending}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteCategoryMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Item Dialog */}
        {showAddItemDialog && selectedCategory && (
          <AddItemDialog
            category={selectedCategory}
            onClose={() => {
              setShowAddItemDialog(false)
              setSelectedCategory(null)
            }}
          />
        )}

        {/* Add Category Dialog */}
        {showAddCategoryDialog && (
          <AddCategoryDialog
            onClose={() => setShowAddCategoryDialog(false)}
          />
        )}
      </div>
    </div>
  )
}

// Add Item Dialog Component
function AddItemDialog({
  category,
  onClose,
}: {
  category: InventoryCategory
  onClose: () => void
}) {
  const [name, setName] = useState('')
  const [totalRequested, setTotalRequested] = useState('0')
  const [totalInventory, setTotalInventory] = useState('0')
  const [pricePerUnit, setPricePerUnit] = useState('')
  const [threshold] = useState('3')

  const createMutation = useCreateInventoryItem()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Item name is required')
      return
    }

    createMutation.mutate(
      {
        name: name.trim(),
        type: 'Product', // Default type
        categoryId: category.id,
        totalRequested: parseInt(totalRequested) || 0,
        totalInventory: parseInt(totalInventory) || 0,
        pricePerUnit: pricePerUnit || undefined,
        threshold: parseInt(threshold) || 3,
      },
      {
        onSuccess: () => {
          onClose()
        },
      }
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h2 className="text-xl font-semibold mb-4">Add Item to {category.name}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Requested
              </label>
              <input
                type="number"
                value={totalRequested}
                onChange={(e) => setTotalRequested(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Inventory
              </label>
              <input
                type="number"
                value={totalInventory}
                onChange={(e) => setTotalInventory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="0"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price per Unit ($)
            </label>
            <input
              type="text"
              value={pricePerUnit}
              onChange={(e) => setPricePerUnit(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="e.g., 10.00"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Add Category Dialog Component
function AddCategoryDialog({ onClose }: { onClose: () => void }) {
  const [categoryName, setCategoryName] = useState('')
  const createCategory = useCreateInventoryCategory()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryName.trim()) {
      toast.error('Category name is required')
      return
    }
    createCategory.mutate(
      { name: categoryName.trim() },
      {
        onSuccess: () => {
          onClose()
        },
      }
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h2 className="text-xl font-semibold mb-4">Add New Category</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="e.g., Supplies, Equipment"
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Create Category
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

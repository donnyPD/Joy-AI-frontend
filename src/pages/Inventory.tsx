import { useState, useEffect, useMemo, useRef } from 'react'
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
  useUpdateInventoryCategory,
  useInventoryNotes,
  useInventorySnapshot,
  useAutoSnapshot,
  useInventoryPurchases,
  useCreateInventoryPurchases,
  useCreateInventoryNote,
  useUpdateInventoryNote,
  useDeleteInventoryNote,
  useUpdateInventoryPurchase,
  useDeleteInventoryPurchase,
  useInventoryStores,
  useCreateInventoryStore,
  useDeleteInventoryStore,
  useInventoryFormSubmissions,
  useUpdateInventoryFormSubmission,
  useDeleteInventoryFormSubmission,
  useInventorySnapshotMonths,
  useInventoryPurchasesAvailableMonths,
  useInventoryFormSubmissionsAvailableMonths,
  useInventoryNotesAvailableMonths,
  useInventoryTechnicianPurchases,
  useInventoryFormConfig,
  useBulkUpdateInventoryFormConfig,
  useInventoryColumnDefinitions,
  usePublicFormKey,
  type Inventory as InventoryType,
  type InventoryCategory,
  type InventoryPurchase,
  type InventoryNote,
  type InventoryFormSubmission,
  type InventoryFormConfig,
  type InventoryColumnDefinition,
} from '../features/inventory/inventoryApi'
import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import toast from 'react-hot-toast'
import { useTeamMemberTypes } from '../features/team-member-options/teamMemberOptionsApi'
import { useDefaultIdealInventory } from '../features/settings/settingsApi'
import { Pencil, Trash2, Eye, Plus, Download, ShoppingCart, StickyNote, Store, Package, X, Settings, Home, Check, Loader2, ExternalLink, ChevronDown, ChevronRight, AlignJustify, Calendar, DollarSign, Droplet } from 'lucide-react'

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

// Helper function to get today's date in NY timezone as YYYY-MM-DD
function getTodayNY(): string {
  const now = new Date()
  const nyDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
  const year = nyDate.getFullYear()
  const month = String(nyDate.getMonth() + 1).padStart(2, '0')
  const day = String(nyDate.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const ORDERED_FROM_OPTIONS = [
  "Sam's Club",
  "Walmart",
  "Amazon",
  "Speed Cleaning",
  "Home Depot",
  "Other",
]

// Helper types and interfaces
interface MetricRow {
  row_number: number
  col_1: string
  'Snapshot KPIs': string
  [key: string]: string | number
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
}: {
  snapshotData: MetricRow[] | undefined
  selectedMonth: number
  selectedYear: number
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
          <DollarSign className="h-4 w-4" />
          {displayPeriod} Revenue
        </div>
        <div className="text-2xl font-bold text-green-800">
          {formatCurrency(revenueData.revenue)}
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
        <div className="text-sm font-medium text-blue-700 flex items-center gap-2 mb-2">
          <Package className="h-4 w-4" />
          3% of {revenueData.month} Revenue
        </div>
        <div className="text-2xl font-bold text-blue-800">
          {formatCurrency(inventoryBudget)}
        </div>
      </div>

      <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-4">
        <div className="text-sm font-medium text-red-700 flex items-center gap-2 mb-2">
          <ShoppingCart className="h-4 w-4" />
          {revenueData.month} Inventory Bought
        </div>
        <div className="text-2xl font-bold text-red-800">
          ${totalAmount !== 0 ? totalAmount.toFixed(2) : '0.00'}
        </div>
      </div>
    </div>
  )
}

// Supplier Order History Table Component
function SupplierOrderHistoryTable({ 
  inventoryItems: _inventoryItems
}: { 
  inventoryItems: InventoryType[]
}) {
  const navigate = useNavigate()
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [viewOrderItems, setViewOrderItems] = useState<{
    orderId: string
    date: string
    store: string
    totalAmount: number
    totalPrice: string | null
    items: InventoryPurchase[]
  } | null>(null)
  const [editingOrder, setEditingOrder] = useState<{
    orderId: string
    date: string
    store: string
    totalAmount: number
    totalPrice: string | null
    items: InventoryPurchase[]
  } | null>(null)
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState<{
    date: string
    store: string
    notes: string
    totalPrice: string
    items: { id: string; itemName: string; amount: string; quantity: number }[]
  }>({ date: '', store: '', notes: '', totalPrice: '', items: [] })

  const { data: purchases = [], isLoading, refetch } = useInventoryPurchases(selectedMonth, selectedYear)
  const { data: availableMonths = [] } = useInventoryPurchasesAvailableMonths()
  const { data: stores = [] } = useInventoryStores()

  // Generate month-year options from available months
  const generateMonthYearOptions = useMemo(() => {
    const options: Array<{ value: string; label: string; month: number; year: number }> = []
    const seen = new Set<string>()

    // Always include current month/year
    const currentKey = `${currentMonth}-${currentYear}`
    options.push({
      value: currentKey,
      label: `${monthNames[currentMonth - 1]} ${currentYear} (Current)`,
      month: currentMonth,
      year: currentYear,
    })
    seen.add(currentKey)

    // Add options from availableMonths
    availableMonths.forEach(({ month, year }) => {
      const key = `${month}-${year}`
      if (!seen.has(key)) {
        options.push({
          value: key,
          label: `${monthNames[month - 1]} ${year}`,
          month,
          year,
        })
        seen.add(key)
      }
    })

    // Sort in descending order (newest first)
    options.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year
      return b.month - a.month
    })

    return options
  }, [availableMonths, currentMonth, currentYear])

  const handleMonthYearChange = (combinedValue: string) => {
    const [month, year] = combinedValue.split('-').map(Number)
    setSelectedMonth(month)
    setSelectedYear(year)
  }
  const updatePurchaseMutation = useUpdateInventoryPurchase()
  const deletePurchaseMutation = useDeleteInventoryPurchase()

  const groupedOrders = useMemo(() => {
    if (!purchases || purchases.length === 0) return []

    const orderMap = new Map<string, InventoryPurchase[]>()
    purchases.forEach((purchase) => {
      const orderId = purchase.orderId || `LEGACY-${purchase.id}`
      if (!orderMap.has(orderId)) {
        orderMap.set(orderId, [])
      }
      orderMap.get(orderId)!.push(purchase)
    })

    return Array.from(orderMap.entries())
      .map(([orderId, items]) => {
        const totalAmount = items.reduce((sum, item) => sum + parseFloat(item.amount || '0'), 0)
        const stores = Array.from(new Set(items.map((item) => item.orderedFrom)))
        // Get totalPrice from first item (all items in an order have the same totalPrice)
        const totalPrice = items[0]?.totalPrice || null
        return {
          orderId,
          date: items[0].purchasedAt,
          store: stores.join(', '),
          totalAmount,
          totalPrice,
          items,
        }
      })
      .sort((a, b) => {
        const dateA = new Date(a.date)
        const dateB = new Date(b.date)
        return dateB.getTime() - dateA.getTime()
      })
  }, [purchases])

  const handleEditOrder = (order: typeof groupedOrders[0]) => {
    // Parse date string to YYYY-MM-DD format without timezone conversion
    const formatDateForInput = (dateString: string): string => {
      if (!dateString) return ''
      
      // If already in YYYY-MM-DD format, validate and return as-is
      const yyyyMmDdPattern = /^\d{4}-\d{2}-\d{2}$/
      if (yyyyMmDdPattern.test(dateString)) {
        // Validate the date parts
        const [year, month, day] = dateString.split('-').map(Number)
        if (year >= 1900 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          return dateString
        }
      }
      
      // For ISO timestamps, extract YYYY-MM-DD directly from string (no timezone conversion)
      try {
        // ISO format: YYYY-MM-DDTHH:mm:ss.sssZ or YYYY-MM-DDTHH:mm:ssZ
        const isoMatch = dateString.match(/^(\d{4}-\d{2}-\d{2})/)
        if (isoMatch) {
          const extractedDate = isoMatch[1]
          // Validate the extracted date
          const [year, month, day] = extractedDate.split('-').map(Number)
          if (year >= 1900 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            return extractedDate
          }
        }
      } catch {
        // Fall through to empty return
      }
      
      return ''
    }

    const orderStore = order.store?.trim() || ''
    const storeInList = orderStore && stores.some((s) => s.name === orderStore)
    const defaultStore = storeInList ? orderStore : (stores[0]?.name ?? orderStore)

    // Calculate totalPrice from order.totalPrice or from items (amount * quantity)
    const calculatedTotalPrice = (order.totalPrice && order.totalPrice !== null)
      ? parseFloat(order.totalPrice).toFixed(2)
      : order.items.reduce((sum, item) => {
          return sum + (parseFloat(item.amount || '0') * (item.quantity || 0))
        }, 0).toFixed(2)

    setEditFormData({
      date: formatDateForInput(order.date),
      store: defaultStore,
      notes: order.items[0]?.notes || '',
      totalPrice: calculatedTotalPrice,
      items: order.items.map((item) => ({
        id: item.id,
        itemName: item.itemName,
        amount: item.amount,
        quantity: item.quantity,
      })),
    })
    setEditingOrder(order)
  }

  const handleSaveEdit = async () => {
    if (!editingOrder) return

    try {
      // Return YYYY-MM-DD string directly (matching getTodayNY format)
      // Validate and return the date string as-is, or use today's date if invalid
      const formatDateForAPI = (dateString: string): string => {
        if (!dateString) return getTodayNY()
        
        // Validate YYYY-MM-DD format
        const yyyyMmDdPattern = /^\d{4}-\d{2}-\d{2}$/
        if (yyyyMmDdPattern.test(dateString)) {
          const [year, month, day] = dateString.split('-').map(Number)
          if (year >= 1900 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            return dateString
          }
        }
        
        // If invalid, return today's date in YYYY-MM-DD format
        return getTodayNY()
      }

      for (const item of editFormData.items) {
        await updatePurchaseMutation.mutateAsync({
          id: item.id,
          data: {
            purchasedAt: formatDateForAPI(editFormData.date),
            orderedFrom: editFormData.store,
            itemName: item.itemName,
            amount: item.amount,
            quantity: item.quantity,
            notes: editFormData.notes || null,
          },
        })
      }
      setEditingOrder(null)
    } catch (error) {
      console.error('Error updating order:', error)
    }
  }

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return
    try {
      // Delete all purchases in the order by orderId
      await api.delete(`/inventory/purchases/order/${encodeURIComponent(orderToDelete)}`)
      toast.success('Order deleted successfully')
      setOrderToDelete(null)
      // Refresh the purchases list
      refetch()
    } catch (error: any) {
      console.error('Error deleting order:', error)
      toast.error(error.response?.data?.message || 'Failed to delete order')
    }
  }

  const downloadCSV = () => {
    if (!purchases || purchases.length === 0) {
      toast.error('No data to export')
      return
    }

    const headers = ['Order ID', 'Date', 'Supplier', 'Item Name', 'Amount', 'Quantity', 'Notes']
    const rows = purchases.map((p) => [
      p.orderId || `LEGACY-${p.id}`,
      p.purchasedAt,
      p.orderedFrom,
      p.itemName,
      p.amount,
      String(p.quantity),
      p.notes || '',
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `inventory_bought_${monthNames[selectedMonth - 1]}_${selectedYear}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success(`CSV downloaded for ${monthNames[selectedMonth - 1]} ${selectedYear}`)
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                SUPPLIER ORDER HISTORY
              </h2>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  
                </label>
                <select
                  value={`${selectedMonth}-${selectedYear}`}
                  onChange={(e) => handleMonthYearChange(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] focus:outline-none"
                >
                  {generateMonthYearOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/operations/inventory/add-purchase')}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Order Inventory
              </button>
              <button
                onClick={downloadCSV}
                disabled={isLoading || !purchases || purchases.length === 0}
                className="px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-white-200 flex items-center gap-1 disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                CSV
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Supplier</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Order ID</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {groupedOrders.map((order) => (
                  <tr key={order.orderId}>
                    <td className="px-4 py-3 whitespace-nowrap">{order.date}</td>
                    <td className="px-4 py-3">{order.store}</td>
                    <td className="px-4 py-3 text-center font-medium">
                      {order.totalPrice 
                        ? `$${parseFloat(order.totalPrice).toFixed(2)}` 
                        : `$${order.totalAmount.toFixed(2)}`}
                    </td>
                    <td className="px-4 py-3 font-mono text-sm">{order.orderId}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setViewOrderItems(order)}
                          className="p-1 text-gray-600 hover:text-blue-600"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditOrder(order)}
                          className="p-1 text-gray-600 hover:text-green-600"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setOrderToDelete(order.orderId)}
                          className="p-1 text-gray-600 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {groupedOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      No purchases found for this period
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* View Order Dialog */}
      {viewOrderItems && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold">Order Details - {viewOrderItems.orderId}</h3>
              <button onClick={() => setViewOrderItems(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-500">Date:</span>
                  <p className="font-medium">{viewOrderItems.date}</p>
                </div>
                <div>
                  <span className="text-gray-500">Supplier:</span>
                  <p className="font-medium">{viewOrderItems.store}</p>
                </div>
                <div>
                  <span className="text-gray-500">Items Total:</span>
                  <p className="font-medium">${viewOrderItems.totalAmount.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Total Price:</span>
                  <p className="font-medium">
                    {viewOrderItems.totalPrice ? `$${parseFloat(viewOrderItems.totalPrice).toFixed(2)}` : '-'}
                  </p>
                </div>
              </div>
              <table className="w-full">
                <thead className="bg-white">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium">Item Name</th>
                    <th className="px-4 py-2 text-center text-sm font-medium">Qty</th>
                    <th className="px-4 py-2 text-right text-sm font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {viewOrderItems.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-2">{item.itemName}</td>
                      <td className="px-4 py-2 text-center">{item.quantity}</td>
                      <td className="px-4 py-2 text-right">${item.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {viewOrderItems.items[0]?.notes && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium mb-2 text-sm text-gray-700">Notes:</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{viewOrderItems.items[0].notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Dialog */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold">Edit Order - {editingOrder.orderId}</h3>
              <button onClick={() => setEditingOrder(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={editFormData.date}
                    onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                  <select
                    value={
                      editFormData.store && stores.some((s) => s.name === editFormData.store)
                        ? editFormData.store
                        : '__other__'
                    }
                    onChange={(e) => {
                      const v = e.target.value
                      if (v === '__other__') {
                        setEditFormData({ ...editFormData, store: editFormData.store || '' })
                      } else {
                        setEditFormData({ ...editFormData, store: v })
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] focus:outline-none"
                  >
                    <option value="">Select supplier</option>
                    {stores.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                    <option value="__other__">+ Other</option>
                  </select>
                  {(!editFormData.store || !stores.some((s) => s.name === editFormData.store)) && (
                    <input
                      type="text"
                      value={editFormData.store}
                      onChange={(e) => setEditFormData({ ...editFormData, store: e.target.value })}
                      placeholder="Enter supplier name"
                      className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] focus:outline-none"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Price</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editFormData.totalPrice}
                    onChange={(e) => {
                      setEditFormData({ ...editFormData, totalPrice: e.target.value })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] focus:outline-none"
                    placeholder="0.00"
                  />
                  <p className="mt-1 text-xs text-gray-500">Total price for overall order (includes tax, shipping, promotion). Auto-calculated from items, but can be edited.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={editFormData.notes}
                    onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                    placeholder="Add any additional notes about this purchase order..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] focus:outline-none resize-y"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Items</label>
                  <div className="space-y-2">
                    {editFormData.items.map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          value={item.itemName}
                          onChange={(e) => {
                            const newItems = [...editFormData.items]
                            newItems[idx].itemName = e.target.value
                            setEditFormData({ ...editFormData, items: newItems })
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] focus:outline-none"
                        />
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const newItems = [...editFormData.items]
                            newItems[idx].quantity = parseInt(e.target.value) || 0
                            // Auto-calculate totalPrice from items (amount * quantity for each item)
                            const calculatedTotal = newItems.reduce((sum, itm) => {
                              return sum + (parseFloat(itm.amount || '0') )
                            }, 0)
                            setEditFormData({ 
                              ...editFormData, 
                              items: newItems,
                              totalPrice: calculatedTotal.toFixed(2)
                            })
                          }}
                          className="w-20 px-3 py-2 border border-gray-300 rounded-md bg-white focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] focus:outline-none"
                          placeholder="Qty"
                        />
                        <input
                          type="text"
                          value={item.amount}
                          onChange={(e) => {
                            const newItems = [...editFormData.items]
                            newItems[idx].amount = e.target.value
                            // Auto-calculate totalPrice from items (amount * quantity for each item)
                            const calculatedTotal = newItems.reduce((sum, itm) => {
                              return sum + (parseFloat(itm.amount || '0') )
                            }, 0)
                            setEditFormData({ 
                              ...editFormData, 
                              items: newItems,
                              totalPrice: calculatedTotal.toFixed(2)
                            })
                          }}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-md bg-white focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] focus:outline-none"
                          placeholder="Amount"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setEditingOrder(null)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={updatePurchaseMutation.isPending}
                className="px-4 py-2 bg-[#E91E63] text-white rounded-md hover:bg-[#C2185B] disabled:opacity-50"
              >
                {updatePurchaseMutation.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-xl font-semibold mb-4">Delete Order</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete order {orderToDelete}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteOrder}
                disabled={deletePurchaseMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {deletePurchaseMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Advanced Notes Section Component
function AdvancedNotesSection() {
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [noteText, setNoteText] = useState('')
  const [noteType, setNoteType] = useState<'general' | 'technician'>('general')
  const [selectedTeamMemberId, setSelectedTeamMemberId] = useState<string>('')
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [showMentionPopover, setShowMentionPopover] = useState(false)
  const [editNoteDialogOpen, setEditNoteDialogOpen] = useState(false)
  const [noteToEdit, setNoteToEdit] = useState<InventoryNote | null>(null)
  const [editNoteText, setEditNoteText] = useState('')
  const [deleteNoteDialogOpen, setDeleteNoteDialogOpen] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null)
  const [mentionSearch, setMentionSearch] = useState('')
  const [cursorPosition, setCursorPosition] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const { data: teamMembers } = useQuery({
    queryKey: ['/team-members'],
    queryFn: async () => {
      const response = await api.get('/team-members')
      return response.data
    },
  })

  const { data: notes = [], isLoading: isLoadingNotes } = useInventoryNotes(selectedMonth, selectedYear)
  const { data: availableMonths = [] } = useInventoryNotesAvailableMonths()

  // Generate month-year options from available months
  const generateMonthYearOptions = useMemo(() => {
    const options: Array<{ value: string; label: string; month: number; year: number }> = []
    const seen = new Set<string>()

    // Always include current month/year
    const currentKey = `${currentMonth}-${currentYear}`
    options.push({
      value: currentKey,
      label: `${monthNames[currentMonth - 1]} ${currentYear} (Current)`,
      month: currentMonth,
      year: currentYear,
    })
    seen.add(currentKey)

    // Add options from availableMonths
    availableMonths.forEach(({ month, year }) => {
      const key = `${month}-${year}`
      if (!seen.has(key)) {
        options.push({
          value: key,
          label: `${monthNames[month - 1]} ${year}`,
          month,
          year,
        })
        seen.add(key)
      }
    })

    // Sort in descending order (newest first)
    options.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year
      return b.month - a.month
    })

    return options
  }, [availableMonths, currentMonth, currentYear])

  const handleMonthYearChange = (combinedValue: string) => {
    const [month, year] = combinedValue.split('-').map(Number)
    setSelectedMonth(month)
    setSelectedYear(year)
  }
  const createNoteMutation = useCreateInventoryNote()
  const updateNoteMutation = useUpdateInventoryNote()
  const deleteNoteMutation = useDeleteInventoryNote()

  const notesWithTechNames = (notes || []).map((note) => {
    const tech = (teamMembers || []).find((t: any) => t.id === note.teamMemberId)
    return {
      ...note,
      techName: tech?.name,
    }
  })

  // Sort notes by date (newest first)
  const sortedNotes = [...notesWithTechNames].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.nyTimestamp || 0)
    const dateB = new Date(b.createdAt || b.nyTimestamp || 0)
    return dateB.getTime() - dateA.getTime()
  })

  // Calculate pagination
  const totalPages = Math.ceil(sortedNotes.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedNotes = sortedNotes.slice(startIndex, endIndex)

  // Reset to page 1 when notes change
  useEffect(() => {
    setCurrentPage(1)
  }, [notes.length])

  const handleSubmitNote = () => {
    if (noteText.trim()) {
      // Generate nyTimestamp (NY timezone timestamp)
      const now = new Date()
      const nyTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
      const nyTimestamp = nyTime.toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })

      createNoteMutation.mutate({
        noteText: noteText.trim(),
        nyTimestamp,
        noteType,
        teamMemberId: noteType === 'technician' && selectedTeamMemberId ? selectedTeamMemberId : null,
      })
      setNoteText('')
      setNoteType('general')
      setSelectedTeamMemberId('')
    }
  }

  const handleEditNote = (note: InventoryNote) => {
    setNoteToEdit(note)
    setEditNoteText(note.noteText)
    setEditNoteDialogOpen(true)
  }

  const confirmEditNote = () => {
    if (noteToEdit) {
      updateNoteMutation.mutate(
        {
          id: noteToEdit.id,
          noteText: editNoteText,
        },
        {
          onSuccess: () => {
            setEditNoteDialogOpen(false)
            setNoteToEdit(null)
            setEditNoteText('')
          },
        }
      )
    }
  }

  const handleDeleteNote = (noteId: string) => {
    setNoteToDelete(noteId)
    setDeleteNoteDialogOpen(true)
  }

  const confirmDeleteNote = () => {
    if (noteToDelete) {
      deleteNoteMutation.mutate(noteToDelete, {
        onSuccess: () => {
          setDeleteNoteDialogOpen(false)
          setNoteToDelete(null)
        },
      })
    }
  }

  const handleNoteTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    const pos = e.target.selectionStart || 0
    setNoteText(value)
    setCursorPosition(pos)

    // Don't clear technician selection based on note text content
    // Technician selection is independent of note text

    const textBeforeCursor = value.substring(0, pos)
    const words = textBeforeCursor.split(/\s/)
    const lastWord = words[words.length - 1]

    if (lastWord.length >= 4 && teamMembers) {
      const searchTerm = lastWord.toLowerCase()
      const matchingTechs = (teamMembers as any[]).filter((t) =>
        t.name.toLowerCase().includes(searchTerm)
      )
      if (matchingTechs.length > 0) {
        setMentionSearch(lastWord)
        setShowMentionPopover(true)
      } else {
        setShowMentionPopover(false)
      }
    } else {
      setShowMentionPopover(false)
    }
  }

  // Helper function to extract clean technician name (without username)
  const getCleanTechnicianName = (tech: any): string => {
    if (!tech || !tech.name) return ''
    const name = tech.name.trim()
    // Remove username patterns like "Name (username)", "Name - username", "Name [username]", etc.
    // Match patterns at the end: "Name (username)", "Name - username", "Name [username]"
    // Also handle: "Name(username)", "Name-username", etc.
    let cleaned = name
    // Remove parentheses content: "Name (username)" -> "Name"
    cleaned = cleaned.replace(/\s*\([^)]*\)\s*$/, '').trim()
    // Remove brackets content: "Name [username]" -> "Name"
    cleaned = cleaned.replace(/\s*\[[^\]]*\]\s*$/, '').trim()
    // Remove dash-separated username: "Name - username" -> "Name"
    cleaned = cleaned.replace(/\s*-\s*[^-]+$/, '').trim()
    // Return cleaned name, or original if cleaning removed everything
    return cleaned || name
  }

  const handleSelectMention = (tech: any) => {
    // Remove the search term that triggered the mention (e.g., "test")
    // This is the last word before the cursor
    const textBeforeCursor = noteText.substring(0, cursorPosition)
    const textAfterCursor = noteText.substring(cursorPosition)
    const words = textBeforeCursor.split(/\s/)
    words.pop() // Remove the last word (the search term like "test")
    const newTextBefore = words.length > 0 ? words.join(' ') + (textAfterCursor ? ' ' : '') : ''
    const updatedText = newTextBefore + textAfterCursor
    
    setNoteText(updatedText)
    setNoteType('technician')
    setSelectedTeamMemberId(tech.id)
    setShowMentionPopover(false)
    setMentionSearch('')
  }

  const handleTechnicianSelect = (technicianId: string) => {
    if (!technicianId) {
      // If "Select technician" (empty value) is selected, clear the selection
      setSelectedTeamMemberId('')
      setNoteType('general')
      return
    }

    // Find the selected technician
    const selectedTech = (teamMembers as any[])?.find((tech) => tech.id === technicianId)
    if (!selectedTech) return

    const cleanName = getCleanTechnicianName(selectedTech)
    
    // Remove technician's name from note text if it exists
    if (cleanName && noteText) {
      // Create a regex to match the name (case-insensitive) with word boundaries
      const nameRegex = new RegExp(`\\b${cleanName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
      let updatedText = noteText.replace(nameRegex, '').trim()
      // Clean up multiple spaces
      updatedText = updatedText.replace(/\s+/g, ' ')
      setNoteText(updatedText)
    }

    setNoteType('technician')
    setSelectedTeamMemberId(technicianId)
  }

  const filteredTechsForMention =
    (teamMembers as any[])?.filter((t) =>
      t.name.toLowerCase().includes(mentionSearch.toLowerCase())
    ) || []

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <StickyNote className="h-5 w-5" />
                Inventory Notes
              </h2>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  
                </label>
                <select
                  value={`${selectedMonth}-${selectedYear}`}
                  onChange={(e) => handleMonthYearChange(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] focus:outline-none"
                >
                  {generateMonthYearOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* <button
              onClick={() => setIsViewDialogOpen(true)}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center gap-1"
            >
              <Eye className="h-4 w-4" />
              View All
            </button> */}
          </div>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note Type</label>
              <select
                value={noteType}
                onChange={(e) => {
                  setNoteType(e.target.value as 'general' | 'technician')
                  if (e.target.value === 'general') {
                    setSelectedTeamMemberId('')
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] focus:outline-none"
              >
                <option value="general">General</option>
                <option value="technician">Technician</option>
              </select>
            </div>
            {noteType === 'technician' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Technician</label>
                <select
                  value={selectedTeamMemberId}
                  onChange={(e) => handleTechnicianSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] focus:outline-none"
                >
                  <option value="">Select technician</option>
                  {(teamMembers || []).map((tech: any) => (
                    <option key={tech.id} value={tech.id}>
                      {tech.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Add a note</label>
            <p className="text-xs text-gray-500 mb-1">
              Type 4+ characters of a technician's name to quick-select them
            </p>
            <textarea
              value={noteText}
              onChange={handleNoteTextChange}
              placeholder="Enter your note here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[120px] resize-none bg-white focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] focus:outline-none"
            />
            {showMentionPopover && filteredTechsForMention.length > 0 && (
              <div className="absolute z-10 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-auto">
                {filteredTechsForMention.map((tech) => (
                  <button
                    key={tech.id}
                    onClick={() => handleSelectMention(tech)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                  >
                    {tech.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleSubmitNote}
            disabled={!noteText.trim() || createNoteMutation.isPending || (noteType === 'technician' && !selectedTeamMemberId)}
            className="w-full px-4 py-2 bg-[#E91E63] text-white rounded-md hover:bg-[#C2185B] disabled:opacity-50"
          >
            {createNoteMutation.isPending ? 'Submitting...' : 'Submit Note'}
          </button>
          {sortedNotes.length > 0 && (
            <div className="pt-4 border-t">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-700">
                  Notes ({sortedNotes.length})
                </h4>
                {sortedNotes.length > itemsPerPage && (
                  <div className="text-xs text-gray-500">
                    Page {currentPage} of {totalPages}
                  </div>
                )}
              </div>
              <div className="space-y-3">
                {paginatedNotes.map((note) => (
                  <div key={note.id} className="p-3 rounded-lg border border-gray-200 bg-white">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                          {note.noteText}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <p className="text-xs text-gray-500">{note.nyTimestamp}</p>
                          {note.techName && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                              {note.techName}
                            </span>
                          )}
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              note.noteType === 'technician'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {note.noteType === 'technician' ? 'Technician' : 'General'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleEditNote(note)}
                          className="p-1 text-gray-600 hover:text-blue-600"
                          title="Edit note"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1 text-gray-600 hover:text-red-600"
                          title="Delete note"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {sortedNotes.length > itemsPerPage && (
                <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {/* Generate page numbers to display */}
                    {(() => {
                      const pages: (number | string)[] = []
                      
                      // Always show first page
                      if (totalPages <= 7) {
                        // Show all pages if 7 or fewer
                        for (let i = 1; i <= totalPages; i++) {
                          pages.push(i)
                        }
                      } else {
                        // Show first page
                        pages.push(1)
                        
                        if (currentPage > 3) {
                          pages.push('...')
                        }
                        
                        // Show pages around current
                        const start = Math.max(2, currentPage - 1)
                        const end = Math.min(totalPages - 1, currentPage + 1)
                        
                        for (let i = start; i <= end; i++) {
                          if (i !== 1 && i !== totalPages) {
                            pages.push(i)
                          }
                        }
                        
                        if (currentPage < totalPages - 2) {
                          pages.push('...')
                        }
                        
                        // Always show last page
                        if (totalPages > 1) {
                          pages.push(totalPages)
                        }
                      }
                      
                      return pages.map((page, index) => {
                        if (page === '...') {
                          return (
                            <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                              ...
                            </span>
                          )
                        }
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page as number)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                              currentPage === page
                                ? 'bg-[#E91E63] text-white border border-[#E91E63]'
                                : 'border border-gray-300 hover:bg-white'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      })
                    })()}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* View All Notes Dialog */}
      {isViewDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold">
                Notes for {monthNames[selectedMonth - 1]} {selectedYear}
              </h3>
              <button onClick={() => setIsViewDialogOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {isLoadingNotes ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : notesWithTechNames.length > 0 ? (
                <div className="space-y-4">
                  {notesWithTechNames.map((note) => (
                    <div key={note.id} className="p-4 rounded-lg border bg-white">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm whitespace-pre-wrap flex-1">{note.noteText}</p>
                        <div className="flex items-center gap-1">
                          {note.techName && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 mr-1">
                              {note.techName}
                            </span>
                          )}
                          <button
                            onClick={() => handleEditNote(note)}
                            className="p-1 text-gray-600 hover:text-blue-600"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="p-1 text-gray-600 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <p className="text-xs text-gray-500 font-medium">{note.nyTimestamp}</p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            note.noteType === 'technician'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {note.noteType === 'technician' ? 'Technician' : 'General'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No notes for {monthNames[selectedMonth - 1]} {selectedYear}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Note Dialog */}
      {editNoteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-xl font-semibold mb-4">Edit Note</h3>
            <textarea
              value={editNoteText}
              onChange={(e) => setEditNoteText(e.target.value)}
              placeholder="Enter note text..."
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 bg-white focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] focus:outline-none"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setEditNoteDialogOpen(false)
                  setNoteToEdit(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-white"
              >
                Cancel
              </button>
              <button
                onClick={confirmEditNote}
                disabled={updateNoteMutation.isPending || !editNoteText.trim()}
                className="px-4 py-2 bg-[#E91E63] text-white rounded-md hover:bg-[#C2185B] disabled:opacity-50"
              >
                {updateNoteMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Note Dialog */}
      {deleteNoteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-xl font-semibold mb-4">Delete Note</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this note? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteNoteDialogOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-white"
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
    </>
  )
}

// Stores Management Component
function StoresManagement() {
  const { data: stores = [] } = useInventoryStores()
  const createStoreMutation = useCreateInventoryStore()
  const deleteStoreMutation = useDeleteInventoryStore()
  const [newStoreName, setNewStoreName] = useState('')
  const [storeToDelete, setStoreToDelete] = useState<string | null>(null)

  const handleCreateStore = () => {
    if (newStoreName.trim()) {
      createStoreMutation.mutate(
        { name: newStoreName.trim() },
        {
          onSuccess: () => {
            setNewStoreName('')
          },
        }
      )
    }
  }

  const handleDeleteStore = () => {
    if (storeToDelete) {
      deleteStoreMutation.mutate(storeToDelete)
      setStoreToDelete(null)
    }
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Store className="h-5 w-5" />
            Supplier Management
          </h2>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newStoreName}
              onChange={(e) => setNewStoreName(e.target.value)}
              placeholder="Enter store name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateStore()
              }}
            />
            <button
              onClick={handleCreateStore}
              disabled={!newStoreName.trim() || createStoreMutation.isPending}
              className="px-4 py-2 bg-[#E91E63] text-white rounded-md hover:bg-[#C2185B] disabled:opacity-50 flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Store
            </button>
          </div>
          <div className="space-y-2">
            {stores.map((store) => (
              <div key={store.id} className="flex items-center justify-between p-3 bg-white rounded border">
                <span className="font-medium">{store.name}</span>
                <button
                  onClick={() => setStoreToDelete(store.id)}
                  className="p-1 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {stores.length === 0 && (
              <p className="text-center text-gray-500 py-8">No stores added yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Delete Store Confirmation */}
      {storeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-xl font-semibold mb-4">Delete Store</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this store? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setStoreToDelete(null)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStore}
                disabled={deleteStoreMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {deleteStoreMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Inventory Requested Section Component
function InventoryRequestedSection() {
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [selectedSubmission, setSelectedSubmission] = useState<InventoryFormSubmission | null>(null)
  const [editingSubmission, setEditingSubmission] = useState<InventoryFormSubmission | null>(null)
  const [deleteConfirmSubmission, setDeleteConfirmSubmission] = useState<InventoryFormSubmission | null>(null)
  const [isViewAllDialogOpen, setIsViewAllDialogOpen] = useState(false)

  const { data: submissions = [], isLoading } = useInventoryFormSubmissions(selectedMonth, selectedYear)
  const { data: availableMonths = [] } = useInventoryFormSubmissionsAvailableMonths()

  // Generate month-year options from available months
  const generateMonthYearOptions = useMemo(() => {
    const options: Array<{ value: string; label: string; month: number; year: number }> = []
    const seen = new Set<string>()

    // Always include current month/year
    const currentKey = `${currentMonth}-${currentYear}`
    options.push({
      value: currentKey,
      label: `${monthNames[currentMonth - 1]} ${currentYear} (Current)`,
      month: currentMonth,
      year: currentYear,
    })
    seen.add(currentKey)

    // Add options from availableMonths
    availableMonths.forEach(({ month, year }) => {
      const key = `${month}-${year}`
      if (!seen.has(key)) {
        options.push({
          value: key,
          label: `${monthNames[month - 1]} ${year}`,
          month,
          year,
        })
        seen.add(key)
      }
    })

    // Sort in descending order (newest first)
    options.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year
      return b.month - a.month
    })

    return options
  }, [availableMonths, currentMonth, currentYear])

  const handleMonthYearChange = (combinedValue: string) => {
    const [month, year] = combinedValue.split('-').map(Number)
    setSelectedMonth(month)
    setSelectedYear(year)
  }
  const updateSubmissionMutation = useUpdateInventoryFormSubmission()
  const deleteSubmissionMutation = useDeleteInventoryFormSubmission()

  const formatDate = (dateStr: Date | string | null): string => {
    if (!dateStr) return '-'
    const parsed = new Date(dateStr)
    if (!isNaN(parsed.getTime())) {
      return `${parsed.getMonth() + 1}/${parsed.getDate()}/${parsed.getFullYear()}`
    }
    return '-'
  }

  const getSubmissionItemsList = (submission: InventoryFormSubmission) => {
    const products = submission.productSelections as Record<string, number> | null
    const tools = submission.toolSelections as Record<string, number> | null
    const items: Array<{ name: string; quantity: number; type: string }> = []

    if (products && typeof products === 'object') {
      Object.entries(products).forEach(([name, qty]) => {
        if (qty > 0) items.push({ name, quantity: qty, type: 'Product' })
      })
    }
    if (tools && typeof tools === 'object') {
      Object.entries(tools).forEach(([name, qty]) => {
        if (qty > 0) items.push({ name, quantity: qty, type: 'Tool' })
      })
    }

    return items
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-gray-900">INVENTORY REQUESTED</h2>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  
                </label>
                <select
                  value={`${selectedMonth}-${selectedYear}`}
                  onChange={(e) => handleMonthYearChange(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] focus:outline-none"
                >
                  {generateMonthYearOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={() => setIsViewAllDialogOpen(true)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1.5 text-gray-700 transition-colors"
            >
              <AlignJustify className="h-4 w-4" />
              View All
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tech Name</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Date</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {submissions.map((submission) => (
                  <tr key={submission.id}>
                    <td className="px-4 py-3 font-medium">{submission.submitterName}</td>
                    <td className="px-4 py-3 text-center">{formatDate(submission.createdAt)}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedSubmission(submission)}
                          className="p-2 border border-gray-800 text-gray-800 rounded-md hover:bg-gray-50 flex items-center justify-center transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingSubmission(submission)}
                          className="p-2 border border-gray-800 text-gray-800 rounded-md hover:bg-gray-50 flex items-center justify-center transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmSubmission(submission)}
                          className="p-2 border border-red-500 bg-red-50 text-red-500 rounded-md hover:bg-red-100 flex items-center justify-center transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {submissions.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                      No form submissions found for this period
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* View Submission Dialog */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold">
                Items Requested by {selectedSubmission.submitterName}
              </h3>
              <button onClick={() => setSelectedSubmission(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  Submitted on {formatDate(selectedSubmission.createdAt)}
                </p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSubmission.delivered || false}
                    onChange={(e) => {
                      const newDelivered = e.target.checked
                      // Capture previous state for rollback on error
                      const previousSelected = selectedSubmission
                      // Optimistically update the UI
                      setSelectedSubmission({ ...selectedSubmission, delivered: newDelivered })
                      updateSubmissionMutation.mutate(
                        {
                          id: selectedSubmission.id,
                          data: { delivered: newDelivered },
                        },
                        {
                          onError: (error) => {
                            // Roll back to previous state on error
                            setSelectedSubmission(previousSelected)
                            toast.error('Failed to update delivery status. Please try again.')
                            console.error('Error updating submission:', error)
                          },
                        }
                      )
                    }}
                    disabled={updateSubmissionMutation.isPending}
                    className="w-4 h-4 text-[#E91E63] border-gray-300 rounded focus:ring-[#E91E63] focus:ring-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="text-sm font-medium text-gray-700">Delivered</span>
                </label>
              </div>
              <table className="w-full">
                <thead className="bg-white">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium">Item</th>
                    <th className="px-4 py-2 text-center text-sm font-medium">Quantity</th>
                    <th className="px-4 py-2 text-center text-sm font-medium">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {getSubmissionItemsList(selectedSubmission).map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 font-medium">{item.name}</td>
                      <td className="px-4 py-2 text-center">{item.quantity}</td>
                      <td className="px-4 py-2 text-center">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            item.type === 'Product'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          {item.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {selectedSubmission.additionalNotes && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium mb-2">Additional Notes:</h4>
                  <p className="text-sm text-gray-600">{selectedSubmission.additionalNotes}</p>
                </div>
              )}
              {selectedSubmission.returningEmptyGallons && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Droplet className="h-4 w-4 text-blue-600" />
                    Returning Empty Gallons:
                  </h4>
                  <p className="text-sm text-gray-600">{selectedSubmission.returningEmptyGallons}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Submission Dialog */}
      {editingSubmission && (
        <EditSubmissionDialog
          submission={editingSubmission}
          onClose={() => setEditingSubmission(null)}
          onSave={(data) => {
            if (editingSubmission) {
              updateSubmissionMutation.mutate({ id: editingSubmission.id, data })
              setEditingSubmission(null)
            }
          }}
          isPending={updateSubmissionMutation.isPending}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-xl font-semibold mb-4">Delete Submission</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the submission by {deleteConfirmSubmission.submitterName}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmSubmission(null)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteSubmissionMutation.mutate(deleteConfirmSubmission.id)
                  setDeleteConfirmSubmission(null)
                }}
                disabled={deleteSubmissionMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {deleteSubmissionMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View All Dialog */}
      {isViewAllDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold">
                All Inventory Requests - {monthNames[selectedMonth - 1]} {selectedYear}
              </h3>
              <button 
                onClick={() => setIsViewAllDialogOpen(false)} 
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tech Name</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Date</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Items</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Returning Empty Gallons</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {submissions.map((submission) => {
                        const items = getSubmissionItemsList(submission)
                        return (
                          <tr key={submission.id}>
                            <td className="px-4 py-3 font-medium">{submission.submitterName}</td>
                            <td className="px-4 py-3 text-center">{formatDate(submission.createdAt)}</td>
                            <td className="px-4 py-3">
                              {items.length > 0 ? (
                                <div className="flex flex-col gap-1">
                                  {items.map((item, idx) => (
                                    <div key={idx} className="text-sm">
                                      {item.name} ({item.quantity})
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400">No items</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {submission.returningEmptyGallons ? (
                                <div className="flex items-center justify-center gap-1.5 text-blue-600">
                                  <Droplet className="h-4 w-4" />
                                  <span className="text-sm font-medium">{submission.returningEmptyGallons}</span>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                      {submissions.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                            No form submissions found for this period
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Edit Submission Dialog Component
function EditSubmissionDialog({
  submission,
  onClose,
  onSave,
  isPending,
}: {
  submission: InventoryFormSubmission | null
  onClose: () => void
  onSave: (data: Partial<InventoryFormSubmission>) => void
  isPending: boolean
}) {
  const [submitterName, setSubmitterName] = useState('')
  const [productSelections, setProductSelections] = useState<Record<string, number>>({})
  const [toolSelections, setToolSelections] = useState<Record<string, number>>({})
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [returningEmptyGallons, setReturningEmptyGallons] = useState('')

  useEffect(() => {
    if (submission) {
      setSubmitterName(submission.submitterName || '')
      setProductSelections((submission.productSelections as Record<string, number>) || {})
      setToolSelections((submission.toolSelections as Record<string, number>) || {})
      setAdditionalNotes(submission.additionalNotes || '')
      setReturningEmptyGallons(submission.returningEmptyGallons || '')
    }
  }, [submission])

  const handleSave = () => {
    onSave({
      submitterName,
      productSelections,
      toolSelections,
      additionalNotes,
      returningEmptyGallons,
    })
  }

  const updateQuantity = (type: 'product' | 'tool', name: string, delta: number) => {
    if (type === 'product') {
      setProductSelections((prev) => {
        const newVal = Math.max(0, (prev[name] || 0) + delta)
        if (newVal === 0) {
          const { [name]: _, ...rest } = prev
          return rest
        }
        return { ...prev, [name]: newVal }
      })
    } else {
      setToolSelections((prev) => {
        const newVal = Math.max(0, (prev[name] || 0) + delta)
        if (newVal === 0) {
          const { [name]: _, ...rest } = prev
          return rest
        }
        return { ...prev, [name]: newVal }
      })
    }
  }

  const allItems = [
    ...Object.entries(productSelections).map(([name, qty]) => ({ name, quantity: qty, type: 'product' as const })),
    ...Object.entries(toolSelections).map(([name, qty]) => ({ name, quantity: qty, type: 'tool' as const })),
  ]

  if (!submission) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-xl font-semibold">Edit Submission</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Submitter Name</label>
              <input
                type="text"
                value={submitterName}
                onChange={(e) => setSubmitterName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Items ({allItems.length} items)</label>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-white">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium">Item</th>
                      <th className="px-4 py-2 text-center text-sm font-medium">Quantity</th>
                      <th className="px-4 py-2 text-center text-sm font-medium">Type</th>
                      <th className="px-4 py-2 text-center text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {allItems.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 font-medium">{item.name}</td>
                        <td className="px-4 py-2 text-center">{item.quantity}</td>
                        <td className="px-4 py-2 text-center">
                          <span
                            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              item.type === 'product'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}
                          >
                            {item.type === 'product' ? 'Product' : 'Tool'}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => updateQuantity(item.type, item.name, -1)}
                              className="px-2 py-1 border border-gray-300 rounded hover:bg-white"
                            >
                              -
                            </button>
                            <button
                              onClick={() => updateQuantity(item.type, item.name, 1)}
                              className="px-2 py-1 border border-gray-300 rounded hover:bg-white"
                            >
                              +
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {allItems.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-4 text-center text-gray-500">
                          No items in this submission
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Returning Empty Gallons</label>
              <input
                type="text"
                value={returningEmptyGallons}
                onChange={(e) => setReturningEmptyGallons(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] focus:outline-none"
              />
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="px-4 py-2 bg-[#E91E63] text-white rounded-md hover:bg-[#C2185B] disabled:opacity-50"
          >
            {isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Technician History Dialog Component
function TechnicianHistoryDialog({
  technician,
  isOpen,
  onClose,
  selectedMonth,
  selectedYear,
  specificDate,
}: {
  technician: { id: string; techName: string } | null
  isOpen: boolean
  onClose: () => void
  selectedMonth: number
  selectedYear: number
  specificDate?: string | null
}) {
  const { data: purchases = [], isLoading } = useInventoryTechnicianPurchases(technician?.id || null)

  const monthShortNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthName = monthShortNames[selectedMonth - 1]

  const parseToDateKey = (dateStr: string): string => {
    const parsed = new Date(dateStr)
    if (!isNaN(parsed.getTime())) {
      const year = parsed.getFullYear()
      const month = String(parsed.getMonth() + 1).padStart(2, '0')
      const day = String(parsed.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    return dateStr.replace(/\s+/g, ' ').trim().toLowerCase()
  }

  const formatDateKeyForDisplay = (dateKey: string): string => {
    const parts = dateKey.split('-')
    if (parts.length === 3 && parts.every((p) => !isNaN(parseInt(p)))) {
      const [year, month, day] = parts
      return `${parseInt(month)}/${parseInt(day)}/${year}`
    }
    return dateKey
  }

  const formatPurchaseDateForDisplay = (dateStr: string): string => {
    if (!dateStr) return '-'
    const slashMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
    if (slashMatch) {
      const [, month, day, year] = slashMatch
      return `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`
    }
    const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (isoMatch) {
      const [, year, month, day] = isoMatch
      return `${month}/${day}/${year}`
    }
    const parsed = new Date(dateStr)
    if (!isNaN(parsed.getTime())) {
      const m = String(parsed.getMonth() + 1).padStart(2, '0')
      const d = String(parsed.getDate()).padStart(2, '0')
      return `${m}/${d}/${parsed.getFullYear()}`
    }
    return dateStr
  }

  const filteredPurchases = purchases?.filter((p: any) => {
    const dateStr = p.purchaseDate
    if (specificDate) {
      const purchaseDateKey = parseToDateKey(dateStr)
      return purchaseDateKey === specificDate
    }
    return dateStr.includes(monthName) && dateStr.includes(selectedYear.toString())
  }) || []

  const formatItems = (purchase: any) => {
    const parsed = purchase.itemsParsed
    if (parsed && Array.isArray(parsed)) {
      return (
        <ol className="list-decimal list-inside space-y-0.5 text-sm">
          {parsed.map((item: any, index: number) => (
            <li key={index}>
              {item.name} <span className="text-gray-500">({item.quantity})</span>
            </li>
          ))}
        </ol>
      )
    }
    return <span className="whitespace-pre-line">{purchase.itemsRaw || '-'}</span>
  }

  if (!isOpen || !technician) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-xl font-semibold">
            Requested History: {technician.techName}{' '}
            {specificDate ? (
              <>({formatDateKeyForDisplay(specificDate)})</>
            ) : (
              <>
                ({monthName} {selectedYear})
              </>
            )}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-white border-b px-4 py-3 grid grid-cols-[120px_1fr] gap-4">
                <div className="font-medium text-sm">Date</div>
                <div className="font-medium text-sm">Items Requested</div>
              </div>
              <div className="max-h-[350px] overflow-y-auto">
                <div className="divide-y">
                  {filteredPurchases.map((purchase: any) => (
                    <div
                      key={purchase.id}
                      className="px-4 py-3 grid grid-cols-[120px_1fr] gap-4"
                    >
                      <div className="font-medium whitespace-nowrap text-sm">
                        {formatPurchaseDateForDisplay(purchase.purchaseDate)}
                      </div>
                      <div className="text-sm break-words">{formatItems(purchase)}</div>
                    </div>
                  ))}
                  {filteredPurchases.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      No Requested history found for{' '}
                      {specificDate
                        ? formatDateKeyForDisplay(specificDate)
                        : `${monthName} ${selectedYear}`}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
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

  // Removed tabs - showing all sections in sequence like Replit
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [itemToEdit, setItemToEdit] = useState<InventoryType | null>(null)
  const [itemToDelete, setItemToDelete] = useState<InventoryType | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<InventoryCategory | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showDeleteCategoryDialog, setShowDeleteCategoryDialog] = useState(false)
  const [showAddItemDialog, setShowAddItemDialog] = useState(false)
  const [showEditItemDialog, setShowEditItemDialog] = useState(false)
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<InventoryCategory | null>(null)
  const [selectedStoreFilter, setSelectedStoreFilter] = useState<string>('all')
  const [isEditFormDialogOpen, setIsEditFormDialogOpen] = useState(false)
  const [isAddPurchaseDialogOpen, setIsAddPurchaseDialogOpen] = useState(false)
  const [isManageStoresDialogOpen, setIsManageStoresDialogOpen] = useState(false)
  const [selectedTechnician, setSelectedTechnician] = useState<{ id: string; techName: string } | null>(null)
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false)
  const [selectedViewDate, setSelectedViewDate] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const hasAutoExpandedRef = useRef(false)

  const isCurrentMonth = selectedMonth === currentMonth && selectedYear === currentYear

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

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
  const { data: columnDefinitions = [] } = useInventoryColumnDefinitions()
  // Defensive check: ensure columnDefinitions is always an array
  const safeColumnDefinitions = Array.isArray(columnDefinitions) ? columnDefinitions : []
  const { data: snapshot } = useInventorySnapshot(
    !isCurrentMonth ? selectedMonth : undefined,
    !isCurrentMonth ? selectedYear : undefined
  )
  const { data: stores = [] } = useInventoryStores()
  const { data: availableMonths = [] } = useInventorySnapshotMonths()

  // Auto-expand first category on page load if categories exist
  useEffect(() => {
    if (categories.length > 0 && !hasAutoExpandedRef.current && !isLoadingCategories) {
      setExpandedCategories(new Set([categories[0].id]))
      hasAutoExpandedRef.current = true
    }
  }, [categories, isLoadingCategories])

  const deleteMutation = useDeleteInventoryItem()
  const deleteCategoryMutation = useDeleteInventoryCategory()

  const handleSignOut = () => {
    dispatch(logout())
    navigate('/signin')
  }

  // Generate month-year options from available snapshots
  const generateMonthYearOptions = useMemo(() => {
    const options: Array<{ value: string; label: string; month: number; year: number }> = []
    const seen = new Set<string>()

    // Always include current month/year
    const currentKey = `${currentMonth}-${currentYear}`
    options.push({
      value: currentKey,
      label: `${monthNames[currentMonth - 1]} ${currentYear} (Current)`,
      month: currentMonth,
      year: currentYear,
    })
    seen.add(currentKey)

    // Add options from availableMonths
    availableMonths.forEach(({ month, year }) => {
      const key = `${month}-${year}`
      if (!seen.has(key)) {
        options.push({
          value: key,
          label: `${monthNames[month - 1]} ${year}`,
          month,
          year,
        })
        seen.add(key)
      }
    })

    // Sort in descending order (newest first)
    options.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year
      return b.month - a.month
    })

    return options
  }, [availableMonths, currentMonth, currentYear])

  const handleMonthYearChange = (combinedValue: string) => {
    const [month, year] = combinedValue.split('-').map(Number)
    setSelectedMonth(month)
    setSelectedYear(year)
    setItemToEdit(null)
  }

  const getItemsForCategory = (categoryId: string): InventoryType[] => {
    let items: InventoryType[] = []
    if (isCurrentMonth) {
      items = inventory.filter((item) => item.categoryId === categoryId)
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
          totalInventory: item.totalInventory || 0,
          pricePerUnit: item.pricePerUnit || null,
          idealTotalInventory: 0,
          toBeOrdered: 0,
          totalRequested: 0,
          threshold: item.threshold || 3,
          rowNumber: item.rowNumber || null,
          preferredStore: null,
          createdAt: '',
          updatedAt: '',
        }))
    }
    
    // Apply store filter
    if (selectedStoreFilter !== 'all') {
      const selectedStore = stores.find((s) => s.id === selectedStoreFilter)
      if (selectedStore) {
        items = items.filter((item) => 
          item.preferredStore?.toLowerCase() === selectedStore.name?.toLowerCase()
        )
      }
    }
    
    return items
  }

  const downloadOrderListCSV = () => {
    const allItems = categories.flatMap((cat) => getItemsForCategory(cat.id))
    if (!allItems || allItems.length === 0) {
      toast.error('No data to export')
      return
    }

    const headers = ['Item Name', 'To Be Ordered']
    const rows = allItems.map((item) => {
      const itemName = item.name || '-'
      const toBeOrdered = Math.max(0, (item.idealTotalInventory || 0) - (item.totalInventory || 0))
      return [itemName, toBeOrdered]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `order_list_${monthNames[selectedMonth - 1]}_${selectedYear}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success(`Order list for ${monthNames[selectedMonth - 1]} ${selectedYear} has been downloaded.`)
  }

  const handleEditClick = (item: InventoryType) => {
    setItemToEdit(item)
    setShowEditItemDialog(true)
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
    // Check if category has items
    const categoryItems = getItemsForCategory(category.id)
    if (categoryItems.length > 0) {
      toast.error(`Cannot delete category "${category.name}". Please delete all items in this category first.`)
      return
    }
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
      <div className="min-h-screen bg-white">
        {/* Header Navigation */}
        <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
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
      <div className="min-h-screen bg-white">
        {/* Header Navigation */}
        <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
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
    <div className="min-h-screen bg-white">
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

      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 sticky top-0 bg-white z-30 py-4 -mt-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Inventory
                </h1>
                <p className="text-gray-600 mt-2">
                  {isCurrentMonth
                    ? "Manage your products and tools inventory. Click on editable fields to update values."
                    : `Viewing historical inventory data for ${monthNames[selectedMonth - 1]} ${selectedYear}.`}
                </p>
              </div>
              <div className="flex gap-3">
                <Link to="/operations">
                  <button className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-white flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Back to Operations
                  </button>
                </Link>
                <button
                  onClick={() => navigate('/settings#inventory-custom-fields')}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-white flex items-center gap-2"
                  title="Open Inventory Item Custom Fields Settings"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={downloadOrderListCSV}
                disabled={isLoadingInventory || inventory.length === 0}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-white flex items-center gap-2 disabled:opacity-50 w-full sm:w-auto"
              >
                <Download className="h-4 w-4" />
                Download Order List
              </button>
              {/* <button
                onClick={() => setIsEditFormDialogOpen(true)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-white flex items-center gap-2 w-full sm:w-auto"
              >
                <Settings className="h-4 w-4" />
                Edit Form
              </button> */}
              <button
                onClick={() => setIsManageStoresDialogOpen(true)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-white flex items-center gap-2 w-full sm:w-auto"
              >
                <Store className="h-4 w-4" />
                New Supplier
              </button>
              {isCurrentMonth && (
                <>
                  <button
                    onClick={() => navigate('/operations/inventory/add-purchase')}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-white flex items-center gap-1 h-10 w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4" />
                    Order Inventory
                  </button>
                  <button
                    onClick={() => setShowAddCategoryDialog(true)}
                    className="px-4 py-2 text-sm bg-[#E91E63] text-white rounded-md hover:bg-[#C2185B] flex items-center gap-2 w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4" />
                    Add New Category
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* <InventoryBudgetCards
          snapshotData={snapshot?.snapshotData as MetricRow[] | undefined}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        /> */}

        {isLoadingInventory || isLoadingCategories ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="border rounded-lg bg-white p-4">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <span className="text-xl font-bold flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  INVENTORY ITEMS
                </span>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    
                  </label>
                  <select
                    value={`${selectedMonth}-${selectedYear}`}
                    onChange={(e) => handleMonthYearChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] focus:outline-none"
                  >
                    {generateMonthYearOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <select
                    value={selectedStoreFilter}
                    onChange={(e) => setSelectedStoreFilter(e.target.value)}
                    className="pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm w-[180px] bg-white focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] focus:outline-none"
                  >
                    <option value="all">All Suppliers</option>
                    {stores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="max-h-[70vh] overflow-y-auto space-y-6">
                {categories.map((category) => {
                  const isExpanded = expandedCategories.has(category.id)
                  return (
                  <div key={category.id} className="border rounded-lg bg-white">
                    <div className="border-b border-gray-200">
                      <div className="p-4 flex items-center justify-between">
                        <div 
                          className="flex items-center gap-2 cursor-pointer hover:bg-white -m-4 p-4 flex-1"
                          onClick={() => toggleCategory(category.id)}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5 text-gray-600" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-gray-600" />
                          )}
                          <h2 className="text-xl font-bold text-gray-900">{category.name.toUpperCase()}</h2>
                        </div>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          {!isCurrentMonth && (
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                              Historical Snapshot (Read Only)
                            </span>
                          )}
                          {isCurrentMonth && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedCategory(category)
                                  setShowAddItemDialog(true)
                                }}
                                className="h-8 px-3 text-sm border border-gray-300 rounded-md hover:bg-white flex items-center gap-1"
                              >
                                <Plus className="h-4 w-4" />
                                Add
                              </button>
                              <button
                                onClick={() => handleDeleteCategoryClick(category)}
                                disabled={deleteCategoryMutation.isPending}
                                className="h-8 px-3 text-sm border border-red-300 text-red-600 rounded-md hover:bg-red-50 disabled:opacity-50 flex items-center gap-1"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                    <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 bg-white">
                          Item Name
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 bg-white">
                          Preferred Supplier
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 bg-white">
                          Inventory
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 bg-white">
                          Ideal Inventory
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 bg-white">
                          To Be Ordered
                        </th>
                        {columnDefinitions
                          .filter(col => col.isVisible)
                          .sort((a, b) => a.displayOrder - b.displayOrder)
                          .map((col) => (
                            <th key={col.id} className="px-4 py-3 text-center text-sm font-medium text-gray-700 bg-white">
                              {col.columnLabel}
                            </th>
                          ))}
                        {isCurrentMonth && (
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 bg-white">
                            Actions
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {getItemsForCategory(category.id).map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3">
                            <span>{item.name}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span>{item.preferredStore || '-'}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span>{item.totalInventory}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span>{item.idealTotalInventory}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span>{Math.max(0, (item.idealTotalInventory || 0) - (item.totalInventory || 0))}</span>
                          </td>
                          {safeColumnDefinitions
                            .filter(col => col.isVisible)
                            .sort((a, b) => a.displayOrder - b.displayOrder)
                            .map((col) => {
                              const dynamicValue = item.dynamicFields?.[col.columnKey] || ''
                              return (
                                <td key={col.id} className="px-4 py-3 text-center">
                                  <span>{dynamicValue || '-'}</span>
                                </td>
                              )
                            })}
                          {isCurrentMonth && (
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleEditClick(item)}
                                  className="text-blue-600 hover:text-blue-700"
                                  title="Edit item"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(item)}
                                  className="text-red-600 hover:text-red-700"
                                  title="Delete item"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                      {getItemsForCategory(category.id).length === 0 && (
                        <tr>
                          <td colSpan={isCurrentMonth ? 7 + columnDefinitions.filter(col => col.isVisible).length : 6 + columnDefinitions.filter(col => col.isVisible).length} className="px-4 py-8 text-center text-gray-500">
                            No items in this category
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                    </div>
                    )}
                  </div>
                  )
                })}
              </div>
            </div>
          <SupplierOrderHistoryTable inventoryItems={inventory} />
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-4">
              <InventoryRequestedSection />
            </div>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-4">
              <AdvancedNotesSection />
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
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-white"
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
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-white"
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

        {/* Edit Item Dialog */}
        {showEditItemDialog && itemToEdit && (
          <EditItemDialog
            item={itemToEdit}
            columnDefinitions={columnDefinitions}
            stores={stores}
            onClose={() => {
              setShowEditItemDialog(false)
              setItemToEdit(null)
            }}
          />
        )}

        {/* Add Category Dialog */}
        {showAddCategoryDialog && (
          <AddCategoryDialog
            onClose={() => setShowAddCategoryDialog(false)}
          />
        )}

        {/* Technician History Dialog */}
        <TechnicianHistoryDialog
          technician={selectedTechnician}
          isOpen={isHistoryDialogOpen}
          onClose={() => {
            setIsHistoryDialogOpen(false)
            setSelectedTechnician(null)
            setSelectedViewDate(null)
          }}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          specificDate={selectedViewDate}
        />

        {/* Add Purchase Dialog */}
        {isAddPurchaseDialogOpen && (
          <AddPurchaseDialog
            isOpen={isAddPurchaseDialogOpen}
            onClose={() => setIsAddPurchaseDialogOpen(false)}
            inventoryItems={inventory}
          />
        )}

        {/* Edit Form Config Dialog */}
        {isEditFormDialogOpen && (
          <EditFormConfigDialog
            isOpen={isEditFormDialogOpen}
            onClose={() => setIsEditFormDialogOpen(false)}
          />
        )}

        {/* Manage Stores Dialog */}
        {isManageStoresDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-semibold">Manage Suppliers</h3>
                <button onClick={() => setIsManageStoresDialogOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <StoresManagement />
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          <InventoryBudgetCards
            snapshotData={snapshot?.snapshotData as MetricRow[] | undefined}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />
        </div>
      </div>
    </div>
  )
}

// Add Purchase Dialog Component
interface DraftPurchase {
  itemName: string
  itemId: string | null
  orderedFrom: string
  amount: string
  quantity: number
  purchasedAt: string
  notes?: string | null
}

function AddPurchaseDialog({
  isOpen,
  onClose,
  inventoryItems,
}: {
  isOpen: boolean
  onClose: () => void
  inventoryItems: InventoryType[]
}) {
  const [itemName, setItemName] = useState('')
  const [itemId, setItemId] = useState<string | null>(null)
  const [orderedFrom, setOrderedFrom] = useState('')
  const [customOrderedFrom, setCustomOrderedFrom] = useState('')
  const [amount, setAmount] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [purchasedAt, setPurchasedAt] = useState<string | null>(() => getTodayNY())
  const [notes, setNotes] = useState('')
  const [draftPurchases, setDraftPurchases] = useState<DraftPurchase[]>([])

  const createPurchases = useCreateInventoryPurchases()

  const resetForm = () => {
    setItemName('')
    setItemId(null)
    setOrderedFrom('')
    setCustomOrderedFrom('')
    setAmount('')
    setQuantity(1)
    setPurchasedAt(getTodayNY())
    setNotes('')
  }

  const handleClose = () => {
    resetForm()
    setDraftPurchases([])
    onClose()
  }

  const getCurrentFormData = (): DraftPurchase | null => {
    if (!itemName.trim()) return null
    const finalOrderedFrom = orderedFrom === 'Other' ? customOrderedFrom.trim() : orderedFrom
    if (!finalOrderedFrom) return null
    if (!amount.trim()) return null
    if (!purchasedAt) return null

    return {
      itemName: itemName.trim(),
      itemId,
      orderedFrom: finalOrderedFrom,
      amount: amount.trim(),
      quantity,
      purchasedAt: purchasedAt,
      notes: notes.trim() || null,
    }
  }

  const handleAddNext = () => {
    const currentData = getCurrentFormData()
    if (!currentData) {
      toast.error('Please fill in all required fields')
      return
    }
    setDraftPurchases([...draftPurchases, currentData])
    resetForm()
  }

  const handleAddRecord = () => {
    const currentData = getCurrentFormData()
    const allPurchases = [...draftPurchases, ...(currentData ? [currentData] : [])]

    if (allPurchases.length === 0) {
      toast.error('Please add at least one purchase')
      return
    }

    createPurchases.mutate(
      {
        purchases: allPurchases.map((p) => ({
          itemId: p.itemId,
          itemName: p.itemName,
          orderedFrom: p.orderedFrom,
          amount: p.amount,
          quantity: p.quantity,
          purchasedAt: p.purchasedAt,
          notes: p.notes || null,
        })),
      },
      {
        onSuccess: () => {
          handleClose()
        },
      }
    )
  }

  const handleRemoveDraft = (index: number) => {
    setDraftPurchases(draftPurchases.filter((_, i) => i !== index))
  }

  const handleItemSelect = (value: string) => {
    const selectedItem = inventoryItems.find((item) => item.id === value)
    if (selectedItem) {
      setItemId(selectedItem.id)
      setItemName(selectedItem.name)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">Add Inventory Purchase</h3>
            <p className="text-sm text-gray-600 mt-1">
              Record purchased inventory items. Use "Add Next" to add multiple entries before submitting.
            </p>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-4">
            {draftPurchases.length > 0 && (
              <div className="border rounded-lg p-3 bg-white">
                <p className="text-sm font-medium mb-2">
                  Pending Entries ({draftPurchases.length})
                </p>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {draftPurchases.map((draft, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm bg-white rounded p-2"
                    >
                      <span className="truncate flex-1">
                        {draft.itemName} - {draft.orderedFrom} - ${draft.amount} x {draft.quantity}
                        {draft.notes && <span className="text-gray-500 ml-2">(has notes)</span>}
                      </span>
                      <button
                        onClick={() => handleRemoveDraft(index)}
                        className="ml-2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Name <span className="text-red-500">*</span>
              </label>
              <select
                value={itemId || ''}
                onChange={(e) => handleItemSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] focus:outline-none"
              >
                <option value="">Select an item</option>
                {inventoryItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ordered From <span className="text-red-500">*</span>
              </label>
              <select
                value={orderedFrom}
                onChange={(e) => setOrderedFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] focus:outline-none"
              >
                <option value="">Select supplier</option>
                {ORDERED_FROM_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {orderedFrom === 'Other' && (
                <input
                  type="text"
                  placeholder="Enter supplier name"
                  value={customOrderedFrom}
                  onChange={(e) => setCustomOrderedFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2 bg-white focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] focus:outline-none"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., $25.99"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={purchasedAt || ''}
                onChange={(e) => setPurchasedAt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes about this purchase..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] focus:outline-none resize-y"
              />
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAddNext}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-white flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Add Next
          </button>
          <button
            onClick={handleAddRecord}
            disabled={createPurchases.isPending}
            className="px-4 py-2 bg-[#E91E63] text-white rounded-md hover:bg-[#C2185B] disabled:opacity-50 flex items-center gap-1"
          >
            {createPurchases.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Add Record
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Edit Form Config Dialog Component
function EditFormConfigDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const { data: formConfigData, isLoading } = useInventoryFormConfig()
  const { data: publicFormKeyData } = usePublicFormKey()
  const { data: teamMemberTypes = [] } = useTeamMemberTypes()
  const bulkUpdateMutation = useBulkUpdateInventoryFormConfig()
  const updateCategoryVisibility = useUpdateInventoryCategory()
  const [localConfigs, setLocalConfigs] = useState<Record<string, InventoryFormConfig>>({})
  const [hasChanges, setHasChanges] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  // Get active Team Member Types
  const activeTeamMemberTypes = useMemo(
    () => teamMemberTypes.filter(type => type.isActive),
    [teamMemberTypes]
  )

  useEffect(() => {
    if (formConfigData) {
      const configMap: Record<string, InventoryFormConfig> = {}
      for (const config of formConfigData.formConfig) {
        const key = `${config.categoryName}:${config.fieldName}`
        // Ensure dropdownMaxByType exists and has all active Team Member Types
        const maxByType = config.dropdownMaxByType || {}
        const updatedMaxByType: Record<string, number> = { ...maxByType }
        
        // Add any missing Team Member Types with default value of 5
        activeTeamMemberTypes.forEach(type => {
          if (!(type.name in updatedMaxByType)) {
            updatedMaxByType[type.name] = 5
          }
        })
        
        configMap[key] = {
          ...config,
          dropdownMaxByType: updatedMaxByType,
        }
      }
      setLocalConfigs(configMap)
      setHasChanges(false)
      if (formConfigData.categories.length > 0 && !selectedCategory) {
        setSelectedCategory(formConfigData.categories[0].name)
      }
    }
  }, [formConfigData, activeTeamMemberTypes])

  const getConfigForItem = (categoryName: string, itemName: string): InventoryFormConfig => {
    const key = `${categoryName}:${itemName}`
    const defaultMaxByType: Record<string, number> = {}
    activeTeamMemberTypes.forEach(type => {
      defaultMaxByType[type.name] = 5
    })
    return (
      localConfigs[key] || {
        id: '',
        fieldName: itemName,
        fieldType: 'dropdown',
        categoryName,
        isVisible: true,
        isRequired: false,
        dropdownMin: 1,
        dropdownMaxByType: defaultMaxByType,
        displayOrder: 0,
        createdAt: '',
        updatedAt: '',
      }
    )
  }

  const updateConfig = (
    categoryName: string,
    itemName: string,
    updates: Partial<InventoryFormConfig>
  ) => {
    const key = `${categoryName}:${itemName}`
    const currentConfig = getConfigForItem(categoryName, itemName)

    const newConfig = { ...currentConfig, ...updates }
    
    // Handle dropdownMaxByType updates
    if (updates.dropdownMaxByType) {
      newConfig.dropdownMaxByType = { ...currentConfig.dropdownMaxByType, ...updates.dropdownMaxByType }
    }
    
    // Validate min <= all max values
    const maxByType = newConfig.dropdownMaxByType || {}
    Object.keys(maxByType).forEach(typeName => {
      if (newConfig.dropdownMin > maxByType[typeName]) {
        if (updates.dropdownMin !== undefined) {
          newConfig.dropdownMin = Math.min(...Object.values(maxByType))
        } else {
          maxByType[typeName] = newConfig.dropdownMin
        }
      }
      if (maxByType[typeName] < 1) maxByType[typeName] = 1
    })
    newConfig.dropdownMaxByType = maxByType
    
    if (newConfig.dropdownMin < 1) newConfig.dropdownMin = 1

    setLocalConfigs({
      ...localConfigs,
      [key]: newConfig,
    })
    setHasChanges(true)
  }

  const handleSave = () => {
    const configs = Object.values(localConfigs)
    bulkUpdateMutation.mutate(configs, {
      onSuccess: () => {
        setHasChanges(false)
        onClose()
      },
    })
  }

  const handleClose = () => {
    setHasChanges(false)
    onClose()
  }

  const getItemsForCategory = (categoryId: string) => {
    return (formConfigData?.inventory || []).filter((item) => item.categoryId === categoryId)
  }

  const publicFormUrl = publicFormKeyData?.publicFormKey
    ? `${window.location.origin}/public/inventory-form?key=${encodeURIComponent(publicFormKeyData.publicFormKey)}`
    : `${window.location.origin}/public/inventory-form`

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-xl font-semibold">Edit Form Configuration</h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 border-b border-gray-200 bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Public Form Link</p>
              <p className="text-xs text-blue-600 mt-1">{publicFormUrl}</p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(publicFormUrl)
                toast.success('Link copied to clipboard!')
              }}
              className="px-3 py-1 text-sm border border-[#E91E63] rounded-md hover:bg-pink-50 text-[#E91E63]"
            >
              Copy Link
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#E91E63]" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Category Tabs */}
              <div className="flex gap-2 border-b border-gray-200">
                {(formConfigData?.categories || []).map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`px-4 py-2 text-sm font-medium border-b-2 ${
                      selectedCategory === category.name
                        ? 'border-[#E91E63] text-[#E91E63]'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              {/* Category Content */}
              {(formConfigData?.categories || []).map((category) => {
                if (selectedCategory !== category.name) return null

                return (
                  <div key={category.id} className="space-y-4">
                    <div className="p-3 bg-white rounded-lg border">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            updateCategoryVisibility.mutate(
                              {
                                id: category.id,
                                data: { isVisibleOnForm: !(category.isVisibleOnForm !== false) },
                              },
                              {
                                onSuccess: () => {
                                  toast.success('Category visibility updated')
                                },
                              }
                            )
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#E91E63] focus:ring-offset-2 ${
                            category.isVisibleOnForm !== false ? 'bg-[#E91E63]' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              category.isVisibleOnForm !== false ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span className="text-sm font-medium">
                          Show "{category.name}" category on public form
                        </span>
                        {category.isVisibleOnForm === false && (
                          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                            Hidden from form
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left p-2 text-sm font-medium">Field Name</th>
                            <th className="text-center p-2 text-sm font-medium">Visible</th>
                            <th className="text-center p-2 text-sm font-medium">Required</th>
                            <th className="text-center p-2 text-sm font-medium">Min Dropdown</th>
                            {activeTeamMemberTypes.map((type) => (
                              <th key={type.id} className="text-center p-2 text-sm font-medium">
                                Max {type.name} Dropdown
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {getItemsForCategory(category.id).map((item) => {
                            const config = getConfigForItem(category.name, item.name)
                            return (
                              <tr key={item.id} className="border-b border-gray-100">
                                <td className="p-2 text-sm font-medium">{item.name}</td>
                                <td className="p-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateConfig(category.name, item.name, {
                                        isVisible: !config.isVisible,
                                      })
                                    }
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#E91E63] focus:ring-offset-2 ${
                                      config.isVisible ? 'bg-[#E91E63]' : 'bg-gray-300'
                                    }`}
                                  >
                                    <span
                                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        config.isVisible ? 'translate-x-6' : 'translate-x-1'
                                      }`}
                                    />
                                  </button>
                                </td>
                                <td className="p-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateConfig(category.name, item.name, {
                                        isRequired: !config.isRequired,
                                      })
                                    }
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#E91E63] focus:ring-offset-2 ${
                                      config.isRequired ? 'bg-[#E91E63]' : 'bg-gray-300'
                                    }`}
                                  >
                                    <span
                                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        config.isRequired ? 'translate-x-6' : 'translate-x-1'
                                      }`}
                                    />
                                  </button>
                                </td>
                                <td className="p-2 text-center">
                                  <input
                                    type="number"
                                    className="w-16 mx-auto text-center px-2 py-1 border border-gray-300 rounded"
                                    value={config.dropdownMin}
                                    onChange={(e) =>
                                      updateConfig(category.name, item.name, {
                                        dropdownMin: parseInt(e.target.value) || 1,
                                      })
                                    }
                                    min="1"
                                    max="50"
                                  />
                                </td>
                                {activeTeamMemberTypes.map((type) => (
                                  <td key={type.id} className="p-2 text-center">
                                    <input
                                      type="number"
                                      className="w-16 mx-auto text-center px-2 py-1 border border-gray-300 rounded"
                                      value={config.dropdownMaxByType?.[type.name] || 5}
                                      onChange={(e) =>
                                        updateConfig(category.name, item.name, {
                                          dropdownMaxByType: {
                                            ...config.dropdownMaxByType,
                                            [type.name]: parseInt(e.target.value) || 5,
                                          },
                                        })
                                      }
                                      min="1"
                                      max="50"
                                    />
                                  </td>
                                ))}
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-between items-center">
          <a
            href={publicFormUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Open Public Form
          </a>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={bulkUpdateMutation.isPending || !hasChanges}
              className="px-4 py-2 bg-[#E91E63] text-white rounded-md hover:bg-[#C2185B] disabled:opacity-50 flex items-center gap-2"
            >
              {bulkUpdateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
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
  const [totalInventory, setTotalInventory] = useState('0')
  const [pricePerUnit, setPricePerUnit] = useState('')
  const [selectedSupplier, setSelectedSupplier] = useState('')
  const [threshold] = useState('3')
  const { data: defaultIdealInventoryData } = useDefaultIdealInventory()
  const defaultIdealInventory = defaultIdealInventoryData?.value || 0
  const { data: stores = [] } = useInventoryStores()

  const createMutation = useCreateInventoryItem()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Item name is required')
      return
    }

    const mutationData: any = {
      name: name.trim(),
      type: 'Product', // Default type
      categoryId: category.id,
      totalInventory: parseInt(totalInventory) || 0,
      pricePerUnit: pricePerUnit || undefined,
      threshold: parseInt(threshold) || 3,
      idealTotalInventory: defaultIdealInventory,
    }

    // Only include preferredStore if a supplier is selected
    if (selectedSupplier && selectedSupplier.trim()) {
      mutationData.preferredStore = selectedSupplier.trim()
    }

    createMutation.mutate(
      mutationData,
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] focus:outline-none"
              required
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] focus:outline-none"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price per Unit ($)
            </label>
            <input
              type="text"
              value={pricePerUnit}
              onChange={(e) => setPricePerUnit(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] focus:outline-none"
              placeholder="e.g., 10.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supplier
            </label>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] focus:outline-none"
            >
              <option value="">Select supplier (optional)</option>
              {stores.map((store) => (
                <option key={store.id} value={store.name}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 bg-[#E91E63] text-white rounded-md hover:bg-[#C2185B] disabled:opacity-50"
            >
              {createMutation.isPending ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Edit Item Dialog Component
function EditItemDialog({
  item,
  columnDefinitions,
  stores,
  onClose,
}: {
  item: InventoryType
  columnDefinitions: InventoryColumnDefinition[]
  stores: { id: string; name: string }[]
  onClose: () => void
}) {
  const [name, setName] = useState(item.name)
  const [preferredStore, setPreferredStore] = useState(item.preferredStore || '')
  const [totalInventory, setTotalInventory] = useState(String(item.totalInventory))
  const [idealTotalInventory, setIdealTotalInventory] = useState(String(item.idealTotalInventory))
  const [dynamicFields, setDynamicFields] = useState<Record<string, string>>(
    item.dynamicFields || {}
  )
  const [showNewSupplierInput, setShowNewSupplierInput] = useState(false)
  const [newSupplierName, setNewSupplierName] = useState('')

  const updateMutation = useUpdateInventoryItem()
  const createStoreMutation = useCreateInventoryStore()
  const { data: updatedStores = [], refetch: refetchStores } = useInventoryStores()

  // Use updated stores if available, otherwise fall back to passed stores
  const availableStores = updatedStores.length > 0 ? updatedStores : stores

  const handleSupplierChange = (value: string) => {
    if (value === '__add_new__') {
      setShowNewSupplierInput(true)
      setPreferredStore('')
    } else {
      setPreferredStore(value)
      setShowNewSupplierInput(false)
      setNewSupplierName('')
    }
  }

  const handleAddNewSupplier = () => {
    if (!newSupplierName.trim()) {
      toast.error('Supplier name is required')
      return
    }

    createStoreMutation.mutate(
      { name: newSupplierName.trim() },
      {
        onSuccess: (newStore) => {
          setPreferredStore(newStore.name)
          setShowNewSupplierInput(false)
          setNewSupplierName('')
          refetchStores()
        },
      }
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Item name is required')
      return
    }

    const updateData: any = {
      name: name.trim(),
      totalInventory: parseInt(totalInventory) || 0,
      idealTotalInventory: parseInt(idealTotalInventory) || 0,
      preferredStore: preferredStore.trim() || null,
      dynamicFields: dynamicFields,
    }

    updateMutation.mutate(
      { id: item.id, data: updateData },
      {
        onSuccess: () => {
          onClose()
        },
      }
    )
  }

  const visibleColumns = columnDefinitions
    .filter((col) => col.isVisible)
    .sort((a, b) => a.displayOrder - b.displayOrder)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Edit Item</h2>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Supplier
              </label>
              {!showNewSupplierInput ? (
                <select
                  value={preferredStore}
                  onChange={(e) => handleSupplierChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] focus:outline-none"
                >
                  <option value="">None</option>
                  {availableStores.map((store) => (
                    <option key={store.id} value={store.name}>
                      {store.name}
                    </option>
                  ))}
                  <option value="__add_new__">+ Add New Supplier</option>
                </select>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSupplierName}
                      onChange={(e) => setNewSupplierName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddNewSupplier()
                        }
                        if (e.key === 'Escape') {
                          setShowNewSupplierInput(false)
                          setNewSupplierName('')
                          setPreferredStore('')
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] focus:outline-none"
                      placeholder="Enter supplier name"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleAddNewSupplier}
                      disabled={createStoreMutation.isPending || !newSupplierName.trim()}
                      className="px-4 py-2 bg-[#E91E63] text-white rounded-md hover:bg-[#C2185B] disabled:opacity-50 flex items-center gap-2"
                    >
                      {createStoreMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          Add
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewSupplierInput(false)
                        setNewSupplierName('')
                        setPreferredStore('')
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Inventory
              </label>
              <input
                type="number"
                value={totalInventory}
                onChange={(e) => setTotalInventory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] focus:outline-none"
                min="0"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ideal Total Inventory
                </label>
                <input
                  type="number"
                  value={idealTotalInventory}
                  onChange={(e) => setIdealTotalInventory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] focus:outline-none"
                  min="0"
                />
              </div>
            </div>

            {visibleColumns.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Fields
                </label>
                <div className="space-y-3">
                  {visibleColumns.map((col) => (
                    <div key={col.id}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {col.columnLabel}
                      </label>
                      <input
                        type="text"
                        value={dynamicFields[col.columnKey] || ''}
                        onChange={(e) =>
                          setDynamicFields({
                            ...dynamicFields,
                            [col.columnKey]: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] focus:outline-none"
                        placeholder={`Enter ${col.columnLabel.toLowerCase()}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-4 py-2 bg-[#E91E63] text-white rounded-md hover:bg-[#C2185B] disabled:opacity-50 flex items-center gap-2"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] focus:outline-none"
              placeholder="e.g., Supplies, Equipment"
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#E91E63] text-white rounded-md hover:bg-[#C2185B]"
            >
              Create Category
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

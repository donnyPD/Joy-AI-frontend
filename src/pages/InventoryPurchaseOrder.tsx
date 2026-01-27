import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Check, Loader2 } from 'lucide-react'
import {
  useInventory,
  useInventoryCategories,
  useInventoryStores,
  useCreateInventoryStore,
  useDeleteInventoryStore,
  useCreateInventoryPurchases,
  type Inventory as InventoryType,
  type InventoryStore,
} from '../features/inventory/inventoryApi'
import { useTeamMembers } from '../features/team-members/teamMembersApi'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'

// Helper function to get today's date in NY timezone as YYYY-MM-DD
function getTodayNY(): string {
  const now = new Date()
  const nyDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
  const year = nyDate.getFullYear()
  const month = String(nyDate.getMonth() + 1).padStart(2, '0')
  const day = String(nyDate.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

interface RowData {
  itemId: string
  itemName: string
  selectedStore: string | null
  quantity: string
  unitPrice: string
}

export default function InventoryPurchaseOrder() {
  const navigate = useNavigate()

  const [selectedDate, setSelectedDate] = useState<string | null>(() => getTodayNY())
  const [globalStore, setGlobalStore] = useState('')
  const [selectedTechnician, setSelectedTechnician] = useState<string>('')
  const [rowData, setRowData] = useState<Record<string, RowData>>({})
  const [tax, setTax] = useState('')
  const [shipping, setShipping] = useState('')
  const [showNewStoreInput, setShowNewStoreInput] = useState(false)
  const [newStoreName, setNewStoreName] = useState('')
  const [storeToDelete, setStoreToDelete] = useState<InventoryStore | null>(null)
  const [showDeleteStoreDialog, setShowDeleteStoreDialog] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  const { data: inventoryItems = [], isLoading: isLoadingInventory } = useInventory()
  const { data: stores = [], isLoading: isLoadingStores } = useInventoryStores()
  const { data: categories = [], isLoading: isLoadingCategories } = useInventoryCategories()
  const { data: teamMembers = [] } = useTeamMembers()
  const createStoreMutation = useCreateInventoryStore()
  const deleteStoreMutation = useDeleteInventoryStore()
  const createPurchasesMutation = useCreateInventoryPurchases()

  useEffect(() => {
    if (inventoryItems.length > 0) {
      const initialData: Record<string, RowData> = {}
      inventoryItems.forEach((item) => {
        initialData[item.id] = {
          itemId: item.id,
          itemName: item.name,
          selectedStore: (globalStore && globalStore.trim() !== '') ? globalStore : null,
          quantity: '',
          unitPrice: '',
        }
      })
      setRowData(initialData)
    }
  }, [inventoryItems])

  useEffect(() => {
    // Only update rows that don't have a per-item store selected
    setRowData((prev) => {
      const updated: Record<string, RowData> = {}
      Object.keys(prev).forEach((key) => {
        const currentRow = prev[key]
        // Only update if the row doesn't have a per-item store set
        updated[key] = {
          ...currentRow,
          selectedStore: currentRow.selectedStore && currentRow.selectedStore.trim() !== ''
            ? currentRow.selectedStore
            : (globalStore && globalStore.trim() !== '' ? globalStore : null)
        }
      })
      return updated
    })
  }, [globalStore])

  const handleQtyChange = (itemId: string, value: string) => {
    setRowData((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], quantity: value },
    }))
  }

  const handlePriceChange = (itemId: string, value: string) => {
    setRowData((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], unitPrice: value },
    }))
  }

  const calculateRowTotal = (row: RowData): number => {
    const qty = parseFloat(row.quantity) || 0
    const price = parseFloat(row.unitPrice) || 0
    return qty * price
  }

  const calculateSubtotal = (): number => {
    return Object.values(rowData).reduce((sum, row) => {
      if (row.quantity && row.unitPrice) {
        return sum + calculateRowTotal(row)
      }
      return sum
    }, 0)
  }

  const calculateGrandTotal = (): number => {
    const subtotal = calculateSubtotal()
    const taxAmount = parseFloat(tax) || 0
    const shippingAmount = parseFloat(shipping) || 0
    return subtotal + taxAmount + shippingAmount
  }

  const handleAddNewStore = () => {
    const trimmedName = newStoreName.trim()
    if (!trimmedName) {
      toast.error('Please enter a supplier name')
      return
    }
    createStoreMutation.mutate(
      { name: trimmedName },
      {
        onSuccess: () => {
          // If no global store is set, set it to the new store
          if (!globalStore) {
            setGlobalStore(trimmedName)
          }
          // Update all rows that don't have a per-item store selected
          setRowData((prev) => {
            const updated: Record<string, RowData> = {}
            Object.keys(prev).forEach((key) => {
              updated[key] = {
                ...prev[key],
                selectedStore: prev[key].selectedStore || trimmedName,
              }
            })
            return updated
          })
          setNewStoreName('')
          setShowNewStoreInput(false)
        },
      }
    )
  }

  const generateOrderId = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `ORD-${year}${month}${day}-${random}`
  }

  const handleSubmit = () => {
    const orderId = generateOrderId()
    const purchases: {
      orderId: string
      itemId: string | null
      itemName: string
      orderedFrom: string
      amount: string
      quantity: number
      purchasedAt: string
    }[] = []

    const validationErrors: string[] = []

    Object.values(rowData).forEach((row) => {
      // Get effective store: per-item store if set, otherwise global store
      const effectiveStore: string = (row.selectedStore && row.selectedStore.trim() !== '') 
        ? row.selectedStore 
        : (globalStore && globalStore.trim() !== '' ? globalStore : '')
      const hasStore = effectiveStore && effectiveStore.trim() !== ''
      const hasQty = row.quantity && row.quantity.trim() !== ''
      const hasPrice = row.unitPrice && row.unitPrice.trim() !== ''

      if (hasQty || hasPrice) {
        if (!hasStore) {
          validationErrors.push(`${row.itemName}: Please select a supplier (globally or per-item)`)
        }
        if (!hasQty) {
          validationErrors.push(`${row.itemName}: Please enter quantity`)
        }
        if (!hasPrice) {
          validationErrors.push(`${row.itemName}: Please enter unit price`)
        }

        const parsedQty = parseInt(row.quantity)
        const parsedPrice = parseFloat(row.unitPrice)

        if (hasQty && (isNaN(parsedQty) || parsedQty <= 0)) {
          validationErrors.push(`${row.itemName}: Invalid quantity`)
        }
        if (hasPrice && (isNaN(parsedPrice) || parsedPrice <= 0)) {
          validationErrors.push(`${row.itemName}: Invalid unit price`)
        }

        if (hasStore && hasQty && hasPrice && parsedQty > 0 && parsedPrice > 0) {
          const totalAmount = parsedQty * parsedPrice
          purchases.push({
            orderId,
            itemId: row.itemId,
            itemName: row.itemName,
            orderedFrom: effectiveStore,
            amount: totalAmount.toFixed(2),
            quantity: parsedQty,
            purchasedAt: selectedDate || getTodayNY(),
          })
        }
      }
    })

    if (validationErrors.length > 0) {
      toast.error(
        validationErrors.slice(0, 3).join('; ') +
          (validationErrors.length > 3 ? ` (+${validationErrors.length - 3} more)` : '')
      )
      return
    }

    if (purchases.length === 0) {
      toast.error('Please fill in at least one row with supplier, quantity, and unit price')
      return
    }

    createPurchasesMutation.mutate(
      { purchases, technicianName: selectedTechnician || undefined },
      {
        onSuccess: () => {
          setShowSuccessDialog(true)
        },
      }
    )
  }

  const resetForm = () => {
    setSelectedDate(getTodayNY())
    setGlobalStore('')
    setSelectedTechnician('')
    setTax('')
    setShipping('')
    const initialData: Record<string, RowData> = {}
    inventoryItems.forEach((item) => {
      initialData[item.id] = {
        itemId: item.id,
        itemName: item.name,
        selectedStore: null,
        quantity: '',
        unitPrice: '',
      }
    })
    setRowData(initialData)
    setShowSuccessDialog(false)
  }

  const handlePlaceAnotherOrder = () => {
    resetForm()
  }

  const handleGoBack = () => {
    navigate('/operations/inventory')
  }

  const subtotal = calculateSubtotal()
  const grandTotal = calculateGrandTotal()

  const groupedInventoryItems = useMemo(() => {
    // Create a map of categoryId to category name
    const categoryMap = new Map<string, string>()
    categories.forEach((cat) => categoryMap.set(cat.id, cat.name))

    // Filter items by selected store's preferred store field
    const filteredItems = globalStore
      ? inventoryItems.filter(
          (item) => item.preferredStore?.toLowerCase() === globalStore.toLowerCase()
        )
      : inventoryItems

    // Group items by their category
    const grouped: Record<string, InventoryType[]> = {}

    filteredItems.forEach((item) => {
      const categoryName = item.categoryId ? categoryMap.get(item.categoryId) : null
      const groupName = categoryName || 'Other Items'

      if (!grouped[groupName]) {
        grouped[groupName] = []
      }
      grouped[groupName].push(item)
    })

    return grouped
  }, [inventoryItems, categories, globalStore])

  if (isLoadingInventory || isLoadingStores || isLoadingCategories) {
    return (
      <div className="min-h-screen bg-[#F7F7F9]">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F7F9]">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventory Purchase Order</h1>
            <p className="text-gray-600 mt-2">Add new purchase orders for inventory items</p>
          </div>
          <button
            onClick={handleGoBack}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Inventory
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">Order Details</h2>
          </div>

          <div className="px-6 py-4 border-b bg-gray-50">
            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-2">
                <label className="font-semibold text-gray-900 whitespace-nowrap">Date</label>
                <input
                  type="date"
                  value={selectedDate || ''}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-[180px]"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="font-semibold text-gray-900 whitespace-nowrap">
                  Choose supplier
                </label>
                <select
                  value={globalStore}
                  onChange={(e) => {
                    if (e.target.value === '__other__') {
                      setShowNewStoreInput(true)
                    } else {
                      setGlobalStore(e.target.value)
                    }
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-[180px] bg-white"
                >
                  <option value="">Select supplier</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.name}>
                      {store.name}
                    </option>
                  ))}
                  <option value="__other__">+ Add Other supplier</option>
                </select>
                {stores.length > 0 && (
                  <button
                    onClick={() => {
                      setStoreToDelete(null)
                      setShowDeleteStoreDialog(true)
                    }}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <label className="font-semibold text-gray-900 whitespace-nowrap">
                  Assign to Technician (Optional)
                </label>
                <select
                  value={selectedTechnician}
                  onChange={(e) => setSelectedTechnician(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-[180px] bg-white"
                >
                  <option value="">None</option>
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.name}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="p-0">
            <div className="h-[400px] sm:h-[450px] w-full overflow-auto">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 z-10 bg-blue-50">
                  <tr>
                    <th className="min-w-[200px] bg-blue-50 font-bold text-gray-900 px-4 py-3 text-left border-b">
                      Items
                    </th>
                    <th className="min-w-[80px] text-center font-bold text-gray-900 px-4 py-3 border-b bg-blue-50">
                      To Be Ordered
                    </th>
                    <th className="min-w-[80px] text-center font-bold text-gray-900 px-4 py-3 border-b bg-blue-50">
                      Quantity
                    </th>
                    <th className="min-w-[100px] text-center font-bold text-gray-900 px-4 py-3 border-b bg-blue-50">
                      Item Price
                    </th>
                    <th className="min-w-[100px] text-center font-bold text-gray-900 px-4 py-3 border-b bg-blue-50">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(groupedInventoryItems).length === 0 && globalStore ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-500">
                        No items found with preferred supplier &quot;{globalStore}&quot;. Select a
                        different supplier or clear the filter.
                      </td>
                    </tr>
                  ) : (
                    Object.entries(groupedInventoryItems).map(([categoryName, items]) => (
                      <>
                        <tr key={`category-${categoryName}`}>
                          <td
                            colSpan={5}
                            className="font-semibold text-sm text-gray-600 py-2 px-4 bg-gray-100 text-left border-b"
                          >
                            {categoryName}
                          </td>
                        </tr>
                        {items.map((item, index) => {
                          const row = rowData[item.id] || {
                            itemId: item.id,
                            itemName: item.name,
                            selectedStore: null,
                            quantity: '',
                            unitPrice: '',
                          }
                          const rowTotal = calculateRowTotal(row as RowData)
                          const rowBgColor = index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          const toBeOrdered =
                            (item.idealTotalInventory || 0) - (item.totalInventory || 0)

                          return (
                            <tr key={item.id} className={rowBgColor}>
                              <td
                                className={`font-medium ${rowBgColor} text-gray-900 text-sm pl-6 py-3 border-b`}
                              >
                                {item.name}
                              </td>
                              <td className="text-center text-sm py-3 border-b">{toBeOrdered}</td>
                              <td className="text-center py-3 border-b">
                                <input
                                  type="number"
                                  min="0"
                                  value={row.quantity || ''}
                                  onChange={(e) => handleQtyChange(item.id, e.target.value)}
                                  className="w-[70px] mx-auto text-center text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="0"
                                />
                              </td>
                              <td className="text-center py-3 border-b">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={row.unitPrice || ''}
                                  onChange={(e) => handlePriceChange(item.id, e.target.value)}
                                  className="w-[80px] mx-auto text-center text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="$0.00"
                                />
                              </td>
                              <td className="text-center font-medium py-3 border-b">
                                {rowTotal > 0 ? `$${rowTotal.toFixed(2)}` : '-'}
                              </td>
                            </tr>
                          )
                        })}
                      </>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-t bg-gray-50 px-6 py-4">
              <div className="flex flex-col gap-3 max-w-md ml-auto">
                <div className="flex items-center justify-between">
                  <label className="font-semibold">Sub total ($)</label>
                  <span className="font-bold text-lg">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <label className="font-semibold whitespace-nowrap">TAX ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={tax}
                    onChange={(e) => setTax(e.target.value)}
                    className="w-[100px] text-right px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <label className="font-semibold whitespace-nowrap">SHIPPING ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={shipping}
                    onChange={(e) => setShipping(e.target.value)}
                    className="w-[100px] text-right px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div className="flex items-center justify-between border-t pt-3">
                  <label className="font-bold text-lg">GRAND TOTAL ($)</label>
                  <span className="font-bold text-xl text-blue-600">${grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t flex justify-end gap-3">
            <button
              onClick={handleGoBack}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={createPurchasesMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
            >
              {createPurchasesMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  SUBMIT
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Add New Store Dialog */}
      {showNewStoreInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">Add New Supplier</h3>
              <p className="text-sm text-gray-600 mt-1">
                Enter the name of the new supplier to add to the list.
              </p>
            </div>
            <div className="px-6 py-4">
              <input
                type="text"
                placeholder="Store name"
                value={newStoreName}
                onChange={(e) => setNewStoreName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddNewStore()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => {
                    setShowNewStoreInput(false)
                    setNewStoreName('')
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNewStore}
                  disabled={createStoreMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  {createStoreMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Add supplier
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Store Dialog */}
      {showDeleteStoreDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">Delete supplier</h3>
              <p className="text-sm text-gray-600 mt-1">
                Select a supplier to delete from the list. This action cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4">
              <select
                value={storeToDelete?.id || ''}
                onChange={(e) => {
                  const store = stores.find((s) => s.id === e.target.value)
                  if (store) {
                    setStoreToDelete(store)
                  } else {
                    setStoreToDelete(null)
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63]"
              >
                <option value="">Select supplier to delete</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
              {storeToDelete && (
                <p className="mt-2 text-sm text-red-600">
                  Are you sure you want to delete &quot;{storeToDelete.name}&quot;?
                </p>
              )}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => {
                    setStoreToDelete(null)
                    setShowDeleteStoreDialog(false)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (storeToDelete) {
                      deleteStoreMutation.mutate(storeToDelete.id, {
                        onSuccess: () => {
                          setStoreToDelete(null)
                          setShowDeleteStoreDialog(false)
                        },
                      })
                    }
                  }}
                  disabled={!storeToDelete || deleteStoreMutation.isPending}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  {deleteStoreMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Dialog */}
      {showSuccessDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 text-center">
            <div className="px-6 py-4 border-b">
              <h3 className="text-2xl font-semibold text-green-600">ORDER PLACED!</h3>
              <p className="text-gray-600 mt-2">
                Your inventory purchase order has been submitted successfully.
              </p>
            </div>
            <div className="px-6 py-4 flex flex-col gap-3">
              <button
                onClick={handlePlaceAnotherOrder}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Place another order
              </button>
              <button
                onClick={handleGoBack}
                className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Back to Inventory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

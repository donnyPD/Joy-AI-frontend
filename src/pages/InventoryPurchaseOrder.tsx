import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Check, Loader2, Calendar, Upload } from 'lucide-react'
import {
  useInventory,
  useInventoryCategories,
  useInventoryStores,
  useCreateInventoryStore,
  useDeleteInventoryStore,
  useCreateInventoryPurchases,
  useCreateInventoryItem,
  type Inventory as InventoryType,
  type InventoryStore,
} from '../features/inventory/inventoryApi'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import axios from 'axios'

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
  itemId: string | null
  itemName: string
  selectedStore: string | null
  quantity: string
  unitPrice: string
  categoryId?: string | null  // For custom items
}

export default function InventoryPurchaseOrder() {
  const navigate = useNavigate()

  const [selectedDate, setSelectedDate] = useState<string | null>(() => getTodayNY())
  const [globalStore, setGlobalStore] = useState('')
  const [rowData, setRowData] = useState<Record<string, RowData>>({})
  const [tax, setTax] = useState('')
  const [shipping, setShipping] = useState('')
  const [promotion, setPromotion] = useState('')
  const [notes, setNotes] = useState('')
  const [showNewStoreInput, setShowNewStoreInput] = useState(false)
  const [newStoreName, setNewStoreName] = useState('')
  const [storeToDelete, setStoreToDelete] = useState<InventoryStore | null>(null)
  const [showDeleteStoreDialog, setShowDeleteStoreDialog] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [isProcessingPDF, setIsProcessingPDF] = useState(false)
  const [extractedOrderId, setExtractedOrderId] = useState<string | null>(null)
  const [hasUploadedPDF, setHasUploadedPDF] = useState(false)
  const [supplierNotFoundInList, setSupplierNotFoundInList] = useState(false)
  const [isCreatingItems, setIsCreatingItems] = useState(false)
  const hasDefaultedSupplier = useRef(false)

  const { data: inventoryItems = [], isLoading: isLoadingInventory } = useInventory()
  const { data: stores = [], isLoading: isLoadingStores } = useInventoryStores()
  const { data: categories = [], isLoading: isLoadingCategories } = useInventoryCategories()
  const createStoreMutation = useCreateInventoryStore()
  const deleteStoreMutation = useDeleteInventoryStore()
  const createPurchasesMutation = useCreateInventoryPurchases()
  const createInventoryItemMutation = useCreateInventoryItem()

  useEffect(() => {
    if (inventoryItems.length > 0 && !hasUploadedPDF) {
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
  }, [inventoryItems, hasUploadedPDF])

  useEffect(() => {
    // Only update rows that don't have a per-item store selected
    // Skip this effect when PDF data is loaded to preserve PDF items
    if (hasUploadedPDF) return
    
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
  }, [globalStore, hasUploadedPDF])

  // Default to first supplier when page opens (skip if PDF uploaded or user cleared)
  useEffect(() => {
    if (stores.length > 0 && !globalStore && !hasUploadedPDF && !hasDefaultedSupplier.current) {
      hasDefaultedSupplier.current = true
      setGlobalStore(stores[0].name)
    }
  }, [stores, globalStore, hasUploadedPDF])

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

  const handleCategoryChange = (itemKey: string, categoryId: string) => {
    setRowData((prev) => ({
      ...prev,
      [itemKey]: { ...prev[itemKey], categoryId },
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
    const promotionAmount = parseFloat(promotion) || 0
    return subtotal + taxAmount + shippingAmount + promotionAmount
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

  const handlePDFUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file')
      return
    }

    setIsProcessingPDF(true)
    const formData = new FormData()
    // Use 'invoice' field name to match n8n webhook API
    formData.append('invoice', file)

    try {
      // Call n8n invoice extraction webhook
      const n8nWebhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://automate-staging.automatejoy.ai/webhook/extract-invoice'
      
      const response = await axios.post(n8nWebhookUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      const extractedData = response.data
      
      // Populate form with extracted data
      populateFormFromPDF(extractedData)
      setHasUploadedPDF(true)
      
      toast.success('PDF processed successfully! Form fields populated.')
    } catch (error: any) {
      console.error('PDF processing error:', error)
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to process PDF. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsProcessingPDF(false)
      // Reset file input
      event.target.value = ''
    }
  }

  const populateFormFromPDF = (data: any) => {
    // Set orderId if extracted
    if (data.orderId) {
      setExtractedOrderId(data.orderId)
    }

    // Set date
    if (data.date) {
      setSelectedDate(data.date)
    }

    // Set supplier
    if (data.supplier) {
      const existingStore = stores.find(s => s.name.toLowerCase() === data.supplier.toLowerCase())
      if (existingStore) {
        setGlobalStore(data.supplier)
        setSupplierNotFoundInList(false)
      } else {
        setGlobalStore(data.supplier)
        setSupplierNotFoundInList(true)
        // Auto-create supplier if it doesn't exist
        createStoreMutation.mutate(
          { name: data.supplier },
          {
            onSuccess: () => {
              setSupplierNotFoundInList(false)
              toast.success(`Supplier "${data.supplier}" created automatically`)
            },
            onError: (error: any) => {
              const errorMessage = error.response?.data?.message || error.message || 'Failed to create supplier'
              toast.error(`Could not auto-create supplier: ${errorMessage}`)
            },
          }
        )
      }
    }

    // Set tax and shipping
    if (data.tax !== undefined && data.tax !== null) {
      setTax(String(data.tax))
    }
    if (data.shipping !== undefined && data.shipping !== null) {
      setShipping(String(data.shipping))
    }

    // Set promotion
    if (data.promotion !== undefined && data.promotion !== null) {
      setPromotion(String(data.promotion))
    }

    // Set notes
    if (data.notes) {
      setNotes(data.notes)
    }

    // Populate items
    if (data.items && Array.isArray(data.items)) {
      console.log('📦 Populating items from PDF data:', data.items)
      console.log('📋 Available inventory items:', inventoryItems.map(i => i.name))
      
      setRowData((prev) => {
        const updated = { ...prev }
        let matchedCount = 0
        let customItemIndex = 0
        
        data.items.forEach((item: any) => {
          // Try to find item by name (case-insensitive)
          const inventoryItem = inventoryItems.find(
            (inv) => inv.name.toLowerCase() === item.name?.toLowerCase()
          )
          
          if (inventoryItem) {
            console.log(`✅ Matched: "${item.name}" -> "${inventoryItem.name}" (ID: ${inventoryItem.id})`)
            
            // Initialize rowData for this item if it doesn't exist
            if (!updated[inventoryItem.id]) {
              updated[inventoryItem.id] = {
                itemId: inventoryItem.id,
                itemName: inventoryItem.name,
                selectedStore: null,
                quantity: '',
                unitPrice: '',
              }
            }
            
            // Update with extracted data
            updated[inventoryItem.id] = {
              ...updated[inventoryItem.id],
              quantity: String(item.quantity || ''),
              unitPrice: String(item.unitPrice || ''),
            }
            matchedCount++
          } else {
            // Item not in inventory - add as custom item
            console.log(`➕ Adding custom item: "${item.name}"`)
            const customKey = `custom-${customItemIndex++}`
            updated[customKey] = {
              itemId: null, // null for custom items not in inventory
              itemName: item.name || 'Unknown Item',
              selectedStore: null,
              quantity: String(item.quantity || ''),
              unitPrice: String(item.unitPrice || ''),
              categoryId: null, // Category will be selected by user
            }
          }
        })
        
        console.log(`📊 Matched ${matchedCount} out of ${data.items.length} items, added ${customItemIndex} custom items`)
        return updated
      })
    }
  }

  const handleSubmit = async () => {
    const orderId = extractedOrderId || generateOrderId()
    
    // First, create inventory items for custom items with selected categories
    const customItemsToCreate = Object.entries(rowData).filter(
      ([key, row]) => key.startsWith('custom-') && row.itemId === null && row.categoryId
    )

    // Create inventory items for custom items with categories
    setIsCreatingItems(customItemsToCreate.length > 0)
    const createdItemIds: Record<string, string> = {}
    for (const [key, row] of customItemsToCreate) {
      try {
        // Get effective store: per-item store if set, otherwise global store
        const effectiveStore: string = (row.selectedStore && row.selectedStore.trim() !== '') 
          ? row.selectedStore 
          : (globalStore && globalStore.trim() !== '' ? globalStore : '')
        
        const newItem = await new Promise<InventoryType>((resolve, reject) => {
          createInventoryItemMutation.mutate(
            {
              name: row.itemName,
              type: 'Product',
              categoryId: row.categoryId!,
              totalInventory: 0,
              pricePerUnit: row.unitPrice || undefined,
              threshold: 0,
              idealTotalInventory: 0,
              preferredStore: effectiveStore || undefined,
            },
            {
              onSuccess: (data) => resolve(data),
              onError: (error) => reject(error),
            }
          )
        })
        createdItemIds[key] = newItem.id
        // Update rowData with the new itemId
        setRowData((prev) => ({
          ...prev,
          [key]: { ...prev[key], itemId: newItem.id },
        }))
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to create inventory item'
        toast.error(`Failed to create item "${row.itemName}": ${errorMessage}`)
        // Continue with other items even if one fails
      }
    }
    setIsCreatingItems(false)

    // Build updated rowData with newly created itemIds
    const updatedRowData = { ...rowData }
    Object.keys(createdItemIds).forEach((key) => {
      if (updatedRowData[key]) {
        updatedRowData[key] = { ...updatedRowData[key], itemId: createdItemIds[key] }
      }
    })

    const purchases: {
      orderId: string
      itemId: string | null
      itemName: string
      orderedFrom: string
      amount: string
      quantity: number
      purchasedAt: string
      notes?: string | null
    }[] = []

    const validationErrors: string[] = []

    Object.entries(updatedRowData).forEach(([key, row]) => {
      // Use created itemId if this was a custom item that was just created
      const effectiveItemId = createdItemIds[key] || row.itemId
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
            itemId: effectiveItemId,
            itemName: row.itemName,
            orderedFrom: effectiveStore,
            amount: totalAmount.toFixed(2),
            quantity: parsedQty,
            purchasedAt: selectedDate || getTodayNY(),
            notes: notes.trim() || null,
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

    // Calculate grand total for the order
    const grandTotal = calculateGrandTotal()

    // Add totalPrice to all purchases (same for all items in the order)
    const purchasesWithTotal = purchases.map(p => ({
      ...p,
      totalPrice: grandTotal.toFixed(2),
    }))

    createPurchasesMutation.mutate(
      { purchases: purchasesWithTotal },
      {
        onSuccess: () => {
          setShowSuccessDialog(true)
        },
        onError: (error: any) => {
          // Error is already handled in the mutation hook, but we can add additional handling here if needed
          const errorMessage = error.response?.data?.message || error.message
          if (errorMessage && errorMessage.includes('already exists')) {
            // Suggest generating a new orderId for duplicate orderId errors
            // toast.error(errorMessage + ' Please generate a new order ID or use a different one.')
          }
        },
      }
    )
  }

  const resetForm = () => {
    setSelectedDate(getTodayNY())
    setGlobalStore('')
    setTax('')
    setShipping('')
    setPromotion('')
    setNotes('')
    setExtractedOrderId(null)
    setHasUploadedPDF(false)
    setSupplierNotFoundInList(false)
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
    // Always show all inventory items, even when PDF is uploaded
    // Create a map of categoryId to category name
    const categoryMap = new Map<string, string>()
    categories.forEach((cat) => categoryMap.set(cat.id, cat.name))

    // Get item IDs that are in rowData (items with data entered or matched from PDF)
    const itemsInRowData = new Set(
      Object.keys(rowData)
        .filter((key) => !key.startsWith('custom-') && rowData[key].itemId)
        .map((key) => rowData[key].itemId)
    )

    // Filter items by selected store's preferred store field
    // BUT also include items that are in rowData (matched from PDF or have data)
    const filteredItems = globalStore
      ? inventoryItems.filter(
          (item) => 
            item.preferredStore?.toLowerCase() === globalStore.toLowerCase() ||
            itemsInRowData.has(item.id)
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
  }, [inventoryItems, categories, globalStore, rowData])

  // Get custom items (items from PDF that are not in inventory)
  const customItems = useMemo(() => {
    return Object.entries(rowData)
      .filter(([key]) => key.startsWith('custom-'))
      .map(([key, row]) => ({ key, ...row }))
  }, [rowData])

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
            <p className="text-muted mt-2">Add new purchase orders for Inventory items</p>
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

          <div className="px-6 py-4 border-b"  >
            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-2">
                <label className="font-semibold text-gray-900 whitespace-nowrap">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    type="date"
                    value={selectedDate || ''}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E91E63] w-[180px]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="font-semibold text-gray-900 whitespace-nowrap">
                  Choose supplier
                </label>
                {supplierNotFoundInList ? (
                  <input
                    type="text"
                    value={globalStore}
                    readOnly
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E91E63] w-[180px] bg-gray-50"
                  />
                ) : (
                  <select
                    value={globalStore}
                    onChange={(e) => {
                      if (e.target.value === '__other__') {
                        setShowNewStoreInput(true)
                        setSupplierNotFoundInList(false)
                      } else {
                        setGlobalStore(e.target.value)
                        setSupplierNotFoundInList(false)
                      }
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E91E63] w-[180px] bg-white"
                  >
                    <option value="">Select supplier</option>
                    {stores.map((store) => (
                      <option key={store.id} value={store.name}>
                        {store.name}
                      </option>
                    ))}
                    <option value="__other__">+ Add Other supplier</option>
                  </select>
                )}
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
                <label className="font-semibold text-gray-900 whitespace-nowrap">AI Autofill</label>
                <label className="relative cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handlePDFUpload}
                    disabled={isProcessingPDF}
                    className="hidden"
                    id="pdf-upload-input"
                  />
                  <span className={`px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2 bg-white ${isProcessingPDF ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                    {isProcessingPDF ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Upload PDF
                      </>
                    )}
                  </span>
                </label>
              </div>

              
            </div>
          </div>

          <div className="p-0">
            <div className="h-[400px] sm:h-[450px] w-full overflow-auto">
              <table className="w-full border-collapse">
                <thead className=" top-0 z-10"  >
                  <tr>
                    <th className="min-w-[200px] font-bold text-black px-4 py-3 text-left border-b">
                      Items
                    </th>
                    <th className="min-w-[80px] text-center font-bold text-black px-4 py-3 border-b">
                      To Be Ordered
                    </th>
                    <th className="min-w-[80px] text-center font-bold text-black px-4 py-3 border-b">
                      Quantity
                    </th>
                    <th className="min-w-[100px] text-center font-bold text-black px-4 py-3 border-b">
                      Item Price
                    </th>
                    <th className="min-w-[100px] text-center font-bold text-black px-4 py-3 border-b">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Custom Items Section - Items from PDF not in inventory - RENDERED FIRST */}
                  {customItems.length > 0 && (
                    <>
                      <tr key="category-custom">
                        <td
                          colSpan={5}
                          className="font-semibold text-sm text-white py-2 px-4 text-left border-b"
                          style={{ backgroundColor: '#7f8a9f' }}
                        >
                          Custom Items (from PDF)
                        </td>
                      </tr>
                      {customItems.map((customItem) => {
                        const row = rowData[customItem.key] || customItem
                        const rowTotal = calculateRowTotal(row as RowData)

                        return (
                          <tr key={customItem.key}>
                            <td className="font-medium text-gray-900 text-sm pl-6 py-3 border-b">
                              <div className="flex flex-col gap-2">
                                <span>{row.itemName}</span>
                                <select
                                  value={row.categoryId || ''}
                                  onChange={(e) => handleCategoryChange(customItem.key, e.target.value)}
                                  className="w-full max-w-[200px] text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#E91E63] bg-white"
                                >
                                  <option value="">Select category...</option>
                                  {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                      {cat.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </td>
                            <td className="text-center text-sm py-3 border-b">
                              -
                            </td>
                            <td className="text-center py-3 border-b">
                              <input
                                type="number"
                                min="0"
                                value={row.quantity || ''}
                                onChange={(e) => handleQtyChange(customItem.key, e.target.value)}
                                className="w-[70px] mx-auto text-center text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#E91E63] bg-white"
                                placeholder="0"
                              />
                            </td>
                            <td className="text-center py-3 border-b">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={row.unitPrice || ''}
                                onChange={(e) => handlePriceChange(customItem.key, e.target.value)}
                                className="w-[80px] mx-auto text-center text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#E91E63] bg-white"
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
                  )}

                  {/* All Inventory Items - RENDERED AFTER CUSTOM ITEMS */}
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
                            className="font-semibold text-sm text-white py-2 px-4 text-left border-b"
                            style={{ backgroundColor: '#7f8a9f' }}
                          >
                            {categoryName}
                          </td>
                        </tr>
                        {items.map((item) => {
                          const row = rowData[item.id] || {
                            itemId: item.id,
                            itemName: item.name,
                            selectedStore: null,
                            quantity: '',
                            unitPrice: '',
                          }
                          const rowTotal = calculateRowTotal(row as RowData)
                          const toBeOrdered =
                            Math.max(0, (item.idealTotalInventory || 0) - (item.totalInventory || 0))

                          return (
                            <tr key={item.id}>
                              <td className="font-medium text-gray-900 text-sm pl-6 py-3 border-b">
                                {item.name}
                              </td>
                              <td className="text-center text-sm py-3 border-b">
                                {toBeOrdered}
                              </td>
                              <td className="text-center py-3 border-b">
                                <input
                                  type="number"
                                  min="0"
                                  value={row.quantity || ''}
                                  onChange={(e) => handleQtyChange(item.id, e.target.value)}
                                  className="w-[70px] mx-auto text-center text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#E91E63] bg-white"
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
                                  className="w-[80px] mx-auto text-center text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#E91E63] bg-white"
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

            <div className="border-t px-6 py-4">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Notes Section - Left Side */}
                <div className="flex-2 lg:w-1/3">
                  <label className="block font-semibold text-gray-900 mb-2">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any additional notes about this purchase order..."
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E91E63] resize-none"
                  />
                </div>

                {/* Cost Summary Section - Right Side */}
                <div className="flex flex-col gap-3 ml-auto lg:min-w-[300px]">
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
                      className="w-[100px] text-right px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
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
                      className="w-[100px] text-right px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <label className="font-semibold whitespace-nowrap">PROMOTION ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={promotion}
                      onChange={(e) => setPromotion(e.target.value)}
                      className="w-[100px] text-right px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="flex items-center justify-between border-t pt-3">
                    <label className="font-bold text-lg">GRAND TOTAL ($)</label>
                    <span className="font-bold text-xl text-[#E91E63]">${grandTotal.toFixed(2)}</span>
                  </div>
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
              disabled={createPurchasesMutation.isPending || isCreatingItems}
              className="px-4 py-2 bg-[#E91E63] text-white rounded-md hover:bg-[#C2185B] disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
            >
              {createPurchasesMutation.isPending || isCreatingItems ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isCreatingItems ? 'Creating items...' : 'Submitting...'}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
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
                  className="px-4 py-2 bg-[#E91E63] text-white rounded-md hover:bg-[#C2185B] disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
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
                className="w-full px-4 py-2 bg-[#E91E63] text-white rounded-md hover:bg-[#C2185B] flex items-center justify-center gap-2"
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

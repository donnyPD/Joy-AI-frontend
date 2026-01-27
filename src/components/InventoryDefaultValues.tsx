import { useState, useEffect } from 'react'
import { 
  useDefaultIdealInventory, 
  useUpdateDefaultIdealInventory,
  useInventoryColumnDescription,
  useUpdateInventoryColumnDescription,
  useIdealInventoryColumnDescription,
  useUpdateIdealInventoryColumnDescription,
  useToBeOrderedColumnDescription,
  useUpdateToBeOrderedColumnDescription
} from '../features/settings/settingsApi'
import { Loader2, Save } from 'lucide-react'

const PINK_COLOR = '#E91E63'
const PINK_DARK = '#C2185B'

type ColumnTab = 'inventory' | 'ideal-inventory' | 'to-be-ordered'

export default function InventoryDefaultValues() {
  const [activeTab, setActiveTab] = useState<ColumnTab>('inventory')

  // Default Ideal Inventory (for Ideal Inventory tab)
  const { data: defaultIdealData, isLoading: isLoadingDefault } = useDefaultIdealInventory()
  const updateDefaultMutation = useUpdateDefaultIdealInventory()
  const [defaultValue, setDefaultValue] = useState<string>('0')

  // Inventory column description
  const { data: inventoryDescData, isLoading: isLoadingInventoryDesc } = useInventoryColumnDescription()
  const updateInventoryDescMutation = useUpdateInventoryColumnDescription()
  const [inventoryDescription, setInventoryDescription] = useState<string>('')

  // Ideal Inventory column description
  const { data: idealInventoryDescData, isLoading: isLoadingIdealDesc } = useIdealInventoryColumnDescription()
  const updateIdealDescMutation = useUpdateIdealInventoryColumnDescription()
  const [idealInventoryDescription, setIdealInventoryDescription] = useState<string>('')

  // To Be Ordered column description
  const { data: toBeOrderedDescData, isLoading: isLoadingToBeOrderedDesc } = useToBeOrderedColumnDescription()
  const updateToBeOrderedDescMutation = useUpdateToBeOrderedColumnDescription()
  const [toBeOrderedDescription, setToBeOrderedDescription] = useState<string>('')

  // Load default ideal inventory value
  useEffect(() => {
    if (defaultIdealData?.value !== undefined) {
      setDefaultValue(String(defaultIdealData.value))
    }
  }, [defaultIdealData])

  // Load inventory column description
  useEffect(() => {
    if (inventoryDescData?.value !== undefined) {
      setInventoryDescription(inventoryDescData.value || '')
    }
  }, [inventoryDescData])

  // Load ideal inventory column description
  useEffect(() => {
    if (idealInventoryDescData?.value !== undefined) {
      setIdealInventoryDescription(idealInventoryDescData.value || '')
    }
  }, [idealInventoryDescData])

  // Load to be ordered column description
  useEffect(() => {
    if (toBeOrderedDescData?.value !== undefined) {
      setToBeOrderedDescription(toBeOrderedDescData.value || '')
    }
  }, [toBeOrderedDescData])

  const isLoading = isLoadingDefault || isLoadingInventoryDesc || isLoadingIdealDesc || isLoadingToBeOrderedDesc

  const handleSaveDefaultValue = () => {
    const numValue = parseInt(defaultValue) || 0
    if (numValue < 0) {
      return
    }
    updateDefaultMutation.mutate(numValue)
  }

  const handleSaveInventoryDescription = () => {
    updateInventoryDescMutation.mutate(inventoryDescription || null)
  }

  const handleSaveIdealInventoryDescription = () => {
    updateIdealDescMutation.mutate(idealInventoryDescription || null)
  }

  const handleSaveToBeOrderedDescription = () => {
    updateToBeOrderedDescMutation.mutate(toBeOrderedDescription || null)
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#E91E63]" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Heading Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-blue-100 p-2">
            <Save className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Column Descriptions</h2>
            <p className="text-sm text-gray-600">
              Define and manage descriptions for the Inventory, Ideal Inventory, and To Be Ordered columns. 
              These descriptions help clarify the purpose and meaning of each column for your team.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Column Description Tabs">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'inventory'
                  ? 'border-[#E91E63] text-[#E91E63]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Inventory
            </button>
            <button
              onClick={() => setActiveTab('ideal-inventory')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'ideal-inventory'
                  ? 'border-[#E91E63] text-[#E91E63]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Ideal Inventory
            </button>
            <button
              onClick={() => setActiveTab('to-be-ordered')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'to-be-ordered'
                  ? 'border-[#E91E63] text-[#E91E63]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              To Be Ordered
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Inventory Tab */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="inventory-description" className="block text-sm font-medium text-gray-700">
                  Inventory Column Description
                </label>
                <textarea
                  id="inventory-description"
                  rows={6}
                  value={inventoryDescription}
                  onChange={(e) => setInventoryDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                  placeholder="Enter a description for the Inventory column..."
                />
                <p className="text-xs text-gray-500">
                  This description will help users understand what the Inventory column represents.
                </p>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSaveInventoryDescription}
                  disabled={updateInventoryDescMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  style={{ backgroundColor: PINK_COLOR }}
                  onMouseEnter={(e) => {
                    if (!updateInventoryDescMutation.isPending) {
                      e.currentTarget.style.backgroundColor = PINK_DARK
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!updateInventoryDescMutation.isPending) {
                      e.currentTarget.style.backgroundColor = PINK_COLOR
                    }
                  }}
                >
                  {updateInventoryDescMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save Description</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Ideal Inventory Tab */}
          {activeTab === 'ideal-inventory' && (
            <div className="space-y-6">
              {/* Default Value Section */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Default Ideal Inventory Value</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Set the default value for Ideal Inventory that will be used when creating new inventory items.
                  </p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="default-ideal-inventory" className="block text-sm font-medium text-gray-700">
                    Default Ideal Inventory Value
                  </label>
                  <input
                    id="default-ideal-inventory"
                    type="number"
                    min="0"
                    value={defaultValue}
                    onChange={(e) => {
                      const newValue = e.target.value
                      if (newValue === '' || (!isNaN(Number(newValue)) && Number(newValue) >= 0)) {
                        setDefaultValue(newValue)
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter default value"
                  />
                  <p className="text-xs text-gray-500">
                    This value will be automatically set as the Ideal Inventory when creating new inventory items.
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveDefaultValue}
                    disabled={updateDefaultMutation.isPending || defaultValue === '' || parseInt(defaultValue) < 0}
                    className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    style={{ backgroundColor: PINK_COLOR }}
                    onMouseEnter={(e) => {
                      if (!updateDefaultMutation.isPending && defaultValue !== '' && parseInt(defaultValue) >= 0) {
                        e.currentTarget.style.backgroundColor = PINK_DARK
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!updateDefaultMutation.isPending && defaultValue !== '' && parseInt(defaultValue) >= 0) {
                        e.currentTarget.style.backgroundColor = PINK_COLOR
                      }
                    }}
                  >
                    {updateDefaultMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Save Default Value</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Description Section */}
              <div className="border-t border-gray-200 pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="ideal-inventory-description" className="block text-sm font-medium text-gray-700">
                      Ideal Inventory Column Description
                    </label>
                    <textarea
                      id="ideal-inventory-description"
                      rows={6}
                      value={idealInventoryDescription}
                      onChange={(e) => setIdealInventoryDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                      placeholder="Enter a description for the Ideal Inventory column..."
                    />
                    <p className="text-xs text-gray-500">
                      This description will help users understand what the Ideal Inventory column represents.
                    </p>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleSaveIdealInventoryDescription}
                      disabled={updateIdealDescMutation.isPending}
                      className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      style={{ backgroundColor: PINK_COLOR }}
                      onMouseEnter={(e) => {
                        if (!updateIdealDescMutation.isPending) {
                          e.currentTarget.style.backgroundColor = PINK_DARK
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!updateIdealDescMutation.isPending) {
                          e.currentTarget.style.backgroundColor = PINK_COLOR
                        }
                      }}
                    >
                      {updateIdealDescMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          <span>Save Description</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* To Be Ordered Tab */}
          {activeTab === 'to-be-ordered' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="to-be-ordered-description" className="block text-sm font-medium text-gray-700">
                  To Be Ordered Column Description
                </label>
                <textarea
                  id="to-be-ordered-description"
                  rows={6}
                  value={toBeOrderedDescription}
                  onChange={(e) => setToBeOrderedDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                  placeholder="Enter a description for the To Be Ordered column..."
                />
                <p className="text-xs text-gray-500">
                  This description will help users understand what the To Be Ordered column represents.
                </p>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSaveToBeOrderedDescription}
                  disabled={updateToBeOrderedDescMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  style={{ backgroundColor: PINK_COLOR }}
                  onMouseEnter={(e) => {
                    if (!updateToBeOrderedDescMutation.isPending) {
                      e.currentTarget.style.backgroundColor = PINK_DARK
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!updateToBeOrderedDescMutation.isPending) {
                      e.currentTarget.style.backgroundColor = PINK_COLOR
                    }
                  }}
                >
                  {updateToBeOrderedDescMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save Description</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useDefaultIdealInventory, useUpdateDefaultIdealInventory } from '../features/settings/settingsApi'
import { Loader2, Save } from 'lucide-react'

const PINK_COLOR = '#E91E63'
const PINK_DARK = '#C2185B'

export default function InventoryDefaultValues() {
  const { data, isLoading } = useDefaultIdealInventory()
  const updateMutation = useUpdateDefaultIdealInventory()
  const [value, setValue] = useState<string>('0')

  useEffect(() => {
    if (data?.value !== undefined) {
      setValue(String(data.value))
    }
  }, [data])

  const handleSave = () => {
    const numValue = parseInt(value) || 0
    if (numValue < 0) {
      return
    }
    updateMutation.mutate(numValue)
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start gap-3 mb-6">
        <div className="rounded-lg bg-blue-100 p-2">
          <Save className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Default Ideal Inventory</h2>
          <p className="text-sm text-gray-600">
            Set the default value for Ideal Inventory that will be used when creating new inventory items.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="default-ideal-inventory" className="block text-sm font-medium text-gray-700">
            Default Ideal Inventory Value
          </label>
          <input
            id="default-ideal-inventory"
            type="number"
            min="0"
            value={value}
            onChange={(e) => {
              const newValue = e.target.value
              if (newValue === '' || (!isNaN(Number(newValue)) && Number(newValue) >= 0)) {
                setValue(newValue)
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter default value"
          />
          <p className="text-xs text-gray-500">
            This value will be automatically set as the Ideal Inventory when creating new inventory items.
          </p>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending || value === '' || parseInt(value) < 0}
            className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={{ backgroundColor: PINK_COLOR }}
            onMouseEnter={(e) => {
              if (!updateMutation.isPending && value !== '' && parseInt(value) >= 0) {
                e.currentTarget.style.backgroundColor = PINK_DARK
              }
            }}
            onMouseLeave={(e) => {
              if (!updateMutation.isPending && value !== '' && parseInt(value) >= 0) {
                e.currentTarget.style.backgroundColor = PINK_COLOR
              }
            }}
          >
            {updateMutation.isPending ? (
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
    </div>
  )
}

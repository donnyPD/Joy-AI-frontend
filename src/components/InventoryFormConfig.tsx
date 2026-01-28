import { useState, useEffect, useMemo, useRef } from 'react'
import {
  useInventoryFormConfig,
  useBulkUpdateInventoryFormConfig,
  useUpdateInventoryCategory,
  usePublicFormKey,
  type InventoryFormConfig,
} from '../features/inventory/inventoryApi'
import { useTeamMemberTypes } from '../features/team-member-options/teamMemberOptionsApi'
import toast from 'react-hot-toast'
import { Loader2, ExternalLink } from 'lucide-react'

export default function InventoryFormConfig() {
  const { data: formConfigData, isLoading } = useInventoryFormConfig()
  const { data: publicFormKeyData } = usePublicFormKey()
  const { data: teamMemberTypes = [] } = useTeamMemberTypes()
  const bulkUpdateMutation = useBulkUpdateInventoryFormConfig()
  const updateCategoryVisibility = useUpdateInventoryCategory()
  const [localConfigs, setLocalConfigs] = useState<Record<string, InventoryFormConfig>>({})
  const [hasChanges, setHasChanges] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const updatingCategoryRef = useRef<Set<string>>(new Set())

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
        toast.success('Form configuration saved successfully!')
      },
    })
  }

  const getItemsForCategory = (categoryId: string) => {
    if (!formConfigData?.inventory) return []
    // Filter items by categoryId, ensuring we match exactly
    return formConfigData.inventory.filter((item) => {
      return item.categoryId === categoryId
    })
  }

  const publicFormUrl = publicFormKeyData?.publicFormKey
    ? `${window.location.origin}/public/inventory-form?key=${encodeURIComponent(publicFormKeyData.publicFormKey)}`
    : `${window.location.origin}/public/inventory-form`

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col flex-1 min-h-0">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Form Configuration</h2>
            <p className="text-sm text-gray-600 mt-1">
              Configure form fields, visibility, and validation rules for the public inventory form.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-gray-200 bg-blue-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-700">Public Form Link</p>
            <p className="text-xs text-blue-600 mt-1 break-all">{publicFormUrl}</p>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(publicFormUrl)
              toast.success('Link copied to clipboard!')
            }}
            className="px-3 py-1 text-sm border border-blue-300 rounded-md hover:bg-blue-100 whitespace-nowrap"
          >
            Copy Link
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 min-h-0">
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
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          
                          // Prevent double calls - check if this category is already being updated
                          if (updatingCategoryRef.current.has(category.id) || updateCategoryVisibility.isPending) {
                            return
                          }
                          
                          // Mark this category as being updated
                          updatingCategoryRef.current.add(category.id)
                          const newValue = !(category.isVisibleOnForm !== false)
                          
                          updateCategoryVisibility.mutate(
                            {
                              id: category.id,
                              data: { isVisibleOnForm: newValue },
                            },
                            {
                              onSuccess: () => {
                                updatingCategoryRef.current.delete(category.id)
                                toast.success('Category visibility updated')
                              },
                              onError: () => {
                                updatingCategoryRef.current.delete(category.id)
                              },
                            }
                          )
                        }}
                        disabled={updateCategoryVisibility.isPending || updatingCategoryRef.current.has(category.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#E91E63] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
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
                        {getItemsForCategory(category.id).length > 0 ? (
                          getItemsForCategory(category.id).map((item) => {
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
                          })
                        ) : (
                          <tr>
                            <td
                              colSpan={4 + activeTeamMemberTypes.length}
                              className="p-8 text-center text-gray-500 text-sm"
                            >
                              No items found in this category
                            </td>
                          </tr>
                        )}
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
  )
}

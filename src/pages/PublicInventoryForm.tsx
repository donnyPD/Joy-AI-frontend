import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  usePublicInventoryFormConfig,
  useSubmitPublicInventoryForm,
} from '../features/inventory/inventoryApi'
import { Loader2, ChevronRight, ChevronLeft, CheckCircle, AlertCircle } from 'lucide-react'

interface TeamMember {
  id: string
  name: string
  type: string
}

export default function PublicInventoryForm() {
  const [searchParams] = useSearchParams()
  const formKey = searchParams.get('key')

  const [stage, setStage] = useState(1)
  const [submitterName, setSubmitterName] = useState('')
  const [selections, setSelections] = useState<Record<string, number>>({})
  const [returningEmptyGallons, setReturningEmptyGallons] = useState('')
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [selectedTechnician, setSelectedTechnician] = useState<TeamMember | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const { data: formData, isLoading, error } = usePublicInventoryFormConfig(formKey || undefined)
  const submitMutation = useSubmitPublicInventoryForm(formKey || undefined)

  // Get all unique categories from inventoryByCategory, sorted: Products first, Tools second, then others alphabetically
  const allCategories = useMemo(() => {
    if (!formData?.inventoryByCategory) return []
    const categories = Object.keys(formData.inventoryByCategory).filter(
      (cat) => formData.inventoryByCategory[cat]?.length > 0,
    )

    // Sort categories: Products first, Tools second, then others alphabetically
    return categories.sort((a, b) => {
      const aLower = a.toLowerCase()
      const bLower = b.toLowerCase()

      if (aLower === 'products') return -1
      if (bLower === 'products') return 1
      if (aLower === 'tools') return -1
      if (bLower === 'tools') return 1

      return a.localeCompare(b)
    })
  }, [formData?.inventoryByCategory])

  // Total stages = 1 (name) + number of categories + 1 (confirmation with notes)
  const totalStages = allCategories.length + 2

  const filteredTechnicians = useMemo(() => {
    if (submitterName.length < 4) return []
    const searchTerm = submitterName.toLowerCase()
    return (formData?.teamMembers || []).filter((tech) =>
      tech.name.toLowerCase().includes(searchTerm),
    )
  }, [submitterName, formData?.teamMembers])

  const getDropdownOptions = (categoryName: string, fieldName: string): number[] => {
    const configKey = `${categoryName}:${fieldName}`
    const config = formData?.formConfig?.[configKey]
    let minValue = config?.dropdownMin || 1
    
    // Get max value from dropdownMaxByType based on selected technician's type
    // Fallback to 5 if type not found or dropdownMaxByType doesn't exist
    let maxValue = 5
    if (selectedTechnician?.type && config?.dropdownMaxByType) {
      maxValue = config.dropdownMaxByType[selectedTechnician.type] || 5
    } else if (config?.dropdownMaxByType) {
      // If no technician selected, use the first available max value or default
      const maxValues = Object.values(config.dropdownMaxByType).filter((v): v is number => typeof v === 'number')
      maxValue = maxValues.length > 0 ? Math.max(...maxValues) : 5
    }
    
    if (minValue > maxValue) {
      ;[minValue, maxValue] = [maxValue, minValue]
    }
    if (minValue < 1) minValue = 1
    const length = Math.max(1, maxValue - minValue + 1)
    return Array.from({ length }, (_, i) => minValue + i)
  }

  const isFieldVisible = (categoryName: string, fieldName: string): boolean => {
    const configKey = `${categoryName}:${fieldName}`
    const config = formData?.formConfig?.[configKey]
    return config?.isVisible !== false
  }

  const isFieldRequired = (categoryName: string, fieldName: string): boolean => {
    const configKey = `${categoryName}:${fieldName}`
    const config = formData?.formConfig?.[configKey]
    return config?.isRequired === true
  }

  const getMissingRequiredFieldsForCategory = (categoryName: string): string[] => {
    if (!formData?.formConfig) return []

    const missingFields: string[] = []
    const items = formData.inventoryByCategory?.[categoryName] || []

    for (const item of items) {
      const configKey = `${categoryName}:${item.name}`
      const config = formData.formConfig[configKey]

      if (config?.isRequired && config?.isVisible !== false) {
        if (!selections[item.name] || selections[item.name] <= 0) {
          missingFields.push(item.name)
        }
      }
    }

    return missingFields
  }

  const handleSelection = (itemName: string, value: string) => {
    if (value === 'none') {
      const newSelections = { ...selections }
      delete newSelections[itemName]
      setSelections(newSelections)
    } else {
      setSelections({
        ...selections,
        [itemName]: parseInt(value),
      })
    }
  }

  const canProceedFromNameStage = () => {
    return submitterName.trim().length > 0 && selectedTechnician !== null
  }

  const canProceedFromCategoryStage = (categoryName: string) => {
    const missingRequired = getMissingRequiredFieldsForCategory(categoryName)
    return missingRequired.length === 0
  }

  const handleSubmit = () => {
    // Split selections into products and tools based on item type
    const productSelections: Record<string, number> = {}
    const toolSelections: Record<string, number> = {}

    for (const categoryName of allCategories) {
      const items = formData?.inventoryByCategory?.[categoryName] || []
      for (const item of items) {
        if (selections[item.name]) {
          if (item.type === 'product') {
            productSelections[item.name] = selections[item.name]
          } else {
            toolSelections[item.name] = selections[item.name]
          }
        }
      }
    }

    submitMutation.mutate(
      {
        submitterName,
        productSelections,
        toolSelections,
        additionalNotes,
        returningEmptyGallons,
      },
      {
        onSuccess: () => {
          setIsSubmitted(true)
        },
      },
    )
  }

  // Show error if key is missing or invalid
  if (!formKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Invalid Form Link</h2>
          <p className="text-gray-600">
            This form requires a valid access key. Please use the link provided by your administrator.
          </p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error || (formData && 'message' in formData && formData.message)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Form</h2>
          <p className="text-gray-600">
            {error?.message || (formData && 'message' in formData ? String(formData.message) : 'Failed to load form configuration')}
          </p>
        </div>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-6">
            Your product and tools request has been submitted successfully.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Products should be ordered via this form and the products will be delivered the
            following week. Ziah will schedule the pickup with you and it will reflect on your
            Jobber as a task
          </p>
          <button
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            onClick={() => {
              setIsSubmitted(false)
              setStage(1)
              setSubmitterName('')
              setSelections({})
              setAdditionalNotes('')
              setReturningEmptyGallons('')
              setSelectedTechnician(null)
            }}
          >
            Submit Another Request
          </button>
        </div>
      </div>
    )
  }

  // Get current category for category stages (stage 2 onwards until last stage)
  const getCurrentCategory = () => {
    if (stage === 1 || stage === totalStages) return null
    return allCategories[stage - 2] // stage 2 = index 0, stage 3 = index 1, etc.
  }

  const currentCategory = getCurrentCategory()
  const currentCategoryItems = currentCategory
    ? formData?.inventoryByCategory?.[currentCategory] || []
    : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-center mb-6 pt-4">
          <h1 className="text-2xl font-bold text-gray-800">Joy of Cleaning</h1>
        </div>

        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2">
            {Array.from({ length: totalStages }, (_, i) => i + 1).map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    stage >= step
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step}
                </div>
                {step < totalStages && (
                  <div
                    className={`w-12 h-1 ${stage > step ? 'bg-blue-600' : 'bg-gray-200'}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Stage 1: Name Entry */}
        {stage === 1 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-center text-xl font-semibold mb-4">
              Product & Tools Request Form
            </h2>
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                <p className="font-medium mb-2">
                  Please fill this form to request products & tools from Joy Of Cleaning:
                </p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>
                    Product counts have been upgraded so you may order enough for at least 30 days.
                  </li>
                  <li>
                    Products should be ordered via this form and the products will be delivered the
                    following week.
                  </li>
                  <li>
                    Pick up location is at our THRIVE OFFICE (3rd floor). Please bring bags or
                    containers for product.
                  </li>
                </ol>
              </div>

              <div className="space-y-2 relative">
                <label htmlFor="name" className="text-base font-medium block">
                  Please enter your name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={submitterName}
                  onChange={(e) => {
                    const newValue = e.target.value
                    setSubmitterName(newValue)
                    setShowSuggestions(true)
                    if (
                      selectedTechnician &&
                      newValue.toLowerCase() !== selectedTechnician.name.toLowerCase()
                    ) {
                      setSelectedTechnician(null)
                    }
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Enter your full name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoComplete="off"
                />
                {showSuggestions && filteredTechnicians.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredTechnicians.map((tech) => (
                      <button
                        key={tech.id}
                        type="button"
                        className="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center justify-between"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          setSubmitterName(tech.name)
                          setSelectedTechnician(tech)
                          setShowSuggestions(false)
                        }}
                      >
                        <span>{tech.name}</span>
                      </button>
                    ))}
                  </div>
                )}
                {selectedTechnician ? (
                  <p className="text-sm text-green-600 mt-1">
                    Selected: {selectedTechnician.name}
                  </p>
                ) : submitterName.length >= 4 && filteredTechnicians.length === 0 ? (
                  <p className="text-sm text-orange-600 mt-1">
                    No matching technician found. Please check the spelling.
                  </p>
                ) : submitterName.length > 0 && submitterName.length < 4 ? (
                  <p className="text-sm text-gray-500 mt-1">
                    Type at least 4 characters to see suggestions
                  </p>
                ) : null}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => {
                    if (canProceedFromNameStage()) {
                      setStage(2)
                    }
                  }}
                  disabled={!canProceedFromNameStage()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Category Stages (dynamic based on categories) */}
        {currentCategory && !selectedTechnician && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="py-8 text-center">
              <p className="text-orange-600 mb-4">Please select a technician first.</p>
              <button
                onClick={() => setStage(1)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Go Back
              </button>
            </div>
          </div>
        )}
        {currentCategory && selectedTechnician && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-center text-xl font-semibold mb-4">
              {currentCategory.toUpperCase()}
            </h2>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 text-center mb-4">
                Select the quantity for each item you need. Required items are marked with *.
              </p>

              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {currentCategoryItems.map((item) => {
                  const isRequired = isFieldRequired(currentCategory, item.name)
                  if (!isFieldVisible(currentCategory, item.name)) return null

                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        isRequired ? 'border-red-200 bg-red-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex-1 pr-4">
                        <span className="text-sm font-medium">
                          {item.name}
                          {isRequired && <span className="text-red-500 ml-1">*</span>}
                        </span>
                      </div>
                      <select
                        value={selections[item.name]?.toString() || 'none'}
                        onChange={(e) => handleSelection(item.name, e.target.value)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="none">-</option>
                        {getDropdownOptions(currentCategory, item.name).map((num) => (
                          <option key={num} value={num.toString()}>
                            {num}
                          </option>
                        ))}
                      </select>
                    </div>
                  )
                })}
              </div>

              {!canProceedFromCategoryStage(currentCategory) &&
                getMissingRequiredFieldsForCategory(currentCategory).length > 0 && (
                  <p className="text-sm text-red-600 text-center">
                    Please select a quantity for:{' '}
                    {getMissingRequiredFieldsForCategory(currentCategory).map((field, idx) => (
                      <span key={field}>
                        &quot;{field}&quot;
                        {idx < getMissingRequiredFieldsForCategory(currentCategory).length - 1
                          ? ', '
                          : ''}
                      </span>
                    ))}
                  </p>
                )}

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStage(stage - 1)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
                <button
                  onClick={() => setStage(stage + 1)}
                  disabled={!canProceedFromCategoryStage(currentCategory)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Final Stage: Notes and Submit */}
        {stage === totalStages && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-center text-xl font-semibold mb-4">Additional Information</h2>
            <div className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="returningGallons" className="text-base font-medium block">
                    Returning Empty unlabeled Gallons - please enter #
                  </label>
                  <input
                    id="returningGallons"
                    type="text"
                    value={returningEmptyGallons}
                    onChange={(e) => setReturningEmptyGallons(e.target.value)}
                    placeholder="Enter number of gallons"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="notes" className="text-base font-medium block">
                    Any notes please enter here (additional product or tool replacement requests)
                  </label>
                  <textarea
                    id="notes"
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Enter any additional notes or requests..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStage(stage - 1)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-gray-500 mt-6">
          Joy of Cleaning - Product & Tools Request Form
        </p>
      </div>
    </div>
  )
}

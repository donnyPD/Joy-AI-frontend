import { useState, useEffect } from 'react'
import { useCreateKpiEntry } from '../features/kpi-entries/kpiEntriesApi'
import type { CustomMetricDefinition, MetricField } from '../features/team-members/teamMembersApi'
import { Calendar, Type, Upload, DollarSign, Hash, Image } from 'lucide-react'

interface CustomMetricEntryDialogProps {
  open: boolean
  onClose: () => void
  teamMemberId: string
  customMetric: CustomMetricDefinition
}

const getFieldTypeIcon = (type: MetricField['type']) => {
  switch (type) {
    case 'date':
      return Calendar
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

export default function CustomMetricEntryDialog({
  open,
  onClose,
  teamMemberId,
  customMetric,
}: CustomMetricEntryDialogProps) {
  const createMutation = useCreateKpiEntry()
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedDate, setSelectedDate] = useState('')

  useEffect(() => {
    if (open) {
      // Initialize field values
      const initialValues: Record<string, string> = {}
      customMetric.fields.forEach((field) => {
        initialValues[field.id] = ''
      })
      setFieldValues(initialValues)
      setSelectedDate(new Date().toISOString().split('T')[0])
      setErrors({})
    }
  }, [open, customMetric])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Find date field for entry date
    const dateField = customMetric.fields.find((f) => f.type === 'date')
    const entryDate = dateField ? fieldValues[dateField.id] : selectedDate

    if (!entryDate) {
      newErrors.date = 'Date is required'
    }

    // Validate required fields
    customMetric.fields.forEach((field) => {
      if (field.required && !fieldValues[field.id]?.trim()) {
        newErrors[field.id] = `${field.name} is required`
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    // Find date field or use selected date
    const dateField = customMetric.fields.find((f) => f.type === 'date')
    const entryDate = dateField ? fieldValues[dateField.id] : selectedDate

    // Find dollarValue field for cost
    const dollarValueField = customMetric.fields.find((f) => f.type === 'dollarValue')
    const cost = dollarValueField && fieldValues[dollarValueField.id]
      ? parseFloat(fieldValues[dollarValueField.id]).toFixed(2)
      : undefined

    // Store all field values in description as JSON
    const descriptionData: Record<string, any> = {}
    customMetric.fields.forEach((field) => {
      descriptionData[field.id] = fieldValues[field.id] || ''
      descriptionData[field.name] = fieldValues[field.id] || '' // Also store by name for easier access
      
      // For image fields, also store the image URL if provided
      if (field.type === 'image' && fieldValues[`${field.id}_url`]) {
        descriptionData[`${field.id}_url`] = fieldValues[`${field.id}_url`]
      }
    })

    createMutation.mutate(
      {
        teamMemberId,
        kpiType: customMetric.id, // Use custom metric ID as kpiType
        date: entryDate,
        description: JSON.stringify(descriptionData),
        cost: cost,
      },
      {
        onSuccess: () => {
          onClose()
        },
      },
    )
  }

  const handleFieldChange = (fieldId: string, value: string) => {
    setFieldValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }))
    // Clear error for this field
    if (errors[fieldId]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[fieldId]
        return newErrors
      })
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">Add {customMetric.name} Entry</h3>
              {customMetric.description && (
                <p className="text-sm text-gray-500 mt-1">{customMetric.description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 ml-4"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Date field (if not in custom fields, show separate date input) */}
          {!customMetric.fields.find((f) => f.type === 'date') && (
            <div className="space-y-2">
              <label htmlFor="entry-date" className="block text-sm font-medium text-gray-700">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                id="entry-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
            </div>
          )}

          {/* Dynamic fields based on custom metric definition */}
          {customMetric.fields.map((field) => {
            const Icon = getFieldTypeIcon(field.type)
            const value = fieldValues[field.id] || ''
            const hasError = !!errors[field.id]

            return (
              <div key={field.id} className="space-y-2">
                <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {field.name}
                  {field.required && <span className="text-red-500">*</span>}
                </label>

                {field.type === 'date' && (
                  <input
                    id={field.id}
                    type="date"
                    value={value}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      hasError ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                )}

                {field.type === 'text' && (
                  <textarea
                    id={field.id}
                    value={value}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      hasError ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={`Enter ${field.name.toLowerCase()}...`}
                  />
                )}

                {(field.type === 'dollarValue' || field.type === 'number') && (
                  <input
                    id={field.id}
                    type="number"
                    step={field.type === 'dollarValue' ? '0.01' : '1'}
                    min="0"
                    value={value}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      hasError ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={field.type === 'dollarValue' ? '0.00' : '0'}
                  />
                )}

                {(field.type === 'upload' || field.type === 'image') && (
                  <div className="space-y-2">
                    <div>
                      <input
                        id={field.id}
                        type="file"
                        accept={field.type === 'image' ? 'image/*' : '*'}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            // Store file name for now (could be enhanced to upload and store URL)
                            handleFieldChange(field.id, file.name)
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          hasError ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {value && (
                        <p className="mt-1 text-sm text-gray-500">Selected: {value}</p>
                      )}
                    </div>
                    {field.type === 'image' && (
                      <div>
                        <label htmlFor={`${field.id}_url`} className="block text-sm font-medium text-gray-700 mb-1">
                          Image URL (Optional)
                        </label>
                        <input
                          id={`${field.id}_url`}
                          type="url"
                          value={fieldValues[`${field.id}_url`] || ''}
                          onChange={(e) => handleFieldChange(`${field.id}_url`, e.target.value)}
                          placeholder="https://example.com/image.jpg"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Enter a direct URL to the image. This will be used for display if provided.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {hasError && <p className="text-sm text-red-500">{errors[field.id]}</p>}
              </div>
            )
          })}

          {/* {customMetric.description && (
            <div className="bg-gray-50 rounded-md p-3">
              <p className="text-sm text-gray-600">{customMetric.description}</p>
            </div>
          )} */}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Adding...' : 'Add Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

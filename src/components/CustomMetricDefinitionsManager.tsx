import { useState } from 'react'
import type {
  CustomMetricDefinition,
  MetricField,
} from '../features/team-members/teamMembersApi'
import {
  useCustomMetricDefinitions,
  useCreateCustomMetricDefinition,
  useUpdateCustomMetricDefinition,
  useDeleteCustomMetricDefinition,
} from '../features/team-members/teamMembersApi'
import {
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Type,
  Upload,
  DollarSign,
  Hash,
  Loader2,
  GripVertical,
  X,
  Image,
} from 'lucide-react'
import toast from 'react-hot-toast'

const FIELD_TYPE_OPTIONS = [
  { value: 'date', label: 'Date', icon: Calendar },
  { value: 'text', label: 'Text', icon: Type },
  { value: 'upload', label: 'File Upload', icon: Upload },
  { value: 'dollarValue', label: 'Dollar Value', icon: DollarSign },
  { value: 'number', label: 'Number', icon: Hash },
  { value: 'image', label: 'Image', icon: Image },
]

const COLOR_OPTIONS = [
  { value: 'red', label: 'Red', class: 'bg-red-500' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
  { value: 'yellow', label: 'Yellow', class: 'bg-yellow-500' },
  { value: 'green', label: 'Green', class: 'bg-green-500' },
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { value: 'pink', label: 'Pink', class: 'bg-pink-500' },
]

const generateId = () => Math.random().toString(36).substring(2, 9)

export default function CustomMetricDefinitionsManager() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingMetric, setEditingMetric] = useState<CustomMetricDefinition | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: 'blue',
    isActive: true,
    threshold: '',
    fields: [{ id: generateId(), name: '', type: 'text' as MetricField['type'], required: true }],
  })

  const { data: metrics, isLoading } = useCustomMetricDefinitions()
  const createMutation = useCreateCustomMetricDefinition()
  const updateMutation = useUpdateCustomMetricDefinition()
  const deleteMutation = useDeleteCustomMetricDefinition()

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: 'blue',
      isActive: true,
      threshold: '',
      fields: [{ id: generateId(), name: '', type: 'text', required: true }],
    })
  }

  const openCreateForm = () => {
    resetForm()
    setEditingMetric(null)
    setIsFormOpen(true)
  }

  const openEditForm = (metric: CustomMetricDefinition) => {
    setEditingMetric(metric)
    setFormData({
      name: metric.name,
      description: metric.description || '',
      color: metric.color || 'blue',
      isActive: metric.isActive,
      threshold: metric.threshold !== null && metric.threshold !== undefined ? String(metric.threshold) : '',
      fields:
        metric.fields.length > 0
          ? metric.fields
          : [{ id: generateId(), name: '', type: 'text', required: true }],
    })
    setIsFormOpen(true)
  }

  const addField = () => {
    setFormData((prev) => ({
      ...prev,
      fields: [...prev.fields, { id: generateId(), name: '', type: 'text', required: false }],
    }))
  }

  const removeField = (fieldId: string) => {
    if (formData.fields.length <= 1) {
      toast.error('At least one field is required')
      return
    }
    setFormData((prev) => ({
      ...prev,
      fields: prev.fields.filter((f) => f.id !== fieldId),
    }))
  }

  const updateField = (fieldId: string, updates: Partial<MetricField>) => {
    setFormData((prev) => ({
      ...prev,
      fields: prev.fields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)),
    }))
  }

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('Metric name is required')
      return
    }

    const hasEmptyFieldNames = formData.fields.some((f) => !f.name.trim())
    if (hasEmptyFieldNames) {
      toast.error('All field names are required')
      return
    }

    const submitData = {
      ...formData,
      threshold: formData.threshold === '' ? undefined : formData.threshold,
    }

    if (editingMetric) {
      updateMutation.mutate(
        { id: editingMetric.id, data: submitData },
        {
          onSuccess: () => {
            resetForm()
            setIsFormOpen(false)
            setEditingMetric(null)
          },
        },
      )
    } else {
      createMutation.mutate(submitData, {
        onSuccess: () => {
          resetForm()
          setIsFormOpen(false)
        },
      })
    }
  }

  const getFieldTypeIcon = (type: MetricField['type']) => {
    const option = FIELD_TYPE_OPTIONS.find((o) => o.value === type)
    return option?.icon || Type
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Custom Metric Definitions</h2>
              <p className="text-sm text-gray-600 mt-1">
                Define custom metrics with various field types to track team performance
              </p>
            </div>
            <button
              onClick={openCreateForm}
              className="px-4 py-2 bg-[#E91E63] text-white rounded-md hover:bg-[#C2185B] transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Metric
            </button>
          </div>
        </div>
        <div className="p-6">
          {metrics && metrics.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {metrics.map((metric) => (
                <div
                  key={metric.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 relative hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            COLOR_OPTIONS.find((c) => c.value === metric.color)?.class || 'bg-blue-500'
                          }`}
                        />
                        <h3 className="text-lg font-semibold text-gray-900">{metric.name}</h3>
                      </div>
                      {metric.description && (
                        <p className="text-sm text-gray-500 mt-1 ml-5">{metric.description}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditForm(metric)}
                        className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(metric.id)}
                        className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
             
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 font-medium">Fields:</p>
                    <div className="flex flex-wrap gap-2">
                      {metric.fields.map((field) => {
                        const Icon = getFieldTypeIcon(field.type)
                        return (
                          <div
                            key={field.id}
                            className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md text-xs"
                          >
                            <Icon className="h-3 w-3" />
                            <span>{field.name}</span>
                            {field.required && <span className="text-red-500">*</span>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  {!metric.isActive && (
                    <div className="mt-3 text-xs text-gray-500">
                      <span className="px-2 py-1 bg-gray-100 rounded">Inactive</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No custom metrics defined yet.</p>
              <p className="text-sm mt-1">Click "Add Metric" to create your first custom metric.</p>
            </div>
          )}
        </div>
      </div>

      {/* Form Dialog */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingMetric ? `Edit ${formData.name || 'Metric'}` : 'Create New Metric'}
              </h3>
              {formData.description && (
                <p className="text-sm text-gray-500 mt-1">{formData.description}</p>
              )}
              {!formData.description && (
                <p className="text-sm text-gray-600 mt-1">
                  Define a custom metric with various field types for tracking team performance.
                </p>
              )}
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Metric Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Customer Complaints"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Color</label>
                  <select
                    value={formData.color}
                    onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                  >
                    {COLOR_OPTIONS.map((color) => (
                      <option key={color.value} value={color.value}>
                        {color.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description of this metric..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Active</label>
                  <p className="text-xs text-gray-500">Enable this metric for data entry</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E91E63]"></div>
                </label>
              </div>

              <div className="space-y-2">
                <label htmlFor="threshold" className="block text-sm font-medium text-gray-700">
                  Threshold (Optional)
                </label>
                <p className="text-xs text-gray-500">
                  Set a threshold count to trigger alerts when this metric is recorded too many times
                </p>
                <input
                  id="threshold"
                  type="number"
                  value={formData.threshold}
                  onChange={(e) => setFormData((prev) => ({ ...prev, threshold: e.target.value }))}
                  placeholder="e.g., 3"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-base font-semibold text-gray-900">Fields</label>
                  <button
                    type="button"
                    onClick={addField}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add Field
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.fields.map((field) => (
                    <div
                      key={field.id}
                      className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50"
                    >
                      <div className="pt-2">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-gray-700">Field Name *</label>
                          <input
                            type="text"
                            value={field.name}
                            onChange={(e) => updateField(field.id, { name: e.target.value })}
                            placeholder="e.g., Incident Date"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-gray-700">Field Type</label>
                          <select
                            value={field.type}
                            onChange={(e) =>
                              updateField(field.id, { type: e.target.value as MetricField['type'] })
                            }
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                          >
                            {FIELD_TYPE_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-6">
                        <div className="flex items-center gap-1">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) => updateField(field.id, { required: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#E91E63]"></div>
                          </label>
                          <span className="text-xs text-gray-700">Required</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeField(field.id)}
                          disabled={formData.fields.length <= 1}
                          className="p-1 text-gray-500 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsFormOpen(false)
                  resetForm()
                  setEditingMetric(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-4 py-2 bg-[#E91E63] text-white rounded-md hover:bg-[#C2185B] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editingMetric ? (
                  'Update Metric'
                ) : (
                  'Create Metric'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full m-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Metric?</h3>
              <p className="text-sm text-gray-600 mb-4">
                This action cannot be undone. This will permanently delete the metric definition.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (deleteConfirmId) {
                      deleteMutation.mutate(deleteConfirmId, {
                        onSuccess: () => {
                          setDeleteConfirmId(null)
                        },
                      })
                    }
                  }}
                  disabled={deleteMutation.isPending}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

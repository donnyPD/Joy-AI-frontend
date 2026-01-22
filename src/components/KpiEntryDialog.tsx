import { useState, useEffect } from 'react'
import { useCreateKpiEntry } from '../features/kpi-entries/kpiEntriesApi'
import type { CreateKpiEntryData } from '../features/kpi-entries/kpiEntriesApi'

interface KpiEntryDialogProps {
  open: boolean
  onClose: () => void
  teamMemberId: string
  kpiType: string
  kpiTypeName: string
}

export default function KpiEntryDialog({
  open,
  onClose,
  teamMemberId,
  kpiType,
  kpiTypeName,
}: KpiEntryDialogProps) {
  const createMutation = useCreateKpiEntry()
  const [formData, setFormData] = useState<CreateKpiEntryData>({
    teamMemberId,
    kpiType,
    date: '',
    description: '',
    cost: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isDamages = kpiType === 'damages'

  useEffect(() => {
    if (open) {
      setFormData({
        teamMemberId,
        kpiType,
        date: '',
        description: '',
        cost: '',
      })
      setErrors({})
    }
  }, [open, teamMemberId, kpiType])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.date.trim()) {
      newErrors.date = 'Date is required'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }
    if (isDamages) {
      if (!formData.cost || !formData.cost.trim()) {
        newErrors.cost = 'Cost is required for damages'
      } else if (parseFloat(formData.cost) <= 0) {
        newErrors.cost = 'Cost must be greater than 0'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    const submitData: CreateKpiEntryData = {
      teamMemberId,
      kpiType,
      date: formData.date,
      description: formData.description,
    }

    if (isDamages && formData.cost) {
      submitData.cost = formData.cost
    }

    createMutation.mutate(submitData, {
      onSuccess: () => {
        onClose()
      },
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h2 className="text-xl font-semibold mb-2">Add {kpiTypeName} Entry</h2>
        <p className="text-sm text-gray-600 mb-4">
          Add a new {kpiTypeName.toLowerCase()} entry with date and description
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              KPI Type
            </label>
            <input
              type="text"
              value={kpiType}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.date && (
              <p className="text-red-500 text-xs mt-1">{errors.date}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          {isDamages && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cost ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                placeholder="0.00"
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.cost ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.cost && (
                <p className="text-red-500 text-xs mt-1">{errors.cost}</p>
              )}
            </div>
          )}

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
              className="px-4 py-2 bg-[#E91E63] text-white rounded-md hover:bg-[#C2185B] disabled:opacity-50"
            >
              {createMutation.isPending ? 'Adding...' : 'Add Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

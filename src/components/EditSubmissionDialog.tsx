import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { InventoryFormSubmission } from '../features/inventory/inventoryApi'

interface EditSubmissionDialogProps {
  submission: InventoryFormSubmission | null
  onClose: () => void
  onSave: (data: Partial<InventoryFormSubmission>) => void
  isPending: boolean
}

export default function EditSubmissionDialog({
  submission,
  onClose,
  onSave,
  isPending,
}: EditSubmissionDialogProps) {
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Returning Empty Gallons</label>
              <input
                type="text"
                value={returningEmptyGallons}
                onChange={(e) => setReturningEmptyGallons(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
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

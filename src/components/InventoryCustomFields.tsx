import { useState } from 'react'
import { Plus, Trash2, Pencil, X, Check, ArrowUp, ArrowDown, Loader2, Package } from 'lucide-react'
import {
  useInventoryColumnDefinitions,
  useCreateInventoryColumnDefinition,
  useUpdateInventoryColumnDefinition,
  useDeleteInventoryColumnDefinition,
  useReorderInventoryColumnDefinitions,
  type InventoryColumnDefinition,
} from '../features/inventory/inventoryApi'
import toast from 'react-hot-toast'

export default function InventoryCustomFields() {
  const { data: columns = [], isLoading } = useInventoryColumnDefinitions()
  const createMutation = useCreateInventoryColumnDefinition()
  const updateMutation = useUpdateInventoryColumnDefinition()
  const deleteMutation = useDeleteInventoryColumnDefinition()
  const reorderMutation = useReorderInventoryColumnDefinitions()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingLabel, setEditingLabel] = useState('')
  const [newColumnLabel, setNewColumnLabel] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const handleStartEdit = (column: InventoryColumnDefinition) => {
    setEditingId(column.id)
    setEditingLabel(column.columnLabel)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingLabel('')
  }

  const handleSaveEdit = () => {
    if (!editingId || !editingLabel.trim()) {
      toast.error('Column label is required')
      return
    }

    updateMutation.mutate(
      {
        id: editingId,
        data: { columnLabel: editingLabel.trim() },
      },
      {
        onSuccess: () => {
          setEditingId(null)
          setEditingLabel('')
        },
      }
    )
  }

  const handleAddColumn = () => {
    if (!newColumnLabel.trim()) {
      toast.error('Column label is required')
      return
    }

    // Generate column key from label
    const columnKey = newColumnLabel
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')

    // Get max display order
    const maxOrder = columns.length > 0 ? Math.max(...columns.map(c => c.displayOrder)) : -1

    createMutation.mutate(
      {
        columnKey,
        columnLabel: newColumnLabel.trim(),
        displayOrder: maxOrder + 1,
      },
      {
        onSuccess: () => {
          setNewColumnLabel('')
          setShowAddForm(false)
        },
      }
    )
  }

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setDeleteConfirmId(null)
      },
    })
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return

    const sortedColumns = [...columns].sort((a, b) => a.displayOrder - b.displayOrder)
    const updates = sortedColumns.map((col, idx) => ({
      id: col.id,
      displayOrder: idx === index ? sortedColumns[index - 1].displayOrder : idx === index - 1 ? sortedColumns[index].displayOrder : col.displayOrder,
    }))

    reorderMutation.mutate(updates)
  }

  const handleMoveDown = (index: number) => {
    if (index === columns.length - 1) return

    const sortedColumns = [...columns].sort((a, b) => a.displayOrder - b.displayOrder)
    const updates = sortedColumns.map((col, idx) => ({
      id: col.id,
      displayOrder: idx === index ? sortedColumns[index + 1].displayOrder : idx === index + 1 ? sortedColumns[index].displayOrder : col.displayOrder,
    }))

    reorderMutation.mutate(updates)
  }

  const handleToggleVisibility = (column: InventoryColumnDefinition) => {
    updateMutation.mutate({
      id: column.id,
      data: { isVisible: !column.isVisible },
    })
  }

  const sortedColumns = [...columns].sort((a, b) => a.displayOrder - b.displayOrder)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Inventory Custom Fields</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage custom columns for your inventory table. These columns will appear in the inventory page.
          </p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-[#E91E63] text-white rounded-md hover:bg-[#C2185B] flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Column
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex items-center gap-2 mb-3">
            <input
              type="text"
              placeholder="Enter column label (e.g., Notes, Location)"
              value={newColumnLabel}
              onChange={(e) => setNewColumnLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddColumn()
                if (e.key === 'Escape') {
                  setShowAddForm(false)
                  setNewColumnLabel('')
                }
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              autoFocus
            />
            <button
              onClick={handleAddColumn}
              disabled={createMutation.isPending || !newColumnLabel.trim()}
              className="px-4 py-2 bg-[#E91E63] text-white rounded-md hover:bg-[#C2185B] disabled:opacity-50 flex items-center gap-1"
            >
              {createMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Add
            </button>
            <button
              onClick={() => {
                setShowAddForm(false)
                setNewColumnLabel('')
              }}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#E91E63]" />
        </div>
      ) : sortedColumns.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium mb-2">No custom columns yet</p>
          <p className="text-sm">Click "Add Column" to create your first custom column</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedColumns.map((column, index) => (
            <div
              key={column.id}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-2 flex-1">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0 || reorderMutation.isPending}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === sortedColumns.length - 1 || reorderMutation.isPending}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>

                {editingId === column.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={editingLabel}
                      onChange={(e) => setEditingLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit()
                        if (e.key === 'Escape') handleCancelEdit()
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveEdit}
                      disabled={updateMutation.isPending}
                      className="p-2 text-green-600 hover:text-green-700"
                    >
                      {updateMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-2 text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{column.columnLabel}</span>
                        {!column.isVisible && (
                          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                            Hidden
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">Key: {column.columnKey}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleVisibility(column)}
                        className={`px-3 py-1 text-xs rounded-md ${
                          column.isVisible
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {column.isVisible ? 'Visible' : 'Hidden'}
                      </button>
                      <button
                        onClick={() => handleStartEdit(column)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(column.id)}
                        className="p-2 text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold mb-4">Delete Column</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this column? The column definition will be removed, but any existing data in inventory items will remain.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 inline animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import {
  useTeamMemberStatuses,
  useCreateTeamMemberStatus,
  useUpdateTeamMemberStatus,
  useDeleteTeamMemberStatus,
  type TeamMemberStatus,
} from '../features/team-member-options/teamMemberOptionsApi'
import OptionFormDialog from './OptionFormDialog'

export default function TeamMemberStatusesManager() {
  const { data: statuses = [], isLoading } = useTeamMemberStatuses()
  const createMutation = useCreateTeamMemberStatus()
  const updateMutation = useUpdateTeamMemberStatus()
  const deleteMutation = useDeleteTeamMemberStatus()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingStatus, setEditingStatus] = useState<TeamMemberStatus | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleCreate = () => {
    setEditingStatus(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (status: TeamMemberStatus) => {
    setEditingStatus(status)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id)
    setDeleteError(null)
  }

  const confirmDelete = () => {
    if (deleteConfirmId) {
      deleteMutation.mutate(deleteConfirmId, {
        onSuccess: () => {
          setDeleteConfirmId(null)
          setDeleteError(null)
        },
        onError: (error: any) => {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to delete team member status'
          setDeleteError(errorMessage)
        },
      })
    }
  }

  const handleSubmit = (data: { name: string; isActive: boolean }) => {
    if (editingStatus) {
      updateMutation.mutate(
        { id: editingStatus.id, data },
        {
          onSuccess: () => {
            setIsDialogOpen(false)
            setEditingStatus(null)
          },
          onError: () => {
            // Error is already handled by toast in the hook
          },
        }
      )
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          setIsDialogOpen(false)
        },
      })
    }
  }

  const activeStatuses = statuses.filter((s) => s.isActive)
  const inactiveStatuses = statuses.filter((s) => !s.isActive)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Member Status Types</h2>
          <p className="text-gray-600 mt-1">Manage team member status options</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Status
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading statuses...</span>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeStatuses.length === 0 && inactiveStatuses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No statuses found. Click "Add Status" to create one.
                    </td>
                  </tr>
                ) : (
                  <>
                    {activeStatuses.map((status) => (
                      <tr key={status.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {status.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(status.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(status)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(status.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {inactiveStatuses.map((status) => (
                      <tr key={status.id} className="hover:bg-gray-50 opacity-60">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                          {status.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                            Inactive
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(status.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(status)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(status.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <OptionFormDialog
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false)
          setEditingStatus(null)
        }}
        onSubmit={handleSubmit}
        initialData={editingStatus}
        title={editingStatus ? 'Edit Team Member Status' : 'Create Team Member Status'}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Status</h3>
              {deleteError ? (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">
                  {deleteError}
                </div>
              ) : (
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this status? This action cannot be undone.
                </p>
              )}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setDeleteConfirmId(null)
                    setDeleteError(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={deleteMutation.isPending}
                >
                  {deleteError ? 'Close' : 'Cancel'}
                </button>
                {!deleteError && (
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

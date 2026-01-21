import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import toast from 'react-hot-toast'

export interface InventoryNote {
  id: string
  noteText: string
  nyTimestamp: string
  noteType: string
  teamMemberId?: string | null
  createdAt: string
}

export interface CreateInventoryNoteData {
  noteText: string
  nyTimestamp: string
  noteType: string
  teamMemberId?: string | null
}

export interface UpdateInventoryNoteData {
  noteText?: string
  nyTimestamp?: string
  noteType?: string
}

// Fetch inventory notes for a team member
export function useInventoryNotes(teamMemberId: string | undefined) {
  return useQuery<InventoryNote[]>({
    queryKey: ['/team-members', teamMemberId, 'notes'],
    queryFn: async () => {
      const response = await api.get<InventoryNote[]>(`/team-members/${teamMemberId}/notes`)
      return response.data
    },
    enabled: !!teamMemberId,
  })
}

// Create inventory note mutation
export function useCreateInventoryNote() {
  const queryClient = useQueryClient()

  return useMutation<InventoryNote, Error, CreateInventoryNoteData>({
    mutationFn: async (data) => {
      const response = await api.post<InventoryNote>('/inventory/notes', data)
      return response.data
    },
    onSuccess: (_, variables) => {
      if (variables.teamMemberId) {
        queryClient.invalidateQueries({ queryKey: ['/team-members', variables.teamMemberId, 'notes'] })
      }
      toast.success('Note added successfully')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add note'
      toast.error(errorMessage)
    },
  })
}

// Update inventory note mutation
export function useUpdateInventoryNote() {
  const queryClient = useQueryClient()

  return useMutation<InventoryNote, Error, { id: string; data: UpdateInventoryNoteData; teamMemberId: string }>({
    mutationFn: async ({ id, data }) => {
      const response = await api.put<InventoryNote>(`/inventory/notes/${id}`, data)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/team-members', variables.teamMemberId, 'notes'] })
      toast.success('Note updated successfully')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update note'
      toast.error(errorMessage)
    },
  })
}

// Delete inventory note mutation
export function useDeleteInventoryNote() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, { id: string; teamMemberId: string }>({
    mutationFn: async ({ id }) => {
      await api.delete(`/inventory/notes/${id}`)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/team-members', variables.teamMemberId, 'notes'] })
      toast.success('Note deleted successfully')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete note'
      toast.error(errorMessage)
    },
  })
}

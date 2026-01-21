import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import toast from 'react-hot-toast'

export interface InventoryTechnicianPurchase {
  id: string
  technicianId: string
  purchaseDate: string
  itemsRaw: string
  itemsParsed?: any | null
  isCompleted: boolean
  createdAt: string
}

export interface UpdateInventoryPurchaseData {
  purchaseDate?: string
  itemsRaw?: string
  itemsParsed?: any | null
  isCompleted?: boolean
}

// Fetch inventory purchases for a team member
export function useInventoryPurchases(teamMemberId: string | undefined, year?: number) {
  return useQuery<InventoryTechnicianPurchase[]>({
    queryKey: ['/team-members', teamMemberId, 'inventory-purchases', year],
    queryFn: async () => {
      const params = year ? { year: year.toString() } : {}
      const response = await api.get<InventoryTechnicianPurchase[]>(
        `/team-members/${teamMemberId}/inventory-purchases`,
        { params }
      )
      return response.data
    },
    enabled: !!teamMemberId,
  })
}

// Update inventory purchase mutation
export function useUpdateInventoryPurchase() {
  const queryClient = useQueryClient()

  return useMutation<InventoryTechnicianPurchase, Error, { id: string; data: UpdateInventoryPurchaseData; teamMemberId: string; year?: number }>({
    mutationFn: async ({ id, data }) => {
      const response = await api.put<InventoryTechnicianPurchase>(`/inventory/purchases/${id}`, data)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/team-members', variables.teamMemberId, 'inventory-purchases', variables.year] })
      toast.success('Purchase updated successfully')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update purchase'
      toast.error(errorMessage)
    },
  })
}

// Delete inventory purchase mutation
export function useDeleteInventoryPurchase() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, { id: string; teamMemberId: string; year?: number }>({
    mutationFn: async ({ id }) => {
      await api.delete(`/inventory/purchases/${id}`)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/team-members', variables.teamMemberId, 'inventory-purchases', variables.year] })
      toast.success('Purchase deleted successfully')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete purchase'
      toast.error(errorMessage)
    },
  })
}

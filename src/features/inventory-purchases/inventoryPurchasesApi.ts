import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'

export interface InventoryTechnicianPurchase {
  id: string
  technicianId: string
  purchaseDate: string
  itemsRaw: string
  itemsParsed?: any | null
  isCompleted: boolean
  createdAt: string
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

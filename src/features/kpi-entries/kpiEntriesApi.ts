import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import toast from 'react-hot-toast'

export interface KpiEntry {
  id: string
  teamMemberId: string
  kpiType: string
  date: string
  description: string
  cost?: string | null
  createdAt: string
}

export interface CreateKpiEntryData {
  teamMemberId: string
  kpiType: string
  date: string
  description: string
  cost?: string
}

export interface UpdateKpiEntryData {
  description?: string
  cost?: string
}

// Fetch KPI entries for a team member
export function useKpiEntries(teamMemberId: string | undefined) {
  return useQuery<KpiEntry[]>({
    queryKey: ['/kpi-entries', teamMemberId],
    queryFn: async () => {
      const response = await api.get<KpiEntry[]>(`/kpi-entries/${teamMemberId}`)
      return response.data
    },
    enabled: !!teamMemberId,
  })
}

// Create KPI entry mutation
export function useCreateKpiEntry() {
  const queryClient = useQueryClient()

  return useMutation<KpiEntry, Error, CreateKpiEntryData>({
    mutationFn: async (data) => {
      const response = await api.post<KpiEntry>('/kpi-entries', data)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/kpi-entries', variables.teamMemberId] })
      toast.success('KPI entry added successfully')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add KPI entry'
      toast.error(errorMessage)
    },
  })
}

// Update KPI entry mutation
export function useUpdateKpiEntry() {
  const queryClient = useQueryClient()

  return useMutation<KpiEntry, Error, { id: string; data: UpdateKpiEntryData; teamMemberId: string }>({
    mutationFn: async ({ id, data }) => {
      const response = await api.put<KpiEntry>(`/kpi-entries/${id}`, data)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/kpi-entries', variables.teamMemberId] })
      toast.success('KPI entry updated successfully')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update KPI entry'
      toast.error(errorMessage)
    },
  })
}

// Delete KPI entry mutation
export function useDeleteKpiEntry() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, { id: string; teamMemberId: string }>({
    mutationFn: async ({ id }) => {
      await api.delete(`/kpi-entries/${id}`)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/kpi-entries', variables.teamMemberId] })
      toast.success('KPI entry deleted successfully')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete KPI entry'
      toast.error(errorMessage)
    },
  })
}

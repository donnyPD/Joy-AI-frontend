import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import toast from 'react-hot-toast'

export interface TeamMemberType {
  id: string
  name: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface TeamMemberStatus {
  id: string
  name: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateTeamMemberTypeData {
  name: string
  isActive?: boolean
}

export interface UpdateTeamMemberTypeData {
  name?: string
  isActive?: boolean
}

export interface CreateTeamMemberStatusData {
  name: string
  isActive?: boolean
}

export interface UpdateTeamMemberStatusData {
  name?: string
  isActive?: boolean
}

// Team Member Types hooks
export function useTeamMemberTypes() {
  return useQuery<TeamMemberType[]>({
    queryKey: ['/team-member-types'],
    queryFn: async () => {
      const response = await api.get<TeamMemberType[]>('/team-member-types')
      return response.data
    },
  })
}

export function useCreateTeamMemberType() {
  const queryClient = useQueryClient()
  return useMutation<TeamMemberType, Error, CreateTeamMemberTypeData>({
    mutationFn: async (data) => {
      const response = await api.post<TeamMemberType>('/team-member-types', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/team-member-types'] })
      toast.success('Team member type added successfully')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add team member type'
      toast.error(errorMessage)
    },
  })
}

export function useUpdateTeamMemberType() {
  const queryClient = useQueryClient()
  return useMutation<TeamMemberType, Error, { id: string; data: UpdateTeamMemberTypeData }>({
    mutationFn: async ({ id, data }) => {
      const response = await api.patch<TeamMemberType>(`/team-member-types/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/team-member-types'] })
      queryClient.invalidateQueries({ queryKey: ['/team-members'] })
      toast.success('Team member type updated successfully')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update team member type'
      toast.error(errorMessage)
    },
  })
}

export function useDeleteTeamMemberType() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/team-member-types/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/team-member-types'] })
      toast.success('Team member type deleted successfully')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete team member type'
      toast.error(errorMessage)
    },
  })
}

// Team Member Statuses hooks
export function useTeamMemberStatuses() {
  return useQuery<TeamMemberStatus[]>({
    queryKey: ['/team-member-statuses'],
    queryFn: async () => {
      const response = await api.get<TeamMemberStatus[]>('/team-member-statuses')
      return response.data
    },
  })
}

export function useCreateTeamMemberStatus() {
  const queryClient = useQueryClient()
  return useMutation<TeamMemberStatus, Error, CreateTeamMemberStatusData>({
    mutationFn: async (data) => {
      const response = await api.post<TeamMemberStatus>('/team-member-statuses', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/team-member-statuses'] })
      toast.success('Team member status added successfully')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add team member status'
      toast.error(errorMessage)
    },
  })
}

export function useUpdateTeamMemberStatus() {
  const queryClient = useQueryClient()
  return useMutation<TeamMemberStatus, Error, { id: string; data: UpdateTeamMemberStatusData }>({
    mutationFn: async ({ id, data }) => {
      const response = await api.patch<TeamMemberStatus>(`/team-member-statuses/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/team-member-statuses'] })
      queryClient.invalidateQueries({ queryKey: ['/team-members'] })
      toast.success('Team member status updated successfully')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update team member status'
      toast.error(errorMessage)
    },
  })
}

export function useDeleteTeamMemberStatus() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/team-member-statuses/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/team-member-statuses'] })
      toast.success('Team member status deleted successfully')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete team member status'
      toast.error(errorMessage)
    },
  })
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import toast from 'react-hot-toast'

export interface TeamMember {
  id: string
  photo?: string | null
  name: string
  slackId?: string | null
  type: string
  status: string
  employmentType: string
  email: string
  phone: string
  address: string
  birthday: string
  primaryLanguage: string
  trainingStartDate?: string | null
  trainingEndDate?: string | null
  workStartDate?: string | null
  lastMinuteCallOffs: number
  arrivingLate: number
  excusedTimeOffs: number
  complaints: number
  npsMonthly: number
  npsAverage: number
  googleReviewsObtained: number
  starOfMonth: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateTeamMemberData {
  photo?: string
  name: string
  slackId?: string
  type: string
  status: string
  employmentType: 'Full Time' | 'Part Time'
  email: string
  phone: string
  address: string
  birthday: string
  primaryLanguage: string
  trainingStartDate?: string
  trainingEndDate?: string
  workStartDate?: string
  lastMinuteCallOffs?: number
  arrivingLate?: number
  excusedTimeOffs?: number
  complaints?: number
  npsMonthly?: number
  npsAverage?: number
  googleReviewsObtained?: number
  starOfMonth?: boolean
}

export interface UpdateTeamMemberData extends Partial<CreateTeamMemberData> {}

// Fetch all team members
export function useTeamMembers() {
  return useQuery<TeamMember[]>({
    queryKey: ['/team-members'],
    queryFn: async () => {
      const response = await api.get<TeamMember[]>('/team-members')
      return response.data
    },
  })
}

// Fetch single team member
export function useTeamMember(id: string | undefined) {
  return useQuery<TeamMember>({
    queryKey: ['/team-members', id],
    queryFn: async () => {
      const response = await api.get<TeamMember>(`/team-members/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}

// Create team member mutation
export function useCreateTeamMember() {
  const queryClient = useQueryClient()

  return useMutation<TeamMember, Error, CreateTeamMemberData>({
    mutationFn: async (data) => {
      const response = await api.post<TeamMember>('/team-members', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/team-members'] })
      toast.success('Team member added successfully')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add team member'
      toast.error(errorMessage)
    },
  })
}

// Update team member mutation
export function useUpdateTeamMember() {
  const queryClient = useQueryClient()

  return useMutation<TeamMember, Error, { id: string; data: UpdateTeamMemberData }>({
    mutationFn: async ({ id, data }) => {
      const response = await api.patch<TeamMember>(`/team-members/${id}`, data)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/team-members'] })
      queryClient.invalidateQueries({ queryKey: ['/team-members', variables.id] })
      toast.success('Team member updated successfully')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update team member'
      toast.error(errorMessage)
    },
  })
}

// Delete team member mutation
export function useDeleteTeamMember() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/team-members/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/team-members'] })
      toast.success('Team member deleted successfully')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete team member'
      toast.error(errorMessage)
    },
  })
}

// Team Metrics Summary types and hooks
export interface KpiEntry {
  id: string
  teamMemberId: string
  kpiType: string
  date: string
  description?: string | null
  cost?: number | null
  createdAt: string
}

export interface MemberMetrics {
  [metricType: string]: {
    count: number
    entries: KpiEntry[]
  }
}

export interface TeamMemberSummary {
  id: string
  name: string
  photo?: string | null
  status: string
  metrics: MemberMetrics
}

export interface TeamMetricsSummaryData {
  active: TeamMemberSummary[]
  dismissed: TeamMemberSummary[]
  metricTypes: string[]
}

// Fetch team metrics summary
export function useTeamMetricsSummary(month?: string) {
  return useQuery<TeamMetricsSummaryData>({
    queryKey: ['/team-metrics-summary', month],
    queryFn: async () => {
      const params = month ? { month } : {}
      const response = await api.get<TeamMetricsSummaryData>('/team-metrics-summary', { params })
      return response.data
    },
  })
}

// Custom Metric Definitions types and hooks
export interface MetricField {
  id: string
  name: string
  type: 'date' | 'text' | 'upload' | 'dollarValue' | 'number' | 'image'
  required: boolean
}

export interface CustomMetricDefinition {
  id: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
  fields: MetricField[]
  isActive: boolean
  threshold: number | null
  createdAt: string
  updatedAt: string
}

export interface CreateCustomMetricDefinitionData {
  name: string
  description?: string
  icon?: string
  color?: string
  fields: MetricField[]
  isActive?: boolean
  threshold?: number | string
}

export interface UpdateCustomMetricDefinitionData extends Partial<CreateCustomMetricDefinitionData> {}

// Fetch all custom metric definitions
export function useCustomMetricDefinitions() {
  return useQuery<CustomMetricDefinition[]>({
    queryKey: ['/custom-metric-definitions'],
    queryFn: async () => {
      const response = await api.get<CustomMetricDefinition[]>('/custom-metric-definitions')
      return response.data
    },
  })
}

// Create custom metric definition mutation
export function useCreateCustomMetricDefinition() {
  const queryClient = useQueryClient()

  return useMutation<CustomMetricDefinition, Error, CreateCustomMetricDefinitionData>({
    mutationFn: async (data) => {
      const response = await api.post<CustomMetricDefinition>('/custom-metric-definitions', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/custom-metric-definitions'] })
      toast.success('Metric created successfully')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create metric'
      toast.error(errorMessage)
    },
  })
}

// Update custom metric definition mutation
export function useUpdateCustomMetricDefinition() {
  const queryClient = useQueryClient()

  return useMutation<CustomMetricDefinition, Error, { id: string; data: UpdateCustomMetricDefinitionData }>({
    mutationFn: async ({ id, data }) => {
      const response = await api.patch<CustomMetricDefinition>(`/custom-metric-definitions/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/custom-metric-definitions'] })
      toast.success('Metric updated successfully')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update metric'
      toast.error(errorMessage)
    },
  })
}

// Delete custom metric definition mutation
export function useDeleteCustomMetricDefinition() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/custom-metric-definitions/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/custom-metric-definitions'] })
      toast.success('Metric deleted successfully')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete metric'
      toast.error(errorMessage)
    },
  })
}

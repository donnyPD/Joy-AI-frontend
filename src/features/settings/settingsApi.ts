import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import toast from 'react-hot-toast'

export interface NotificationMessageResponse {
  value: string
}

export interface DefaultIdealInventoryResponse {
  value: number
}

// Fetch notification message template
export function useNotificationMessage() {
  return useQuery<NotificationMessageResponse>({
    queryKey: ['/notification-templates/message'],
    queryFn: async () => {
      const response = await api.get<NotificationMessageResponse>('/notification-templates/message')
      return response.data
    },
  })
}

// Update notification message template mutation
export function useUpdateNotificationMessage() {
  const queryClient = useQueryClient()

  return useMutation<NotificationMessageResponse, Error, string>({
    mutationFn: async (value) => {
      const response = await api.put<NotificationMessageResponse>('/notification-templates/message', { value })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/notification-templates/message'] })
      toast.success('Message template saved successfully')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save message template'
      toast.error(errorMessage)
    },
  })
}

// Fetch default ideal inventory setting
export function useDefaultIdealInventory() {
  return useQuery<DefaultIdealInventoryResponse>({
    queryKey: ['/settings/inventory/default-ideal-inventory'],
    queryFn: async () => {
      const response = await api.get<DefaultIdealInventoryResponse>('/settings/inventory/default-ideal-inventory')
      return response.data
    },
  })
}

// Update default ideal inventory setting mutation
export function useUpdateDefaultIdealInventory() {
  const queryClient = useQueryClient()

  return useMutation<DefaultIdealInventoryResponse, Error, number>({
    mutationFn: async (value) => {
      const response = await api.put<DefaultIdealInventoryResponse>('/settings/inventory/default-ideal-inventory', { value })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/settings/inventory/default-ideal-inventory'] })
      toast.success('Default ideal inventory saved successfully')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save default ideal inventory'
      toast.error(errorMessage)
    },
  })
}

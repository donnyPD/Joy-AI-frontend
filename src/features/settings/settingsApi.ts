import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import toast from 'react-hot-toast'

export interface NotificationMessageResponse {
  value: string
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

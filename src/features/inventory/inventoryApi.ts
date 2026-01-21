import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import toast from 'react-hot-toast'

// Types ported from Replit shared/schema.ts
export interface Inventory {
  id: string
  name: string
  type: string
  categoryId?: string | null
  totalRequested: number
  totalInventory: number
  pricePerUnit?: string | null
  idealTotalInventory: number
  toBeOrdered: number
  threshold: number
  rowNumber?: number | null
  preferredStore?: string | null
  createdAt: string
  updatedAt: string
}

export interface InventoryCategory {
  id: string
  name: string
  isVisibleOnForm: boolean
  createdAt: string
}

export interface InventoryTechnician {
  id: string
  techName: string
  latestPurchaseDate?: string | null
  createdAt: string
  updatedAt: string
  latestPurchase?: InventoryTechnicianPurchase | null
}

export interface InventoryTechnicianPurchase {
  id: string
  technicianId: string
  purchaseDate: string
  itemsRaw: string
  itemsParsed?: any | null
  isCompleted: boolean
  createdAt: string
}

export interface InventorySnapshot {
  id: string
  month: number
  year: number
  snapshotData: any
  createdAt: string
}

export interface InventorySnapshotItem {
  name: string
  type: string
  totalRequested: number
  totalInventory: number
  pricePerUnit: string | null
  threshold: number
  rowNumber: number | null
}

export interface InventoryStore {
  id: string
  name: string
  createdAt: string
}

export interface InventoryNote {
  id: string
  noteText: string
  nyTimestamp: string
  noteType: string
  teamMemberId?: string | null
  createdAt: string
}

export interface InventoryPurchase {
  id: string
  orderId: string
  itemId?: string | null
  itemName: string
  orderedFrom: string
  amount: string
  quantity: number
  purchasedAt: string
  createdAt: string
}

export interface InventoryFormSubmission {
  id: string
  submitterName: string
  productSelections: any
  toolSelections: any
  additionalNotes?: string | null
  returningEmptyGallons?: string | null
  createdAt: string
}

export interface CreateInventoryItemData {
  name: string
  type: string
  categoryId: string
  totalRequested?: number
  totalInventory?: number
  pricePerUnit?: string
  threshold?: number
}

export interface UpdateInventoryItemData {
  name?: string
  totalRequested?: number
  totalInventory?: number
  pricePerUnit?: string
  idealTotalInventory?: number
  toBeOrdered?: number
  threshold?: number
  preferredStore?: string
}

// Inventory hooks
export function useInventory(type?: string, categoryId?: string) {
  return useQuery<Inventory[]>({
    queryKey: ['/inventory', type, categoryId],
    queryFn: async () => {
      const params: any = {}
      if (type) params.type = type
      if (categoryId) params.categoryId = categoryId
      const response = await api.get<Inventory[]>('/inventory', { params })
      return response.data
    },
  })
}

export function useInventoryItem(id: string | undefined) {
  return useQuery<Inventory>({
    queryKey: ['/inventory', id],
    queryFn: async () => {
      const response = await api.get<Inventory>(`/inventory/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient()

  return useMutation<Inventory, Error, CreateInventoryItemData>({
    mutationFn: async (data) => {
      const response = await api.post<Inventory>('/inventory', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/inventory'] })
      toast.success('Inventory item created successfully')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create inventory item'
      toast.error(errorMessage)
    },
  })
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient()

  return useMutation<Inventory, Error, { id: string; data: UpdateInventoryItemData }>({
    mutationFn: async ({ id, data }) => {
      const response = await api.put<Inventory>(`/inventory/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/inventory'] })
      toast.success('Inventory item updated successfully')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update inventory item'
      toast.error(errorMessage)
    },
  })
}

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/inventory/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/inventory'] })
      toast.success('Inventory item deleted successfully')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete inventory item'
      toast.error(errorMessage)
    },
  })
}

// Inventory Categories hooks
export function useInventoryCategories() {
  return useQuery<InventoryCategory[]>({
    queryKey: ['/inventory/categories'],
    queryFn: async () => {
      const response = await api.get<InventoryCategory[]>('/inventory/categories')
      return response.data
    },
  })
}

export function useCreateInventoryCategory() {
  const queryClient = useQueryClient()

  return useMutation<InventoryCategory, Error, { name: string; isVisibleOnForm?: boolean }>({
    mutationFn: async (data) => {
      const response = await api.post<InventoryCategory>('/inventory/categories', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/inventory/categories'] })
      toast.success('Category created successfully')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create category'
      toast.error(errorMessage)
    },
  })
}

export function useUpdateInventoryCategory() {
  const queryClient = useQueryClient()

  return useMutation<InventoryCategory, Error, { id: string; data: Partial<InventoryCategory> }>({
    mutationFn: async ({ id, data }) => {
      const response = await api.patch<InventoryCategory>(`/inventory/categories/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/inventory/categories'] })
      toast.success('Category updated successfully')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update category'
      toast.error(errorMessage)
    },
  })
}

export function useDeleteInventoryCategory() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/inventory/categories/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/inventory/categories'] })
      queryClient.invalidateQueries({ queryKey: ['/inventory'] })
      toast.success('Category deleted successfully')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete category'
      toast.error(errorMessage)
    },
  })
}

// Inventory Technicians hooks
export function useInventoryTechnicians() {
  return useQuery<InventoryTechnician[]>({
    queryKey: ['/inventory/technicians'],
    queryFn: async () => {
      const response = await api.get<InventoryTechnician[]>('/inventory/technicians')
      return response.data
    },
  })
}

export function useTechniciansByMonth(month?: number, year?: number, includeCompleted?: boolean) {
  return useQuery<InventoryTechnician[]>({
    queryKey: ['/inventory/technicians-by-month', month, year, includeCompleted],
    queryFn: async () => {
      const params: any = {}
      if (month) params.month = month.toString()
      if (year) params.year = year.toString()
      if (includeCompleted) params.includeCompleted = 'true'
      const response = await api.get<InventoryTechnician[]>('/inventory/technicians-by-month', { params })
      return response.data
    },
    enabled: !!month && !!year,
  })
}

export function useTechnicianPurchases(technicianId: string | undefined) {
  return useQuery<InventoryTechnicianPurchase[]>({
    queryKey: ['/inventory/technicians', technicianId, 'purchases'],
    queryFn: async () => {
      const response = await api.get<InventoryTechnicianPurchase[]>(`/inventory/technicians/${technicianId}/purchases`)
      return response.data
    },
    enabled: !!technicianId,
  })
}

export function useCompletePurchase() {
  const queryClient = useQueryClient()

  return useMutation<InventoryTechnicianPurchase, Error, string>({
    mutationFn: async (id) => {
      const response = await api.patch<InventoryTechnicianPurchase>(`/inventory/technicians/purchases/${id}/complete`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/inventory/technicians'] })
      queryClient.invalidateQueries({ queryKey: ['/inventory/technicians-by-month'] })
      toast.success('Purchase marked as completed')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to complete purchase'
      toast.error(errorMessage)
    },
  })
}

export function useUncompletePurchase() {
  const queryClient = useQueryClient()

  return useMutation<InventoryTechnicianPurchase, Error, string>({
    mutationFn: async (id) => {
      const response = await api.patch<InventoryTechnicianPurchase>(`/inventory/technicians/purchases/${id}/uncomplete`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/inventory/technicians'] })
      queryClient.invalidateQueries({ queryKey: ['/inventory/technicians-by-month'] })
      toast.success('Purchase marked as uncompleted')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to uncomplete purchase'
      toast.error(errorMessage)
    },
  })
}

export function useCompleteAllPurchases() {
  const queryClient = useQueryClient()

  return useMutation<InventoryTechnicianPurchase[], Error, { technicianId: string; month: number; year: number }>({
    mutationFn: async ({ technicianId, month, year }) => {
      const response = await api.patch<InventoryTechnicianPurchase[]>(
        `/inventory/technicians/${technicianId}/complete-all`,
        {},
        { params: { month: month.toString(), year: year.toString() } }
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/inventory/technicians'] })
      queryClient.invalidateQueries({ queryKey: ['/inventory/technicians-by-month'] })
      toast.success('All purchases marked as completed')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to complete all purchases'
      toast.error(errorMessage)
    },
  })
}

export function useAllPurchases(month?: number, year?: number) {
  return useQuery<InventoryTechnicianPurchase[]>({
    queryKey: ['/inventory/technicians/purchases/all', month, year],
    queryFn: async () => {
      const params: any = {}
      if (month) params.month = month.toString()
      if (year) params.year = year.toString()
      const response = await api.get<InventoryTechnicianPurchase[]>('/inventory/technicians/purchases/all', { params })
      return response.data
    },
  })
}

// Inventory Notes hooks (for inventory page)
export function useInventoryNotes(month?: number, year?: number) {
  return useQuery<InventoryNote[]>({
    queryKey: ['/inventory/notes', month, year],
    queryFn: async () => {
      const params: any = {}
      if (month) params.month = month.toString()
      if (year) params.year = year.toString()
      const response = await api.get<InventoryNote[]>('/inventory/notes', { params })
      return response.data
    },
    enabled: !!month && !!year,
  })
}

// Inventory Snapshots hooks
export function useInventorySnapshot(month?: number, year?: number) {
  return useQuery<InventorySnapshot | null>({
    queryKey: ['/inventory/snapshot', month, year],
    queryFn: async () => {
      const params: any = {}
      if (month) params.month = month.toString()
      if (year) params.year = year.toString()
      const response = await api.get<InventorySnapshot | null>('/inventory/snapshot', { params })
      return response.data
    },
    enabled: !!month && !!year,
  })
}

export function useSnapshotMonths() {
  return useQuery<Array<{ month: number; year: number }>>({
    queryKey: ['/inventory/snapshot-months'],
    queryFn: async () => {
      const response = await api.get<Array<{ month: number; year: number }>>('/inventory/snapshot-months')
      return response.data
    },
  })
}

export function useAutoSnapshot() {
  const queryClient = useQueryClient()

  return useMutation<{ created: boolean; snapshot: InventorySnapshot }, Error, void>({
    mutationFn: async () => {
      const response = await api.post<{ created: boolean; snapshot: InventorySnapshot }>('/inventory/auto-snapshot')
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/inventory/snapshot-months'] })
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create snapshot'
      toast.error(errorMessage)
    },
  })
}

// Inventory Stores hooks
export function useInventoryStores() {
  return useQuery<InventoryStore[]>({
    queryKey: ['/inventory/stores'],
    queryFn: async () => {
      const response = await api.get<InventoryStore[]>('/inventory/stores')
      return response.data
    },
  })
}

export function useCreateInventoryStore() {
  const queryClient = useQueryClient()

  return useMutation<InventoryStore, Error, { name: string }>({
    mutationFn: async (data) => {
      const response = await api.post<InventoryStore>('/inventory/stores', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/inventory/stores'] })
      toast.success('Store created successfully')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create store'
      toast.error(errorMessage)
    },
  })
}

export function useDeleteInventoryStore() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/inventory/stores/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/inventory/stores'] })
      toast.success('Store deleted successfully')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete store'
      toast.error(errorMessage)
    },
  })
}

// Inventory Purchases hooks (order purchases, not technician purchases)
export function useInventoryPurchases(month?: number, year?: number) {
  return useQuery<InventoryPurchase[]>({
    queryKey: ['/inventory/purchases', month, year],
    queryFn: async () => {
      if (!month || !year) return []
      const response = await api.get<InventoryPurchase[]>(`/inventory/purchases?month=${month}&year=${year}`)
      return Array.isArray(response.data) ? response.data : []
    },
    enabled: !!month && !!year,
  })
}

export interface CreateInventoryPurchaseData {
  orderId?: string
  itemId?: string | null
  itemName: string
  orderedFrom: string
  amount: string
  quantity?: number
  purchasedAt: string
}

export function useCreateInventoryPurchases() {
  const queryClient = useQueryClient()

  return useMutation<InventoryPurchase[], Error, CreateInventoryPurchaseData[]>({
    mutationFn: async (purchases) => {
      const response = await api.post<InventoryPurchase[]>('/inventory/purchases', { purchases })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/inventory/purchases'] })
      queryClient.invalidateQueries({ queryKey: ['/inventory'] })
      toast.success('Purchases created successfully')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create purchases'
      toast.error(errorMessage)
    },
  })
}

// Inventory Form Submissions hooks
export function useInventoryFormSubmissions(month?: number, year?: number) {
  return useQuery<InventoryFormSubmission[]>({
    queryKey: ['/inventory-form/submissions', month, year],
    queryFn: async () => {
      if (!month || !year) return []
      const response = await api.get<InventoryFormSubmission[]>(`/inventory-form/submissions?month=${month}&year=${year}`)
      return Array.isArray(response.data) ? response.data : []
    },
    enabled: !!month && !!year,
  })
}

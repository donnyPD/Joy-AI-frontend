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
  dynamicFields?: Record<string, string> | null
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
  dynamicFields?: Record<string, string>
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
      try {
        const response = await api.get<Inventory>(`/inventory/${id}`)
        return response.data
      } catch (error: any) {
        // Handle 404 errors gracefully
        if (error.response?.status === 404) {
          throw new Error(`Inventory item with ID ${id} not found`)
        }
        throw error
      }
    },
    enabled: !!id,
    retry: false, // Don't retry on 404 errors
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

export interface CreateInventoryNoteData {
  noteText: string
  noteType: 'general' | 'technician'
  teamMemberId?: string | null
}

export function useCreateInventoryNote() {
  const queryClient = useQueryClient()

  return useMutation<InventoryNote, Error, CreateInventoryNoteData>({
    mutationFn: async (data) => {
      const response = await api.post<InventoryNote>('/inventory/notes', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/inventory/notes'] })
      toast.success('Note created successfully')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create note'
      toast.error(errorMessage)
    },
  })
}

export function useUpdateInventoryNote() {
  const queryClient = useQueryClient()

  return useMutation<InventoryNote, Error, { id: string; noteText: string }>({
    mutationFn: async ({ id, noteText }) => {
      const response = await api.patch<InventoryNote>(`/inventory/notes/${id}`, { noteText })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/inventory/notes'] })
      toast.success('Note updated successfully')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update note'
      toast.error(errorMessage)
    },
  })
}

export function useDeleteInventoryNote() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/inventory/notes/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/inventory/notes'] })
      toast.success('Note deleted successfully')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete note'
      toast.error(errorMessage)
    },
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

  return useMutation<InventoryPurchase[], Error, { purchases: CreateInventoryPurchaseData[]; technicianName?: string }>({
    mutationFn: async ({ purchases, technicianName }) => {
      const response = await api.post<InventoryPurchase[]>('/inventory/purchases', { purchases, technicianName })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/inventory/purchases'] })
      queryClient.invalidateQueries({ queryKey: ['/inventory'] })
      queryClient.invalidateQueries({ queryKey: ['/team-members'] })
      toast.success('Purchases created successfully')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create purchases'
      toast.error(errorMessage)
    },
  })
}

export function useUpdateInventoryPurchase() {
  const queryClient = useQueryClient()

  return useMutation<InventoryPurchase, Error, { id: string; data: Partial<CreateInventoryPurchaseData> }>({
    mutationFn: async ({ id, data }) => {
      const response = await api.patch<InventoryPurchase>(`/inventory/purchases/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/inventory/purchases'] })
      queryClient.invalidateQueries({ queryKey: ['/inventory'] })
      toast.success('Purchase updated successfully')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update purchase'
      toast.error(errorMessage)
    },
  })
}

export function useDeleteInventoryPurchase() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/inventory/purchases/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/inventory/purchases'] })
      queryClient.invalidateQueries({ queryKey: ['/inventory'] })
      toast.success('Purchase deleted successfully')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete purchase'
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

export function useUpdateInventoryFormSubmission() {
  const queryClient = useQueryClient()
  return useMutation<InventoryFormSubmission, Error, { id: string; data: Partial<InventoryFormSubmission> }>({
    mutationFn: async ({ id, data }) => {
      const response = await api.patch<InventoryFormSubmission>(`/inventory-form/submissions/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/inventory-form/submissions'] })
      toast.success('Submission updated successfully')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update submission'
      toast.error(errorMessage)
    },
  })
}

export function useDeleteInventoryFormSubmission() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/inventory-form/submissions/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/inventory-form/submissions'] })
      toast.success('Submission deleted successfully')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete submission'
      toast.error(errorMessage)
    },
  })
}

// Available snapshot months
export function useInventorySnapshotMonths() {
  return useQuery<Array<{ month: number; year: number }>>({
    queryKey: ['/inventory/snapshot-months'],
    queryFn: async () => {
      const response = await api.get<Array<{ month: number; year: number }>>('/inventory/snapshot-months')
      return response.data
    },
  })
}

// Inventory technicians for history dialog
export function useInventoryTechnicianPurchases(technicianId: string | null) {
  return useQuery({
    queryKey: ['/inventory/technicians', technicianId, 'purchases'],
    queryFn: async () => {
      if (!technicianId) return []
      const response = await api.get(`/inventory/technicians/${technicianId}/purchases`)
      return response.data
    },
    enabled: !!technicianId,
  })
}

// Inventory Column Definitions hooks
export interface InventoryColumnDefinition {
  id: string
  userId: string
  columnKey: string
  columnLabel: string
  displayOrder: number
  isVisible: boolean
  createdAt: string
  updatedAt: string
}

export function useInventoryColumnDefinitions() {
  return useQuery<InventoryColumnDefinition[]>({
    queryKey: ['/inventory-column-definitions'],
    queryFn: async () => {
      const response = await api.get<InventoryColumnDefinition[]>('/inventory-column-definitions')
      return response.data
    },
  })
}

export interface CreateInventoryColumnDefinitionData {
  columnKey?: string
  columnLabel: string
  displayOrder?: number
  isVisible?: boolean
}

export function useCreateInventoryColumnDefinition() {
  const queryClient = useQueryClient()

  return useMutation<InventoryColumnDefinition, Error, CreateInventoryColumnDefinitionData>({
    mutationFn: async (data) => {
      const response = await api.post<InventoryColumnDefinition>('/inventory-column-definitions', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/inventory-column-definitions'] })
      toast.success('Column created successfully')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create column'
      toast.error(errorMessage)
    },
  })
}

export interface UpdateInventoryColumnDefinitionData {
  columnLabel?: string
  displayOrder?: number
  isVisible?: boolean
}

export function useUpdateInventoryColumnDefinition() {
  const queryClient = useQueryClient()

  return useMutation<InventoryColumnDefinition, Error, { id: string; data: UpdateInventoryColumnDefinitionData }>({
    mutationFn: async ({ id, data }) => {
      const response = await api.patch<InventoryColumnDefinition>(`/inventory-column-definitions/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/inventory-column-definitions'] })
      toast.success('Column updated successfully')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update column'
      toast.error(errorMessage)
    },
  })
}

export function useDeleteInventoryColumnDefinition() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/inventory-column-definitions/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/inventory-column-definitions'] })
      toast.success('Column deleted successfully')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete column'
      toast.error(errorMessage)
    },
  })
}

export function useReorderInventoryColumnDefinitions() {
  const queryClient = useQueryClient()

  return useMutation<{ success: boolean; updated: number }, Error, Array<{ id: string; displayOrder: number }>>({
    mutationFn: async (updates) => {
      const response = await api.patch<{ success: boolean; updated: number }>('/inventory-column-definitions/reorder', { updates })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/inventory-column-definitions'] })
      toast.success('Columns reordered successfully')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to reorder columns'
      toast.error(errorMessage)
    },
  })
}

// Inventory Form Config hooks
export interface InventoryFormConfig {
  id: string
  fieldName: string
  fieldType: string
  categoryName: string
  isVisible: boolean
  isRequired: boolean
  dropdownMin: number
  dropdownMax: number
  dropdownMaxW2: number
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export interface InventoryFormConfigData {
  formConfig: InventoryFormConfig[]
  categories: InventoryCategory[]
  inventory: Inventory[]
}

export function useInventoryFormConfig() {
  return useQuery<InventoryFormConfigData>({
    queryKey: ['/inventory-form/config'],
    queryFn: async () => {
      const response = await api.get<InventoryFormConfigData>('/inventory-form/config')
      return response.data
    },
  })
}

export function useBulkUpdateInventoryFormConfig() {
  const queryClient = useQueryClient()

  return useMutation<{ success: boolean; updated: number }, Error, InventoryFormConfig[]>({
    mutationFn: async (configs) => {
      const response = await api.patch<{ success: boolean; updated: number }>('/inventory-form/config/bulk', { configs })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/inventory-form/config'] })
      toast.success('Form configuration saved successfully')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save configuration'
      toast.error(errorMessage)
    },
  })
}

// Public Inventory Form types and hooks
export interface PublicInventoryFormData {
  categories: string[]
  inventoryByCategory: Record<string, Inventory[]>
  formConfig: Record<string, {
    fieldName: string
    categoryName: string
    isVisible: boolean
    isRequired: boolean
    dropdownMin: number
    dropdownMax: number
    dropdownMaxW2: number
    displayOrder: number
  }>
  teamMembers: Array<{
    id: string
    name: string
    type: 'W2' | '1099'
  }>
}

export interface PublicInventoryFormSubmitData {
  submitterName: string
  productSelections: Record<string, number>
  toolSelections: Record<string, number>
  additionalNotes: string
  returningEmptyGallons: string
}

export function usePublicInventoryFormConfig() {
  return useQuery<PublicInventoryFormData>({
    queryKey: ['/public/inventory-form/config'],
    queryFn: async () => {
      const response = await api.get<PublicInventoryFormData>('/public/inventory-form/config')
      return response.data
    },
  })
}

export function useSubmitPublicInventoryForm() {
  return useMutation<any, Error, PublicInventoryFormSubmitData>({
    mutationFn: async (data) => {
      const response = await api.post('/public/inventory-form/submit', data)
      return response.data
    },
    onSuccess: () => {
      toast.success('Form submitted successfully!')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit form'
      toast.error(errorMessage)
    },
  })
}

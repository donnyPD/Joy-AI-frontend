/**
 * Shared types for inventory-related features
 */

export interface CreateInventoryNoteData {
  noteText: string
  nyTimestamp: string
  noteType: string
  teamMemberId?: string | null
}

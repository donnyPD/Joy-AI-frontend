import { useState, useEffect } from 'react'
import { useCreateInventoryNote, useUpdateInventoryNote } from '../features/inventory-notes/inventoryNotesApi'
import type { CreateInventoryNoteData, InventoryNote } from '../features/inventory-notes/inventoryNotesApi'

interface NoteEntryDialogProps {
  open: boolean
  onClose: () => void
  teamMemberId: string
  teamMemberName?: string
  note?: InventoryNote | null
}

export default function NoteEntryDialog({
  open,
  onClose,
  teamMemberId,
  teamMemberName,
  note,
}: NoteEntryDialogProps) {
  const createMutation = useCreateInventoryNote()
  const updateMutation = useUpdateInventoryNote()
  const [noteText, setNoteText] = useState('')
  const [error, setError] = useState('')
  const isEditMode = !!note

  useEffect(() => {
    if (open) {
      if (note) {
        setNoteText(note.noteText)
      } else {
        setNoteText('')
      }
      setError('')
    }
  }, [open, note])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!noteText.trim()) {
      setError('Note text is required')
      return
    }

    if (isEditMode && note) {
      // Update existing note
      updateMutation.mutate(
        {
          id: note.id,
          data: {
            noteText: noteText.trim(),
          },
          teamMemberId,
        },
        {
          onSuccess: () => {
            onClose()
          },
        }
      )
    } else {
      // Create new note
      // Generate nyTimestamp (NY timezone timestamp)
      const now = new Date()
      const nyTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
      const nyTimestamp = nyTime.toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })

      const submitData: CreateInventoryNoteData = {
        noteText: noteText.trim(),
        nyTimestamp,
        noteType: 'technician',
        teamMemberId,
      }

      createMutation.mutate(submitData, {
        onSuccess: () => {
          onClose()
        },
      })
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h2 className="text-xl font-semibold mb-2">{isEditMode ? 'Edit Note' : 'Add Note'}</h2>
        <p className="text-sm text-gray-600 mb-4">
          {isEditMode ? 'Edit the note' : `Add a new note for ${teamMemberName || 'this team member'}`}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note <span className="text-red-500">*</span>
            </label>
            <textarea
              value={noteText}
              onChange={(e) => {
                setNoteText(e.target.value)
                setError('')
              }}
              rows={5}
              placeholder="Enter your note here..."
              className={`w-full px-3 py-2 border rounded-md ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isEditMode
                ? updateMutation.isPending
                  ? 'Updating...'
                  : 'Update Note'
                : createMutation.isPending
                ? 'Adding...'
                : 'Add Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

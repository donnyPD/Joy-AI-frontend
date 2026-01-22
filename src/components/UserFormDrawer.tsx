import { useState, useEffect, useRef } from 'react'
import { useTeamMember, useCreateTeamMember, useUpdateTeamMember } from '../features/team-members/teamMembersApi'
import type { CreateTeamMemberData } from '../features/team-members/teamMembersApi'
import { useTeamMemberTypes, useTeamMemberStatuses } from '../features/team-member-options/teamMemberOptionsApi'

const PINK_COLOR = '#E91E63'

interface UserFormDrawerProps {
  open: boolean
  onClose: () => void
  mode: 'add' | 'edit'
  memberId?: string
}

export default function UserFormDrawer({ open, onClose, mode, memberId }: UserFormDrawerProps) {
  const { data: member } = useTeamMember(mode === 'edit' ? memberId : undefined)
  const createMutation = useCreateTeamMember()
  const updateMutation = useUpdateTeamMember()
  const { data: types = [], isLoading: typesLoading } = useTeamMemberTypes()
  const { data: statuses = [], isLoading: statusesLoading } = useTeamMemberStatuses()

  // Calculate default values at component level (before useState)
  const defaultType = types.find((t) => t.isActive && t.name === 'W2')?.name || (types.find((t) => t.isActive)?.name || 'W2')
  const defaultStatus = statuses.find((s) => s.isActive && s.name === 'Active')?.name || (statuses.find((s) => s.isActive)?.name || 'Active')

  const [formData, setFormData] = useState<CreateTeamMemberData>({
    photo: '',
    name: '',
    slackId: '',
    type: defaultType,
    status: defaultStatus,
    employmentType: 'Full Time',
    email: '',
    phone: '',
    address: '',
    birthday: '',
    primaryLanguage: '',
    trainingStartDate: '',
    trainingEndDate: '',
    workStartDate: '',
    lastMinuteCallOffs: 0,
    arrivingLate: 0,
    excusedTimeOffs: 0,
    complaints: 0,
    npsMonthly: 0,
    npsAverage: 0,
    googleReviewsObtained: 0,
    starOfMonth: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [typeIsOther, setTypeIsOther] = useState(false)
  const [statusIsOther, setStatusIsOther] = useState(false)
  const [customType, setCustomType] = useState('')
  const [customStatus, setCustomStatus] = useState('')
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (!open) {
      hasInitialized.current = false
      return
    }

    if (member && mode === 'edit') {
      // Check if type is a custom value (not in active types)
      const activeTypeNames = types.filter((t) => t.isActive).map((t) => t.name)
      const isTypeCustom = !activeTypeNames.includes(member.type)
      // Check if status is a custom value (not in active statuses)
      const activeStatusNames = statuses.filter((s) => s.isActive).map((s) => s.name)
      const isStatusCustom = !activeStatusNames.includes(member.status)
      
      setTypeIsOther(isTypeCustom)
      setStatusIsOther(isStatusCustom)
      setCustomType(isTypeCustom ? member.type : '')
      setCustomStatus(isStatusCustom ? member.status : '')
      
      setFormData({
        photo: member.photo || '',
        name: member.name,
        slackId: member.slackId || '',
        type: isTypeCustom ? 'Other' : member.type,
        status: isStatusCustom ? 'Other' : member.status,
        employmentType: member.employmentType as 'Full Time' | 'Part Time',
        email: member.email,
        phone: member.phone,
        address: member.address,
        birthday: member.birthday,
        primaryLanguage: member.primaryLanguage,
        trainingStartDate: member.trainingStartDate || '',
        trainingEndDate: member.trainingEndDate || '',
        workStartDate: member.workStartDate || '',
        lastMinuteCallOffs: member.lastMinuteCallOffs,
        arrivingLate: member.arrivingLate,
        excusedTimeOffs: member.excusedTimeOffs,
        complaints: member.complaints,
        npsMonthly: member.npsMonthly,
        npsAverage: member.npsAverage,
        googleReviewsObtained: member.googleReviewsObtained,
        starOfMonth: member.starOfMonth,
      })
      if (member.photo) {
        setPhotoPreview(member.photo)
      }
      hasInitialized.current = true
    } else if (mode === 'add') {
      if (hasInitialized.current) {
        return
      }
      // Set default values from API if available
      const defaultType = types.find((t) => t.isActive && t.name === 'W2')?.name || (types.find((t) => t.isActive)?.name || 'W2')
      const defaultStatus = statuses.find((s) => s.isActive && s.name === 'Active')?.name || (statuses.find((s) => s.isActive)?.name || 'Active')
      setTypeIsOther(false)
      setStatusIsOther(false)
      setCustomType('')
      setCustomStatus('')
      setFormData({
        photo: '',
        name: '',
        slackId: '',
        type: defaultType,
        status: defaultStatus,
        employmentType: 'Full Time',
        email: '',
        phone: '',
        address: '',
        birthday: '',
        primaryLanguage: '',
        trainingStartDate: '',
        trainingEndDate: '',
        workStartDate: '',
        lastMinuteCallOffs: 0,
        arrivingLate: 0,
        excusedTimeOffs: 0,
        complaints: 0,
        npsMonthly: 0,
        npsAverage: 0,
        googleReviewsObtained: 0,
        starOfMonth: false,
      })
      setPhotoPreview(null)
      hasInitialized.current = true
    }
    setErrors({})
  }, [member, mode, open, types, statuses])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else {
      const nameParts = formData.name.trim().split(/\s+/).filter((part) => part.length > 0)
      if (nameParts.length < 2) {
        newErrors.name = 'First name and last name required'
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required'
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
    }

    if (!formData.birthday) {
      newErrors.birthday = 'Birthday is required'
    }

    if (!formData.primaryLanguage.trim()) {
      newErrors.primaryLanguage = 'Primary Language is required'
    }

    if (typeIsOther && !formData.type.trim()) {
      newErrors.type = 'Custom type is required'
    }

    if (statusIsOther && !formData.status.trim()) {
      newErrors.status = 'Custom status is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      if (mode === 'add') {
        await createMutation.mutateAsync(formData)
      } else if (memberId) {
        await updateMutation.mutateAsync({ id: memberId, data: formData })
      }
      onClose()
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setPhotoPreview(result)
        setFormData({ ...formData, photo: result })
      }
      reader.readAsDataURL(file)
    }
    e.target.value = ''
  }

  const handleChange = (field: keyof CreateTeamMemberData, value: any) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900">
                  {mode === 'add' ? 'Add User' : 'Edit User'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {mode === 'add' ? 'Add a new team member' : 'Edit team member'} to your organization
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 ml-4"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Tech Information</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
                  <div className="flex items-center gap-4">
                    {photoPreview && (
                      <div className="relative w-24 h-24">
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-full h-full object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoPreview(null)
                            handleChange('photo', '')
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="photo-upload"
                      />
                      <label
                        htmlFor="photo-upload"
                        className="cursor-pointer px-4 py-2 text-white rounded-lg transition-colors inline-flex items-center"
                        style={{ backgroundColor: PINK_COLOR }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#C2185B')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = PINK_COLOR)}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Upload Photo
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Slack ID</label>
                  <input
                    type="text"
                    value={formData.slackId}
                    onChange={(e) => handleChange('slackId', e.target.value)}
                    placeholder="e.g. @johndoe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                    {typesLoading ? (
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm">
                        Loading types...
                      </div>
                    ) : (
                      <select
                        value={typeIsOther ? 'Other' : formData.type}
                        onChange={(e) => {
                          if (e.target.value === 'Other') {
                            setTypeIsOther(true)
                            setCustomType('')
                            handleChange('type', '')
                          } else {
                            setTypeIsOther(false)
                            setCustomType('')
                            handleChange('type', e.target.value)
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.type ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        {types
                          .filter((t) => t.isActive)
                          .map((type) => (
                            <option key={type.id} value={type.name}>
                              {type.name}
                            </option>
                          ))}
                        <option value="Other">Other</option>
                      </select>
                    )}
                    {typeIsOther && (
                      <input
                        type="text"
                        value={customType}
                        onChange={(e) => {
                          setCustomType(e.target.value)
                          handleChange('type', e.target.value)
                          if (errors.type) {
                            setErrors({ ...errors, type: '' })
                          }
                        }}
                        placeholder="Enter custom type"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 mt-2 ${
                          errors.type ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    )}
                    {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                    {statusesLoading ? (
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm">
                        Loading statuses...
                      </div>
                    ) : (
                      <select
                        value={statusIsOther ? 'Other' : formData.status}
                        onChange={(e) => {
                          if (e.target.value === 'Other') {
                            setStatusIsOther(true)
                            setCustomStatus('')
                            handleChange('status', '')
                          } else {
                            setStatusIsOther(false)
                            setCustomStatus('')
                            handleChange('status', e.target.value)
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.status ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        {statuses
                          .filter((s) => s.isActive)
                          .map((status) => (
                            <option key={status.id} value={status.name}>
                              {status.name}
                            </option>
                          ))}
                        <option value="Other">Other</option>
                      </select>
                    )}
                    {statusIsOther && (
                      <input
                        type="text"
                        value={customStatus}
                        onChange={(e) => {
                          setCustomStatus(e.target.value)
                          handleChange('status', e.target.value)
                          if (errors.status) {
                            setErrors({ ...errors, status: '' })
                          }
                        }}
                        placeholder="Enter custom status"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 mt-2 ${
                          errors.status ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    )}
                    {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employment Type *</label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="Full Time"
                        checked={formData.employmentType === 'Full Time'}
                        onChange={(e) => handleChange('employmentType', e.target.value)}
                        className="mr-2"
                      />
                      Full Time
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="Part Time"
                        checked={formData.employmentType === 'Part Time'}
                        onChange={(e) => handleChange('employmentType', e.target.value)}
                        className="mr-2"
                      />
                      Part Time
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Birthday *</label>
                  <input
                    type="date"
                    value={formData.birthday}
                    onChange={(e) => handleChange('birthday', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.birthday ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.birthday && <p className="mt-1 text-sm text-red-600">{errors.birthday}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Language *</label>
                  <input
                    type="text"
                    value={formData.primaryLanguage}
                    onChange={(e) => handleChange('primaryLanguage', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.primaryLanguage ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.primaryLanguage && <p className="mt-1 text-sm text-red-600">{errors.primaryLanguage}</p>}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Training Start Date</label>
                    <input
                      type="date"
                      value={formData.trainingStartDate}
                      onChange={(e) => handleChange('trainingStartDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Training End Date</label>
                    <input
                      type="date"
                      value={formData.trainingEndDate}
                      onChange={(e) => handleChange('trainingEndDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Work Start Date</label>
                    <input
                      type="date"
                      value={formData.workStartDate}
                      onChange={(e) => handleChange('workStartDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Star of the Month</h3>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.starOfMonth}
                      onChange={(e) => handleChange('starOfMonth', e.target.checked)}
                      className="mr-2 w-4 h-4"
                    />
                    Award Star of the Month
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50"
                  style={{ backgroundColor: PINK_COLOR }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = '#C2185B'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = PINK_COLOR
                    }
                  }}
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

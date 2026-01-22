import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../store/hooks'
import { logout } from '../features/auth/authSlice'
import { useTeamMembers, useDeleteTeamMember } from '../features/team-members/teamMembersApi'
import UserFormDrawer from '../components/UserFormDrawer'

const PINK_COLOR = '#E91E63'

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const avatarColors = [
  'bg-teal-600',
  'bg-rose-500',
  'bg-slate-600',
  'bg-emerald-600',
  'bg-blue-600',
  'bg-purple-600',
  'bg-cyan-600',
  'bg-amber-600',
  'bg-indigo-600',
  'bg-pink-600',
]

function getAvatarColor(index: number): string {
  return avatarColors[index % avatarColors.length]
}

function formatDate(dateString: string): string {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateString
  }
}

export default function ManageTeam() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingMemberId, setEditingMemberId] = useState<string | undefined>(undefined)
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null)

  const { data: members, isLoading } = useTeamMembers()
  const deleteMutation = useDeleteTeamMember()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      // Check if click is outside any dropdown menu
      const dropdownMenus = document.querySelectorAll('[data-dropdown-menu]')
      let clickedInsideDropdown = false
      dropdownMenus.forEach((menu) => {
        if (menu.contains(target)) {
          clickedInsideDropdown = true
        }
      })
      if (!clickedInsideDropdown) {
        setDropdownOpen(null)
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen])

  const handleSignOut = () => {
    dispatch(logout())
    navigate('/signin')
  }

  const handleAddUser = () => {
    setEditingMemberId(undefined)
    setDrawerOpen(true)
  }

  const handleEditUser = (id: string) => {
    setEditingMemberId(id)
    setDrawerOpen(true)
    setDropdownOpen(null)
  }

  const handleDeleteUser = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      deleteMutation.mutate(id)
    }
    setDropdownOpen(null)
  }

  const handleCloseDrawer = () => {
    setDrawerOpen(false)
    setEditingMemberId(undefined)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link to="/dashboard" className="text-xl font-bold text-gray-900">
                JOY AI
              </Link>
              <Link to="/clients" className="text-gray-700 hover:text-gray-900 font-medium">
                Clients
              </Link>
              <Link to="/quotes" className="text-gray-700 hover:text-gray-900 font-medium">
                Quotes
              </Link>
              <Link to="/jobs" className="text-gray-700 hover:text-gray-900 font-medium">
                Jobs
              </Link>
              <Link to="/operations" className="text-gray-700 hover:text-gray-900 font-medium">
                Operations
              </Link>
              <Link to="/services" className="text-gray-700 hover:text-gray-900 font-medium">
                Services
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/settings"
                className="p-2 text-gray-800 hover:text-gray-900 transition-colors"
                title="Settings"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </Link>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-joy-pink border border-gray-300 rounded-lg hover:border-joy-pink transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex lg:items-center items-start justify-between lg:flex-row flex-col gap-4">
            <div className="">
              <h1 className="text-3xl font-bold text-gray-900">Manage team</h1>
              <p className="text-gray-600 mt-2">
                Add or manage team members that need to log into Jobber in the office or in the field. Dispatch them to jobs and give them access to Jobber features.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 lg:w-[40%]">
              <Link
                to="/operations"
                className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="text-gray-900">Back to Operations</span>
              </Link>
              <button
                onClick={handleAddUser}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2"
                style={{ backgroundColor: PINK_COLOR }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#C2185B')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = PINK_COLOR)}
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-white">Add User</span>
              </button>
              <Link
                to="/settings"
                className="w-9 h-9 flex items-center justify-center text-gray-800 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Settings"
              >
                <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="h-40 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : members && members.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {members.map((member, index) => (
              <div
                key={member.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer relative"
                onClick={() => navigate(`/operations/users/${member.id}`)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4 gap-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {member.photo ? (
                        <img
                          src={member.photo}
                          alt={member.name}
                          className="h-12 w-12 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div
                          className={`h-12 w-12 rounded-full flex-shrink-0 ${getAvatarColor(
                            index,
                          )} flex items-center justify-center text-white font-semibold text-lg`}
                        >
                          {getInitials(member.name)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 truncate flex items-center gap-2">
                          {member.name}
                          {member.starOfMonth && (
                            <svg 
                              className="w-5 h-5 text-yellow-500 fill-current flex-shrink-0" 
                              fill="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <title>Star of the Month</title>
                              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          )}
                          {member.slackId && (
                            <span className="text-gray-500 font-normal text-sm ml-1">
                              ({member.slackId})
                            </span>
                          )}
                        </h3>
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <svg className="h-3.5 w-3.5 flex-shrink-0 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <p className="truncate">{member.phone || 'No phone'}</p>
                        </div>
                      </div>
                    </div>
                    <div
                      onClick={(e) => {
                        e.stopPropagation()
                        setDropdownOpen(dropdownOpen === member.id ? null : member.id)
                      }}
                      className="flex-shrink-0 ml-2 relative"
                    >
                      <button className="h-8 w-8 p-0 flex items-center justify-center text-gray-800 hover:text-gray-900 rounded hover:bg-gray-100">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                      {dropdownOpen === member.id && (
                        <div 
                          data-dropdown-menu
                          className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200"
                          style={{ zIndex: 1000 + index }}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/operations/users/${member.id}`)
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 flex items-center"
                          >
                            <svg className="h-4 w-4 mr-2 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Details
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditUser(member.id)
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 flex items-center"
                          >
                            <svg className="h-4 w-4 mr-2 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteUser(member.id, member.name)
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                          >
                            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="h-4 w-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-gray-900">{member.primaryLanguage}</span>
                      </div>
                      {member.birthday && (
                        <div className="flex items-center gap-2 text-sm">
                          <svg className="h-4 w-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-gray-900">{formatDate(member.birthday)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-2 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="h-4 w-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="text-gray-900">
                          {member.type} • {member.employmentType}
                        </span>
                      </div>

                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          member.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : member.status === 'On Leave'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {member.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="text-center text-gray-500">
              No team members found. Click "Add User" to add your first team member.
            </div>
          </div>
        )}
      </div>

      <UserFormDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        mode={editingMemberId ? 'edit' : 'add'}
        memberId={editingMemberId}
      />
    </div>
  )
}

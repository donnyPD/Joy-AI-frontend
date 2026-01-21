import Navbar from '../components/Navbar'

export default function Settings() {
  return (
    <div className="min-h-screen bg-[#F7F7F9]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[260px,1fr] gap-8">
          <aside className="bg-white border border-[#EFEFEF] rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-2 text-lg font-semibold text-[#1F1F1F]">
              <svg className="w-5 h-5 text-[#6B6B6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </div>

            <div className="mt-6">
              <button className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#F2F7FF] text-sm font-semibold text-[#1F1F1F]">
                Option Management
                <svg className="w-4 h-4 text-[#6B6B6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div className="mt-2 space-y-2">
                <button className="w-full text-left px-4 py-2 rounded-xl text-sm text-[#1F1F1F] hover:bg-[#F7F7F7]">
                  Team Member Types
                </button>
                <button className="w-full text-left px-4 py-2 rounded-xl text-sm font-semibold text-[#2563EB] bg-[#E6F0FF]">
                  Status Types
                </button>
              </div>
            </div>
          </aside>

          <section className="bg-white border border-[#EFEFEF] rounded-2xl shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-[#1F1F1F]">Team Member Status Types</h1>
                <p className="text-sm text-[#8B8B8B] mt-1">Manage team member status options</p>
              </div>
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#2563EB]">
                <span className="text-lg leading-none">+</span>
                Add Status
              </button>
            </div>

            <div className="mt-6 border border-[#E9E9E9] rounded-xl overflow-hidden">
              <div className="grid grid-cols-[1.2fr,1fr,1fr,120px] gap-4 px-5 py-3 bg-[#F9FAFB] text-xs font-semibold text-[#6B6B6B]">
                <div>NAME</div>
                <div>STATUS</div>
                <div>CREATED</div>
                <div className="text-right">ACTIONS</div>
              </div>
              <div className="grid grid-cols-[1.2fr,1fr,1fr,120px] gap-4 px-5 py-4 items-center">
                <div className="text-sm font-semibold text-[#1F1F1F]">Active</div>
                <div>
                  <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-[#DCFCE7] text-[#166534]">
                    Active
                  </span>
                </div>
                <div className="text-sm text-[#6B6B6B]">21/01/2026</div>
                <div className="flex items-center justify-end gap-3">
                  <button className="text-[#2563EB]">✎</button>
                  <button className="text-[#DC2626]">🗑</button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

import { useState } from 'react';
import { UserCheck, Users, ClipboardList, Church } from 'lucide-react';
import CheckIn from './components/CheckIn';
import ChildrenList from './components/ChildrenList';
import AttendanceHistory from './components/AttendanceHistory';
import RegisterChild from './components/RegisterChild';
import type { Child } from './lib/supabase';

type Tab = 'checkin' | 'children' | 'history';

export default function App() {
  const [tab, setTab] = useState<Tab>('checkin');
  const [showRegister, setShowRegister] = useState(false);
  const [editChild, setEditChild] = useState<Child | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'checkin', label: 'Asistencia', icon: <UserCheck size={18} /> },
    { id: 'children', label: 'Ninos', icon: <Users size={18} /> },
    { id: 'history', label: 'Historial', icon: <ClipboardList size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Church size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 leading-tight text-base">Ministerio de Ninos</h1>
            <p className="text-xs text-gray-400 leading-tight">Control de asistencia</p>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="max-w-2xl mx-auto px-4">
          <nav className="flex">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors flex-1 justify-center ${
                  tab === t.id
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.icon}
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {tab === 'checkin' && (
          <CheckIn onCheckedIn={() => setRefreshKey(k => k + 1)} />
        )}
        {tab === 'children' && (
          <ChildrenList
            onRegister={() => { setEditChild(null); setShowRegister(true); }}
            onEdit={child => { setEditChild(child); setShowRegister(true); }}
            refreshKey={refreshKey}
          />
        )}
        {tab === 'history' && <AttendanceHistory />}
      </main>

      {showRegister && (
        <RegisterChild
          editChild={editChild}
          onClose={() => { setShowRegister(false); setEditChild(null); }}
          onSaved={() => {
            setShowRegister(false);
            setEditChild(null);
            setRefreshKey(k => k + 1);
          }}
        />
      )}
    </div>
  );
}

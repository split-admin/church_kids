import { useState, useEffect, useCallback } from 'react';
import { supabase, type Child, type Attendance } from '../lib/supabase';
import { Search, CheckCircle2, Loader2, UserCheck, Baby } from 'lucide-react';

type Props = {
  onCheckedIn?: () => void;
};

function getAge(birthdate: string | null): string {
  if (!birthdate) return '';
  const diff = Date.now() - new Date(birthdate).getTime();
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  return `${years} anos`;
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function TodayList({ ids }: { ids: string[] }) {
  const [children, setChildren] = useState<Child[]>([]);

  useEffect(() => {
    if (ids.length === 0) { setChildren([]); return; }
    supabase
      .from('children')
      .select('*')
      .in('id', ids)
      .order('full_name')
      .then(({ data }) => setChildren((data as Child[]) ?? []));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(',')]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {children.map(c => (
        <div key={c.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            {c.photo_url ? (
              <img src={c.photo_url} alt={c.full_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Baby size={14} className="text-gray-300" />
              </div>
            )}
          </div>
          <span className="text-xs font-medium text-gray-700 truncate">{c.full_name}</span>
        </div>
      ))}
    </div>
  );
}

export default function CheckIn({ onCheckedIn }: Props) {
  const [query, setQuery] = useState('');
  const [children, setChildren] = useState<Child[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState<string | null>(null);
  const [justChecked, setJustChecked] = useState<string | null>(null);

  const loadTodayAttendance = useCallback(async () => {
    const { data } = await supabase
      .from('attendance')
      .select('*')
      .eq('event_date', todayStr());
    setTodayAttendance((data as Attendance[]) ?? []);
  }, []);

  useEffect(() => {
    loadTodayAttendance();
  }, [loadTodayAttendance]);

  useEffect(() => {
    if (!query.trim()) {
      setChildren([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setLoading(true);
      const { data } = await supabase
        .from('children')
        .select('*')
        .ilike('full_name', `%${query}%`)
        .order('full_name')
        .limit(20);
      setChildren((data as Child[]) ?? []);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const checkedInIds = new Set(todayAttendance.map(a => a.child_id));

  const handleCheckIn = async (child: Child) => {
    if (checkedInIds.has(child.id)) return;
    setCheckingIn(child.id);
    try {
      await supabase.from('attendance').insert({
        child_id: child.id,
        event_date: todayStr(),
        checked_in_at: new Date().toISOString(),
      });
      setJustChecked(child.id);
      setTimeout(() => setJustChecked(null), 3000);
      await loadTodayAttendance();
      onCheckedIn?.();
    } catch (err) {
      console.error(err);
      alert('Error al registrar asistencia.');
    } finally {
      setCheckingIn(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
            <UserCheck size={18} className="text-emerald-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">Registrar Asistencia</h2>
            <p className="text-xs text-gray-500">Busca al nino por nombre y registra su ingreso</p>
          </div>
        </div>

        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por nombre del nino..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
            autoFocus
          />
          {loading && (
            <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
          )}
        </div>

        {query.trim() && children.length === 0 && !loading && (
          <p className="text-sm text-gray-500 text-center mt-4 py-4">
            No se encontraron ninos con ese nombre.
          </p>
        )}

        {children.length > 0 && (
          <div className="mt-4 space-y-2">
            {children.map(child => {
              const alreadyIn = checkedInIds.has(child.id);
              const isCheckingIn = checkingIn === child.id;
              return (
                <div
                  key={child.id}
                  className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${
                    alreadyIn
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-white border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                    {child.photo_url ? (
                      <img src={child.photo_url} alt={child.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Baby size={20} className="text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">{child.full_name}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {getAge(child.birthdate)}{child.birthdate && child.parent1_name ? ' · ' : ''}{child.parent1_name}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCheckIn(child)}
                    disabled={alreadyIn || isCheckingIn}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      alreadyIn
                        ? 'bg-emerald-100 text-emerald-700 cursor-default'
                        : isCheckingIn
                        ? 'bg-gray-100 text-gray-400 cursor-wait'
                        : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm'
                    }`}
                  >
                    {isCheckingIn ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={14} />
                    )}
                    {alreadyIn ? 'Ya ingreso' : isCheckingIn ? 'Registrando...' : 'Registrar'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {justChecked && (
          <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium">
            <CheckCircle2 size={18} />
            Asistencia registrada exitosamente
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Asistencia de hoy</h3>
          <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2.5 py-1 rounded-full">
            {todayAttendance.length} nino{todayAttendance.length !== 1 ? 's' : ''}
          </span>
        </div>
        {todayAttendance.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Aun no hay registros hoy</p>
        ) : (
          <TodayList ids={Array.from(checkedInIds)} />
        )}
      </div>
    </div>
  );
}

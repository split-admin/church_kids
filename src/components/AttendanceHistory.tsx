import { useState, useEffect } from 'react';
import { supabase, type Attendance, type Child } from '../lib/supabase';
import { Calendar, ChevronLeft, ChevronRight, Baby, Loader2, ClipboardList } from 'lucide-react';

type AttendanceWithChild = Attendance & { child: Child };

function formatDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('es', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
}

export default function AttendanceHistory() {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [records, setRecords] = useState<AttendanceWithChild[]>([]);
  const [loading, setLoading] = useState(false);
  const [dates, setDates] = useState<string[]>([]);

  useEffect(() => {
    supabase
      .from('attendance')
      .select('event_date')
      .order('event_date', { ascending: false })
      .then(({ data }) => {
        const unique = [...new Set((data ?? []).map((r: { event_date: string }) => r.event_date))];
        setDates(unique);
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    supabase
      .from('attendance')
      .select('*, child:children(*)')
      .eq('event_date', date)
      .order('checked_in_at')
      .then(({ data }) => {
        setRecords((data as unknown as AttendanceWithChild[]) ?? []);
        setLoading(false);
      });
  }, [date]);

  const shift = (days: number) => {
    const d = new Date(date + 'T12:00:00');
    d.setDate(d.getDate() + days);
    setDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <ClipboardList size={18} className="text-amber-600" />
          </div>
          <h2 className="font-semibold text-gray-800">Historial de Asistencia</h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => shift(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex-1 relative">
            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={date}
              max={today}
              onChange={e => setDate(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => shift(1)}
            disabled={date >= today}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {dates.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {dates.slice(0, 8).map(d => (
              <button
                key={d}
                onClick={() => setDate(d)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                  d === date
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {new Date(d + 'T12:00:00').toLocaleDateString('es', { month: 'short', day: 'numeric' })}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-700 capitalize text-sm">{formatDate(date)}</h3>
          {!loading && (
            <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2.5 py-1 rounded-full">
              {records.length} nino{records.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={28} className="text-gray-300 animate-spin" />
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-8">
            <Baby size={40} className="text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Sin registros para este dia</p>
          </div>
        ) : (
          <div className="space-y-2">
            {records.map((r, i) => (
              <div
                key={r.id}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <span className="text-xs text-gray-300 font-mono w-5 text-right flex-shrink-0">{i + 1}</span>
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                  {r.child?.photo_url ? (
                    <img src={r.child.photo_url} alt={r.child.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Baby size={16} className="text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm truncate">{r.child?.full_name ?? 'Desconocido'}</p>
                  <p className="text-xs text-gray-400 truncate">{r.child?.parent1_name}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0 font-mono">
                  {formatTime(r.checked_in_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

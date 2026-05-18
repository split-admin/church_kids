import { useState, useEffect } from 'react';
import { supabase, type Child } from '../lib/supabase';
import { Search, UserPlus, CreditCard as Edit2, Trash2, Baby, Phone, Users, Loader2 } from 'lucide-react';

type Props = {
  onRegister: () => void;
  onEdit: (child: Child) => void;
  refreshKey: number;
};

function getAge(birthdate: string | null): string {
  if (!birthdate) return 'Edad desconocida';
  const diff = Date.now() - new Date(birthdate).getTime();
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  return `${years} ano${years !== 1 ? 's' : ''}`;
}

export default function ChildrenList({ onRegister, onEdit, refreshKey }: Props) {
  const [children, setChildren] = useState<Child[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    supabase
      .from('children')
      .select('*')
      .order('full_name')
      .then(({ data }) => {
        setChildren((data as Child[]) ?? []);
        setLoading(false);
      });
  }, [refreshKey]);

  const filtered = query.trim()
    ? children.filter(c => c.full_name.toLowerCase().includes(query.toLowerCase()))
    : children;

  const handleDelete = async (child: Child) => {
    if (!confirm(`Eliminar a ${child.full_name}? Esta accion no se puede deshacer.`)) return;
    setDeleting(child.id);
    await supabase.from('children').delete().eq('id', child.id);
    setChildren(prev => prev.filter(c => c.id !== child.id));
    setDeleting(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar nino..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
          />
        </div>
        <button
          onClick={onRegister}
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 text-white rounded-xl text-sm font-medium hover:bg-sky-600 transition-colors shadow-sm whitespace-nowrap"
        >
          <UserPlus size={16} />
          Nuevo nino
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={32} className="text-gray-300 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Baby size={48} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">
            {query.trim() ? 'No se encontraron resultados' : 'No hay ninos registrados aun'}
          </p>
          {!query.trim() && (
            <button
              onClick={onRegister}
              className="mt-4 text-sky-500 text-sm font-medium hover:text-sky-600 transition-colors"
            >
              Registrar el primer nino
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map(child => (
            <div
              key={child.id}
              className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  {child.photo_url ? (
                    <img src={child.photo_url} alt={child.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Baby size={28} className="text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{child.full_name}</p>
                  <p className="text-xs text-gray-500 mb-2">{getAge(child.birthdate)}</p>
                  <div className="space-y-1">
                    {child.parent1_name && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Users size={11} className="text-gray-400 flex-shrink-0" />
                        <span className="truncate">{child.parent1_name}</span>
                        {child.parent1_phone && (
                          <>
                            <Phone size={11} className="text-gray-400 flex-shrink-0" />
                            <span className="truncate">{child.parent1_phone}</span>
                          </>
                        )}
                      </div>
                    )}
                    {child.parent2_name && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Users size={11} className="text-gray-400 flex-shrink-0" />
                        <span className="truncate">{child.parent2_name}</span>
                        {child.parent2_phone && (
                          <>
                            <Phone size={11} className="text-gray-400 flex-shrink-0" />
                            <span className="truncate">{child.parent2_phone}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  {child.notes && (
                    <p className="text-xs text-amber-600 mt-1.5 bg-amber-50 px-2 py-1 rounded-lg truncate">
                      {child.notes}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                <button
                  onClick={() => onEdit(child)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-gray-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Edit2 size={13} /> Editar
                </button>
                <button
                  onClick={() => handleDelete(child)}
                  disabled={deleting === child.id}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-red-500 font-medium rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {deleting === child.id ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Trash2 size={13} />
                  )}
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <p className="text-center text-xs text-gray-400">
          {filtered.length} nino{filtered.length !== 1 ? 's' : ''} registrado{filtered.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}

import { MapPin, Calendar, TrendingUp, CheckCircle2, Trash2 } from 'lucide-react';
import { Hike } from '../App';

type HikesListProps = {
  hikes: Hike[];
  onSelectHike: (id: string) => void;
  onUpdateHike: (id: string, updates: Partial<Hike>) => void;
  onDeleteAll?: () => void;
};

export function HikesList({ hikes, onSelectHike, onUpdateHike, onDeleteAll }: HikesListProps) {
  const planned = hikes.filter(h => !h.completed);
  const completed = hikes.filter(h => h.completed);

  const handleDeleteAll = () => {
    if (window.confirm(`Are you sure you want to delete all ${hikes.length} hike(s)? This action cannot be undone.`)) {
      if (onDeleteAll) {
        onDeleteAll();
      }
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'moderate': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const HikeCard = ({ hike }: { hike: Hike }) => (
    <div
      onClick={() => onSelectHike(hike.id)}
      className="bg-white rounded-xl shadow-md p-4 mb-3 active:scale-98 transition-transform cursor-pointer"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="flex-1 pr-2">{hike.name}</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(hike.difficulty)}`}>
          {hike.difficulty}
        </span>
      </div>
      
      <div className="space-y-1.5 text-gray-600">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{hike.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">{new Date(hike.date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm">{hike.distance} miles • {hike.duration}</span>
        </div>
      </div>

      {hike.observations.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <span className="text-sm text-gray-500">
            {hike.observations.length} observation{hike.observations.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div>
      {hikes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No hikes yet. Tap the + button to add your first hike!</p>
        </div>
      ) : (
        <>
          {/* Delete All Button */}
          {onDeleteAll && hikes.length > 0 && (
            <div className="mb-4">
              <button
                onClick={handleDeleteAll}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete All Hikes ({hikes.length})
              </button>
            </div>
          )}

          {planned.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-3 text-gray-700 flex items-center gap-2">
                <span>Planned Hikes</span>
                <span className="text-sm bg-green-600 text-white px-2 py-0.5 rounded-full">
                  {planned.length}
                </span>
              </h2>
              {planned.map(hike => (
                <HikeCard key={hike.id} hike={hike} />
              ))}
            </div>
          )}

          {completed.length > 0 && (
            <div>
              <h2 className="mb-3 text-gray-700 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Completed Hikes</span>
                <span className="text-sm bg-gray-600 text-white px-2 py-0.5 rounded-full">
                  {completed.length}
                </span>
              </h2>
              {completed.map(hike => (
                <HikeCard key={hike.id} hike={hike} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

import { useState } from 'react';
import { 
  MapPin, 
  Calendar, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  Trash2,
  Plus,
  Eye,
  Cloud,
  MapPinned,
  AlertCircle,
  Edit2,
  Save,
  X,
  ParkingCircle
} from 'lucide-react';
import { Hike, Observation } from '../App';

type HikeDetailProps = {
  hike: Hike;
  onUpdate: (updates: Partial<Hike>) => void;
  onDelete: () => void;
  onAddObservation: (observation: Omit<Observation, 'id'>) => void;
  onDeleteObservation?: (hikeId: string, observationId: string) => void;
};

export function HikeDetail({ hike, onUpdate, onDelete, onAddObservation, onDeleteObservation }: HikeDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showAddObservation, setShowAddObservation] = useState(false);
  const [observationNote, setObservationNote] = useState('');
  const [observationType, setObservationType] = useState<Observation['type']>('other');
  const [observationTime, setObservationTime] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
  });
  const [obsErrors, setObsErrors] = useState<Record<string, string>>({});
  
  const [editData, setEditData] = useState({
    name: hike.name,
    location: hike.location,
    date: hike.date,
    distance: hike.distance.toString(),
    difficulty: hike.difficulty,
    duration: hike.duration,
    description: hike.description,
  });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'moderate': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const validateObservation = () => {
    const errors: Record<string, string> = {};
    
    if (!observationNote.trim()) {
      errors.note = 'Observation is required';
    }
    
    if (!observationTime) {
      errors.time = 'Time is required';
    }
    
    setObsErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddObservation = () => {
    if (!validateObservation()) return;
    
    onAddObservation({
      timestamp: new Date(observationTime).toISOString(),
      note: observationNote,
      type: observationType,
    });
    
    // Reset form
    setObservationNote('');
    setObservationType('other');
    const now = new Date();
    setObservationTime(now.toISOString().slice(0, 16));
    setObsErrors({});
    setShowAddObservation(false);
  };

  const validateEdit = () => {
    const errors: Record<string, string> = {};
    
    if (!editData.name.trim()) {
      errors.name = 'Name is required';
    }
    if (!editData.location.trim()) {
      errors.location = 'Location is required';
    }
    if (!editData.date) {
      errors.date = 'Date is required';
    }
    if (!editData.distance || parseFloat(editData.distance) <= 0) {
      errors.distance = 'Length must be greater than 0';
    }
    if (!editData.duration.trim()) {
      errors.duration = 'Duration is required';
    }
    
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveEdit = () => {
    if (!validateEdit()) return;
    
    onUpdate({
      name: editData.name,
      location: editData.location,
      date: editData.date,
      distance: parseFloat(editData.distance),
      difficulty: editData.difficulty,
      duration: editData.duration,
      description: editData.description,
    });
    setIsEditing(false);
    setEditErrors({});
  };

  const handleCancelEdit = () => {
    setEditData({
      name: hike.name,
      location: hike.location,
      date: hike.date,
      distance: hike.distance.toString(),
      difficulty: hike.difficulty,
      duration: hike.duration,
      description: hike.description,
    });
    setEditErrors({});
    setIsEditing(false);
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
    if (editErrors[name]) {
      setEditErrors({ ...editErrors, [name]: '' });
    }
  };

  const getObservationIcon = (type: Observation['type']) => {
    switch (type) {
      case 'wildlife': return <Eye className="w-4 h-4" />;
      case 'landmark': return <MapPinned className="w-4 h-4" />;
      case 'weather': return <Cloud className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this hike? This action cannot be undone.')) {
      onDelete();
    }
  };

  const handleDeleteObservation = (obsId: string) => {
    if (window.confirm('Are you sure you want to delete this observation?')) {
      if (onDeleteObservation) {
        onDeleteObservation(hike.id, obsId);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Details Card */}
      <div className="bg-white rounded-xl shadow-md p-5">
        {isEditing ? (
          // Edit Mode
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-green-600">Edit Hike</h2>
              <button
                onClick={handleCancelEdit}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div>
              <label className="block text-sm mb-1.5 text-gray-700">
                Hike Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={editData.name}
                onChange={handleEditChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  editErrors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {editErrors.name && (
                <p className="text-sm text-red-600 mt-1">{editErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-1.5 text-gray-700">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={editData.location}
                onChange={handleEditChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  editErrors.location ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {editErrors.location && (
                <p className="text-sm text-red-600 mt-1">{editErrors.location}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1.5 text-gray-700">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={editData.date}
                  onChange={handleEditChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    editErrors.date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {editErrors.date && (
                  <p className="text-sm text-red-600 mt-1">{editErrors.date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm mb-1.5 text-gray-700">
                  Length (km) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="distance"
                  value={editData.distance}
                  onChange={handleEditChange}
                  step="0.1"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    editErrors.distance ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {editErrors.distance && (
                  <p className="text-sm text-red-600 mt-1">{editErrors.distance}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1.5 text-gray-700">
                  Difficulty <span className="text-red-500">*</span>
                </label>
                <select
                  name="difficulty"
                  value={editData.difficulty}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1.5 text-gray-700">
                  Duration <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="duration"
                  value={editData.duration}
                  onChange={handleEditChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    editErrors.duration ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {editErrors.duration && (
                  <p className="text-sm text-red-600 mt-1">{editErrors.duration}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1.5 text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={editData.description}
                onChange={handleEditChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleCancelEdit}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save className="w-5 h-5" />
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          // View Mode
          <>
            <div className="flex items-start justify-between mb-4">
              <h2 className="flex-1 pr-2">{hike.name}</h2>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(hike.difficulty)}`}>
                  {hike.difficulty}
                </span>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Edit hike"
                >
                  <Edit2 className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="space-y-3 text-gray-600 mb-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5" />
                <span>{hike.location}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5" />
                <span>{new Date(hike.date).toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5" />
                <span>{hike.distance} km</span>
              </div>
              {hike.duration && (
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5" />
                  <span>{hike.duration}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <ParkingCircle className="w-5 h-5" />
                <span>Parking: {hike.parkingAvailable === 'yes' ? 'Available' : 'Not Available'}</span>
              </div>
            </div>

            {hike.description && (
              <div className="pt-4 border-t border-gray-100">
                <p className="text-gray-700">{hike.description}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4 mt-4 border-t border-gray-100">
              <button
                onClick={() => onUpdate({ completed: !hike.completed })}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-colors ${
                  hike.completed
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
                {hike.completed ? 'Completed' : 'Mark Complete'}
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Observations Section */}
      <div className="bg-white rounded-xl shadow-md p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-700">Observations</h3>
          <button
            onClick={() => setShowAddObservation(!showAddObservation)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        {showAddObservation && (
          <div className="mb-4 p-4 bg-green-50 rounded-lg space-y-3">
            <div>
              <label htmlFor="obs-type" className="block text-sm mb-1.5 text-gray-700">
                Type
              </label>
              <select
                id="obs-type"
                value={observationType}
                onChange={(e) => setObservationType(e.target.value as Observation['type'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="wildlife">Wildlife</option>
                <option value="landmark">Landmark</option>
                <option value="weather">Weather</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="obs-time" className="block text-sm mb-1.5 text-gray-700">
                Time of Observation <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="obs-time"
                value={observationTime}
                onChange={(e) => {
                  setObservationTime(e.target.value);
                  if (obsErrors.time) {
                    setObsErrors({ ...obsErrors, time: '' });
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  obsErrors.time ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {obsErrors.time && (
                <p className="text-sm text-red-600 mt-1">{obsErrors.time}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="obs-note" className="block text-sm mb-1.5 text-gray-700">
                Observation <span className="text-red-500">*</span>
              </label>
              <textarea
                id="obs-note"
                value={observationNote}
                onChange={(e) => {
                  setObservationNote(e.target.value);
                  if (obsErrors.note) {
                    setObsErrors({ ...obsErrors, note: '' });
                  }
                }}
                rows={2}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none ${
                  obsErrors.note ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="What did you observe?"
              />
              {obsErrors.note && (
                <p className="text-sm text-red-600 mt-1">{obsErrors.note}</p>
              )}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowAddObservation(false);
                  setObsErrors({});
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAddObservation}
                className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {hike.observations.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No observations yet</p>
        ) : (
          <div className="space-y-3">
            {hike.observations.map((obs) => (
              <div key={obs.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="flex items-center gap-1.5 text-xs px-2 py-1 bg-white rounded-full text-gray-700">
                      {getObservationIcon(obs.type)}
                      {obs.type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(obs.timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  {onDeleteObservation && (
                    <button
                      onClick={() => handleDeleteObservation(obs.id)}
                      className="p-1 hover:bg-red-100 rounded transition-colors"
                      title="Delete observation"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  )}
                </div>
                <p className="text-gray-700">{obs.note}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

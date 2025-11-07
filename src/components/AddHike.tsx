import { useState } from 'react';
import { Hike } from '../App';
import { AlertCircle, Check } from 'lucide-react';

type AddHikeProps = {
  onAdd: (hike: Omit<Hike, 'id' | 'observations' | 'completed'>) => void;
  onCancel: () => void;
};

export function AddHike({ onAdd, onCancel }: AddHikeProps) {
  const [step, setStep] = useState<'form' | 'confirm'>('form');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    distance: '',
    difficulty: 'moderate' as 'easy' | 'moderate' | 'hard',
    duration: '',
    description: '',
    parkingAvailable: 'yes' as 'yes' | 'no',
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Hike name is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    if (!formData.distance || parseFloat(formData.distance) <= 0) {
      newErrors.distance = 'Length must be greater than 0';
    }
    
    if (!formData.duration.trim()) {
      newErrors.duration = 'Duration is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setStep('confirm');
    }
  };

  const handleConfirm = () => {
    onAdd({
      ...formData,
      distance: parseFloat(formData.distance),
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  if (step === 'confirm') {
    return (
      <div className="bg-white rounded-xl shadow-md p-5">
        <h2 className="mb-5 text-green-600">Confirm Hike Details</h2>
        
        <div className="space-y-4 mb-6">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Hike Name</p>
                <p className="text-gray-900">{formData.name}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="text-gray-900">{formData.location}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="text-gray-900">
                    {new Date(formData.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Length</p>
                  <p className="text-gray-900">{formData.distance} km</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Difficulty</p>
                  <p className="text-gray-900 capitalize">{formData.difficulty}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="text-gray-900">{formData.duration}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Parking Available</p>
                <p className="text-gray-900">{formData.parkingAvailable === 'yes' ? 'Yes' : 'No'}</p>
              </div>
              
              {formData.description && (
                <div>
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="text-gray-900">{formData.description}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
            <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-900">
              Please review the details above. You can go back to make changes or confirm to save this hike.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setStep('form')}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back to Edit
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Confirm & Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-5">
      <h2 className="mb-5 text-green-600">Plan a New Hike</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm mb-1.5 text-gray-700">
            Hike Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., Snowdon, Trosley Country Park"
          />
          {errors.name && (
            <div className="flex items-center gap-1.5 mt-1.5 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{errors.name}</p>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="location" className="block text-sm mb-1.5 text-gray-700">
            Location <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.location ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., Rocky Mountain National Park"
          />
          {errors.location && (
            <div className="flex items-center gap-1.5 mt-1.5 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{errors.location}</p>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="date" className="block text-sm mb-1.5 text-gray-700">
            Date of the Hike <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.date ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.date && (
            <div className="flex items-center gap-1.5 mt-1.5 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{errors.date}</p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1.5 text-gray-700">
            Parking Available <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="parkingAvailable"
                value="yes"
                checked={formData.parkingAvailable === 'yes'}
                onChange={handleChange}
                className="w-4 h-4 text-green-600 focus:ring-green-500"
              />
              <span className="text-gray-700">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="parkingAvailable"
                value="no"
                checked={formData.parkingAvailable === 'no'}
                onChange={handleChange}
                className="w-4 h-4 text-green-600 focus:ring-green-500"
              />
              <span className="text-gray-700">No</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="distance" className="block text-sm mb-1.5 text-gray-700">
              Length (km) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="distance"
              name="distance"
              value={formData.distance}
              onChange={handleChange}
              step="0.1"
              min="0"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.distance ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="8.5"
            />
            {errors.distance && (
              <div className="flex items-center gap-1.5 mt-1.5 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <p className="text-sm">{errors.distance}</p>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="difficulty" className="block text-sm mb-1.5 text-gray-700">
              Difficulty <span className="text-red-500">*</span>
            </label>
            <select
              id="difficulty"
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="easy">Easy</option>
              <option value="moderate">Moderate</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="duration" className="block text-sm mb-1.5 text-gray-700">
            Duration <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.duration ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., 4-5 hours, 2 hours 30 minutes"
          />
          {errors.duration && (
            <div className="flex items-center gap-1.5 mt-1.5 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{errors.duration}</p>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm mb-1.5 text-gray-700">
            Description <span className="text-gray-500">(Optional)</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            placeholder="Add notes about the trail, scenery, difficulty notes, etc."
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Next: Review
          </button>
        </div>
      </form>
    </div>
  );
}

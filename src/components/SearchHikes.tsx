import { useState, useMemo } from 'react';
import { Search, MapPin, Calendar, TrendingUp, SlidersHorizontal } from 'lucide-react';
import { Hike } from '../App';

type SearchHikesProps = {
  hikes: Hike[];
  onSelectHike: (id: string) => void;
};

export function SearchHikes({ hikes, onSelectHike }: SearchHikesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Advanced search filters
  const [filters, setFilters] = useState({
    name: '',
    location: '',
    minLength: '',
    maxLength: '',
    dateFrom: '',
    dateTo: '',
    difficulty: 'all',
    status: 'all'
  });

  const filteredHikes = useMemo(() => {
    return hikes.filter(hike => {
      // Basic search
      const matchesBasicSearch = searchTerm === '' || 
        hike.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hike.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hike.description.toLowerCase().includes(searchTerm.toLowerCase());

      // Advanced filters
      const matchesName = !filters.name || 
        hike.name.toLowerCase().includes(filters.name.toLowerCase());
      
      const matchesLocation = !filters.location || 
        hike.location.toLowerCase().includes(filters.location.toLowerCase());
      
      const matchesMinLength = !filters.minLength || 
        hike.distance >= parseFloat(filters.minLength);
      
      const matchesMaxLength = !filters.maxLength || 
        hike.distance <= parseFloat(filters.maxLength);
      
      const matchesDateFrom = !filters.dateFrom || 
        new Date(hike.date) >= new Date(filters.dateFrom);
      
      const matchesDateTo = !filters.dateTo || 
        new Date(hike.date) <= new Date(filters.dateTo);
      
      const matchesDifficulty = filters.difficulty === 'all' || 
        hike.difficulty === filters.difficulty;
      
      const matchesStatus = filters.status === 'all' || 
        (filters.status === 'completed' && hike.completed) ||
        (filters.status === 'planned' && !hike.completed);

      return matchesBasicSearch && 
             matchesName && 
             matchesLocation && 
             matchesMinLength && 
             matchesMaxLength && 
             matchesDateFrom && 
             matchesDateTo && 
             matchesDifficulty && 
             matchesStatus;
    });
  }, [hikes, searchTerm, filters]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters({ ...filters, [field]: value });
  };

  const clearFilters = () => {
    setFilters({
      name: '',
      location: '',
      minLength: '',
      maxLength: '',
      dateFrom: '',
      dateTo: '',
      difficulty: 'all',
      status: 'all'
    });
    setSearchTerm('');
  };

  const hasActiveFilters = searchTerm || 
    filters.name || 
    filters.location || 
    filters.minLength || 
    filters.maxLength || 
    filters.dateFrom || 
    filters.dateTo || 
    filters.difficulty !== 'all' || 
    filters.status !== 'all';

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'moderate': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Quick search by name, location, or description..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Advanced Search Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 mt-3 px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {showAdvanced ? 'Hide' : 'Show'} Advanced Search
        </button>

        {/* Advanced Search Filters */}
        {showAdvanced && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="filter-name" className="block text-sm mb-1.5 text-gray-700">
                  Hike Name
                </label>
                <input
                  type="text"
                  id="filter-name"
                  value={filters.name}
                  onChange={(e) => handleFilterChange('name', e.target.value)}
                  placeholder="Enter name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label htmlFor="filter-location" className="block text-sm mb-1.5 text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  id="filter-location"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  placeholder="Enter location..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="filter-min-length" className="block text-sm mb-1.5 text-gray-700">
                  Min Length (km)
                </label>
                <input
                  type="number"
                  id="filter-min-length"
                  value={filters.minLength}
                  onChange={(e) => handleFilterChange('minLength', e.target.value)}
                  placeholder="0"
                  step="0.1"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label htmlFor="filter-max-length" className="block text-sm mb-1.5 text-gray-700">
                  Max Length (km)
                </label>
                <input
                  type="number"
                  id="filter-max-length"
                  value={filters.maxLength}
                  onChange={(e) => handleFilterChange('maxLength', e.target.value)}
                  placeholder="100"
                  step="0.1"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="filter-date-from" className="block text-sm mb-1.5 text-gray-700">
                  Date From
                </label>
                <input
                  type="date"
                  id="filter-date-from"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label htmlFor="filter-date-to" className="block text-sm mb-1.5 text-gray-700">
                  Date To
                </label>
                <input
                  type="date"
                  id="filter-date-to"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="filter-difficulty" className="block text-sm mb-1.5 text-gray-700">
                  Difficulty
                </label>
                <select
                  id="filter-difficulty"
                  value={filters.difficulty}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All</option>
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label htmlFor="filter-status" className="block text-sm mb-1.5 text-gray-700">
                  Status
                </label>
                <select
                  id="filter-status"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All</option>
                  <option value="planned">Planned</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-full px-3 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      <div>
        <p className="text-sm text-gray-600 mb-3">
          {filteredHikes.length} {filteredHikes.length === 1 ? 'hike' : 'hikes'} found
          {hasActiveFilters && <span className="text-green-600"> (filtered)</span>}
        </p>

        {filteredHikes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-500 mb-2">No hikes match your search criteria</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-green-600 hover:underline"
              >
                Clear filters to see all hikes
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHikes.map(hike => (
              <div
                key={hike.id}
                onClick={() => onSelectHike(hike.id)}
                className="bg-white rounded-xl shadow-md p-4 active:scale-98 transition-transform cursor-pointer hover:shadow-lg"
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
                    <span className="text-sm">{hike.distance} km</span>
                  </div>
                </div>

                {hike.completed && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <span className="text-sm text-green-600">✓ Completed</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

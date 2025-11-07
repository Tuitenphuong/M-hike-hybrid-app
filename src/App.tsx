import { useState, useEffect } from 'react';
import { HikesList } from './components/HikesList';
import { AddHike } from './components/AddHike';
import { HikeDetail } from './components/HikeDetail';
import { SearchHikes } from './components/SearchHikes';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Mountain, Plus, Search, List, LogOut } from 'lucide-react';
import { database, Hike as DBHike, Observation as DBObservation } from '../services/database.ts';

export type Observation = {
  id: string;
  timestamp: string;
  note: string;
  type: 'wildlife' | 'landmark' | 'weather' | 'other';
};

export type Hike = {
  id: string;
  name: string;
  location: string;
  date: string;
  distance: number;
  difficulty: 'easy' | 'moderate' | 'hard';
  duration: string;
  description: string;
  parkingAvailable?: 'yes' | 'no';
  observations: Observation[];
  completed: boolean;
};

type View = 'list' | 'add' | 'detail' | 'search';
type AuthView = 'login' | 'register';

type User = {
  id: number;
  name: string;
  email: string;
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<AuthView>('login');
  const [view, setView] = useState<View>('list');
  const [selectedHikeId, setSelectedHikeId] = useState<string | null>(null);
  const [hikes, setHikes] = useState<Hike[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize database and check for existing session on mount
  useEffect(() => {
    const initApp = async () => {
      try {
        await database.initialize();
        
        const savedUserId = localStorage.getItem('mhike_user_id');
        if (savedUserId) {
          const userData = await database.getUserById(parseInt(savedUserId));
          if (userData) {
            setUser({
              id: userData.id!,
              name: userData.name,
              email: userData.email
            });
            setIsAuthenticated(true);
            await loadHikes(userData.id!);
          }
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initApp();
  }, []);

  const loadHikes = async (userId: number) => {
    try {
      const dbHikes = await database.getHikesByUserId(userId);
      const hikesWithObservations = await Promise.all(
        dbHikes.map(async (hike) => {
          const observations = await database.getObservationsByHikeId(hike.id!);
          return {
            id: hike.id!.toString(),
            name: hike.name,
            location: hike.location,
            date: hike.date,
            distance: parseFloat(hike.length.split(' ')[0]) || 0,
            difficulty: hike.difficulty as 'easy' | 'moderate' | 'hard',
            duration: hike.length,
            description: hike.description,
            parkingAvailable: (hike.parking_available === true ? 'yes' : 'no') as 'yes' | 'no',
            observations: observations.map(obs => ({
              id: obs.id!.toString(),
              timestamp: obs.time,
              note: obs.comment,
              type: obs.type as 'wildlife' | 'landmark' | 'weather' | 'other'
            })),
            completed: false
          };
        })
      );
      setHikes(hikesWithObservations);
    } catch (error) {
      console.error('Error loading hikes:', error);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const userData = await database.getUserByEmail(email);
      if (userData && userData.password === password) {
        setUser({
          id: userData.id!,
          name: userData.name,
          email: userData.email
        });
        setIsAuthenticated(true);
        localStorage.setItem('mhike_user_id', userData.id!.toString());
        await loadHikes(userData.id!);
      } else {
        alert('Invalid email or password');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Error logging in. Please try again.');
    }
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    try {
      const existingUser = await database.getUserByEmail(email);
      if (existingUser) {
        alert('Email already registered');
        return;
      }
      
      const userId = await database.createUser({ name, email, password });
      setUser({ id: userId, name, email });
      setIsAuthenticated(true);
      localStorage.setItem('mhike_user_id', userId.toString());
    } catch (error) {
      console.error('Error registering:', error);
      alert('Error creating account. Please try again.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setHikes([]);
    localStorage.removeItem('mhike_user_id');
    setView('list');
  };

  const addHike = async (hike: Omit<Hike, 'id' | 'observations' | 'completed'>) => {
    if (!user) return;
    
    try {
      const hikeId = await database.createHike({
        user_id: user.id,
        name: hike.name,
        location: hike.location,
        date: hike.date,
        length: hike.duration,
        difficulty: hike.difficulty,
        parking_available: hike.parkingAvailable === 'yes',
        description: hike.description
      });

      const newHike: Hike = {
        ...hike,
        id: hikeId.toString(),
        observations: [],
        completed: false,
      };
      setHikes([newHike, ...hikes]);
      setView('list');
    } catch (error) {
      console.error('Error adding hike:', error);
      alert('Error adding hike. Please try again.');
    }
  };

  const updateHike = async (id: string, updates: Partial<Hike>) => {
    try {
      await database.updateHike(parseInt(id), {
        name: updates.name,
        location: updates.location,
        date: updates.date,
        length: updates.duration,
        difficulty: updates.difficulty,
        description: updates.description
      });
      setHikes(hikes.map(h => h.id === id ? { ...h, ...updates } : h));
    } catch (error) {
      console.error('Error updating hike:', error);
      alert('Error updating hike. Please try again.');
    }
  };

  const deleteHike = async (id: string) => {
    try {
      await database.deleteHike(parseInt(id));
      setHikes(hikes.filter(h => h.id !== id));
      setView('list');
    } catch (error) {
      console.error('Error deleting hike:', error);
      alert('Error deleting hike. Please try again.');
    }
  };

  const addObservation = async (hikeId: string, observation: Omit<Observation, 'id'>) => {
    try {
      const obsId = await database.createObservation({
        hike_id: parseInt(hikeId),
        type: observation.type,
        name: observation.type,
        time: observation.timestamp,
        comment: observation.note
      });

      const newObservation: Observation = {
        ...observation,
        id: obsId.toString(),
      };
      
      setHikes(hikes.map(h => 
        h.id === hikeId 
          ? { ...h, observations: [...h.observations, newObservation] }
          : h
      ));
    } catch (error) {
      console.error('Error adding observation:', error);
      alert('Error adding observation. Please try again.');
    }
  };

  const deleteObservation = async (hikeId: string, observationId: string) => {
    try {
      await database.deleteObservation(parseInt(observationId));
      
      setHikes(hikes.map(h => 
        h.id === hikeId 
          ? { ...h, observations: h.observations.filter(obs => obs.id !== observationId) }
          : h
      ));
    } catch (error) {
      console.error('Error deleting observation:', error);
      alert('Error deleting observation. Please try again.');
    }
  };

  const deleteAllHikes = async () => {
    if (!user) return;
    
    try {
      // Delete all hikes for this user
      for (const hike of hikes) {
        await database.deleteHike(parseInt(hike.id));
      }
      setHikes([]);
    } catch (error) {
      console.error('Error deleting all hikes:', error);
      alert('Error deleting hikes. Please try again.');
    }
  };

  const selectedHike = hikes.find(h => h.id === selectedHikeId);

  // Show loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Mountain className="w-16 h-16 text-green-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading M-Hike...</p>
        </div>
      </div>
    );
  }

  // Show auth screens if not authenticated
  if (!isAuthenticated) {
    if (authView === 'login') {
      return (
        <Login
          onLogin={handleLogin}
          onSwitchToRegister={() => setAuthView('register')}
        />
      );
    } else {
      return (
        <Register
          onRegister={handleRegister}
          onSwitchToLogin={() => setAuthView('login')}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-green-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mountain className="w-8 h-8" />
              <div>
                <h1 className="text-2xl">M-Hike</h1>
                {user && <p className="text-xs text-green-100">Welcome, {user.name}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {view !== 'list' && (
                <button
                  onClick={() => setView('list')}
                  className="text-sm bg-green-700 px-3 py-1.5 rounded-lg hover:bg-green-800 transition-colors"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleLogout}
                className="p-2 bg-green-700 rounded-lg hover:bg-green-800 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6 pb-24">
        {view === 'list' && (
          <HikesList
            hikes={hikes}
            onSelectHike={(id) => {
              setSelectedHikeId(id);
              setView('detail');
            }}
            onUpdateHike={updateHike}
            onDeleteAll={deleteAllHikes}
          />
        )}
        
        {view === 'add' && <AddHike onAdd={addHike} onCancel={() => setView('list')} />}
        
        {view === 'detail' && selectedHike && (
          <HikeDetail
            hike={selectedHike}
            onUpdate={(updates) => updateHike(selectedHike.id, updates)}
            onDelete={() => deleteHike(selectedHike.id)}
            onAddObservation={(obs) => addObservation(selectedHike.id, obs)}
            onDeleteObservation={deleteObservation}
          />
        )}
        
        {view === 'search' && (
          <SearchHikes
            hikes={hikes}
            onSelectHike={(id) => {
              setSelectedHikeId(id);
              setView('detail');
            }}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-md mx-auto flex justify-around items-center py-3">
          <button
            onClick={() => setView('list')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              view === 'list' ? 'text-green-600' : 'text-gray-600 hover:text-green-600'
            }`}
          >
            <List className="w-6 h-6" />
            <span className="text-xs">My Hikes</span>
          </button>
          
          <button
            onClick={() => setView('add')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              view === 'add' ? 'text-green-600' : 'text-gray-600 hover:text-green-600'
            }`}
          >
            <Plus className="w-6 h-6" />
            <span className="text-xs">Add Hike</span>
          </button>
          
          <button
            onClick={() => setView('search')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              view === 'search' ? 'text-green-600' : 'text-gray-600 hover:text-green-600'
            }`}
          >
            <Search className="w-6 h-6" />
            <span className="text-xs">Search</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

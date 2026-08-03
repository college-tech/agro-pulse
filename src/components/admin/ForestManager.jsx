import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, PlusCircle, Trash2, LogOut, Trees, Menu, X, 
  Search, MapPin, Calendar, User, ChevronLeft, ChevronRight, AlertTriangle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QRCodeDisplay from '../QR/QRCodeDisplay';
import Logo from "../../../public/images/logo.png" 

import { v4 as uuidv4 } from 'uuid'; 

// --- FIRESTORE IMPORTS ---
import { db, auth } from '../../firebase/firebaseConfig'; 
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,setDoc,writeBatch
} from 'firebase/firestore'; // <--- Firestore specific imports
import { signOut } from 'firebase/auth';

// ==============================
// SUB-COMPONENT: HOME (INVENTORY)
// ==============================
const HomeView = ({ plants }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter Logic
  const filteredPlants = plants.filter(plant => 
    (plant.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (plant.plantId?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredPlants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPlants = filteredPlants.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Forest Inventory</h2>
          <p className="text-forest-muted mt-1">Total Plants: {plants.length}</p>
        </div>
        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search ID or Name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-forest-surface border border-forest-border text-white rounded-xl py-2 pl-10 pr-4 focus:border-forest-accent outline-none"
          />
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-forest-surface border border-forest-border rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-forest-muted">
            <thead className="bg-forest-base text-forest-accent uppercase font-bold border-b border-forest-border">
              <tr>
                <th className="p-4">Plant ID</th>
                <th className="p-4">plant Name</th>
                <th className="p-4">Location (Lat, Lng)</th>
                <th className="p-4">Planted Date</th>
                <th className="p-4">Owner ID</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest-border/30">
              {currentPlants.length > 0 ? currentPlants.map((plant) => (
                <tr key={plant.id} className="hover:bg-forest-highlight/10 transition-colors text-gray-200">
                  <td className="p-4 font-mono text-forest-accent font-bold">{plant.id}</td>
                  <td className="p-4 font-bold">{plant.name}</td>
                  <td className="p-4 flex items-center gap-1">
                    <MapPin size={14} className="text-forest-muted"/> 
                    {plant.plant_lat}, {plant.plant_lng}
                  </td>
                  <td className="p-4">{plant.planted}</td>
                  <td className="p-4">
                    {plant.ownerId ? (
                      <span className="flex items-center gap-1 text-emerald-400"><User size={14}/> {plant.ownerId}</span>
                    ) : (
                      <span className="text-forest-muted italic">Unassigned</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs font-bold">Active</span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-forest-muted">No plants match your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-forest-base border-t border-forest-border flex justify-between items-center">
          <span className="text-xs text-forest-muted">Page {currentPage} of {totalPages || 1}</span>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded bg-forest-surface border border-forest-border hover:bg-forest-highlight disabled:opacity-50"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded bg-forest-surface border border-forest-border hover:bg-forest-highlight disabled:opacity-50"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==============================
// SUB-COMPONENT: ADD PLANT (FIRESTORE)
// ==============================
const registerNewPlant = async (plantData) => {
    // Destructure using simple names from the form data
    const { plantId, name, latitude, longitude, plantedDate, ownerId,plantType } = plantData;

    // 1. Generate the unique token (UUID)
    const adoptionToken = uuidv4();

    // 2. Prepare the Batch Write
    const batch = writeBatch(db);

    // --- A. Create the Plant Document ---
    // Collection: All_Plants, Document ID: plantId
    const plantRef = doc(db, 'All_Plants', plantId); 
    
    // Data structure using YOUR DATABASE FIELD NAMES (plant_lat, plant_lng, planted)
    batch.set(plantRef, {
        name: name,
        plant_lat: parseFloat(latitude), 
        plant_lng: parseFloat(longitude),
        planted: plantedDate,
        ownerId: ownerId || null, // Allow for manual override, otherwise null
        adoptionToken: adoptionToken, // Store the UUID for audit/display
        plantType: plantType,
        createdAt: serverTimestamp(), // Use server timestamp
    });

    // --- B. Create the Adoption Token Document ---
    // Collection: adoption_tokens, Document ID: adoptionToken (UUID)
    const tokenRef = doc(db, 'adoption_tokens', adoptionToken);
    
    batch.set(tokenRef, {
        plantId: plantId,
        createdAt: serverTimestamp(),
    });

    // 3. Commit the batch: ensures both documents are written successfully
    await batch.commit(); // 

    return { plantId, adoptionToken };
};

const initialFormData = {
    plantId: '', name: '', latitude: '', longitude: '', plantedDate: '', ownerId: '',plantType: 'Roadside_Tree'
};

const PLANT_TYPES = ['Roadside_Tree','Indoor_plant','Urban_garden_plant'];
const AddPlantView = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [qrData, setQrData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setQrData(null); 
    setStatus({ type: 'loading', msg: 'Registering plant and generating QR code...' });
    
    const dataToRegister = {
          plantId: formData.plantId,
          name: formData.name,
          plantType: formData.plantType,
          latitude: formData.latitude, 
          longitude: formData.longitude,
          plantedDate: formData.plantedDate,
          ownerId: formData.ownerId,
      };
    try {
      // FIRESTORE: Add Document to 'plants' collection

        const result = await registerNewPlant(dataToRegister);

            // Success Handling
        setStatus({ type: 'success', msg: `Plant ${result.plantId} registered successfully! QR Code generated.` });
        setQrData(result); 
        setFormData(initialFormData);
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', msg: 'Failed to add plant. ' + error.message });
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
      {qrData && (
          <div className="bg-forest-surface border border-forest-border p-5 rounded-[2rem] shadow-2xl h-fit pb-2">
                    <h2 className="text-xl font-bold mb-4 text-emerald-400 text-center">QR Code for {qrData.plantId}</h2>

                    <div className="flex justify-center"> 
                        <QRCodeDisplay 
                            token={qrData.adoptionToken}
                            plantId={qrData.plantId} 
                        />
                    </div>
                </div>
            )}
      
        <h2 className="text-3xl font-bold text-white mb-6 pt-2">Register New Plant</h2>
      <div className="bg-forest-surface border border-forest-border p-8 rounded-[2rem] shadow-2xl ">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-forest-accent uppercase">Plant Unique ID</label>
              <input required type="text" placeholder="e.g. Plant-1" 
                value={formData.plantId} onChange={e => setFormData({...formData, plantId: e.target.value})}
                className="w-full bg-forest-base border border-forest-border text-white rounded-xl p-3 focus:border-forest-accent outline-none" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-forest-accent uppercase">Common Name</label>
              <input required type="text" placeholder="e.g. English Oak" 
                 value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                 className="w-full bg-forest-base border border-forest-border text-white rounded-xl p-3 focus:border-forest-accent outline-none" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
              <label className="text-xs font-bold text-forest-muted uppercase">Latitude</label>
              <input required type="number" step="any" placeholder="22.5726" 
                 value={formData.latitude} onChange={e => setFormData({...formData, latitude: e.target.value})}
                 className="w-full bg-forest-base border border-forest-border text-white rounded-xl p-3 focus:border-forest-accent outline-none" 
              />
            </div>
             <div className="space-y-2">
              <label className="text-xs font-bold text-forest-muted uppercase">Longitude</label>
              <input required type="number" step="any" placeholder="88.3639" 
                 value={formData.longitude} onChange={e => setFormData({...formData, longitude: e.target.value})}
                 className="w-full bg-forest-base border border-forest-border text-white rounded-xl p-3 focus:border-forest-accent outline-none" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
              <label className="text-xs font-bold text-forest-muted uppercase">Planted Date</label>
              <input required type="date" 
                 value={formData.plantedDate} onChange={e => setFormData({...formData, plantedDate: e.target.value})}
                 className="w-full bg-forest-base border border-forest-border text-white rounded-xl p-3 focus:border-forest-accent outline-none" 
              />
            </div>
             <div className="space-y-2">
              <label className="text-xs font-bold text-forest-muted uppercase">Owner ID (Optional)</label>
              <input type="text" placeholder="Leave empty if unassigned" 
                 value={formData.ownerId} onChange={e => setFormData({...formData, ownerId: e.target.value})}
                 className="w-full bg-forest-base border border-forest-border text-white rounded-xl p-3 focus:border-forest-accent outline-none" 
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
              <label className="text-xs font-bold text-forest-muted uppercase">Plant's Type</label>
              <div className="relative">
                <select 
                   required
                   value={formData.plantType} 
                   onChange={e => setFormData({...formData, plantType: e.target.value})}
                   className="w-full bg-forest-base border border-forest-border text-white rounded-xl p-3 appearance-none focus:border-forest-accent outline-none cursor-pointer" 
                >
                  {PLANT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, ' ')} {/* Replaces underscores with spaces for display */}
                    </option>
                  ))}
                </select>
                {/* Custom Chevron Icon for Dropdown */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-forest-muted pointer-events-none">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>
          </div>

          {status.msg && (
            <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${status.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
              {status.type === 'error' && <AlertTriangle size={18}/>}
              {status.msg}
            </div>
          )}

          <button type="submit" className="w-full bg-forest-accent hover:bg-emerald-400 text-forest-base font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
            <PlusCircle size={20} /> Register Plant
          </button>
        </form>
      </div>

            
    </div>
  );
};

// ==============================
// SUB-COMPONENT: DELETE PLANT (FIRESTORE)
// ==============================
const DeletePlantView = ({ plants }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = async (docId) => {
    if (window.confirm("WARNING: Are you sure you want to delete this plant record? This cannot be undone.")) {
      try {
        // FIRESTORE: Delete document
        await deleteDoc(doc(db, "All_Plants", docId));
        alert("Plant record deleted successfully.");
      } catch (error) {
        alert("Error deleting plant: " + error.message);
      }
    }
  };

  const filteredPlants = plants.filter(plant => 
    (plant.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (plant.plantId?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-in fade-in duration-500">
      <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl mb-8 flex items-start gap-4">
        <div className="bg-red-500/20 p-3 rounded-full text-red-400"><AlertTriangle size={24}/></div>
        <div>
          <h3 className="text-xl font-bold text-white">Danger Zone</h3>
          <p className="text-red-300 text-sm mt-1">Removing plants here permanently erases their historical data from the global database.</p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-muted" size={18} />
        <input 
          type="text" placeholder="Search plant to delete..." 
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-forest-surface border border-forest-border text-white rounded-xl py-3 pl-10 pr-4 focus:border-red-500 outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPlants.map((plant) => (
          <div key={plant.id} className="bg-forest-surface border border-forest-border p-4 rounded-xl flex justify-between items-center group hover:border-red-500/50 transition-colors">
            <div>
              <h4 className="font-bold text-white">ID: {plant.id}</h4>
              <p className="text-xs text-forest-muted font-mono">{plant.name}</p>
            </div>
            <button 
              onClick={() => handleDelete(plant.id)}
              className="bg-forest-base text-forest-muted hover:bg-red-500 hover:text-white p-3 rounded-lg transition-all"
            >
              <Trash2 size={20}/>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==============================
// MAIN COMPONENT: FOREST MANAGER
// ==============================
const ForestManager = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [plants, setPlants] = useState([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  // FETCH PLANTS FROM FIRESTORE
  useEffect(() => {
    // Listen to "plants" collection updates in real-time
    const unsubscribe = onSnapshot(collection(db, "All_Plants"), (snapshot) => {
      const loadedPlants = snapshot.docs.map(doc => ({
        id: doc.id, // Capture the Document ID
        ...doc.data()
      }));
      setPlants(loadedPlants);
    }, (error) => {
      console.error("Error fetching plants:", error);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Logout Error", error);
    }
  };

  const NavItem = ({ id, icon: Icon, label }) => (
    <button 
      onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
        activeTab === id 
          ? 'bg-forest-accent text-forest-base shadow-lg shadow-emerald-500/20' 
          : 'text-forest-muted hover:bg-forest-highlight hover:text-white'
      }`}
    >
      <Icon size={20} />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-forest-base text-white flex relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* --- SIDEBAR (Desktop) --- */}
      <aside className={`fixed md:relative z-40 h-screen w-72 bg-forest-surface border-r border-forest-border p-6 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="flex items-center gap-3 mb-10 px-2">
           <div className="bg-transparent rounded-lg text-white">
            <img src={Logo} alt="" className="w-12 rounded-4xl bg-transparent" />
           </div>
           <span className="text-xl font-bold">AgroPulse</span>
        </div>

        <nav className="space-y-2">
          <NavItem id="home" icon={LayoutDashboard} label="Inventory Overview" />
          <NavItem id="add" icon={PlusCircle} label="Add Plants" />
          <NavItem id="delete" icon={Trash2} label="Remove Plants" />
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="p-4 bg-forest-base rounded-xl border border-forest-border">
             <h4 className="text-sm font-bold text-white">Forest Manager</h4>
             <p className="text-xs text-forest-muted">Access Level: High</p>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-30 md:hidden"></div>}

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 bg-forest-base/80 backdrop-blur border-b border-forest-border flex justify-between items-center px-6 md:px-10 z-20">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-forest-muted"><Menu size={24}/></button>
          
          <div className="hidden md:block text-sm text-forest-muted">
             System Status: <span className="text-emerald-400 font-bold">Online (Firestore)</span>
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 hover:bg-forest-highlight py-1.5 px-2 pr-4 rounded-full transition-colors border border-transparent hover:border-forest-border"
            >
              <img src="https://ui-avatars.com/api/?name=Forest+Manager&background=10b981&color=fff" className="w-9 h-9 rounded-full" alt="Admin" />
              <div className="text-left hidden sm:block">
                <p className="text-sm font-bold text-white leading-none">Forest Manager</p>
                <p className="text-[10px] text-forest-muted leading-none mt-1">Forest Manager</p>
              </div>
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-forest-surface border border-forest-border rounded-xl shadow-2xl overflow-hidden py-1 z-50 animate-in fade-in slide-in-from-top-2">
                <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-forest-highlight">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Dynamic Content View */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 relative scroll-smooth">
          {activeTab === 'home' && <HomeView plants={plants} />}
          {activeTab === 'add' && <AddPlantView />}
          {activeTab === 'delete' && <DeletePlantView plants={plants} />}
        </div>
        
      </main>
    </div>
  );
};

export default ForestManager;
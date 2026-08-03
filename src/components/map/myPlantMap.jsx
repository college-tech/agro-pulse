import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Globe, MapPin, Trees, Activity, Calendar, Navigation, Loader2 } from 'lucide-react';
import L from 'leaflet';
import { collection, onSnapshot,getDoc,getDocs,doc } from 'firebase/firestore';
import { db,auth } from '../../firebase/firebaseConfig';

// --- CUSTOM ICONS (Same as before) ---
const createTreeIcon = () => new L.DivIcon({
  className: 'custom-tree-icon',
  html: `
    <div class="relative flex items-center justify-center w-8 h-8">
      <div class="absolute inset-0 bg-forest-accent/30 rounded-full animate-ping"></div>
      <div class="relative w-8 h-8 bg-forest-base border-2 border-forest-accent rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(74,222,128,0.5)]">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-5"/><path d="M13.8 8.2a2 2 0 0 0-3.6 0L4 18h16l-6.2-9.8z"/><path d="M4 18h16"/></svg>
      </div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -36]
});

const userIcon = new L.DivIcon({
  className: 'user-location-icon',
  html: `
    <div class="relative flex items-center justify-center w-6 h-6">
      <div class="absolute inset-0 bg-blue-500 rounded-full opacity-40 animate-ping duration-1000"></div>
      <div class="w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg"></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// --- HELPER: FLY TO LOCATION ---
const FlyToLocation = ({ location, trigger }) => {
  const map = useMap();
  useEffect(() => {
    if (location && trigger > 0) {
      map.flyTo(location, 15, { animate: true, duration: 1.5 });
    }
  }, [trigger, location, map]);
  return null;
};

const MapSection = () => {
  const [userPos, setUserPos] = useState([40.785091, -73.968285]); 
  const [hasLocation, setHasLocation] = useState(false);
  const [flyTrigger, setFlyTrigger] = useState(0);
  const [treesData, setTreesData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New States for Logic Handling
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // 1. Initial Silent Check (Optional - good for UX)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          updateUserLocation(pos);
        }, 
        () => {
          // If silent check fails, do nothing. Wait for user to click button.
          console.log("Initial location check failed or denied.");
        }
      );
    }
  }, []);

  // 2. REAL-TIME FIREBASE LISTENER
  useEffect(() => {
    const fetchUserDataAndPlants = async () => {
      const user = auth.currentUser;
      
      if (!user) {
        setLoading(false);
        return; 
      }

      try {
        const userDocRef = doc(db, 'UsersDetail', user.uid);
        const userSnap = await getDoc(userDocRef);
        
        let userPlantIds = [];
        if (userSnap.exists() && userSnap.data().adoptedPlants) {
          userPlantIds = userSnap.data().adoptedPlants; 
        }

        if (userPlantIds.length === 0) {
            setMyPlants([]);
            setLoading(false);
            return;
        }

        const querySnapshot = await getDocs(collection(db, "All_Plants"));
        const allPlants = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const filteredPlants = allPlants.filter(plant => 
            userPlantIds.includes(plant.id) || 
            userPlantIds.includes(plant.plantId) 
        );

        // SAFE DATA PROCESSING: Ensure Lat/Lng are numbers
        const readyToRender = filteredPlants
          .map(p => ({
            ...p,
            lat: parseFloat(p.plant_lat),
            lng: parseFloat(p.plant_lng),
          }))
          .filter(p => !isNaN(p.lat) && !isNaN(p.lng)); // IMPORTANT: Remove bad coordinates

        setTreesData(readyToRender);

      } catch (error) {
        console.error("Error loading user map data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndPlants();
  }, []);

  // --- CORE LOGIC: UPDATE LOCATION ---
  const updateUserLocation = (position) => {
    const { latitude, longitude } = position.coords;
    setUserPos([latitude, longitude]);
    setHasLocation(true);
    setFlyTrigger(prev => prev + 1); // Trigger the FlyTo animation
    setIsLocating(false);
    setLocationError(null);
  };

  // --- CORE LOGIC: HANDLE CLICK ---
  const handleLocateMe = () => {
    setIsLocating(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      // Success Callback
      (position) => {
        updateUserLocation(position);
      },
      // Error Callback
      (error) => {
        setIsLocating(false);
        let errorMsg = "";
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = "Location permission denied. Please enable it in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMsg = "The request to get user location timed out.";
            break;
          default:
            errorMsg = "An unknown error occurred.";
        }
        setLocationError(errorMsg);
        alert(errorMsg); // Simple feedback to user
      },
      // Options
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <section id="open-map" className="py-25 bg-forest-base relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        
        <div className="flex flex-col lg:flex-row items-end gap-12 mb-12">
          <div className="lg:w-1/2">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="text-forest-accent" size={20} />
              <span className="text-forest-accent font-bold uppercase tracking-widest text-sm">Live My Plans Tracking</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Interactive <span className="text-forest-accent">My Plants Map</span>
            </h2>
            <p className="text-forest-muted text-lg">
              Explore the grid. Zoom in to see individual tree health statuses in real-time.
            </p>
          </div>
        </div>

        {/* --- MAP FRAME --- */}
        <div className="relative rounded-[2rem] overflow-hidden border-4 border-forest-surface shadow-[0_0_50px_rgba(0,0,0,0.5)] h-[600px] w-full z-0 group">
          
          <MapContainer 
            center={userPos} 
            zoom={13} 
            scrollWheelZoom={true} 
            zoomControl={false} 
            attributionControl={false}
            className="w-full h-full bg-[#121F1B]"
          >
            <FlyToLocation location={userPos} trigger={flyTrigger} />
            
            
            {/* Replace your existing TileLayer with this: */}
            <TileLayer
              url="http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
              maxZoom={20}
              subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
              attribution='&copy; Google Maps'
              className="map-satellite-filter" // We add a slight filter to blend it
            /> 

            <ZoomControl position="bottomright" />

            {/* User Marker */}
            {hasLocation && (
              <Marker position={userPos} icon={userIcon}>
                <Popup className="dark-popup">
                  <span className="text-forest-base font-bold">You are here</span>
                </Popup>
              </Marker>
            )}

            {/* Tree Markers */}
            {treesData.map((tree) => (
              <Marker key={tree.id} position={[tree.lat, tree.lng]} icon={createTreeIcon()}>
                <Popup className="dark-popup" closeButton={false}>
                  <div className="min-w-[220px] bg-forest-surface p-1 rounded-lg text-forest-text">
                    <div className="flex items-center gap-2 mb-3 border-b border-forest-border pb-2">
                      <div className="bg-forest-base p-1.5 rounded text-forest-accent">
                        <Trees size={14}/>
                      </div>
                      <h3 className="font-bold text-lg text-white">{tree.name}</h3>
                    </div>
                    <div className="space-y-2.5 text-sm">
                      <div className="flex justify-between items-center bg-forest-base/50 p-2 rounded">
                        <span className="flex items-center gap-1.5 text-forest-muted"><Activity size={14}/> Status</span>
                        <span className={`font-bold px-2 py-0.5 rounded text-xs ${
                          tree.health === 'Healthy' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                          tree.health === 'Moderate' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 
                          'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {tree.health}
                        </span>
                      </div>
                      <div className="flex justify-between items-center px-2">
                        <span className="flex items-center gap-1.5 text-forest-muted"><Calendar size={14}/> Planted</span>
                        <span className="text-white font-mono">{tree.planted}</span>
                      </div>
                      <div className="text-xs text-center pt-2 text-forest-muted">
                        Guardian: <span className="text-forest-accent">{tree.ownerId}</span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

          </MapContainer>

          {/* --- SMART LOCATION BUTTON --- */}
          <button 
            onClick={handleLocateMe}
            disabled={isLocating}
            className={`absolute bottom-24 right-3 z-[1000] p-3 rounded-lg shadow-xl border border-forest-border transition-all 
              ${isLocating 
                ? 'bg-forest-highlight cursor-wait' 
                : 'bg-forest-surface hover:bg-forest-highlight hover:scale-110 active:scale-95'
              }
            `}
            title={locationError || "Locate Me"}
          >
            {isLocating ? (
              <Loader2 size={20} className="text-forest-accent animate-spin" />
            ) : (
              <Navigation 
                size={20} 
                fill={hasLocation ? "#4ADE80" : "none"} 
                className={hasLocation ? "text-forest-accent" : "text-forest-muted"} 
              />
            )}
          </button>

          {/* Error Message Toast (Optional visual feedback) */}
          {locationError && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-rose-900/90 text-white px-4 py-2 rounded-full text-xs font-bold border border-rose-700 shadow-lg z-[1000] animate-bounce">
              {locationError}
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_60px_rgba(18,31,27,1)] z-[400]"></div>
        </div>
      </div>
    </section>
  );
};

export default MapSection;
import React, { useState, useEffect } from "react";
import Hero from "../components/landing/hero";
import Stats from "../components/landing/stats";
import Map from "../components/landing/mapsection";
import Health from "../components/landing/overallhealth";
import Vision from "../components/landing/vision";
import Inspiration from "../components/landing/inspiration";

import { db, rtdb } from "../firebase/firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import { ref, onValue } from "firebase/database";

export default function Landing() {
  const [systemData, setSystemData] = useState({
    totalPlants: 0,
    adoptedPlants: 0, 
    activeGuardians: 0,
    health: { thriving: 0, moderate: 0, critical: 0 }
  });

  useEffect(() => {
    // A. Fetch Plants & Count Adoptions
    const unsubPlants = onSnapshot(collection(db, 'All_Plants'), (snap) => {
      let adoptedCount = 0;
      snap.forEach((doc) => {
        const data = doc.data();
        // Check if owner exists and is not null/empty
        if (data.ownerId && data.ownerId !== null && data.ownerId !== "") {
          adoptedCount++;
        }
      });
      
      setSystemData(prev => ({ 
        ...prev, 
        totalPlants: snap.size,
        adoptedPlants: adoptedCount 
      }));
    });

    // B. Count Guardians
    const unsubUsers = onSnapshot(collection(db, 'UsersDetail'), (snap) => {
      setSystemData(prev => ({ ...prev, activeGuardians: snap.size }));
    });

    // C. Get Global Health Distribution (ML Data)
    const mlRef = ref(rtdb, 'mlPredictions');
    const unsubML = onValue(mlRef, (snap) => {
      const data = snap.val() || {};
      const counts = Object.values(data).reduce((acc, curr) => {
        if (curr.health === 'Healthy') acc.thriving++;
        else if (curr.health === 'Moderate') acc.moderate++;
        else if (curr.health === 'Critical') acc.critical++;
        return acc;
      }, { thriving: 0, moderate: 0, critical: 0 });
      setSystemData(prev => ({ ...prev, health: counts }));
    });

    return () => { unsubPlants(); unsubUsers(); unsubML(); };
  }, []);

  return (
    <>
      <div className="py-0">
        <Hero />
        <Stats 
          totalPlants={systemData.totalPlants} 
          activeGuardians={systemData.activeGuardians} 
          adoptedCount={systemData.adoptedPlants} 
        />
        <Map />
        <Health healthCounts={systemData.health} />
        <Vision />
        <Inspiration />
      </div>
    </>
  );
}
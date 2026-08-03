// 
import React, { useState, useRef } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner'; 
import QrScanner from 'qr-scanner'; // <--- NEW LIBRARY for file scanning
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Camera, Trees, AlertCircle, CheckCircle, 
  ScanLine, Image as ImageIcon, Loader2 
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { db, auth } from '../../firebase/firebaseConfig'; 
import { doc, runTransaction, arrayUnion } from 'firebase/firestore';

// ==========================================
// TRANSACTION LOGIC (Same as before)
// ==========================================
async function performAdoptionTransaction(userId, adoptionToken) {
    const tokenRef = doc(db, 'adoption_tokens', adoptionToken);
    const userRef = doc(db, 'UsersDetail', userId);
    
    let plantIdToAdopt = null;

    try {
        await runTransaction(db, async (transaction) => {
            const tokenDoc = await transaction.get(tokenRef);
            if (!tokenDoc.exists()) throw new Error("Invalid Token: QR code invalid or used.");
            
            plantIdToAdopt = tokenDoc.data().plantId;
            const plantRef = doc(db, 'All_Plants', plantIdToAdopt); // Ensure collection name matches your DB ('plants' or 'All_Plants')
            const plantDoc = await transaction.get(plantRef);
            
            if (!plantDoc.exists()) throw new Error("System Error: Plant record missing.");
            if (plantDoc.data().ownerId) throw new Error("Unavailable: Plant already adopted.");

            transaction.update(plantRef, { ownerId: userId, adoptedDate: new Date().toISOString() });
            transaction.delete(tokenRef);
            transaction.update(userRef, { adoptedPlants: arrayUnion(plantIdToAdopt) });
        });
        return { success: true, plantId: plantIdToAdopt };
    } catch (error) {
        console.error("Transaction Failed:", error);
        throw error;
    }
}

// ==========================================
// COMPONENT
// ==========================================
const AdoptPlant = () => {
  const [scannedToken, setScannedToken] = useState(null);
  const [scanning, setScanning] = useState(true);
  const [status, setStatus] = useState('idle'); 
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null); // Ref for hidden file input

  const navigate = useNavigate();

  // 1. Handle Live Camera Scan
  const handleCameraScan = (detectedCodes) => {
    if (detectedCodes && detectedCodes.length > 0) {
      const rawValue = detectedCodes[0].rawValue;
      if (rawValue) processToken(rawValue);
    }
  };

  // 2. Handle File Upload Scan
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // Use QrScanner to read the image file
      const result = await QrScanner.scanImage(file);
      processToken(result); // result is the string text of the QR
    } catch (error) {
      console.error(error);
      setErrorMessage("No QR code found in this image. Please try another.");
      setStatus('error');
    }
  };

  // Common function to handle success from either source
  const processToken = (token) => {
    setScannedToken(token);
    setScanning(false);
    setStatus('idle');
    setErrorMessage('');
  };

  const handleConfirmAdoption = async () => {
    const user = auth.currentUser;
    if (!user) {
      setErrorMessage("You must be logged in to adopt.");
      setStatus('error');
      return;
    }

    setStatus('processing');
    setErrorMessage('');

    try {
      const result = await performAdoptionTransaction(user.uid, scannedToken);
      setStatus('success');
      setTimeout(() => {
        alert(`Congratulations! You have adopted plant ID: ${result.plantId}`);
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error.message);
    }
  };

  const resetScanner = () => {
    setScanning(true);
    setScannedToken(null);
    setStatus('idle');
    setErrorMessage('');
    if (fileInputRef.current) fileInputRef.current.value = ''; // Reset file input
  };

  return (
    <div className="min-h-screen bg-forest-base text-white flex flex-col relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-900/20 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* --- HEADER --- */}
      <div className="absolute top-0 left-0 w-full z-30 p-6 flex justify-between items-center bg-gradient-to-b from-forest-base to-transparent">
        <button 
          onClick={() => navigate(-1)} 
          className="bg-forest-surface/80 backdrop-blur-md p-2.5 rounded-xl border border-forest-border hover:bg-forest-highlight transition-colors text-forest-muted hover:text-white"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="bg-forest-surface/80 backdrop-blur-md px-4 py-2 rounded-full border border-forest-border flex items-center gap-2">
          <ScanLine size={16} className="text-forest-accent animate-pulse"/>
          <span className="text-xs font-bold uppercase tracking-widest text-white">
            {scanning ? "Active Scanner" : "Token Detected"}
          </span>
        </div>
        <div className="w-10"></div> 
      </div>

      {/* --- MAIN VIEWPORT --- */}
      <div className="flex-1 flex items-center justify-center relative z-10">
        
        {scanning ? (
          // --- SCANNING MODE (Camera + Upload) ---
          <div className="w-full h-full relative flex flex-col items-center justify-center">
            
            {/* Live Camera Background */}
            <div className="absolute inset-0 z-0">
               <Scanner
                onScan={handleCameraScan}
                onError={(err) => console.log(err)}
                components={{ audio: false, finder: false }}
                styles={{ container: { width: '100%', height: '100%' }, video: { objectFit: 'cover' } }}
              />
            </div>
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-forest-base/60 z-10">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-transparent shadow-[0_0_0_9999px_rgba(11,18,16,0.85)] rounded-3xl"></div>
            </div>

            {/* Frame & Controls */}
            <div className="relative z-20 flex flex-col items-center gap-8">
                
                {/* Scanner Frame */}
                <div className="w-72 h-72 border-2 border-forest-accent/30 rounded-3xl flex items-center justify-center relative">
                    <div className="absolute inset-0 animate-pulse bg-forest-accent/5 rounded-3xl"></div>
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-forest-accent rounded-tl-xl -mt-1 -ml-1"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-forest-accent rounded-tr-xl -mt-1 -mr-1"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-forest-accent rounded-bl-xl -mb-1 -ml-1"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-forest-accent rounded-br-xl -mb-1 -mr-1"></div>
                    <div className="w-full h-0.5 bg-forest-accent/80 shadow-[0_0_15px_#10b981] absolute top-1/2 animate-[scan_2s_ease-in-out_infinite]"></div>
                </div>

                {/* Error Toast */}
                {status === 'error' && (
                    <div className="bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-xl flex items-center gap-2 text-xs text-red-300 font-bold animate-bounce">
                    <AlertCircle size={16} /> {errorMessage}
                    </div>
                )}

                {/* File Upload Button */}
                <div>
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        accept="image/*" 
                        onChange={handleFileUpload} 
                        className="hidden" 
                    />
                    <button 
                        onClick={() => fileInputRef.current.click()}
                        className="bg-forest-surface/90 backdrop-blur-xl border border-forest-border hover:bg-forest-highlight text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg hover:scale-105"
                    >
                        <ImageIcon size={20} className="text-forest-accent" />
                        Scan from Gallery
                    </button>
                    <p className="text-center text-[10px] text-forest-muted mt-2 uppercase tracking-wide">Supports JPG, PNG</p>
                </div>
            </div>
          </div>
        ) : (
          // --- CONFIRMATION STATE (Same as before) ---
          <div className="w-full max-w-sm mx-auto px-6 animate-in zoom-in duration-300 relative z-20">
            <div className="bg-forest-surface border border-forest-border p-8 rounded-[2.5rem] shadow-2xl text-center relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-forest-accent/20 rounded-full blur-[50px] pointer-events-none"></div>
              <div className="w-20 h-20 bg-forest-base border border-forest-border rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
                <Trees size={32} className="text-forest-accent" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">Token Detected</h2>
              <div className="bg-forest-base border border-forest-accent/30 px-6 py-4 rounded-xl mb-6 mt-4 relative group overflow-hidden">
                <p className="text-[10px] text-forest-muted uppercase tracking-widest mb-1">Adoption Token</p>
                <span className="text-sm font-mono font-bold text-forest-accent tracking-wider relative z-10 break-all">{scannedToken}</span>
              </div>

              {/* Error in Confirmation Screen */}
              {status === 'error' && (
                <div className="mb-6 bg-red-500/10 border border-red-500/30 p-3 rounded-xl flex items-center gap-2 text-xs text-red-300 font-bold">
                  <AlertCircle size={16} /> {errorMessage}
                </div>
              )}
              
              <div className="space-y-3">
                <button 
                  onClick={handleConfirmAdoption}
                  disabled={status === 'processing'}
                  className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                    status === 'processing' 
                      ? 'bg-forest-muted/20 text-forest-muted cursor-not-allowed' 
                      : 'bg-forest-accent hover:bg-emerald-400 text-forest-base shadow-emerald-500/20 hover:scale-[1.02]'
                  }`}
                >
                  {status === 'processing' ? <><Loader2 size={20} className="animate-spin" /> Verifying...</> : <><CheckCircle size={20} /> Adopt Plant</>}
                </button>
                <button 
                  onClick={resetScanner}
                  disabled={status === 'processing'}
                  className="w-full bg-transparent hover:bg-forest-highlight text-forest-muted hover:text-white font-bold py-3 rounded-xl border border-forest-border transition-colors disabled:opacity-50"
                >
                  Cancel & Rescan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { top: 10%; opacity: 0; }
          50% { top: 90%; opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default AdoptPlant;
import React, { useRef } from 'react'; // <--- 1. ENSURE useRef IS IMPORTED HERE
import QRCode from 'react-qr-code'; 
// Optional icon import, if you use it in the button
import { Download } from 'lucide-react'; 

const QR_SIZE = 256; 

const QRCodeDisplay = ({ token, plantId }) => {
    // 2. CRITICAL FIX: svgRef MUST be declared here using useRef()
    const svgRef = useRef(); 
    // -------------------------------------------------------------------

    if (!token) {
        return <div className="p-4 text-center text-gray-500">Error: Missing token for QR generation.</div>;
    }

    const downloadQRCode = () => {
        const svgElement = svgRef.current;
        if (!svgElement) {
            console.error("SVG reference is missing. Cannot download.");
            // If the element isn't rendered yet, we stop.
            return; 
        }

        // --- Download Logic (Now using the Blob/SVG download method) ---
        
        // 1. Get the inner content of the QR code SVG
        const svgInnerHtml = svgElement.innerHTML;
        
        // 2. Manually construct the full, valid SVG data string with necessary headers
        const fullSvgData = `
            <svg 
                xmlns="http://www.w3.org/2000/svg"
                width="${QR_SIZE}" 
                height="${QR_SIZE}"
                viewBox="0 0 ${QR_SIZE} ${QR_SIZE}"
            >
                ${svgInnerHtml}
            </svg>
        `.trim();

        // 3. Create a Blob containing the SVG data and generate an object URL.
        // Use encodeURIComponent/unescape for robust SVG data handling
        const svgBlob = new Blob([fullSvgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        // 4. Trigger Download
        const downloadLink = document.createElement('a');
        downloadLink.download = `QR-Adoption-${plantId}.svg`; 
        downloadLink.href = url;
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        // 5. Clean up the object URL
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col items-center">
            
            {/* 3. ATTACH THE REF: The ref is attached to the parent div of the SVG element. */}
            <div 
                ref={svgRef} 
                style={{
                    position: 'absolute',
                    opacity: 0,
                    pointerEvents: 'none',
                    width: QR_SIZE,
                    height: QR_SIZE,
                    overflow: 'hidden'
                }}
            >
                {/* The QR Code MUST be rendered in the DOM for the ref to capture it. */}
                <QRCode
                    value={token}             
                    size={QR_SIZE}
                    level="H" 
                    style={{ width: QR_SIZE, height: QR_SIZE }}
                />
            </div>

            {/* The Download Button (The ONLY visible element) */}
            <button 
                onClick={downloadQRCode}
                className="mt-4 p-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
            >
                <Download size={20} /> Download QR Code ({plantId})
            </button>
        </div>
    );
};

export default QRCodeDisplay;
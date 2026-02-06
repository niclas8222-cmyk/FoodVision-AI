import React, { useRef, useState, useEffect } from 'react';

interface ImagePickerProps {
  onImageSelected: (base64: string, mimeType: string) => void;
}

const ImagePicker: React.FC<ImagePickerProps> = ({ onImageSelected }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        onImageSelected(base64, file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      setStream(mediaStream);
      setShowCamera(true);
      
      // We use a small timeout to ensure the DOM element is rendered before setting srcObject
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(err => console.error("Video play failed:", err));
        }
      }, 100);
    } catch (err) {
      console.error("Camera access error:", err);
      alert("Could not access camera. Please ensure permissions are granted.");
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    // Ensure video is actually providing data
    if (video.readyState < 2) {
      console.warn("Video not ready yet");
      return;
    }

    const canvas = document.createElement('canvas');
    // Prefer video native resolution
    const width = video.videoWidth;
    const height = video.videoHeight;

    if (width === 0 || height === 0) {
      console.error("Video dimensions are 0. Capture failed.");
      return;
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, width, height);
      
      // Convert to base64
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      const parts = dataUrl.split(',');
      if (parts.length > 1) {
        const base64 = parts[1];
        onImageSelected(base64, 'image/jpeg');
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setShowCamera(false);
  };

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      {showCamera ? (
        <div className="relative rounded-3xl overflow-hidden bg-black aspect-square md:aspect-video shadow-2xl border-4 border-white">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted
            className="w-full h-full object-cover" 
          />
          <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-6">
            <button 
              onClick={stopCamera}
              className="p-4 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/30 transition-colors"
              title="Cancel"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            
            <button 
              onClick={capturePhoto}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all group"
              title="Capture Photo"
            >
              <div className="w-16 h-16 border-4 border-orange-500 rounded-full group-hover:border-orange-600 transition-colors" />
            </button>
            
            <div className="w-12 h-12" /> {/* Spacer for symmetry */}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-4 p-12 border-2 border-dashed border-gray-300 rounded-3xl bg-white hover:border-orange-500 hover:bg-orange-50 transition-all group shadow-sm"
          >
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-900 text-lg">Upload Photo</p>
              <p className="text-sm text-gray-500">Pick from your library</p>
            </div>
          </button>

          <button 
            onClick={startCamera}
            className="flex flex-col items-center justify-center gap-4 p-12 border-2 border-dashed border-gray-300 rounded-3xl bg-white hover:border-blue-500 hover:bg-blue-50 transition-all group shadow-sm"
          >
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-900 text-lg">Take Photo</p>
              <p className="text-sm text-gray-500">Use your camera</p>
            </div>
          </button>
        </div>
      )}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept="image/*" 
        className="hidden" 
      />
    </div>
  );
};

export default ImagePicker;
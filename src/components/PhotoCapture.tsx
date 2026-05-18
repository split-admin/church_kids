import { useRef, useState, useCallback } from 'react';
import { Camera, RefreshCw, Upload, X } from 'lucide-react';

type Props = {
  onPhoto: (file: File) => void;
  currentPhotoUrl?: string;
};

export default function PhotoCapture({ onPhoto, currentPhotoUrl }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentPhotoUrl || null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.play();
      }
      setStreaming(true);
    } catch {
      alert('No se pudo acceder a la camara. Usa la opcion de subir foto.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
    setStreaming(false);
  }, [stream]);

  const capture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    canvas.toBlob(blob => {
      if (!blob) return;
      const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);
      setPreview(url);
      onPhoto(file);
      stopCamera();
    }, 'image/jpeg', 0.9);
  }, [onPhoto, stopCamera]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    onPhoto(file);
  };

  const clearPhoto = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {streaming ? (
        <div className="relative">
          <video
            ref={videoRef}
            className="w-48 h-48 object-cover rounded-full border-4 border-sky-400 shadow-lg"
            autoPlay
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="hidden" />
          <div className="flex gap-2 mt-3 justify-center">
            <button
              type="button"
              onClick={capture}
              className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg font-medium hover:bg-sky-600 transition-colors text-sm"
            >
              <Camera size={16} /> Capturar
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors text-sm"
            >
              <X size={16} /> Cancelar
            </button>
          </div>
        </div>
      ) : preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Foto del nino"
            className="w-48 h-48 object-cover rounded-full border-4 border-sky-400 shadow-lg"
          />
          <button
            type="button"
            onClick={clearPhoto}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
          >
            <X size={14} />
          </button>
          <button
            type="button"
            onClick={startCamera}
            className="flex items-center gap-2 mt-3 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors text-sm mx-auto"
          >
            <RefreshCw size={14} /> Cambiar foto
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-48 h-48 rounded-full border-4 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
            <Camera size={48} className="text-gray-300" />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={startCamera}
              className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg font-medium hover:bg-sky-600 transition-colors text-sm"
            >
              <Camera size={16} /> Usar camara
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors text-sm"
            >
              <Upload size={16} /> Subir foto
            </button>
          </div>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

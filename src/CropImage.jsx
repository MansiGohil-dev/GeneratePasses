import { useCallback, useState } from 'react';
import Cropper from 'react-easy-crop';

function getCroppedImg(imageSrc, croppedAreaPixels) {
  return new Promise((resolve) => {
    const image = new window.Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );
      resolve(canvas.toDataURL('image/jpeg'));
    };
  });
}

const CropImage = ({ imageSrc, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const handleCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleDone = async () => {
    if (croppedAreaPixels) {
      const croppedImg = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedImg);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: 400, background: '#222' }}>
      <Cropper
        image={imageSrc}
        crop={crop}
        zoom={zoom}
        aspect={1.875} // Old, for reference
        // The pass image box is 0.45w x 0.24h, so aspect = 0.45/0.24 = 1.875
        // This is already correct, but let's clarify and ensure it's always synced with the pass box
        // If you ever change the pass box, update this value too.
        // aspect={0.45/0.24} // which is 1.875
        onCropChange={setCrop}
        onZoomChange={setZoom}
        onCropComplete={handleCropComplete}
      />
      <div style={{ position: 'absolute', bottom: 10, left: 0, width: '100%', display: 'flex', justifyContent: 'center', gap: 16 }}>
        <button onClick={handleDone} style={{ padding: '8px 16px' }}>Done</button>
        <button onClick={onCancel} style={{ padding: '8px 16px' }}>Cancel</button>
      </div>
    </div>
  );
};

export default CropImage;
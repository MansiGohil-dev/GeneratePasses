
import { useState, useRef, useEffect } from 'react';
import CropImage from './CropImage';
import './App.css';

function App() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [userName, setUserName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCrop, setShowCrop] = useState(false);
  const [rawImage, setRawImage] = useState(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setRawImage(e.target.result);
        setShowCrop(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImg) => {
    setUploadedImage(croppedImg);
    setShowCrop(false);
  };

  const handleCropCancel = () => {
    setShowCrop(false);
  };

  const generatePass = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    setIsGenerating(true);
    const templateImg = new Image();
    templateImg.crossOrigin = 'anonymous';
    templateImg.onload = () => {
      try {
        canvas.width = templateImg.width;
        canvas.height = templateImg.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(templateImg, 0, 0);

        if (uploadedImage) {
          const userImg = new Image();
          userImg.crossOrigin = 'anonymous';
          userImg.onload = () => {
            try {
              const imageBoxX = canvas.width * 0.275;
              const imageBoxY = canvas.height * 0.292;
              const imageBoxWidth = canvas.width * 0.45;
              const imageBoxHeight = canvas.height * 0.24;
              const margin = canvas.width * 0.01;
              ctx.drawImage(
                userImg,
                imageBoxX + margin,
                imageBoxY + margin,
                imageBoxWidth - 2 * margin,
                imageBoxHeight - 2 * margin
              );

              if (userName.trim()) {
                const nameBoxX = canvas.width * 0.25;
                const nameBoxY = canvas.height * 0.575;
                const nameBoxWidth = canvas.width * 0.5;
                const nameBoxHeight = canvas.height * 0.055;
                ctx.save();
                ctx.fillStyle = '#000';
                ctx.font = `${Math.floor(nameBoxHeight * 0.55)}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const nameTextX = nameBoxX + nameBoxWidth / 2;
                const verticalOffset = nameBoxHeight * 0.22; // Move text lower
                const nameTextY = nameBoxY + nameBoxHeight / 2 + verticalOffset; // Lowered a bit
                ctx.fillText(userName.toUpperCase(), nameTextX, nameTextY, nameBoxWidth * 0.92);
                ctx.restore();
              }
              setIsGenerating(false);
            } catch (error) {
              console.error('Error drawing user image:', error);
              setIsGenerating(false);
            }
          };
          userImg.onerror = () => {
            console.error('Failed to load user image');
            setIsGenerating(false);
          };
          userImg.src = uploadedImage;
        } else if (userName.trim()) {
          const nameBoxX = canvas.width * 0.25;
          const nameBoxY = canvas.height * 0.575;
          const nameBoxWidth = canvas.width * 0.5;
          const nameBoxHeight = canvas.height * 0.055;
          ctx.save();
          ctx.fillStyle = '#000';
          ctx.font = `${Math.floor(nameBoxHeight * 0.55)}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const nameTextX = nameBoxX + nameBoxWidth / 2;
          const verticalOffset = nameBoxHeight * 0.22; // Move text lower
          const nameTextY = nameBoxY + nameBoxHeight / 2 + verticalOffset; // Lowered a bit
          ctx.fillText(userName.toUpperCase(), nameTextX, nameTextY, nameBoxWidth * 0.92);
          ctx.restore();
          setIsGenerating(false);
        } else {
          // Initial state: only template image, no text
          setIsGenerating(false);
        }
      } catch (error) {
        console.error('Error drawing template:', error);
        setIsGenerating(false);
      }
    };
    templateImg.onerror = () => {
      console.error('Failed to load template image');
      alert('Failed to load template image. Please check if pass-template.jpg exists in the public folder.');
      setIsGenerating(false);
    };
    templateImg.src = '/pass-template.jpg';
  };

  const updateNamePreview = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (canvas && userName) {
      const templateImg = new Image();
      templateImg.crossOrigin = 'anonymous';
      templateImg.onload = () => {
        canvas.width = templateImg.width;
        canvas.height = templateImg.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(templateImg, 0, 0);
        const nameBoxX = canvas.width * 0.25;
        const nameBoxY = canvas.height * 0.575;
        const nameBoxWidth = canvas.width * 0.5;
        const nameBoxHeight = canvas.height * 0.055;
        ctx.save();
        ctx.fillStyle = '#000';
        ctx.font = `${Math.floor(nameBoxHeight * 0.55)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const nameTextX = nameBoxX + nameBoxWidth / 2;
        const verticalOffset = nameBoxHeight * 0.22; // Move text lower
        const nameTextY = nameBoxY + nameBoxHeight / 2 + verticalOffset; // Lowered a bit
        ctx.fillText(userName.toUpperCase(), nameTextX, nameTextY, nameBoxWidth * 0.92);
        ctx.restore();
      };
      templateImg.src = '/pass-template.jpg';
    }
  };

  const downloadPass = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `${userName.replace(/\s+/g, '_')}_pass.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  useEffect(() => {
    if (uploadedImage || userName) {
      generatePass();
    }
  }, [uploadedImage, userName]);

  useEffect(() => {
    if (userName && !uploadedImage) {
      updateNamePreview(); // Update text preview without white bg while typing
    } else if (!userName && !uploadedImage) {
      generatePass(); // Reset to template if name is cleared
    }
  }, [userName, uploadedImage]);

  return (
    <div className="app">
      <div className="main-layout">
        <div className="form-side">
          <h1>Pass Generator</h1>
          <div className="upload-section">
            <div 
              className="image-upload-area"
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadedImage ? (
                <img src={uploadedImage} alt="Uploaded" className="uploaded-image" />
              ) : (
                <div className="upload-placeholder">
                  <div className="upload-icon">📷</div>
                  <p>Click to upload your photo</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </div>
          <div className="name-section">
            <input
              type="text"
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="name-input"
            />
          </div>
          <div className="action-buttons">
            {/* <button 
              onClick={generatePass}
              disabled={isGenerating || !uploadedImage || !userName.trim()}
              className="generate-btn"
            >
              {isGenerating ? 'Generating...' : 'Generate Pass'}
            </button> */}
            <button 
              onClick={downloadPass}
              disabled={isGenerating || !uploadedImage || !userName.trim()}
              className="download-btn"
            >
              Download Pass
            </button>
          </div>
        </div>
        <div className="preview-side" style={{ position: 'relative' }}>
          <canvas 
            ref={canvasRef} 
            className="pass-canvas"
            style={{ 
              display: 'block',
              maxWidth: '100%',
              height: 'auto',
              marginTop: '20px',
              border: '2px solid #ddd',
              borderRadius: '10px',
              background: '#fff',
              zIndex: 1,
            }}
          />
        </div>
      </div>
      {showCrop && rawImage && (
        <div className="cropper-modal-overlay">
          <div className="cropper-modal-content">
            <CropImage imageSrc={rawImage} onCropComplete={handleCropComplete} onCancel={handleCropCancel} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
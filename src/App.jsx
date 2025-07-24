import { useState, useRef } from 'react'
import './App.css'

function App() {
  const [uploadedImage, setUploadedImage] = useState(null)
  const [userName, setUserName] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const generatePass = () => {
    if (!uploadedImage || !userName.trim()) {
      alert('Please upload an image and enter your name')
      return
    }

    setIsGenerating(true)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    // Load the template image first
    const templateImg = new Image()
    templateImg.crossOrigin = 'anonymous' // Handle CORS issues
    templateImg.onload = () => {
      try {
        // Set canvas size to match template image
        canvas.width = templateImg.width
        canvas.height = templateImg.height
        
        // Clear canvas first
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        
        // Draw the template image as background
        ctx.drawImage(templateImg, 0, 0)
        
        // Load and draw user image
        const userImg = new Image()
        userImg.crossOrigin = 'anonymous' // Handle CORS issues
        userImg.onload = () => {
          try {
            // Make the user image a little smaller
            const imageBoxX = canvas.width * 0.275; // More inset from blue border
            const imageBoxY = canvas.height * 0.292; // Move UP slightly
            const imageBoxWidth = canvas.width * 0.45; // Smaller width
            const imageBoxHeight = canvas.height * 0.24; // Smaller height

            // Draw user image INSIDE the blue box (preserving blue border)
            ctx.drawImage(userImg, imageBoxX, imageBoxY, imageBoxWidth, imageBoxHeight);

            // Position for the small white box - MOVE UP SLIGHTLY for perfect fit
            const nameBoxX = canvas.width * 0.25; // Slightly inset from white box border
            const nameBoxY = canvas.height * 0.592 // Move UP (was 0.61)
            const nameBoxWidth = canvas.width * 0.5 // Slightly smaller to fit within white box
            const nameBoxHeight = canvas.height * 0.055 // Slightly smaller to fit within white box
            
            // Add the name text with better visibility in the white box
            ctx.fillStyle = '#000000'; // Black text
            ctx.font = 'bold 32px Arial'; // Much larger font for better visibility
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Add text shadow for better visibility
            ctx.shadowColor = 'rgba(255, 255, 255, 0.7)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;

            const nameTextX = nameBoxX + nameBoxWidth / 2;
            const nameTextY = nameBoxY + nameBoxHeight / 2;
            ctx.fillText(userName.toUpperCase(), nameTextX, nameTextY);

            // Reset shadow settings
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            
            setIsGenerating(false)
          } catch (error) {
            console.error('Error drawing user image:', error)
            setIsGenerating(false)
          }
        }
        userImg.onerror = () => {
          console.error('Failed to load user image')
          setIsGenerating(false)
        }
        userImg.src = uploadedImage
      } catch (error) {
        console.error('Error drawing template:', error)
        setIsGenerating(false)
      }
    }
    templateImg.onerror = () => {
      console.error('Failed to load template image')
      alert('Failed to load template image. Please check if pass-template.jpg exists in the public folder.')
      setIsGenerating(false)
    }
    templateImg.src = '/pass-template.jpg'
  }

  const downloadPass = () => {
    const canvas = canvasRef.current
    const link = document.createElement('a')
    link.download = `${userName.replace(/\s+/g, '_')}_pass.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <div className="app">
      <div className="container">
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
          <button 
            onClick={generatePass}
            disabled={isGenerating || !uploadedImage || !userName.trim()}
            className="generate-btn"
          >
            {isGenerating ? 'Generating...' : 'Generate Pass'}
          </button>
          
          <button 
            onClick={downloadPass}
            disabled={isGenerating || !uploadedImage || !userName.trim()}
            className="download-btn"
          >
            Download Pass
          </button>
        </div>
        
        <canvas 
          ref={canvasRef} 
          className="pass-canvas"
          style={{ 
            display: 'block',
            maxWidth: '100%',
            height: 'auto',
            marginTop: '20px',
            border: '2px solid #ddd',
            borderRadius: '10px'
          }}
        />
      </div>
    </div>
  )
}

export default App

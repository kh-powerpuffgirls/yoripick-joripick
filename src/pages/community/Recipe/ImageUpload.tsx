// ImageUpload.jsx
import React, { useState } from 'react';
import './ImageUpload.css';

const ImageUpload = () => {
  const [fileName, setFileName] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
    } else {
      setFileName('');
    }
  };

  return (
    <div>
      <label className="image-upload">
        <span className="plus-button">+</span>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          hidden
        />
      </label>

      {fileName && <div className="filename">{fileName}</div>}
    </div>
  );
};

export default ImageUpload;

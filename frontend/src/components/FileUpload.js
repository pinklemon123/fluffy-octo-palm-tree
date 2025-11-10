import React, { useState } from 'react';
import { uploadFile } from '../services/api';

function FileUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (file) {
      setUploading(true);
      const result = await uploadFile(file);
      setUploading(false);
      if (result.success) {
        alert("File uploaded successfully");
      } else {
        alert("File upload failed");
      }
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
}

export default FileUpload;
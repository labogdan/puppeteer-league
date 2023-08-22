import React, { useState, useEffect } from 'react';
import Button from "react-bootstrap/Button";

const DownloadButton = (props:any) => {
    const [fileExists, setFileExists] = useState(false);
    const {filename, text} = props;
    
    const downloadFile = () => {
        const link = document.createElement('a');
        link.href = `/download?filename=${filename}`;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    useEffect(() => {
        async function checkFileExists() {
          try {
            const response = await fetch(`/check-file-exists?filename=${filename}`);
            const data = await response.json();
            setFileExists(data.exists);
          } catch (error) {
            console.error('Error checking file existence:', error);
          }
        }
        
        checkFileExists();
      }, [filename]);

    return (
        <>
        {fileExists ? (
            <Button variant="primary" onClick={() => downloadFile()}>{text}</Button>
          ) : (
            <p>File not yet available for download.</p>
          )}
        
        </>
    );
    
  }

  export default DownloadButton;
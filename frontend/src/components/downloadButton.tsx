import React, { useState, useEffect } from 'react';
import Button from "react-bootstrap/Button";

interface Props {
  filename: string;
  text: string;
  fileExists: boolean;
}

const DownloadButton = ({ filename, text, fileExists }: Props) => {
    
    const downloadFile = () => {
        const link = document.createElement('a');
        link.href = `/download?filename=${filename}`;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

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
import React, { useState, useEffect } from 'react';
import Button from "react-bootstrap/Button";

interface Props {
  filename: string;
  text: string;
  fileExists: boolean;
  deleteSuccess: Function;
}

const DeleteButton = ({ filename, text, fileExists, deleteSuccess }: Props) => {
  
  const deleteFile = () => {
    console.log('deleteFile'  + filename);
    fetch(`/delete?filename=${filename}`)
    .then(response => {
      if (response.ok) {
        console.log('File deleted successfully');
        deleteSuccess();
      } else {
        console.error('Error deleting file');
      }
    })
    .catch(error => {
      console.error('Error deleting file:', error);
    });
  }

  return (
    <>
      {fileExists ? (
        <Button variant="secondary" onClick={() => deleteFile()}>{text}</Button>
      ) : null}
    </>
  );
}
export default DeleteButton;


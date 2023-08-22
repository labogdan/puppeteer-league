import React, { useState, useEffect } from 'react';
import socketIOClient from 'socket.io-client';

import Container from 'react-bootstrap/Container';
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../fontAwesome';

const ScrapeModule = () => {

  const [updates, setUpdates] = useState<any[]>([]);
  const socket = socketIOClient('http://localhost:8080');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8080/api/kansasyouthsoccer');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const json = await response.json();
      setData(json);
      setUpdates(json.updates);
    } catch (err) {
      //setError(err);
    }

    setLoading(false);
  };

  const fetchData1 = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/data');
      const data = await response.json();
      //setUpdates(data.updates);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {

    fetchData1();
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('update', (update) => {
      setUpdates((update: any) => [...updates, update]);
      fetchData();
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

    return (
        <>
          <Container className="py-3 px-3">
            <h1>Scrape Module</h1>
            <Button onClick={fetchData} disabled={loading} variant="primary">{loading ? 'Loading...' : 'Scrape'}</Button>
            <div>
              <FontAwesomeIcon icon="star" size="3x" />
            </div>
            <h1>Updates:</h1>
      <ul>
        {updates.map((update, index) => (
          <li key={index}>{update}</li>
        ))}
      </ul>
          </Container>
        </>
    )
}

export default ScrapeModule;
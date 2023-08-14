import React, { useState } from 'react';

import Container from 'react-bootstrap/Container';
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './fontAwesome';

const ScrapeModule = () => {

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
    } catch (err) {
      //setError(err);
    }

    setLoading(false);
  };

    return (
        <>
          <Container className="py-3 px-3">
            <h1>Scrape Module</h1>
            <Button onClick={fetchData} disabled={loading} variant="primary">{loading ? 'Loading...' : 'Scrape'}</Button>
            <div>
              <FontAwesomeIcon icon="star" size="3x" />
            </div>
          </Container>
        </>
    )
}

export default ScrapeModule;
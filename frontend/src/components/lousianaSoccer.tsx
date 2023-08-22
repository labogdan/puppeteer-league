import React, { useState, useEffect } from 'react';
import DownloadButton from './downloadButton';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Stack from 'react-bootstrap/Stack';
import ProgressBar from 'react-bootstrap/ProgressBar';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../fontAwesome';

function LousianaSoccer() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState([]);
  const [socket, setSocket] = useState(null);
  const [numbers, setNumbers] = useState(['']);
  const [progress, setProgress] = useState(0);  

  const handleNumberChange = (index:number, value:string) => {
    const newNumbers = [...numbers];
    newNumbers[index] = value;
    setNumbers(newNumbers);
  };

  const handleAddNumber = () => {
    setNumbers([...numbers, '']);
  };

  const handleRemoveNumber = (index:number) => {
    const newNumbers = numbers.filter((_, i) => i !== index);
    setNumbers(newNumbers);
  };

  useEffect(() => {
    const newSocket = new WebSocket('ws://localhost:8080');
    newSocket.onopen = () => {
      console.log('WebSocket connection opened');
    };
    newSocket.onmessage = (event) => {
      console.log('WebSocket message received:', event);
      
      //event.data.text().then(txt=>setResponse(txt))
      if (event.data.includes('percentComplete')) {
        let percentage = event.data.split(':')[1];
        setProgress(percentage);
      } else {
        // @ts-ignore
        setResponse(prevUpdates => [...prevUpdates, event.data]);
      }
    };
    newSocket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    // @ts-ignore
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const sendMessage = (newMessage:any) => {
    // @ts-ignore
    if (socket && socket.readyState === WebSocket.OPEN) {
      // @ts-ignore
      socket.send(newMessage);
    }
  };

  return (
    <Container className='mt-3'>
    <div>
      <h3>Louisiana Soccer</h3>
      <ProgressBar animated now={progress} />
      <div style={{ maxWidth: '900px', margin: '10px auto'}}></div>
        <Row className="mb-3">
          <Col xs={6}>
          {numbers.map((number, index) => (
          <Row key={index} className="mb-3">
            <Col xs={9}>
              <Form.Control
                type="number"
                value={number}
                onChange={(e) => handleNumberChange(index, e.target.value)}
              />
            </Col>
            <Col xs={3}>
              <Button variant="outline-danger" onClick={() => handleRemoveNumber(index)}>
                Remove
              </Button>
            </Col>
          </Row>
        ))}
        <Row>
          <Col xs={9}>
            <Button variant="outline-primary" onClick={handleAddNumber}>Add Number</Button>
          </Col>
          <Col xs={3}>
            <Button onClick={() => sendMessage(`playlousianasoccer:${numbers}`)} variant="primary">Scrape</Button>
          </Col>
        </Row>
          </Col>
          <Col xs={6}>
            <Stack gap={3}>
              <h5>Response: </h5>
              {response && response.map((item:string, index) => {
                return <div className={item.indexOf('Scrape Complete!') !== -1 ? 'p-2 bg-success text-light border': 'p-2 bg-light border' } key={index}>{item}</div>
              })}
            </Stack>
          </Col>
        </Row>
        
      <DownloadButton filename="playlouisianasoccer-urls.csv" text="Download CSV" />
    </div>
    </Container>
  );
}

export default LousianaSoccer;
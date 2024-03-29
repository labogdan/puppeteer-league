import React, { useState, useEffect } from 'react';
import DownloadButton from './downloadButton';
import DeleteButton from './deleteButton';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Stack from 'react-bootstrap/Stack';
import ProgressBar from 'react-bootstrap/ProgressBar';

interface GoogleMapScraperProps {
  scrapeName: string;
  title: string;
}

const GoogleMapScraper: React.FC<GoogleMapScraperProps> = ({ scrapeName, title }) => {
  const [response, setResponse] = useState([]);
  const [socket, setSocket] = useState(null);
  const [numbers, setNumbers] = useState(['']);
  const [progress, setProgress] = useState(0);  
  const [fileExists, setFileExists] = useState(false);
  const [fileExistsFinal, setFileExistsFinal] = useState(false);
  const [dynamicClass, setDynamicClass] = useState('p-2 border');

  const { protocol, hostname, port } = window.location;
  
  const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${wsProtocol}//${hostname}:${port}`;
  const newSocket = new WebSocket(wsUrl);
  

  async function checkFileExists() {
    try {
      const response = await fetch(`/check-file-exists?filename=${scrapeName + "-urls.csv"}`);
      const data = await response.json();
      setFileExists(data.exists);
    } catch (error) {
      console.error('Error checking file existence:', error);
    }
  }

  async function checkFileExistsFinal() {
    try {
      const response = await fetch(`/check-file-exists?filename=${scrapeName + "-urls.csv"}`);
      const data = await response.json();
      setFileExistsFinal(data.exists);
    } catch (error) {
      console.error('Error checking file existence:', error);
    }
  }

  async function resetAll() {
    setProgress(0);
    setResponse([]);
  }

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
    
    checkFileExists();
    checkFileExistsFinal();
    
    newSocket.onopen = () => {
      console.log('WebSocket connection opened');
    };
    newSocket.onmessage = (event) => {
      console.log('WebSocket message received:', event.data);
      
      //event.data.text().then(txt=>setResponse(txt))
      if (event.data.includes('percentComplete')) {
        let percentage = event.data.split(':')[1];
        setProgress(percentage);
        if (percentage === '100') {
          checkFileExists();
          checkFileExistsFinal();
          setDynamicClass('p-2 border bg-success text-white');
        }
      } else if (event.data.includes('error')) {
        setDynamicClass('p-2 border bg-danger text-white');
        // @ts-ignore
        setResponse(prevUpdates => [...prevUpdates, event.data]);
        throw new Error(event.data);

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
      <h3>{title}</h3>
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
            <Button onClick={() => sendMessage(`${scrapeName}:${numbers}`)} variant="primary">Scrape</Button>
          </Col>
        </Row>
          </Col>
          <Col xs={6}>
            <Stack gap={3}>
              <h5>Response: </h5>
              {response && response.map((item:string, index) => {
                return <div className={item.indexOf('Scrape Complete!') !== -1 || item.indexOf('error') != -1 ? dynamicClass: 'p-2 border' } key={index}>{item}</div>
              })}
            </Stack>
          </Col>
        </Row>
        
        <Row className="mb-3">
          <Col>
            <DownloadButton filename={scrapeName + "-urls.csv"} text="Download CSV 1" fileExists={fileExists}/>
          </Col>
          <Col>
            <DeleteButton filename={scrapeName + "-urls.csv"} text="Delete CSV" fileExists={fileExists} deleteSuccess={checkFileExists} />
          </Col>
          <Col>
            <Button onClick={() => sendMessage(`${scrapeName}-clubs:${numbers}`)} variant="primary">Scrape</Button>
          </Col>
          <Col>
            <DownloadButton filename={scrapeName + "-clubs.csv"} text="Download CSV Final" fileExists={fileExistsFinal}/>
          </Col>
        </Row>
      
    </div>
    </Container>
  );
}

export default GoogleMapScraper;
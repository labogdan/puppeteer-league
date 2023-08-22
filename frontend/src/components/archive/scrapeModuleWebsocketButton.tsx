import React, { useState, useEffect } from 'react';

function ScrapeModuleWebsocketButton() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = new WebSocket('ws://localhost:8080');
    newSocket.onopen = () => {
      console.log('WebSocket connection opened');
    };
    newSocket.onmessage = (event) => {
      console.log('WebSocket message received:', event);
      // @ts-ignore
      event.data.text().then(txt=>setResponse(txt))
      //setResponse(event.data);
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
    <div>
      <h1>WebSocket Example without socket.io</h1>
      <div>
        <button onClick={() => sendMessage('Hello from Button 1')}>
          Send Message 1
        </button>
        <button onClick={() => sendMessage('Greetings from Button 2')}>
          Send Message 2
        </button>
        <button onClick={() => sendMessage('Hi from Button 3')}>
          Send Message 3
        </button>
      </div>
      {response && <p>Server Response: {response}</p>}
    </div>
  );
}

export default ScrapeModuleWebsocketButton;
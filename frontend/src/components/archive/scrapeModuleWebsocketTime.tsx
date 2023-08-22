import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";
const ENDPOINT = "http://localhost:8080";

function ScrapeModuleWebsocket() {
  const [response, setResponse] = useState("");

  

  const sendMessage = (message:any) => {
    const socket = socketIOClient('http://localhost:8080');
    socket.emit('messageFromClient', message);
  };

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    socket.on("FromAPI", data => {
      console.log(data);
      setResponse(data);
    });

    socket.on("messageFromServer", data => {
      setResponse(data);
    });

    //sendMessage('Hello from client');

  }, []);

  return (
    <>
    <p>
      It's <time dateTime={response}>{response}</time>
    </p>
    <button onClick={() => sendMessage('Hello from client')}>Send message</button>
    </>
  );
}

export default ScrapeModuleWebsocket;
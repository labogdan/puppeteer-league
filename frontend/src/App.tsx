import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Header from './header';
import ScrapeWithButton from './components/googleMapFormScrape';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Header />}>
            <Route index element={<Index />} />
            <Route path="soccerScrape" element={
              <ScrapeWithButton 
                scrapeName="playlouisianasoccer"
                title="Louisiana Soccer" 
              />} 
            />
          </Route>
        </Routes>
      </Router>
      <ScrapeWithButton
        scrapeName="playlouisianasoccer"
        title="Louisiana Soccer"
       />
    </>
  );
}

export default App;

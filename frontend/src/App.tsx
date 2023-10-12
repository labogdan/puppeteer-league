import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Header from './header';
import ScrapeWithButton from './components/googleMapFormScrape';
import SimpleScrape from './components/simpleScrape';
import MainMenu from './components/mainMenu';

function App() {
  return (
    <>
    <Header />
      <Router>
        <Routes>
          <Route path="soccerScraper" element={
              <ScrapeWithButton 
                scrapeName="playlouisianasoccer"
                title="Louisiana Soccer" 
              /> }>
          </Route>
          <Route path="alaskaSoccer" element={
              <SimpleScrape 
                scrapeName="alaskayouthsoccer"
                title="Alaska Soccer" 
              /> }>
          </Route>
          <Route path="/" element={
              <MainMenu/> 
            }>
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;

import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Header from './header';
import ScrapeWithButton from './components/googleMapFormScrape';

function App() {
  return (
    <>
      <Header />
      <ScrapeWithButton
        scrapeName="playlouisianasoccer"
        title="Louisiana Soccer"
       />
    </>
  );
}

export default App;

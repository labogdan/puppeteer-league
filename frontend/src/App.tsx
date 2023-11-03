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
          <Route path="azSoccer" element={
              <SimpleScrape 
                scrapeName="azsoccerassociation"
                title="Arizona Soccer" 
              /> }>
          </Route>
          <Route path="coloradoSoccer" element={
              <SimpleScrape 
                scrapeName="coloradosoccer"
                title="Colorado Soccer" 
              /> }>
          </Route>
          <Route path="ecnlSoccer" element={
              <SimpleScrape 
                scrapeName="ecnlboys"
                title="ECNL Soccer" 
              /> }>
          </Route>
          <Route path="girlsacademyleague" element={
            <SimpleScrape
            scrapeName='girlsacademyleague'
            title='Girls Academy League'
            />
          }>
          </Route>
          <Route path="hawaiisoccer" element={
            <SimpleScrape
            scrapeName='hawaiisoccer'
            title='Hawaii Soccer'
            />
          }>
          </Route>
          <Route path="kansasyouthsoccer" element={
            <SimpleScrape
            scrapeName='kansasyouthsoccer'
            title='Kansas Soccer'
            />
          }>
          </Route>
          <Route path="kysoccer" element={
            <SimpleScrape
            scrapeName='kysoccer'
            title='Kentucky Soccer'
            />
          }>
          </Route>
          <Route path="missourisoccer" element={
            <SimpleScrape
            scrapeName='missourisoccer'
            title='Missouri Soccer'
            />
          }>
          </Route>
          <Route path="mlssoccer" element={
            <SimpleScrape
            scrapeName='mlssoccer'
            title='MLS Next Soccer'
            />
          }>
          </Route>
          <Route path="mnyouthsoccer" element={
            <SimpleScrape
            scrapeName='mnyouthsoccer'
            title='Minnesota Youth Soccer'
            />
          }>
          </Route>
          <Route path="montanayouthsoccer" element={
            <SimpleScrape
            scrapeName='montanayouthsoccer'
            title='Montana Youth Soccer'
            />
          }>
          </Route>
          <Route path="nebraskastatesoccer" element={
            <SimpleScrape
            scrapeName='nebraskastatesoccer'
            title='Nebraska State Soccer'
            />
          }>
          </Route>
          <Route path="nevadayouthsoccer" element={
            <SimpleScrape
            scrapeName='nevadayouthsoccer'
            title='Nevada Youth Soccer'
            />
          }>
          </Route>
          <Route path="ntxsoccer" element={
            <SimpleScrape
            scrapeName='ntxsoccer'
            title='North Texas Soccer'
            />
          }>
          </Route>
          <Route path="nyswysa" element={
            <SimpleScrape
            scrapeName='nyswysa'
            title='North Texas Soccer'
            />
          }>
          </Route>
          <Route path="ohiosoccer" element={
            <SimpleScrape
            scrapeName='ohiosoccer'
            title='Ohio Soccer'
            />
          }>
          </Route>
          <Route path="soccerindiana" element={
            <SimpleScrape
            scrapeName='soccerindiana'
            title='Soccer Indiana'
            />
          }>
          </Route>
          <Route path="soccermaine" element={
            <SimpleScrape
            scrapeName='soccermaine'
            title='Soccer Maine'
            />
          }>
          </Route>
          <Route path="upslsoccer" element={
            <SimpleScrape
            scrapeName='upslsoccer'
            title='UPSL Soccer'
            />
          }>
          </Route>
          <Route path="sylsoccerconnect" element={
              <SimpleScrape
                scrapeName="sylsoccerconnect"
                title="SYLSoccerConnect"
              />
            }>
          </Route>
          <Route path="uslwleague" element={
              <SimpleScrape
                scrapeName="uslwleague"
                title="USL League 2"
              />
            }>
          </Route>
          <Route path="ushl" element={
              <SimpleScrape
                scrapeName="ushl"
                title="USHL"
              />
            }>
          </Route>
          <Route path="nahl" element={
              <SimpleScrape
                scrapeName="nahl"
                title="NAHL"
              />
            }>
          </Route>
          <Route path="nahl-final" element={
              <SimpleScrape
                scrapeName="nahl-final"
                title="NAHL Final"
              />
            }>
          </Route>
          <Route path="nahl3" element={
              <SimpleScrape
                scrapeName="nahl3"
                title="NAHL3"
              />
            }>
          </Route>
          <Route path="nahl3-final" element={
              <SimpleScrape
                scrapeName="nahl3-final"
                title="NAHL3 Final"
              />
            }>
          </Route>
          <Route path="arkansassoccer" element={
              <ScrapeWithButton
                scrapeName="arkansassoccer"
                title="Arkansas Soccer"
              />
            }>
          </Route>
          <Route path="floridayouthsoccer" element={
              <ScrapeWithButton
                scrapeName="floridayouthsoccer"
                title="Florida Youth Soccer"
              />
            }>
          </Route>
          <Route path="marylandyouthsoccer" element={
              <ScrapeWithButton
                scrapeName="marylandyouthsoccer"
                title="Maryland Youth Soccer"
              />
            }>
          </Route>
          <Route path="ncsoccer" element={
              <ScrapeWithButton
                scrapeName="ncsoccer"
                title="North Carolina Soccer"
              />
            }>
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

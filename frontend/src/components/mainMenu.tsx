import React, { useState } from "react";

import Container from 'react-bootstrap/Container';
import { Row, Col } from "react-bootstrap";
import { Link } from 'react-router-dom';

const MainMenu = () => {

  const stateLinks = [
    { name: 'Alaska Youth Soccer', path: 'alaskaSoccer' },
    { name: 'Arizona Youth Soccer', path: 'azSoccer' },
    { name: 'Colorado Soccer', path: 'coloradoSoccer' },
    { name: 'ECNL', path: 'ecnlSoccer' },
    { name: 'Girls Academy League', path: 'girlsacademyleague' },
    { name: 'Hawaii Soccer', path: 'hawaiisoccer' },
    { name: 'Kansas Youth Soccer', path: 'kansasyouthsoccer' },
    { name: 'Kentucky Soccer', path: 'kysoccer' },
    { name: 'Missouri Soccer', path: 'missourisoccer' },
    { name: 'MLS Next Soccer', path: 'mlssoccer' },
    { name: 'Minnesota Youth Soccer', path: 'mnyouthsoccer' },
    { name: 'Montana Youth Soccer', path: 'montanayouthsoccer' },
    { name: 'Nebraska State Soccer', path: 'nebraskastatesoccer' },
    { name: 'Nevada Youth Soccer', path: 'nevadayouthsoccer' },
    { name: 'North Texas Soccer', path: 'ntxsoccer' },
    { name: 'New York State West', path: 'nyswysa' },
    { name: 'Ohio Soccer', path: 'ohiosoccer' },
    { name: 'Indiana Soccer', path: 'soccerindiana' },
    { name: 'Maine Soccer', path: 'soccermaine' },
    { name: 'UPSL Soccer', path: 'upslsoccer' },
    { name: 'Super Y League Soccer', path: 'sylsoccerconnect' },
    { name: 'USL W League Soccer', path: 'uslwleague' },
    { name: 'USHL', path: 'ushl' },
    { name: 'NAHL', path: 'nahl' },
    { name: 'NAHL 3', path: 'nahl3' },
    { name: 'Arkansas Soccer', path: 'arkansassoccer' },
    { name: 'Florida Youth Soccer', path: 'floridayouthsoccer' },
    { name: 'Maryland Youth Soccer', path: 'marylandyouthsoccer' },
    { name: 'NC Soccer', path: 'ncsoccer' },
  ];

    return (
      <Container className="my-5" style={{ maxWidth: '1200px' }}>
      <Row>
        {stateLinks.map((state, index) => (
          <Col key={index} sm={4} className="mb-3">
            <Link to={`${state.path}`} className="btn btn-primary btn-block">
              {state.name}
            </Link>
          </Col>
        ))}
      </Row>
    </Container>
    )
}

export default MainMenu

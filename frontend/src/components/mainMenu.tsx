import React, { useState } from "react";

import Container from 'react-bootstrap/Container';
import { Row, Col } from "react-bootstrap";
import { Link } from 'react-router-dom';

const MainMenu = () => {

  const stateLinks = [
    { name: 'Alaska', path: 'alaskaSoccer' },
    { name: 'Arizona', path: 'azSoccer' },
    { name: 'Colorado', path: 'coloradoSoccer' },
    { name: 'ECNL', path: 'ecnlSoccer' },
    { name: 'Girls Academy League', path: 'girlsacademyleague' },
    { name: 'Hawaii', path: 'hawaiisoccer' },
    { name: 'Kansas', path: 'kansasyouthsoccer' },
    { name: 'Kentucky', path: 'kysoccer' },
    { name: 'Missouri', path: 'missourisoccer' },
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

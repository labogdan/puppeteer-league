import React, { useState } from "react";

import Container from 'react-bootstrap/Container';
import { Row, Col } from "react-bootstrap";
import { Link } from 'react-router-dom';

const MainMenu = () => {

  const stateLinks = [
    { name: 'Alaska', path: 'alaskaSoccer' },
    { name: 'Arizona', path: 'azSoccer' },

  ];

    return (
      <Container className="my-5" style={{ maxWidth: '1200px' }}>
      <Row>
        {stateLinks.map((state, index) => (
          <Col key={index} sm={4} className="mb-3">
            <Link to={`${state.path}`} className="btn btn-primary btn-block">
              {state.name} Soccer
            </Link>
          </Col>
        ))}
      </Row>
    </Container>
    )
}

export default MainMenu

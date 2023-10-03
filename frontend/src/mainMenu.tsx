import React from "react";

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from "react-bootstrap/Button";

const Header = () => {
    return (
        <Navbar bg="dark" variant="dark" expand="lg" className="py-3 px-3">
        <Navbar.Brand href="#">Scraper App</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto">
            <Nav.Link href="#">Help</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    )
}

export default Header

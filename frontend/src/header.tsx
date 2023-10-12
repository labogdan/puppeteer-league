import React, { useState, useEffect } from 'react';

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Form from 'react-bootstrap/Form';
import Cookies from 'js-cookie';

const Header = () => {

    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
      const storedIsDarkMode = Cookies.get('isDarkMode');
      if (storedIsDarkMode === 'true') {
        setIsDarkMode(true);
        document.body.setAttribute('data-bs-theme', 'dark');
      } else {
        setIsDarkMode(false);
        document.body.setAttribute('data-bs-theme', 'light');
      }
    }, []);
  
    // Function to toggle dark mode
    const toggleTheme = () => {
      const newIsDarkMode = !isDarkMode;

      setIsDarkMode(newIsDarkMode);
      // Set the dark mode state in a cookie
      Cookies.set('isDarkMode', newIsDarkMode.toString(), { expires: 365 });

      // Update the body attribute based on the new state
      if (newIsDarkMode) {
        document.body.setAttribute('data-bs-theme', 'dark');
      } else {
        document.body.setAttribute('data-bs-theme', 'light');
      }
    };

    return (
      <>
        <Navbar className="py-3 px-3">
      <Navbar.Brand href="#">Scraper App</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
        <Nav className="ml-auto">
          <Nav.Link href="#">Help</Nav.Link>
          <Form.Check
            type="switch"
            id="darkModeSwitch"
            label={isDarkMode ? "Dark Mode" : "Light Mode"}
            checked={isDarkMode}
            onChange={toggleTheme}
            style={{padding: "8px 0 8px 40px"}}
          />
        </Nav>
      </Navbar.Collapse>
    </Navbar>
      </>
        
      
    )
}

export default Header

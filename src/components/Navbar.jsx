

import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import "../css/Navbar.css"; //penser  a  ajouter la page css




export default function Navbar() {
  //test importé de navbar router
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuClicked, setMenuClicked] = useState(false);
  const handleMenuOpen = () => {
    setMenuOpen(!menuOpen);
  };
  const handleMenuClicked = () => {
    setMenuOpen(false);
  };



  return (
    <div className="mainBox-nav">
      <div className="lilNav-box0">
      </div>
      <div className="lilTitle-box1">
        <Link to="/" className="title">
          {/*IT V*/}
          <img src="src/assets/logoseul.png" />

          {/*??? trouver logo et ecriture logo*/}
        </Link>
      </div>
      <div className="lilNav-box2">
        <ul className={menuOpen ? "open" : ""}>
          <li>
            <NavLink
              to="/home"
              className={menuClicked ? "clicked" : ""}
              onClick={handleMenuClicked}
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="collection"  
             /*   to="Signup"*/
              /*to= "Old"*/

              className={menuClicked ? "clicked" : ""}
              onClick={handleMenuClicked}
            >
              Collection
            </NavLink>
          </li>

          <li>
            <NavLink
              to="Conc" 
              className={menuClicked ? "clicked" : ""}
              onClick={handleMenuClicked}
            >
              Le Concept
            </NavLink>
          </li>

          <li>
            <NavLink
              /*  to="/Book"  */
              to="Signup" 

              className={menuClicked ? "clicked" : ""}
              onClick={handleMenuClicked}
            >
              Book
            </NavLink>
          </li>
          <li>
            <NavLink
              /*  to="About"  */
              to="Signup" 

              className={menuClicked ? "clicked" : ""}
              onClick={handleMenuClicked}
            >
              About
            </NavLink>
          </li>
          <li>
            <NavLink
              /*  to="Contact"  */
              to="Signup" 

              className={menuClicked ? "clicked" : ""}
              onClick={handleMenuClicked}
            >
              Contact
            </NavLink>
          </li>
        </ul>

        <div className="lilBurger-box3" onClick={handleMenuOpen}>
          <span></span>
          <span></span>
          <span></span>
        </div>
        
      </div>
    </div>
  );
}

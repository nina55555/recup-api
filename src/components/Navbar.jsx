

import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import '../css/Navbar.css' //penser  a  ajouter la page css
//import {Link} from "react-router-dom";
//import { NavLink } from "react-router-dom";

export default function Navbar() {
   

      //test importé de navbar router
      const [menuOpen, setMenuOpen] = useState(false);

      const [menuClicked, setMenuClicked] = useState(false);
  
      
      const handleMenuOpen = () =>{
          setMenuOpen(!menuOpen);
        
      }
  
      const handleMenuClicked = () =>{
          setMenuOpen(false);
      }

      //


    return (
      
      /*
      <div className='navbar'>
      <h1 className="contour"> Je suis la fabuleuse Navbar</h1> 
      <img className="logoimg" src="../src/assets/ohlogo.jpg" alt="logo" ></img>
      <div className="navbox" >
    
      <p><a href="Home">Home</a></p>
      <p><a href="Collection">Collection</a></p>
      <p><a href="Book">Book</a></p>
      <p><a href="About">About</a></p>
      <p><a href="Contact">Contact</a></p>

      </div>
      
      
      
      <div>
        
        <h2>Je m'appelle navbar page</h2>
      </div>
      */


      //
      <div>
      <nav>
        
        <Link to='/' className='title'>IT V</Link>

        <ul className={menuOpen? 'open': ''}>







          
           <li>
                <NavLink to='/home' className={menuClicked? 'clicked': ''} onClick={handleMenuClicked} >Home</NavLink>
            </li>
          
            <li>
                <NavLink to='collection' className={menuClicked? 'clicked': ''} onClick={handleMenuClicked} >Collection</NavLink>
            </li>
            
            <li>
                <NavLink to='/Book' className={menuClicked? 'clicked': ''} onClick={handleMenuClicked}>Book</NavLink>
            </li>

            <li>
                <NavLink to='About' className={menuClicked? 'clicked': ''} onClick={handleMenuClicked}>About</NavLink>
            </li>
           
            <li>
                <NavLink to='Contact' className={menuClicked? 'clicked': ''} onClick={handleMenuClicked}>Contact</NavLink>
            </li>
        </ul>
        <div className='burger' onClick={handleMenuOpen
      }>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>



        </div>
    </nav>

</div>

    );
  }
  
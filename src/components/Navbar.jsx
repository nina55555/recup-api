
import React from "react";
//import {Link} from "react-router-dom";
//import { NavLink } from "react-router-dom";

export default function Navbar() {
    return (
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
      

      
      
      </div>
      
      
      /*
      <div>
        
        <h2>Je m'appelle navbar page</h2>
      </div>
      */
    );
  }
  
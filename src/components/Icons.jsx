


//import { FaInstagram } from 'react-icons/fa';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faFacebook } from "@fortawesome/free-brands-svg-icons";



import React from 'react';
import '../css/Icons.css'



export default function Icons() {


    return (
        
<div className="icons">
        <div className="text-icon">
          <p>Follow us and be part of the experience </p>
        </div>
        {/*<FaInstagram className='icon insta' />*/}
        <div className="icon-items">
          <ul>
            <li>
              <a>
                <FontAwesomeIcon icon={faInstagram} />
              </a>
            </li>
            <li>
              <a>
                <FontAwesomeIcon icon={faFacebook} />
              </a>
            </li>
            <li>
              <a>
                <FontAwesomeIcon icon={faEnvelope} />
              </a>
            </li>
          </ul>
        </div>
      </div>
        
    );
};










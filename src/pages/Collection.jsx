import React, { useState, useEffect } from "react";
import axios from "axios";
import { useQuery } from "react-query";
import { Link, NavLink, useParams } from "react-router-dom";

//import { FaInstagram } from 'react-icons/fa';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faFacebook } from "@fortawesome/free-brands-svg-icons";

import "../css/Cards.css";
import "../css/Collection.css";

import ReactPlayer from "react-player";
/*import videoShow from '../assets/cindyB.mp4'*/
import videoShow from "../assets/videoDefile.mp4";

//import { useParams } from 'react-router-dom';

/*
import "../css/Product.css";
import Product from '../pages/Product';
*/

const Collection = () => {
  const { id } = useParams();

  /*
   const handleClick = (e) =>{
    <SingleProduct/>
    }
*/
  /*
   const {productId } = useParams();
        const product = model.find((product) => product.id === productId);
        console.log (product)
        //const {imageUrl, title} = product
*/

  const { data, isError, isLoading } = useQuery("model", () => {
    //return axios.get ('http://localhost:3002/collection-test/');
    //return axios.get (' http://localhost:5979/runways/');
    return axios.get(" http://localhost:5978/defilons/");
  });








  return (
    <div className="mainBox">
      <div className="videodudef">


<div className="box-big-defile">

        {data?.data.map((product) => {
          return (

            <>
              <div className="big-defile" key={product._id}>
                {/*{`/product/${product._id} `}*/}
                <img src={product.imageUrl} />
              </div>

            </>
          );
        })}

</div>


        {/*<img className="picmarque" src="/src/assets/ohlogo.jpg" alt="bigPic" />*/}

        <video src={videoShow} autoPlay muted loop />
        <div className="big--ticket">
          <div className="ticket">
            <h3>Voir la salle d'enchere</h3>
          </div>
        </div>
      </div>

      <div className="show-cards">

        {data?.data.map((product) => {
          return (


            <>
              

              <div className="card" key={product._id}>
                <img src={product.imageUrl} />

                <NavLink to={`/product/${product._id} `}>buy now</NavLink>
               
              </div>
            </>


          );
        })}


      </div>




      <div className="icons">
        <div className="text-icon">
          <p>Follow us and be part of the adventure </p>
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



    </div>
  );
};
export default Collection;

/*
import Navbar from "../components/Navbar"

export default function Collection() {
    return (
        <div> 
      <h1>Je m'appelle Collection page</h1>

        </div>
    )
  }
  */

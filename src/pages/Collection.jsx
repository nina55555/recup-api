import React, { useState, useEffect } from "react";
import axios from "axios";
import { useQuery } from "react-query";
import { Link, NavLink, useParams } from "react-router-dom";

//import { FaInstagram } from 'react-icons/fa';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faFacebook } from "@fortawesome/free-brands-svg-icons";

import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";

import "../css/Cards.css";
import "../css/Collection.css";

import ReactPlayer from "react-player";
/*import videoShow from '../assets/cindyB.mp4'*/
import videoShow from "../assets/videoDefile.mp4";
import { BsChevronCompactLeft, BsChevronCompactRight } from "react-icons/bs";
import { GiCarDoor } from "react-icons/gi";

const Collection = ({ product, handleClickLarge }) => {
  const { id } = useParams();

  const { data, isError, isLoading } = useQuery("model", () => {
    //return axios.get ('http://localhost:3002/collection-test/');
    //return axios.get (' http://localhost:5979/runways/');
    return axios.get(" http://localhost:5978/defilons/");
  });

  {
    /*
    (programme defilons-crud-api)
*/
  }

  {
    /*
  const [currentIndex, setCurrentIndex ] = useState (0);
*/
  }

  /*

  const changingImgs = document.querySelectorAll(".changing-class");

  changingImgs.forEach((changingImg) => {
    changingImg.addEventListener("click", () => {
      changingImg.classList.add("active");
    });
  });

  */

  /*****a remettre si le props ne fonctionne pas ******* */
  /*
  const changingImgs = document.querySelectorAll(".changing-class");
  changingImgs.forEach((changingImg) => {
    changingImg.addEventListener("click", () => {
      changingImg.classList.add("large");
  
      /*mettre la fonction qui show les images avec leur id ici en props ? (il y a deja id utilisable sur cette page ?*/

  /*

    });
  });
*/

  /*placer l'evenement sur les fleches en plus


/*

  function handleClick2 (){

    const ticket = document.getElementsByClassName('card');
    ticket.classList.add('large');
  };

*/

  return (
    <div className="mainBox">
      {/* les big videos du def a replacer ici si besoin c'est dans fichier CollectionTest */}

          {data?.data.map((product) => {
            



            /************carousel changement ou enlever ?************ */
                        let prev = document.querySelector('.prev')
                        let next = document.querySelector('.next')

                        prev.addEventListener('click', function(){
                          let cardp = document.querySelectorAll('.card')
                          document.querySelector('.big-defile').appendChild(cardp[3])/*****? choisir les bons index dynamiquement***** */
                        })


                        next.addEventListener('click', enlarge);
                        function enlarge(){
                          let cardn = document.querySelectorAll('.card') /*ou(.active)*/
                          document.querySelector('.big-defile').appendChild(cardn[1]);
                         
                        }

                        /*
                        return(
                           <div className="card" key={product._id}>
                            <img src={product.imageUrl}/>
                            </div>
                        )
                        */
                       
            /***************************************** */

            return (
              <>
                <div className="big-defile" key={product._id}>
                  {/*{`/product/${product._id} `}*/}
                  
                  
                  
                  {/* <--mettre ici toutes url de defilé */}

                          <img src={product.imageUrl}  />

                          {/*<img src={product.videoUrl} />{" "}*/}

                          {/*<video src={videoShow} autoPlay muted loop />*/}

                  <div className="big--ticket">
                    <div className="ticket">
                      <h3>Voir la salle d'enchere</h3>
                    </div>
                  </div>
                </div>


              </>
            );
          })}

          {/*<img className="picmarque" src="/src/assets/ohlogo.jpg" alt="bigPic" />*/}

          










      {/* thumbnails*/}
      {/*remettre bloc de Collectiontest-jsx.jsx ici*/}

      <div className="show-cards nextt">
        {/*carousel*/}
        <div className="arrows">
          <button className="prev">
            <BsChevronCompactLeft />
          </button>

          <button className="next ">
            <BsChevronCompactRight />
          </button>
        </div>
        {data?.data.map((product) => {
          return (
            <>
              {/*placer l'autre div a agrandir ici peut etre ?*/}

              <div className="card" key={product._id}>
                <img
                  src={product.imageUrl}
                  

                  className=" changing-class active "
                  onClick={() => handleClickLarge(product._id)}
                  /*className=" changing-class active" onClick={()=>handleClickLarge(product.imageUrl._id) }
                   */
                />


                
                {/* 
                      <NavLink to={`/product/${product._id} `}>buy now</NavLink>
                  */}
                {/*  <NavLink to={`/collectionShow/${product._id} `}>buy now  {product.title} </NavLink>
                 */}
                {/*
                      <NavLink to="Home">buy now</NavLink>
                  */}
              </div>
            </>
          );
        })}
      </div>

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

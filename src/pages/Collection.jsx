import React, { useState } from "react";
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
      <div className="show">
        {data?.data.map((product) => {
          return (
            <div className="card" key={product.id}>
              {/*product.imageUrl*/}
              {/*product.title*/}
              {/*item.author*/}
              {/*<img src={product.imgUrl} alt= "photo model"/>  */}
              <img src={product.imageUrl} />
              {/*
                            <button ><a href='/Enchere' >Acheter ce model</a></button>
                            */}

              {/*
                            <Link to={`/SingleProduct `} >more infos</Link>
                            */}

              {/*
                            <button onClick={() => handleClick() } >click to open</button>
                            */}

              {/*<Link to={`/SingleProduct/${id} `} >ouvre moi stp</Link> */}

              {/*
                            <button ><a href='/SingleProduct/:id' >Acheter ce model</a></button>
                            */}

              <NavLink to={`/product/${product.id} `}>buy now</NavLink>
              {/* <NavLink to={`/product/${product._id} `}>buy now</NavLink> */}




              {/*
                            <Link to='/SingleProduct/:product.id' >prod
                            <img src={product.imageUrl} alt= "photo model"/>
                            <product product={product} />
                            </Link> 
                            */}

              {/*
                            <Link to={'/SingleProduct/${product.id}' }>prod
                            <product product={product} />
                            </Link>

                            */}

              {/*   <img src={item.imgUrl} alt= "photo model"/>   */}

              {/*  <video src ={item.videoUrl} ></video>   */}
            </div>
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

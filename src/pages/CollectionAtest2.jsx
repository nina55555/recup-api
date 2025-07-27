


import React, { useState, useEffect, useRef } from "react";
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
import "../css/CollectionAtest2.css";

import ReactPlayer from "react-player";
/*import videoShow from '../assets/cindyB.mp4'*/
import videoShow from "../assets/videoDefile.mp4";
import { BsChevronCompactLeft, BsChevronCompactRight } from "react-icons/bs";
import { GiCarDoor } from "react-icons/gi";
import Icons from "../components/Icons";





const CollectionAtest2 = ({ product }) => {
  const { id } = useParams();

  const slideRef = useRef(null);
  const [enlargedId, setEnlargedId] = useState(null);

  const { data, isError, isLoading } = useQuery("model", () => {
    return axios.get(" http://localhost:5978/defilons/");
  });

  function previous() {
    if (slideRef.current) {
      const items = slideRef.current.querySelectorAll('.item');
      if (items.length > 0) {
        slideRef.current.prepend(items[items.length - 1]);
      }
    }
  }

  function nexter() {
    if (slideRef.current) {
      const items = slideRef.current.querySelectorAll('.item');
      if (items.length > 0) {
        slideRef.current.appendChild(items[0]);
      }
    }
  }

  const handleClickLarge = (id) => {
    setEnlargedId(id);
  };

  return (
    <div className="mainBox">
      {data?.data.map((product) => (
        <div className="container" key={product._id}>
          <img src={product.imageUrl} alt="" />

          <div className="slide" key={product._id} ref={slideRef}>
            {data?.data.map((innerProduct, index) => (
              <div
                className={`item changing-class active ${
                  enlargedId === innerProduct._id && index === 0 ? 'enlarged' : ''
                }`}
                key={innerProduct._id}
              >
                <img
                  src={innerProduct.imageUrl}
                  onClick={() => handleClickLarge(innerProduct._id)}
                  alt=""
                />
              </div>
            ))}
          </div>

          <div className="button">
            <button onClick={() => previous()} className="prev">
              prev
            </button>
            <button onClick={() => nexter()} className="next">
              next
            </button>
          </div>

        </div>
      ))}     
      <Icons />
    </div>

  )
}
  export default CollectionAtest2;
  
  
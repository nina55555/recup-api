import React from "react";
import axios from "axios";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import videoShow from "../assets/cindyB.mp4";
import Navbar from "../components/Navbar";
import Video from "../components/Video";
import "../css/Home.css";
import Slides from "../components/Slides";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import Icons from "../components/Icons";
import "../css/Icons.css";




export default function Home() {
  // Fetch API
  const { data, isLoading, isError } = useQuery("model", () =>
    axios.get("http://localhost:5978/defilons/"),
  );

  if (isLoading) return <p>Chargement...</p>;
  if (isError) return <p>Erreur API</p>;

  const products = data?.data || [];

  return (
    <div className="containerHome">
      

      <Video />

      <button className="btn-decouvrezz">
        {/*<a href='/Signup' >Decouvrez la collection
                </a>
                */}
        <a href="/Collection">Decouvrez la collection</a>
      </button>

      <div className="presentation">
        <h2>Presentation.</h2>
        <p>
          Pourrez vous ... Chez It V{" "}
          {/*nous ne nous occupons pas de la mode. */} Nous nous specialisons
          dans le vet.. d ... a.. h... i... Ra..... n... v... h* lors d n...
          en...... et n... en fe.... d. l'.....*une br.... d'..... * u.. oe....
          br....* presente s.. v... mod.. //qui acc.... de gr... ch... au tr...
          d. n... ass//
        </p>

        <Slides products={products} />

            <Icons/>

      </div>

    </div>
  );
}

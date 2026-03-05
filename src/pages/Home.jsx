import React from "react";
import axios from "axios";
import { useQuery } from "react-query";
import Video from "../components/Video";
import Slides from "../components/Slides";
import Icons from "../components/Icons";
import "../css/Home.css";

export default function Home() {
  // Fetch API
  const { data, isLoading, isError } = useQuery("model", () =>
    axios.get("http://localhost:5978/defilons/")
  );

  if (isLoading) return <p>Chargement...</p>;
  if (isError) return <p>Erreur API</p>;

  const products = data?.data || [];

  return (
    <div className="containerHome">
      {/* Vidéo avec paragraphe */}
      <Video />

      {/* Bouton découvrir la collection */}
      <button className="btn-decouvrezz">
        <a href="/Collection">Découvrez la collection</a>
      </button>

      {/* Présentation */}
      <div className="presentation">
        <h2>Présentation</h2>
        <p>
          Pourrez-vous ... Chez It V, nous nous spécialisons dans le vêtement
          de haute qualité, réalisé avec passion et créativité. Découvrez nos
          modèles uniques et laissez-vous surprendre par l'élégance et le style
          qui caractérisent chaque pièce de notre collection.
        </p>

        {/* Slider produits */}
        {/*<Slides products={products} />*/}

        {/* Icônes réseaux sociaux */}
        <Icons />
      </div>
    </div>
  );
}
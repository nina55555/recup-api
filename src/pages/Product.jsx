import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Countdown from "../components/Countdown";
import Enchere from "../components/Enchere";
import Icons from "../components/Icons";
import "../css/Product.css";

const Product = () => {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProduct = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `http://localhost:5978/defilons/${id}`
        );

        if (!response.ok) {
          throw new Error("Erreur produit");
        }

        const data = await response.json();
        setProduct(data);

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (id) getProduct();

  }, [id]);

  if (loading) return <div className="main--box">Loading...</div>;
  if (!product) return <div className="main--box">Produit introuvable</div>;

  return (
    <div className="main--box">

      <Countdown />

      <div className="big--box">
        <div className="images--box">

          <img
            className="paint"
            src="/src/assets/wallpaint.jpg"
            alt="wall"
          />

          <div className="product-overlay">

            <img
              className="podium"
              src={product.imageUrl}
              alt={product.title}
            />

            <h2>{product.title}</h2>

          </div>

        </div>
      </div>

      <Enchere productId={id} />

      <Icons />

    </div>
  );
};

export default Product;
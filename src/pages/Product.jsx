import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Countdown from "../components/Countdown";
import Enchere from "../components/Enchere";
import Icons from "../components/Icons";
import { supabase } from "../lib/supabase";
import "../css/Product.css";

const Product = () => {

const { id } = useParams();
const navigate = useNavigate();

const [product,setProduct] = useState(null);
const [loading,setLoading] = useState(true);

const [showPopup,setShowPopup] = useState(false);
const [bidValue,setBidValue] = useState(null);

const [formData,setFormData] = useState({
message:"",
country:""
});

const [bids,setBids] = useState([]);
const [user,setUser] = useState(null);
const [pseudo,setPseudo] = useState("");

/* ============================= */
/* USER CONNECTE */
/* ============================= */

useEffect(()=>{

const getUser = async()=>{

const { data } = await supabase.auth.getUser();

if(data?.user){

setUser(data.user);

const { data:profile } = await supabase
.from("profiles")
.select("pseudo")
.eq("id",data.user.id)
.single();

if(profile) setPseudo(profile.pseudo);

}

};

getUser();

},[]);

/* ============================= */
/* RECUP PRODUIT */
/* ============================= */

useEffect(()=>{

const getProduct = async()=>{

try{

const response = await fetch(
`http://localhost:5978/defilons/${id}`
);

const data = await response.json();
setProduct(data);

}catch(error){

console.error(error);

}finally{

setLoading(false);

}

};

if(id) getProduct();

},[id]);

/* ============================= */
/* RECUP ENCHERES */
/* ============================= */

useEffect(()=>{

const fetchBids = async ()=>{

const { data,error } = await supabase
.from("bids")
.select(`
amount,
message,
country,
created_at,
profiles (pseudo)
`)
.order("amount",{ascending:false});

if(error){

console.error(error);
return;

}

if(data){

const formatted = data.map(b => ({

amount:b.amount,
message:b.message,
country:b.country,
pseudo:b.profiles?.pseudo,
date:b.created_at

}));

setBids(formatted);

}

};

fetchBids();

},[]);

/* ============================= */
/* CLICK ENCHERE */
/* ============================= */

const handleBidSubmit = (value)=>{

if(!user){

navigate("/signup");
return;

}

setBidValue(value);
setShowPopup(true);

};

/* ============================= */
/* CHANGE FORM */
/* ============================= */

const handleChange = (e)=>{

const {name,value} = e.target;

setFormData({
...formData,
[name]:value
});

};

/* ============================= */
/* ENREGISTRER ENCHERE */
/* ============================= */

const handleFormSubmit = async (e)=>{

e.preventDefault();

const newBid = {

amount:bidValue,
message:formData.message,
country:formData.country,
user_id:user.id

};

const { error } = await supabase
.from("bids")
.insert([newBid]);

if(error){

console.error(error);
return;

}

const localBid = {
...newBid,
pseudo:pseudo,
date:new Date()
};

setBids([localBid,...bids]);

setShowPopup(false);

setFormData({
message:"",
country:""
});

};

if(loading) return <div>Loading...</div>;
if(!product) return <div>Produit introuvable</div>;

return(

<div className="main--box">

<Countdown/>

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

<Enchere
bids={bids}
onBidSubmit={handleBidSubmit}
/>

<Icons/>

{showPopup && (

<div className="popup-overlay">

<div className="popup-form">

<h3>Commentaire</h3>

<form onSubmit={handleFormSubmit}>

<textarea
name="message"
placeholder="Ecrire quelques lignes"
value={formData.message}
onChange={handleChange}
/>

<select
name="country"
value={formData.country}
onChange={handleChange}
required
>

<option value="">Choisir un pays</option>
<option>France</option>
<option>Italie</option>
<option>Espagne</option>
<option>Allemagne</option>
<option>Belgique</option>

</select>

<button type="submit">
Valider l'enchère
</button>

</form>

</div>

</div>

)}

</div>

);

};

export default Product;
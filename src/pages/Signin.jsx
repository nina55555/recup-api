import React,{useState} from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import "../css/Auth.css";

const Signin = ()=>{

const navigate = useNavigate();

const [email,setEmail] = useState("");
const [password,setPassword] = useState("");
const [error,setError] = useState(null);

const handleSignin = async (e)=>{

e.preventDefault();

const { error } = await supabase.auth.signInWithPassword({

email,
password

});

if(error){

setError(error.message);
return;

}

navigate("/home");

};

return(

<div className="auth-container">

<h2>Connexion</h2>

<form onSubmit={handleSignin} className="auth-form">

<input
type="email"
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
required
/>

<input
type="password"
placeholder="Mot de passe"
value={password}
onChange={(e)=>setPassword(e.target.value)}
required
/>

<button type="submit">
Se connecter
</button>

{error && <p className="auth-error">{error}</p>}

</form>

</div>

);

};

export default Signin;
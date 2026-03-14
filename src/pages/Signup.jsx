import React,{useState} from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import "../css/Auth.css";

const Signup = ()=>{

const navigate = useNavigate();

const [pseudo,setPseudo] = useState("");
const [email,setEmail] = useState("");
const [password,setPassword] = useState("");
const [country,setCountry] = useState("");
const [story,setStory] = useState("");
const [storyMode,setStoryMode] = useState("later");
const [error,setError] = useState(null);
const [success,setSuccess] = useState(null);

const handleSignup = async (e)=>{

e.preventDefault();

setError(null);

const { data,error } = await supabase.auth.signUp({

email,
password

});

if(error){

setError(error.message);
return;

}

if(data?.user){

const { error:profileError } = await supabase
.from("profiles")
.insert([{

id:data.user.id,
pseudo:pseudo,
country:country,
story:storyMode==="now"?story:null,
story_mode:storyMode

}]);

if(profileError){

setError(profileError.message);
return;

}

}

setSuccess("Compte créé ! Vérifiez votre email pour confirmer.");

};

return(

<div className="auth-container">

<h2>Créer un compte</h2>

<form onSubmit={handleSignup} className="auth-form">

<input
type="text"
placeholder="Pseudo"
value={pseudo}
onChange={(e)=>setPseudo(e.target.value)}
required
/>

<select
value={country}
onChange={(e)=>setCountry(e.target.value)}
required
>

<option value="">Choisir un pays</option>
<option>France</option>
<option>Italie</option>
<option>Espagne</option>
<option>Allemagne</option>
<option>Belgique</option>
<option>Suisse</option>
<option>Canada</option>
<option>USA</option>
<option>Japon</option>

</select>

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

<div className="story-section">

<label>Raconte ton histoire</label>

<div className="story-options">

<label>

<input
type="radio"
value="now"
checked={storyMode==="now"}
onChange={()=>setStoryMode("now")}
/>

Raconter maintenant

</label>

<label>

<input
type="radio"
value="later"
checked={storyMode==="later"}
onChange={()=>setStoryMode("later")}
/>

Raconter plus tard

</label>

</div>

{storyMode==="now" && (

<textarea
placeholder="Ton histoire..."
value={story}
onChange={(e)=>setStory(e.target.value)}
/>

)}

</div>

<button type="submit">
Créer le compte
</button>

{error && <p className="auth-error">{error}</p>}

{success && <p className="auth-success">{success}</p>}

</form>

</div>

);

};

export default Signup;
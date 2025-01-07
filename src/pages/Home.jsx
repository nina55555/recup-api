
/*import videoShow from '../assets/cindy.mp4'*/

import { Link } from 'react-router-dom';
import videoShow from '../assets/cindyB.mp4';
import Navbar from '../components/Navbar';
import Video from '../components/Video';
import '../css/Home.css';


export default function Home() {
    return (
        <div className="containerHome">
            {/* <Navbar />  */}
        
        {/*
        <div className="img3">
            <img src="src/assets/Capturelogo.PNG" alt="logo" />
            </div>

           <div className="img2">
           <img src="src/assets/Capturelogo.PNG" alt="logo" />

           </div>
        */}
            
           <Video /> 
 
            <button className='btn-decouvrezz'>
                <a href='/Signup' >Decouvrez la collection
                </a>
            </button>
           
            <div className='presentation'> 
            <h2>Presentation.</h2>
            <p>Pourrez vous ... Chez It V {/*nous ne nous occupons pas de la mode. */} Nous nous specialisons dans le vet.. d ... a.. h... i... Ra..... n... v... h* lors d n... en...... et n... en fe.... d. l'.....*une br.... d'..... * u..  oe.... br....*  presente s..  v... mod.. //qui acc.... de gr... ch... au tr... d.  n... ass//</p>
        </div>

        {/*
      
           <div className='boxx-container'>
            <div className="boxa">
                <div className="box1">
                <p>H</p>              
                <img src="src/assets/livre.jpg" alt="pic" />
                </div>
            </div>
            <div className="boxb">
            <div className="box2">
                <p>D</p>
                <img src="src/assets/pic-bro.jpg" alt="pic" />
                </div>
            </div>
            <div className="boxc">
                <div className="box3">
                <p>I</p>
                <h2>NOTRE MISSION <i class="fa-solid fa-heart"></i> </h2>
                </div>
            </div>  
            
        </div>
*/}

        </div>
    )
    
} 

/*
<h1 className="contour">Je m'appelle Home page</h1>
            
            <h1 className="contour">form</h1>
            <form >
                <label htmlFor="somme">entrez une somme</label>
                <br/>
                <br/>
                <input type="number" name="somme" id="somme"/>
                <input type="submit" value="somme"/>
            </form>
 */
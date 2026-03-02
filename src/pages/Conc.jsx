

import { Link } from 'react-router-dom';
import videoShow from '../assets/cindyB.mp4';
import Navbar from '../components/Navbar';
import Video from '../components/Video';
import '../css/Conc.css';


export default function Conc () {
    return(
        <div className="container">
            <div className='boxx-container1'>
                    
                        <div className="box1">
                        <p>H</p>
                        {/* v.. acco...*/}
                        {/*votre H..*/}                
                        <img src="src/assets/livre.jpg" alt="pic" />
                        <h3>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ad nulla nesciunt sed cupiditate optio, voluptate id, magnam enim iste reprehenderit iure mollitia, molestias sequi minus.
                        </h3>
                        </div>
                    
                    {/*<div className="boxb">  */}
                    <div className="box2">
                        <p>D</p>
                        {/*notre D...*/}
                        <img src="src/assets/pic-bro.jpg" alt="pic" />
                        <h3>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ad nulla nesciunt sed cupiditate optio, voluptate id, magnam enim iste reprehenderit iure mollitia, molestias sequi minus.
                        </h3>
                        {/*</div>  */}
                    </div>
                        <div className="box3">
                        <p>I</p>
                        {/* votre I...*/}
                        {/* <img src="src/assets/Capturelogo.PNG" alt="pic" />   */}
                        <div className="mission">
                            <h2>NOTRE MISSION <i class="fa-solid fa-heart"></i> </h2>

                        </div>
                        <h3>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ad nulla nesciunt sed cupiditate optio, voluptate id, magnam enim iste reprehenderit iure mollitia, molestias sequi minus.
                        </h3>

                        </div>
                    
                </div>

        </div>
        
    )

}
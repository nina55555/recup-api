
/*import videoShow from '../assets/cindy.mp4'*/

import videoShow from '../assets/cindyB.mp4'
import Navbar from '../components/Navbar'
import Presentation from '../components/Presentation'
import Video from '../components/Video'


export default function Home() {
    return (
        <div className="home">
            <Navbar />
           <Video />
           <Presentation />
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
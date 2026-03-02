
import Navbar from "../components/Navbar";
import '../css/About.css';
import "../css/CollectionAtest.css";




let next  = document.querySelector('.next');
let prev  = document.querySelector('.prev');


function previous() {
    let items = document.querySelectorAll('.item')
    document.querySelector('.slide').prepend(items[items.length - 1] )
}



function nexter() {
    let items = document.querySelectorAll('.item')
    document.querySelector('.slide').appendChild(items[0] )
}



export default function CollectionAtest() {

    return (
        <div className="container">

         <div className="slide">

            <div className="item">
                1
            </div>

            <div className="item">
                2
            </div>

            <div className="item">
                3
            </div>

            <div className="item">
                4
            </div>

            <div className="item">
                5
            </div>

            <div className="item">
                6
            </div>

         </div>

         <div className="button">
            {/*<div className="prev">prev</div>*/}
            {/*<div className="next">next</div>*/}
            <button onClick={() => previous() }className="prev" >prev</button>
            <button onClick={() => nexter() } className="next" >next</button>

         </div>

        </div>
    );
  }
  

import { Link } from "react-router-dom"

export default function ErrorPage() {
    return(
        <div>
            <h1>404 vous allons vous aider a trouver votre chemin</h1>
            <p> Revenez avec nous ! <Link to='/'>HOME</Link>
            </p>
        </div>  
    )
}
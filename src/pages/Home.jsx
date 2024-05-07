
export default function Home() {
    return (
        <div className="technoAdd">
            <h1>Je m'appelle Home page</h1>
            <h1>form</h1>
            <form >
                <label htmlFor="somme">entrez une somme</label>
                <br/>
                <br/>
                <input type="number" name="somme" id="somme"/>
                <input type="submit" value="somme"/>
            </form>
        </div>
    )
    
}
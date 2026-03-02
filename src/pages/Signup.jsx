
import React, { useState } from 'react';
import '../firebaseConfig';
import { getFirestore, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { query, orderBy, limit, getDocs } from 'firebase/firestore';
import '../css/Signup.css';

/*** */
/* import "../../node_modules/bootstrap/dist/css/bootstrap.min.css";
/*** */

function App () {


  const [inputValue1, setInputValue1] = useState('');
  const [inputValue2, setInputValue2] = useState('');
  const [inputValue3, setInputValue3] = useState('');



  const db = getFirestore();

  const saveInFirestore = async () => {
    const docRef = await addDoc (collection (db, "contact"), {
        name: inputValue1,
        email: inputValue2,
        phone: inputValue3,

        createdAt: serverTimestamp (),


      });
    alert('doc written in firebase + We gonna contact you within 48h');
    setInputValue1(''),
    setInputValue2(''),
    setInputValue3('')



    const q = query(
      collection(db,"contact"),
      orderBy("createdAt", "desc"),
      limit (25)
    );


  };



return (


  /*** */

  <div className="containBoxo">
  <div className="box-signup">
    <div className="textbox">
      <div className="welcome-text">
        <h3>SIGN UP</h3>
        <br />
        <p>
          it's not a waist of time,
          <br /> we gonna take care of you{" "}
        </p>
      </div>

      

        
                    <label htmlFor='name' >NAME :</label>
                    <input type='text' placeholder='enter your name' className='form-control input-form'

                    id="name"
                    value={inputValue1}
                    onChange={(e) => setInputValue1(e.target.value) }
                    />

                    <br/>

                    
                    <label htmlFor='email' >EMAIL: </label>
                    <input type='email' placeholder='enter your email' className='form-control input-form'
                    id="email"
                    value={inputValue2}
                    onChange={(e) => setInputValue2(e.target.value) }
                    />
                
                <br/>


                    <label htmlFor='phone' >PHONE:</label>
                    <input type='number' placeholder='enter your phone' className='form-control input-form'
                    id="phone"
                    value={inputValue3}
                    onChange={(e) => setInputValue3(e.target.value) }
                    />
                    <br/>

                    
                    <p>The experience begins now !</p>

                    <button  className='btn' onClick={saveInFirestore} >Save</button>

                    {  /*<button><a href='/' >sign up</a></button>  */}
      
    </div>
  </div>

  {/*
        
       <div className='box-signup'>
       
            <div className="sign-text">
                <h3>sign up</h3>
                <br/> 
                <p>it's not a waist of time,
                <br/> we gonna take care of you </p>
            </div>
           <div>
            <form>
                    <label htmlFor='name' >name</label>
                    <input type='text' placeholder='enter your name' className='form-control input-form'/>

                <br/>
                    <label htmlFor='lastname' >lastname</label>
                    <input type='text' placeholder='enter your lastname' className='form-control input-form'/>
                <br/>
                    <label htmlFor='email' >email</label>
                    <input type='email' placeholder='enter your email' className='form-control input-form'/>
                
                <br/>
                    <label htmlFor='passeword' >passeword</label>
                    <input type='passeword' placeholder='choose passeword' className='form-control input-form'/>
                <br/>
                    <label htmlFor='passeword' >passeword</label>
                    <input type='passeword' placeholder='confirm passeword' className='form-control input-form'/>

                    <button className='btn'><a href='/home' >sign up</a></button>
            </form>
            </div> 
   
     </div>
     */}
</div>



  /*** */







);
      
}







export default App;






/*

  useEffect(() => {
    img && uploadFile(img, "imgUrl");
  }, [img]);




  const uploadFile = (file, fileType) => {
    const storage = getStorage(app);
    const folder = fileType === "imgUrl" ? "images/" : "videos/";
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, folder + fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);
  }



   // Listen for state changes, errors, and completion of the upload.
   uploadTask.on(
    "state_changed",
    (snapshot) => {
      const progress =
        (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      fileType === "imgUrl"
        ? setImgPerc(Math.round(progress))
        : setVideoPerc(Math.round(progress));
      switch (snapshot.state) {
        case "paused":
          console.log("Upload is paused");
          break;
        case "running":
          console.log("Upload is running");
          break;
        default:
          break;
      }
    },
      (error) => {
        console.log(error);
        switch (error.code) {
          case "storage/unauthorized":
            // User doesn't have permission to access the object
            console.log(error);
            break;
          case "storage/canceled":
            // User canceled the upload
            break;
          case "storage/unknown":
            // Unknown error occurred, inspect error.serverResponse
            break;
          default:
            break;
        }
      },
    () => {
            // Upload completed successfully, now we can get the download URL
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              console.log('DownloadURL - ', downloadURL);
              setInputs((prev) => {
                return {
                  ...prev,
                  [fileType]: downloadURL,
                };
              });
            });
          }
  );



    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await axios.post(`http://localhost:5979/runways/`, { ...inputs });
        window.location.reload();
      } catch (error) {
        console.log(error);
      }
    };

*/

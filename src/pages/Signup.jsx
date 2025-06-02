
import React, { useState } from 'react';

import '../firebaseConfig';
import { getFirestore, addDoc, collection } from "firebase/firestore";
import "../../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../css/Signup.css";

const Signup = () => {






const [inputValueA, setInputValueA] = useState('');
const [inputValueB, setInputValueB] = useState('');
const [inputValueC, setInputValueC] = useState('');



const db = getFirestore();

const saveInFirestore = async () => {
  const docRef = await addDoc (collection (db, "got-email-user"), {

  /*const docRef = await addDoc (collection (db, "firebase-get-contacts"), {*/
  
      name: inputValueA,
      email: inputValueB,
      phone: inputValueC,


    });
  alert('doc written in firebase');
  setInputValueA(''),
  setInputValueB(''),
  setInputValueC('')

};








  return (
    <div className="containBoxo">
      <div className="box-signup">
        <div className="textbox">
          <div className="welcome-text">
            <h3>sign up</h3>
            <br />
            <p>
              it's not a waist of time,
              <br /> we gonna take care of you{" "}
            </p>
          </div>

          <form  /*action="submit"  */>

            
                        <label htmlFor='name' >name</label>
                        <input type='text' placeholder='enter your name' className='form-control input-form'

                        id="name"
                        value={inputValueA}
                        onChange={(e) => setInputValueA(e.target.value) }
                        />

                        <br/>

                        
                        <label htmlFor='email' >email</label>
                        <input type='email' placeholder='enter your email' className='form-control input-form'
                        id="email"
                        value={inputValueB}
                        onChange={(e) => setInputValueB(e.target.value) }
                        />
                    
                    <br/>


                        <label htmlFor='phone' >phone</label>
                        <input type='number' placeholder='enter your phone' className='form-control input-form'
                        id="phone"
                        value={inputValueC}
                        onChange={(e) => setInputValueC(e.target.value) }
                        />
                        <br/>

                        
                        <p>The experience begins now !</p>

                        <button  className='btn' onClick={saveInFirestore}>Save</button>

                        {  /*<button><a href='/' >sign up</a></button>  */}
          </form>
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
  );
};

export default Signup;

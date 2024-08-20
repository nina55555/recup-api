import React from "react";
import "../../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../css/Signup.css";

const Signup = () => {
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

          <form action="submit">

            
                        <label htmlFor='name' >name</label>
                        <input type='text' placeholder='enter your name' className='form-control input-form'/>
                        <br/>

                        
                        <label htmlFor='phone' >phone</label>
                        <input type='number' placeholder='enter your phone' className='form-control input-form'/>
                        <br/>

                        <label htmlFor='email' >email</label>
                        <input type='email' placeholder='enter your email' className='form-control input-form'/>
                    
                    <br/>
                        
                        <p>L"experience commence maintenant !</p>
                        <button className='btn'><a href='/' >sign up</a></button>
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

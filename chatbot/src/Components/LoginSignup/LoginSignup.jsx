import React, { useState } from 'react'
import './LoginSignup.css'
function LoginSignup() {
  const [state,setState]=useState("Signup");

  
  const [formData,setFormData]=useState({
    username:"",
    password:"",
    email:""
  })


  const login=async()=>{
    console.log("Login function");
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
    let responsedata = { success: false, error: "Network or Server Error" }; // Default error
    try {
        const response = await fetch(`${baseUrl}/login`,{
          method:'POST',
          headers:{
            'Accept':'application/json',
            'Content-Type':'application/json',
          },
          body:JSON.stringify(formData),
        });
        
        if (!response.ok) {
            console.error("Login response not OK:", response.status, response.statusText);
            try {
                const errorText = await response.text();
                console.error("Login error body:", errorText);
                responsedata = JSON.parse(errorText);
            } catch (e) {
                console.error("Could not parse error body as JSON", e);
                responsedata = { success: false, error: `Server Error: ${response.status} ${response.statusText}` };
            }
        } else {
            responsedata = await response.json();
        }
    } catch (err) {
        console.error("Fetch error:", err);
        responsedata = { success: false, error: "Could not connect to server. Check if backend is running." };
    }

    if(responsedata && responsedata.success){
      localStorage.setItem('auth-token',responsedata.token);
      console.log("Logged in");
      window.location.replace('/home');
    }
    else {
        alert(responsedata?.error || responsedata?.errors || "Login Failed");
    }
  }

  const signup=async()=>{
    console.log("Signup Function",formData);
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
    let responsedata = { success: false, error: "Network or Server Error" };
    try {
        const response = await fetch(`${baseUrl}/signup`,{
          method:'POST',
          headers:{
            'Accept':'application/json',
            'Content-Type':'application/json',
          },
          body:JSON.stringify(formData),
        });

        if (!response.ok) {
            console.error("Signup response not OK:", response.status, response.statusText);
            try {
                const errorText = await response.text();
                console.error("Signup error body:", errorText);
                 responsedata = JSON.parse(errorText);
            } catch (e) {
                console.error("Could not parse error body", e);
                responsedata = { success: false, error: `Server Error: ${response.status} ${response.statusText}` };
            }
        } else {
            responsedata = await response.json();
        }
    } catch (err) {
        console.error("Fetch error:", err);
        responsedata = { success: false, error: "Could not connect to server. Check if backend is running." };
    }

    if(responsedata && responsedata.success){
      localStorage.setItem('auth-token',responsedata.token);
      console.log("Signed up");
      window.location.replace('/home');
    }
    else {
        // Backend sometimes returns 'errors' string instead of 'error'
        alert(responsedata?.error || responsedata?.errors || "Signup Failed");
    }
  }

  const changeHandler=(e)=>{
    setFormData({...formData,[e.target.name]:e.target.value})
  }

  return (
    <div className="loginsignup">
      <div className="loginsignup-container">
        <h1>{state}</h1>
        <div className="loginsignup-fields">
          {state==="Signup"?<input name='username' value={formData.username} onChange={changeHandler} type="text" placeholder='Your name' />:<></>}
          <input name='email' value={formData.email} onChange={changeHandler} type="email" placeholder='Email' />
          <input name='password' value={formData.password} onChange={changeHandler} type="password" placeholder='Password' />
        </div>
        <button onClick={()=>{state==="Login"?login():signup()}}>{state}</button>
        {state==="Signup"?<p className='loginsignup-login'>Already have an account ? <span onClick={()=>setState("Login")}>Login</span></p>
        :<p className='loginsignup-login'>Don't have an account?<p className='loginsignup-login'>   
        Create an account <span onClick={()=>setState("Signup")}>Click here</span></p> </p>
  }
      </div>
    </div>
  )
}

export default LoginSignup
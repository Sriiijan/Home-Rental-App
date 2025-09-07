import React from 'react'
import { useState } from 'react'
import "../../styles/Login.scss"
import { setlogin } from '../../redux/authSlice.js';
import {useDispatch} from 'react-redux';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail]= useState("");
  const [password, setPassword]= useState("");

  const dispatch= useDispatch();
  const navigate= useNavigate();

  const handleSubmit= async (e) => {
    e.preventDefault()
    // console.log("Email:", email);
    // console.log("Password:", password);

    const requestData= {
      email: email,
      password: password
    }

    // console.log(requestData);
    

    try {
      const config = {
          headers: {
              "Content-Type": "application/json",
          },
      };

      // console.log("Submitting registration form...");

      const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/v1/users/login`,
          requestData,
          config
      );

      const loggedIn= response;

      // console.log("LOGGED IN ", loggedIn.data);
      

      if(loggedIn) {
        dispatch (
          setlogin( {
            user: loggedIn.data.data.user,
            token: loggedIn.data.data.token
          })
        )
        navigate('/');
      }
    } catch (error) {
      console.log("Login failed: ", error);
      
    }
  }

  return (
    <div className='login'>
      <div className='login_content'>
        <form className='login_content_form' onSubmit={handleSubmit}>
            <input
             type="email"
             placeholder='email'
             value={email}
             onChange={(e) => setEmail(e.target.value)}
             required
            />
            <input
             type="password"
             placeholder='password'
             value={password}
             onChange={(e) => setPassword(e.target.value)}
             required
            />
            <button type='submit'>Log In</button>
        </form>
        <a href="/register">Don't have an account? Sign In Here</a>
      </div>
    </div>
  )
}

export default Login

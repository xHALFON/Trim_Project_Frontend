import React, { useEffect } from 'react'
import FetchPosts from '../components/fetchPosts.tsx';
import NavBar from '../components/NavBar.tsx';
import Cookies from 'js-cookie';
import axios from 'axios';
export default function Home({ setAuth, logout }) {
  useEffect(()=>{
    async function refreshToken() {
      const server = process.env.REACT_APP_API_URL;
  
      try {
        const response = await axios.post(`${server}/auth/refreshToken`, {
          id: Cookies.get("user_id"),
          accessToken: Cookies.get("accessToken"),
        });
        
        if(response.status == 201){
          console.log("token good");
          return;
        }else{
       
        Cookies.set("accessToken", response.data.accessToken);
        window.location.reload();
        }
      
      } catch (error) {
        console.error("Error Refresh Token:", error);
  
        
        if (error.response?.status === 403) {
          logout();
          alert("Session expired!");
        }
      }
    }
  
    
    if (Cookies.get("user_id") && Cookies.get("accessToken")) {
      refreshToken();
    } else {
      logout();
      alert("Missing user credentials");
    }
  },[])
  return (
    <div>
      <FetchPosts userIdProp={Cookies.get("user_id")} addPost={true}/>
    </div>
  )
}

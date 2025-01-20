import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaLock } from 'react-icons/fa';  // אייקון מנעול
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
export default function Forbidden({ setAuth, logout }) {

  const navigate = useNavigate();

  useEffect(() => {
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
  }, []);
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center p-10 bg-blue-500 shadow-xl rounded-lg border border-blue-700">
        <FaLock className="text-white text-6xl mb-4 mx-auto" />
        <h1 className="text-4xl font-bold text-white">This Page is Locked</h1>
        <p className="mt-4 text-xl text-gray-100">Access to this page is restricted. The content of the site is not available at the moment.</p>
        <div className="mt-7"><Link to="/" className="mt-6 text-white hover:text-blue-100 text-2xl">Go back to Home</Link></div>
      </div>
    </div>
  );
}

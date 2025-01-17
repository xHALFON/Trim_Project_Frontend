import React, { useEffect, useState } from 'react';
import './App.css';
import {BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Cookies from "js-cookie";
import axios from 'axios';
import Welcome from './pages/Welcome.tsx';
import Home from './pages/Home.tsx';
import LoadingSplash from './components/LoadingSplash.tsx';
import Forbidden from './pages/Forbidden.tsx';
import Profile from './pages/Profile.tsx';
import FetchProfile from './pages/FetchProfile.tsx';
import NavBar from './components/NavBar.tsx';
import Explore from './pages/Explore.tsx';

function App() {
  const [auth, setAuth] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    setLoading(true)
    async function checkToken(){
      const token = Cookies.get("accessToken");
      if (token) {
        try{
          const server = process.env.REACT_APP_API_URL;
          const response = await axios.post(`${server}/auth/payload/${token}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if(response.data){
            setAuth(token);
          }else{
            setAuth('');
            Cookies.remove('accessToken');
            Cookies.remove('user_id');
          }
        }catch(error){
          console.error("Error during payload", error);
        }
      }else{
        setAuth('');
        Cookies.remove('accessToken');
        Cookies.remove('user_id');
      }
    }
    setTimeout(() => {
      setLoading(false);
    }, 2000);
    checkToken();
  }, [auth]);

  if (loading && Cookies.get("accessToken")) {
    return (
      <div className="App">
        <LoadingSplash />
      </div>
    );
  }else if(auth == ''){
    return (
      <div className="App">
        <Router>
          <Routes>
            <Route path="/" element={<Welcome setAuth={setAuth} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </div>
    );
  }else{
    return (
      <div className="App">
        <Router>
        <div>
          <NavBar />
        </div>
          <Routes>
            <Route path="/" element={<div><Home /></div>} />
            <Route path="/profile" element={<Profile setAuth={setAuth} />} />
            <Route path="/profile/:userName" element={<FetchProfile setAuth={setAuth} />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="*" element={<Forbidden />} />
          </Routes>
        </Router>
      </div>
    );
  }
}

export default App;

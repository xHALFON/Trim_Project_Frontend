import React, { useEffect, useState } from 'react';
import './App.css';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Cookies from "js-cookie";
import axios from 'axios';
import Welcome from './pages/Welcome.tsx';
import Home from './pages/Home.tsx';
import LoadingSplash from './components/LoadingSplash.tsx';
import Forbidden from './pages/Forbidden.tsx';

function App() {
  const [auth, setAuth] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);


  useEffect(() => {
    async function checkToken(){
      const token = Cookies.get("accessToken");
      if (token) {
        try{
          const server = process.env.REACT_APP_API_URL;
          const response = await axios.post(`${server}/auth/payload/${token}`);
          if(response.data){
            setAuth(token);
          }else{
            setAuth('');
          }
        }catch(error){
          console.error("Error during payload", error);
        }
        setAuth(token);
      }else{
        setAuth('');
      }
    }
    setTimeout(() => {
      setLoading(false);
    }, 2000);
    checkToken();
  }, []);

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
            <Route path="/" element={<Welcome />} />
          </Routes>
        </Router>
      </div>
    );
  }else{
    return (
      <div className="App">
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="*" element={<Forbidden />} />
          </Routes>
        </Router>
      </div>
    );
  }
}

export default App;

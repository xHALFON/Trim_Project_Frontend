import React, { useState } from 'react';
import NavbarLogin from '../components/NavBarLogin.tsx';
import network from "../assests/Network.png";
import Cookies from "js-cookie";
import axios from 'axios';

function Welcome({ setAuth }) {
  const [userName, setUserName] = useState<string>('');
  const [Email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [error, setError] = useState('');


  async function signUp(e: React.FormEvent) {
    e.preventDefault(); 

    if (userName.length < 2) {
      setError("Username must be at least 2 characters.");
      return;
    }

    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/; // לפחות 6 תווים, לפחות תו אחד וספרה אחת
    if (!passwordRegex.test(password)) {
      setError("Password must be at least 6 characters long and include at least one letter and one number.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if(gender == ''){
      setError("Gender required");
      return;
    }
    setError(""); 

    try{
      const server = process.env.REACT_APP_API_URL;

      await axios.post(`${server}/auth/register`, {
        username: userName,
        email: Email,
        password: password,
        gender: gender
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const responseLogin = await axios.post(`${server}/auth/login`, {
        email: Email,
        password: password,
      });
      Cookies.set("accessToken", responseLogin.data.accessToken, { expires: 1, secure: true });
      setAuth(responseLogin.data.accessToken);

    }catch(error){
      console.log("Error during sign up: " + error);
      
    }
  }

  return (
    <div className="h-screen flex flex-col">
      <NavbarLogin setAuth={setAuth} />
      <div className="flex h-full">
        {/* Left side - Background image, hidden on small screens */}
        <div className="w-1/2 h-full bg-gray-100 bg-contain bg-center hidden sm:block" style={{
          backgroundImage: `url(${network})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: 'center 55%',
          backgroundSize: '90%'
        }}></div>

        {/* Right side - Form */}
        <div className="w-full sm:w-1/2 flex justify-center items-center bg-gray-100">
          <form className="w-3/5 max-w-lg p-8 bg-white rounded-lg shadow-lg" onSubmit={signUp}>
            <h1 className="text-4xl font-bold text-center text-blue-600 mb-3">Welcome to Our Platform</h1>
            <p className="text-center text-gray-600 mb-1">Create your account to get started.</p>

            {error && <div className="mb-4 text-red-500">{error}</div>}

            <div className="mb-6">
              <input
                type="text"
                placeholder="Username"
                className="w-full p-4 border border-gray-300 rounded-md"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>

            <div className="mb-6">
              <input
                type="email"
                placeholder="Email"
                className="w-full p-4 border border-gray-300 rounded-md"
                value={Email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-6">
              <input
                type="password"
                placeholder="Password"
                className="w-full p-4 border border-gray-300 rounded-md"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="mb-6">
              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full p-4 border border-gray-300 rounded-md"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="mb-6">
              <label htmlFor="gender" className="block text-gray-700 mb-2">Gender</label>
              <select
                id="gender"
                name="gender"
                className="w-full p-4 border border-gray-300 rounded-md"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full p-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Welcome;

import React, { useState } from 'react';
import NavbarLogin from '../components/NavBarLogin.tsx';
import network from "../assests/Network.png"

function Welcome() {
  const [userName, setUserName] = useState('');
  const [Email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState('');

  return (
    <div className="h-screen flex flex-col">
      <NavbarLogin />
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
          <form className="w-3/5 max-w-lg p-8 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-6">Sign Up</h2>
            
            <div className="mb-6">
              <input
                type="text"
                placeholder="Username"
                className="w-full p-4 border border-gray-300 rounded-md"
              />
            </div>
            
            <div className="mb-6">
              <input
                type="email"
                placeholder="Email"
                className="w-full p-4 border border-gray-300 rounded-md"
              />
            </div>
            
            <div className="mb-6">
              <input
                type="password"
                placeholder="Password"
                className="w-full p-4 border border-gray-300 rounded-md"
              />
            </div>
            
            <div className="mb-6">
              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full p-4 border border-gray-300 rounded-md"
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="gender" className="block text-gray-700 mb-2">Gender</label>
              <select
                id="gender"
                name="gender"
                className="w-full p-4 border border-gray-300 rounded-md"
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

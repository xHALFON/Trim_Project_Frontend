import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const NavbarLogin = ({setAuth}) => {
  const [Email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [borderColor, setBorderColor] = useState({
    email: "border-black",
    password: "border-black",
  });

  async function Login() {
    const server = process.env.REACT_APP_API_URL;
    try {
      const response = await axios.post(`${server}/auth/login`, {
        email: Email,
        password: password,
      });
      
      Cookies.set("accessToken", response.data.accessToken, { expires: 1, secure: true });
      setAuth(response.data.accessToken)
      
      setMessage("");
      setBorderColor({
        email: "border-black",
        password: "border-black",
      });

      
    } catch (error) {
      console.error("Error during login:", error);
      if (error.response?.status === 401) {
        setMessage("Email or Password is invalid");
        setBorderColor({
          email: "border-red-700",
          password: "border-red-700",
        });
      }
    }
  }

  return (
    <nav className="bg-blue-900 text-white px-4 sm:px-20 md:px-40 lg:px-60 py-5 flex flex-col sm:flex-row justify-between items-center">
      <div className="text-2xl font-bold mb-4 sm:mb-0">Trim Network</div>
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 items-center">
        <div>
          <p className="text-m">{message}</p>
        </div>
        <div>
          <input
            type="text"
            placeholder="Email"
            className={`p-2 rounded text-black ${borderColor.email} border-2 py-1 w-64 sm:w-auto`}
            value={Email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setBorderColor({ ...borderColor, email: "border-black" })}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            className={`p-2 rounded text-black ${borderColor.password} border-2 py-1 w-64 sm:w-auto`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setBorderColor({ ...borderColor, password: "border-black" })}
          />
        </div>
        <button className="bg-white text-blue-600 font-semibold px-6 py-1 rounded" onClick={Login}>
          Log In
        </button>
      </div>
    </nav>
  );
};

export default NavbarLogin;

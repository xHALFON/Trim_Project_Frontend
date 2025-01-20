import axios from "axios";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import avatar from "../assests/Avatar.png";
import avatarTop from "../assests/topAvatar.jpg";
import ClipLoader from "react-spinners/ClipLoader";
import { useNavigate } from "react-router-dom";
import FemaleIcon from '@mui/icons-material/Female';
import MaleIcon from '@mui/icons-material/Male';

interface User {
  _id: string;
  username: string;
  email: string;
  password: string;
  gender: string;
  status: string;
  profileImage: string;
  profileImageTop: string;
}

export default function Explore({ setAuth, logout }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const handleNavigateProfile = (profileName: string) => {
    navigate(`/profile/${profileName}`);
  };

  const shuffleArray = (array: User[]) => {
    let shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
  };

  useEffect(() => {
    async function refreshToken() {
      const server = process.env.REACT_APP_API_URL;

      try {
        const response = await axios.post(`${server}/auth/refreshToken`, {
          id: Cookies.get("user_id"),
          accessToken: Cookies.get("accessToken"),
        });

        if(response.status === 201){
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

    async function fetchUsers() {
      setLoading(true);
      const server = process.env.REACT_APP_API_URL;
      try {
        const response = await axios.get(`${server}/auth/users`, {
          headers: { Authorization: `Bearer ${Cookies.get("accessToken")}` },
        });
        const shuffledUsers = shuffleArray(response.data);
        setUsers(shuffledUsers);
        setTimeout(() => {
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error("Error fetching users:", error);
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full md:w-3/5 border-x px-4 sm:px-6 md:px-10">
        {!loading && <h1 className="text-3xl font-bold text-gray-800 mb-4">Explore Users</h1>}

        {!loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pt-7 border-t-2 border-gray-200 gap-6">
            {users
              .filter((user) => user._id !== Cookies.get("user_id"))
              .slice(0, 12)
              .map((user, index) => (
                <div
                  key={index}
                  className="bg-white shadow-lg rounded-xl border-2 overflow-hidden flex flex-col items-center pb-10 w-full h-auto max-w-[280px] cursor-pointer transition-all duration-300 hover:border-2 hover:border-blue-900"
                  onClick={() => handleNavigateProfile(user.username)}
                >
                  <div
                    className="w-full h-20 bg-cover bg-center"
                    style={{
                      backgroundImage:
                        user.profileImageTop !== "none"
                          ? `url(${process.env.REACT_APP_API_URL}/uploads/${user.profileImageTop})`
                          : `url(${avatarTop})`,
                    }}
                  ></div>
                  <img
                    src={
                      user.profileImage !== "none"
                        ? `${process.env.REACT_APP_API_URL}/uploads/${user.profileImage}`
                        : avatar
                    }
                    alt={`${user.username}'s profile`}
                    className="w-20 h-20 rounded-full border-4 border-white -mt-10 object-cover"
                  />
                  <h3 className="text-lg font-semibold text-gray-800 mt-4">{user.username}</h3>
                  <h4 className="text-gray-600 text-center break-words">{user.status}</h4>
                  <span className="mt-2">
                    {user.gender === "male" ? (
                      <MaleIcon sx={{ color: "blue", fontSize: 30 }} />
                    ) : user.gender === "female" ? (
                      <FemaleIcon sx={{ color: "#ed007b", fontSize: 30 }} />
                    ) : (
                      ""
                    )}
                  </span>
                </div>
              ))}
          </div>
        ) : (
          <ClipLoader />
        )}
      </div>
    </div>
  );
}

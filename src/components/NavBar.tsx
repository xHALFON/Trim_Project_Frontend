import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaUser, FaHome, FaCog } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import avatar from '../assests/Avatar.png';
import SearchUsers from './search.tsx';

export default function NavBar({setAuth}) {
  const [profileImage, setProfileImage] = useState<string | undefined>();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [users, setUsers] = useState<any>();
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  const logout = () => {
    Cookies.remove('accessToken');
    Cookies.remove('user_id');
    setAuth('');
    navigate('/');
  };
  useEffect(() => {
    async function fetchUsers() {
      const server = process.env.REACT_APP_API_URL;
      try {
        const response = await axios.get(`${server}/auth/users`, {
          headers: { Authorization: `Bearer ${Cookies.get("accessToken")}` },
        });
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    }
    fetchUsers();

    async function fetchProfile() {
      const server = process.env.REACT_APP_API_URL;
      const response = await axios.get(`${server}/auth/${Cookies.get("user_id")}`, {
        headers: { Authorization: `Bearer ${Cookies.get("accessToken")}` },
      });
      if (response.data.profileImage !== 'none') {
        setProfileImage(`${server}/uploads/${response.data.profileImage}`);
      } else {
        setProfileImage(avatar);
      }
    }
    fetchProfile();
  }, []);

  // פונקציה שמסדרת את סגירת התפריט אחרי דיליי
  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    const newTimeoutId = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 150); 
    setTimeoutId(newTimeoutId);
  };

  const handleMouseEnter = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setIsDropdownOpen(true);
  };

  return (
    <div className="bg-blue-900 p-4 z-10 relative">
      <div className="flex justify-around items-center">
        {/* צד שמאל - Trim Network */}
        <Link to="/">
          <div className="text-2xl cursor-pointer text-white font-bold hover:text-gray-200">
            Trim Network
          </div>
        </Link>

        <span className="w-1/3">
          <SearchUsers users={users} />
        </span>

        {/* צד ימין - פרופיל ואייקונים */}
        <div className="flex items-center space-x-6 hover:text-gray-200 relative">
          <Link to="/">
            <FaHome className="text-2xl text-white cursor-pointer hover:text-gray-200" />
          </Link>
          <Link to="/profile">
            <FaUser className="text-2xl text-white cursor-pointer hover:text-gray-200" />
          </Link>
          <div
            className="relative"
            onMouseEnter={handleMouseEnter} 
            onMouseLeave={handleMouseLeave} 
          >
            <FaCog className="text-2xl text-white cursor-pointer hover:text-gray-200" />
            {isDropdownOpen && (
              <div
                className="absolute mt-7 bg-blue-900 rounded-b-md shadow-lg w-48 z-50 left-[-50px]"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  onClick={() => {navigate('/profile'); setIsDropdownOpen(false);}}
                  className="block w-full px-4 py-2 text-left border-b hover:bg-blue-800 text-white"
                >
                  Profile
                </button>
                <button
                  onClick={() => {navigate("/settings"); setIsDropdownOpen(false);}}
                  className="block w-full px-4 py-2 text-left border-y hover:bg-blue-800 text-white"
                >
                  Advanced Settings
                </button>
                <button
                  onClick={() => {logout(); setIsDropdownOpen(false);}}
                  className="block text-red-400 w-full px-4 py-2 text-left rounded-b-md border-y hover:bg-blue-800"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
          {/* תמונת פרופיל */}
          <div className="w-12 h-12 relative left-5">
            <img
              src={profileImage}
              className="w-full h-full object-cover rounded-full border-2 border-white shadow-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

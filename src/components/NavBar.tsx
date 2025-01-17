import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaUser, FaHome, FaUsers, FaCog, FaSearch } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import avatar from '../assests/Avatar.png';
import SearchUsers from './search.tsx';
export default function NavBar() {
  const [profileImage, setProfileImage] = useState<string | undefined>();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [users,setUsers] = useState<any>();
  const navigate = useNavigate();

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

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate(`/profile/${searchTerm.trim()}`);
    }
  };

  return (
    <div className="bg-blue-900 p-4">
      <div className="flex justify-around items-center">
        {/* צד שמאל - Trim Network */}
        <Link to="/">
          <div className="text-2xl cursor-pointer text-white font-bold hover:text-gray-200">
            Trim Network
          </div>
        </Link>

        <span className="w-1/3">
        <SearchUsers users={users}/>
        </span>

        {/* צד ימין - פרופיל ואייקונים */}
        <div className="flex items-center space-x-6 hover:text-gray-200">
          <Link to="/">
            <FaHome className="text-2xl text-white cursor-pointer hover:text-gray-200" />
          </Link>
          <Link to="/profile">
            <FaUser className="text-2xl text-white cursor-pointer hover:text-gray-200" />
          </Link>
          <Link to="/settings">
            <FaCog className="text-2xl text-white cursor-pointer hover:text-gray-200" />
          </Link>
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

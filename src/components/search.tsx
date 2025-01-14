import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaUsers } from "react-icons/fa";
import avatar from '../assests/Avatar.png';

type User = {
  _id: string;
  username: string;
  profileImage: string;
  gender: string;
};

export default function SearchUsers({ users }: { users: User[] }) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [serverApi, setServerApi] = useState(process.env.REACT_APP_API_URL);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLDivElement>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim()) {
      const filtered = users.filter((user) =>
        user.username.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredUsers(filtered.slice(0, 10));
    } else {
      setFilteredUsers([]);
    }
  };

  const handleUserClick = (username: string) => {
    navigate(`/profile/${username}`);
    setFilteredUsers([]);
    setSearchTerm("");
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
      setFilteredUsers([]);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  return (
    <div
      className="flex items-center relative w-full max-w-4xl mx-auto"
      ref={inputRef}
    >
      <div className="relative flex-grow">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full p-2 pl-10 rounded-lg border border-gray-300"
        />
        <FaSearch className="absolute left-3 text-black top-1/2 transform -translate-y-1/2" />
        {filteredUsers.length > 0 && (
          <ul className="absolute bg-white w-full mt-2 border border-gray-300 rounded-lg shadow-md max-h-60 overflow-y-auto z-10">
            {filteredUsers.map((user) => {
                
                return(
              <li
                key={user._id}
                onClick={() => handleUserClick(user.username)}
                className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-100"
              >
                {/* תמונה בצד שמאל */}
                <div className="flex items-center">
                  <img
                    src={user.profileImage != 'none' ? `${serverApi}/uploads/${user.profileImage}` : avatar}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <span className="text-sm font-medium">{user.username}</span>
                </div>
                {/* מגדר בצד ימין */}
                <span className="text-sm text-gray-500">{user.gender}</span>
              </li>
            )})}
          </ul>
        )}
      </div>
      <Link to="/explore" className="ml-4">
        <FaUsers className="text-3xl text-white cursor-pointer hover:text-gray-200" />
      </Link>
    </div>
  );
}

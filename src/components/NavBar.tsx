import React from 'react';
import { FaUser, FaHome, FaUsers, FaCog, FaSearch } from 'react-icons/fa';  // אייקונים של פרופיל ו-פוסטים

export default function NavBar() {
  return (
    <div className="bg-blue-900 p-4">
      <div className="flex justify-around items-center">
        {/* צד שמאל - Trim Network */}
        <div className="text-2xl cursor-pointer text-white font-bold mb-4 sm:mb-0">Trim Network</div>

        {/* צד אמצע - Input חיפוש */}
        <div className="flex items-center justify-center w-1/3 relative">
        <input
            type="text"
            placeholder="Search..."
            className="w-full p-2 pl-10 pr-12 rounded-lg border border-blue-500"
          />
          <div className="flex items-center text-white ml-5 cursor-pointer">
            <FaUsers className="text-3xl" />
          </div>
          <FaSearch className="absolute left-3 text-black top-1/2 transform -translate-y-1/2" />
        </div>

        {/* צד ימין - פרופיל ופוסטים */}
        <div className="flex space-x-6 text-white">
          <div className="flex items-center cursor-pointer">
            <FaHome className="text-2xl" />
          </div>
          <div className="flex items-center cursor-pointer">
            <FaUser className="text-2xl" />
          </div>
          <div className="flex items-center cursor-pointer">
            <FaCog className="text-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import avatarTop from "../assests/topAvatar.jpg";
import avatar from "../assests/Avatar.png";

export default function Settings({ setAuth, logout }) {
  const [profileName, setProfileName] = useState('');
  const [profileGender, setProfileGender] = useState('');
  const [profileStatus, setProfileStatus] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [profileImageTop, setProfileImageTop] = useState('');

  useEffect(() => {
    async function refreshToken() {
      const server = process.env.REACT_APP_API_URL;
  
      try {
        const response = await axios.post(`${server}/auth/refreshToken`, {
          id: Cookies.get("user_id"),
          accessToken: Cookies.get("accessToken"),
        });
        
        if(response.status == 201){
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

    const fetchProfile = async () => {
      const server = process.env.REACT_APP_API_URL;
      const userid = Cookies.get('user_id');
      const accessToken = Cookies.get('accessToken');
      try {
        const response = await axios.get(`${server}/auth/${userid}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        setProfileName(response.data.username);
        setProfileGender(response.data.gender);
        setProfileStatus(response.data.status);

        if (response.data.profileImage === 'none') {
          setProfileImage(avatar);
        } else {
          setProfileImage(`${server}/uploads/${response.data.profileImage}`);
        }

        if (response.data.profileImageTop === 'none') {
          setProfileImageTop(avatarTop);
        } else {
          setProfileImageTop(`${server}/uploads/${response.data.profileImageTop}`);
        }
      } catch (error) {
        console.error('Error fetching profile:', error.response?.data || error.message);
      }
    };

    fetchProfile();
  }, []);

  const handleAccountDeletion = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete your account?");
    if (confirmDelete) {
      const server = process.env.REACT_APP_API_URL;
      const userid = Cookies.get('user_id');
      const accessToken = Cookies.get('accessToken');
      try {
        const response = await axios.delete(`${server}/auth/delete/${userid}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        alert("Your account has been successfully deleted.");
        Cookies.remove("accessToken");
        Cookies.remove("user_id");
        window.location.reload();
      } catch (error) {
        console.error('Error deleting account:', error.response?.data || error.message);
        alert('An error occurred while deleting your account.');
      }
    }
  };

  return (
    <div className="flex flex-col pt-20 items-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Advanced Settings</h1>
          <div className="w-1/3 bg-white shadow-lg rounded-xl border-2 overflow-hidden flex flex-col items-center">
            <div
              className="w-full h-36 bg-cover bg-center"
              style={{
                backgroundImage: `url(${profileImageTop})`
              }}
            ></div>
            {/* תמונת פרופיל */}
            <div className='w-48 h-48 relative -top-16'>
            <img
              src={profileImage}
              className="w-full h-full object-cover rounded-full shadow-lg"
            />
            </div>

          {/* Profile Information */}
          <div className="w-full -mt-10">
            <div className="w-2/3 mx-auto bg-gray-200 p-3 rounded-xl mb-4">
              <h2 className="text-xl font-semibold">{profileName}</h2>
            </div>
            <div className="w-2/3 mx-auto bg-gray-200 p-3 rounded-xl my-4">
              <p className="text-lg text-gray-600">Gender: {profileGender}</p>
            </div>
            <div className="w-2/3 mx-auto bg-gray-200 p-3 rounded-xl my-4">
              <p className="text-lg text-gray-600">Status: {profileStatus}</p>
            </div>
          </div>
        <button 
          onClick={handleAccountDeletion} 
          className="mt-4 bg-red-500 text-white px-6 py-3 rounded-md mb-5 text-lg hover:bg-red-600 transition duration-200">
          Delete Account
        </button>
        </div>
      </div>
  );
}

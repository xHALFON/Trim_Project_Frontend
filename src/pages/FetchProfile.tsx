import React, { useEffect, useState } from 'react';
import NavBar from '../components/NavBar.tsx';
import { useNavigate, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';
import avatar from '../assests/Avatar.png';
import avatarTop from '../assests/topAvatar.jpg';
import FetchPosts from '../components/fetchPosts.tsx';
import FemaleIcon from '@mui/icons-material/Female';
import MaleIcon from '@mui/icons-material/Male';
import ClipLoader from "react-spinners/ClipLoader";
import FetchUsersProfile from '../components/fetchUsersProfile.tsx';

export default function FetchProfile({ setAuth, logout }) {
  const navigate = useNavigate();
  const [profileName, setProfileName] = useState<string>();
  const [profileImage, setProfileImage] = useState<string>();
  const [profileImageTop, setProfileImageTop] = useState<string>();
  const [profileGender, setProfileGender] = useState<string>();
  const [profileStatus, setProfileStatus] = useState<string>();
  const [userId,setUserId] = useState<string>();
  const { userName } = useParams();

  
  useEffect(() => {
    const fetchProfile = async () => {
      if(userId){
        const server = process.env.REACT_APP_API_URL;
        const accessToken = Cookies.get('accessToken');
        try {
            const response = await axios.get(`${server}/auth/${userId}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            });
    
            setProfileName(response.data.username);
            setProfileGender(response.data.gender);
            setProfileStatus(response.data.status);

            setProfileImage(
            response.data.profileImage === 'none'
                ? avatar
                : `${server}/uploads/${response.data.profileImage}`
            );
    
            setProfileImageTop(
            response.data.profileImageTop === 'none'
                ? avatarTop
                : `${server}/uploads/${response.data.profileImageTop}`
            );
        } catch (error) {
            console.error('Error fetching profile:', error.response?.data || error.message);
        }
      }
    };
  
    fetchProfile();
    
  }, [userId]); 

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
    
    const fetchId = async () => {
        try {
          const server = process.env.REACT_APP_API_URL;
          const accessToken = Cookies.get('accessToken');
          const response = await axios.get(
            `${server}/auth/getUserByName/${userName}`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );
          console.log(response.data.id);
          if (Cookies.get('user_id') === response.data.id) {
            navigate('/profile');
            window.scrollTo(0, 0);
          }
          setUserId(response.data.id);
        } catch (error) {
          console.error('Error fetching user ID:', error);
          if(error.response.data.message = "User not found"){
            navigate("/UserNotFound");
            window.scrollTo(0, 0);
          }
        }
    }
    async function init() {
      if (Cookies.get("user_id") && Cookies.get("accessToken")) {
        try {
          await refreshToken();
          await fetchId();
        } catch (error) {
          console.error("Initialization failed:", error);
        }
      } else {
        logout();
        alert("Session expired");
      }
    }
    init();
  }, [userName]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex justify-center pt-10 pb-16">
        <div className="w-2/3  bg-white rounded-lg shadow-lg">
          <div className="w-full h-48 flex items-center justify-center text-white text-2xl font-bold relative border-b border-gray-200"
              style={{
                  width: '100%',  // או רוחב קבוע
                  height: '400px',  // גובה קבוע
                  backgroundImage: `url(${profileImageTop})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}           
              >
          </div>
          <div className="p-8 flex flex-row-reverse">
            <div className="w-1/3 flex flex-col items-center relative">
              <div className="w-48 h-48 mb-4 relative">
                <img src={profileImage} alt="" className="w-full h-full object-cover rounded-full shadow-lg" />
              </div>
              <h1 className="text-xl font-bold text-gray-800 mb-4">{profileName}</h1>
              <span className="mb-4">{profileGender == "male" ? <MaleIcon sx={{ color: 'blue', fontSize: 40 }} /> : profileGender == "female" ? <FemaleIcon sx={{ color: '#ed007b', fontSize: 40 }} /> : ""}</span>
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-2">{profileStatus}</h2>
              </div>
              <div>
                <FetchUsersProfile />
              </div>
            </div>
            <div className="w-full">
                {userId ? <FetchPosts profile={true} userIdProp={userId} addPost={false}/> : <ClipLoader />}
            </div>
          </div>
        </div>
      </div>
    </div>
    
  );  
}

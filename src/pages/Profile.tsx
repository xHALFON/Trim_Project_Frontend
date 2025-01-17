import React, { useEffect, useState } from 'react';
import NavBar from '../components/NavBar.tsx';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';
import avatar from '../assests/Avatar.png';
import avatarTop from '../assests/topAvatar.jpg';
import FetchPosts from '../components/fetchPosts.tsx';
import FemaleIcon from '@mui/icons-material/Female';
import MaleIcon from '@mui/icons-material/Male';

export default function Profile({ setAuth }) {
  const navigate = useNavigate();
  const [profileName, setProfileName] = useState<string>();
  const [profileImage, setProfileImage] = useState<string>();
  const [profileImageTop, setProfileImageTop] = useState<string>();
  const [profileGender, setProfileGender] = useState<string>();

  const logout = () => {
    Cookies.remove('accessToken');
    Cookies.remove('user_id');
    setAuth('');
    navigate('/');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, top=false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const server = process.env.REACT_APP_API_URL;
    const accessToken = Cookies.get('accessToken');

    const formData = new FormData();
    formData.append('file', file);

    try {
        // שמירת תמונה בשרת
        const response = await axios.post(`${server}/saveImage`, formData, {
            headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
            },
        });
      
        // עדכון תמונת הפרופיל
        const responseUpadate = await axios.post(`${server}/auth/updateProfileImage`,{
                userId: Cookies.get("user_id"),
                filename: response.data.originalname,
                top: top
        },
        {
            headers: {
            Authorization: `Bearer ${accessToken}`,
            },
        });

        const imageUrl = `${server}/uploads/${responseUpadate.data.filename}`;
        window.location.reload();
        if(top){
            setProfileImageTop(imageUrl);
        }else{
            setProfileImage(imageUrl);
        }
    } catch (error) {
      console.error('Error uploading image:', error.response?.data || error.message);
    }
  };

  useEffect(() => {
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

        if (response.data.profileImage === 'none') {
          setProfileImage(avatar);
        } else {
          setProfileImage(`${server}/uploads/${response.data.profileImage}`);
        }

        if(response.data.profileImageTop === 'none'){
            setProfileImageTop(avatarTop);
        }else{
            setProfileImageTop(`${server}/uploads/${response.data.profileImageTop}`);
        }
      } catch (error) {
        console.error('Error fetching profile:', error.response?.data || error.message);
      }
    };

    fetchProfile();
  }, []);


  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />
      <div className="flex justify-center mt-10">
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
              <input
                  type="file"
                  className="hidden"
                  id="headerImageUpload"
                  onChange={(e) => handleImageUpload(e, true)} // פונקציה חדשה לטיפול בהעלאת תמונת כותרת
              />
              <button
                  className="absolute bottom-4 right-4 bg-gray-200 text-black text-2xl p-2 rounded-full shadow-xl hover:bg-gray-300"
                  onClick={() => document.getElementById('headerImageUpload')?.click()}
              >
                  📷
              </button>
          </div>
          <div className="p-8 flex flex-row-reverse">
            <div className="w-1/3 flex flex-col items-center relative">
              <div className="w-48 h-48 mb-4 relative">
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover rounded-full shadow-lg" />
                <input
                  type="file"
                  className="hidden"
                  id="imageUpload"
                  onChange={handleImageUpload}
                />
                <button
                  className="absolute bottom-0 text-2xl right-0 bg-gray-200 text-white p-2 rounded-full shadow-xl hover:bg-gray-300"
                  onClick={() => document.getElementById('imageUpload')?.click()}
                  >📷
                </button>
              </div>
              <h1 className="text-xl font-bold text-gray-800 mb-4">{profileName}</h1>
              <span className="mb-4">{profileGender == "male" ? <MaleIcon sx={{ color: 'blue', fontSize: 40 }} /> : profileGender == "female" ? <FemaleIcon sx={{ color: '#ed007b', fontSize: 40 }} /> : ""}</span>
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Hobbies</h2>
                <ul className="list-disc list-inside text-gray-600">
                  <li>Coding</li>
                  <li>Reading</li>
                  <li>Traveling</li>
                </ul>
              </div>
              <button className="mt-6 bg-blue-900 text-white px-10 py-2 rounded-lg shadow hover:bg-blue-950">
                Edit Profile
              </button>
              <button
                onClick={logout}
                className="mt-6 bg-red-500 text-white px-10 py-2 rounded-lg shadow hover:bg-red-600"
              >
                Log Out
              </button>
            </div>
            <div className="w-full">
                <FetchPosts profile={true} userIdProp={Cookies.get("user_id")} addPost={true}/>
            </div>
          </div>
        </div>
      </div>
    </div>
    
  );  
}

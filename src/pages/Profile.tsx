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
import FetchUsersProfile from '../components/fetchUsersProfile.tsx';

export default function Profile({ setAuth }) {
  const navigate = useNavigate();
  const [profileName, setProfileName] = useState<string>('');
  const [profileImage, setProfileImage] = useState<string>('');
  const [profileImageTop, setProfileImageTop] = useState<string>('');
  const [profileGender, setProfileGender] = useState<string>('');
  const [profileStatus, setProfileStatus] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [newName, setNewName] = useState<string>('');
  const [newGender, setNewGender] = useState<string>('');
  const [newStatus, setNewStatus] = useState<any>('');
  const [updateImage, setUpdateImage] = useState<any>('');
  const [updateImageModal,setUpdateImageModal] = useState<any>(null);
  const [message, setMessage] = useState<string>('');
  const logout = () => {
    Cookies.remove('accessToken');
    Cookies.remove('user_id');
    setAuth('');
    navigate('/');
  };

  const handleImageEdit = (e) => {
    const file = e.target.files[0];
    setUpdateImageModal(file);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, top = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const server = process.env.REACT_APP_API_URL;
    const accessToken = Cookies.get('accessToken');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${server}/saveImage`, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      const responseUpadate = await axios.post(
        `${server}/auth/updateProfileImage`,
        {
          userId: Cookies.get('user_id'),
          filename: response.data.originalname,
          top: top,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      window.location.reload();
    } catch (error) {
      console.error('Error uploading image:', error.response?.data || error.message);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(e.target.value);
  };

  const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewGender(e.target.value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewStatus(e.target.value);
  };

  const handleModalSave = async () => {
    const server = process.env.REACT_APP_API_URL;
    const accessToken = Cookies.get('accessToken');
    try {
      if(newStatus.length > 45){
        setMessage("Status must contains 0-30 characters");
        return;
      }
      if(newName.length > 15){
        setMessage("Username must contains 1-30 characters");
        return;
      }
      if(newStatus.length == 0){
        setNewStatus(null);
      }
      await axios.put(`${server}/auth/update/${Cookies.get("user_id")}`,
        {
          username: newName,
          gender: newGender,
          status: newStatus || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
        }
      );
      if(updateImage){
      handleImageUpload(updateImage);
      }else{
        window.location.reload();
      }
      setModalOpen(false);
    } catch (error) {
      console.error('Error saving profile:', error.response?.data || error.message);
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
        setNewName(response.data.username);
        setProfileGender(response.data.gender);
        setNewGender(response.data.gender);
        setProfileStatus(response.data.status);
        setNewStatus(response.data.status);
        
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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex justify-center pt-10 pb-16">
        <div className="w-2/3 bg-white rounded-lg shadow-lg">
          <div
            className="w-full h-48 flex items-center justify-center text-white text-2xl font-bold relative border-b border-gray-200"
            style={{
              width: '100%',
              height: '400px',
              backgroundImage: `url(${profileImageTop})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <input
              type="file"
              className="hidden"
              id="headerImageUpload"
              onChange={(e) => handleImageUpload(e, true)}
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
                <img
                  src={profileImage}
                  alt=""
                  className="w-full h-full object-cover rounded-full shadow-lg"
                />
                <input
                  type="file"
                  className="hidden"
                  id="imageUpload"
                  onChange={(handleImageUpload)}
                />
                <button
                  className="absolute bottom-0 text-2xl right-0 bg-gray-200 text-white p-2 rounded-full shadow-xl hover:bg-gray-300"
                  onClick={() => document.getElementById('imageUpload')?.click()}
                >
                  📷
                </button>
              </div>
              <h1 className="text-xl font-bold text-gray-800 mb-4">{profileName}</h1>
              <span className="mb-4">
                {profileGender === 'male' ? (
                  <MaleIcon sx={{ color: 'blue', fontSize: 40 }} />
                ) : profileGender === 'female' ? (
                  <FemaleIcon sx={{ color: '#ed007b', fontSize: 40 }} />
                ) : (
                  ''
                )}
              </span>
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-2">{profileStatus}</h2>
              </div>
              <button
                className="mt-6 bg-blue-900 text-white px-10 py-2 rounded-lg shadow hover:bg-blue-950"
                onClick={() => setModalOpen(true)} // פותח את המודאל
              >
                Edit Profile
              </button>
              <button
                onClick={logout}
                className="mt-6 bg-red-500 text-white px-10 py-2 rounded-lg shadow hover:bg-red-600"
              >
                Log Out
              </button>
              <div>
                <FetchUsersProfile />
              </div>
            </div>
            <div className="w-full">
              <FetchPosts profile={true} userIdProp={Cookies.get('user_id')} addPost={true} />
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-8 rounded-lg w-1/3">
            <h2 className="text-xl font-bold mb-4">Edit Profile</h2>

            {/* Profile Image */}
            <div className="w-48 h-48 mb-4 relative mx-auto">
              <img
                src={updateImageModal != null ? URL.createObjectURL(updateImageModal) : profileImage}
                alt=""
                className="w-full h-full object-cover rounded-full shadow-lg"
              />
              <input
                type="file"
                className="hidden"
                id="updateImageUpload"
                onChange={(e) => {setUpdateImage(e); handleImageEdit(e)}}
              />
              <button
                className="absolute bottom-0 text-2xl right-0 bg-gray-200 text-white p-2 rounded-full shadow-xl hover:bg-gray-300"
                onClick={() => document.getElementById('updateImageUpload')?.click()}
              >
                📷
              </button>
            </div>

            {/* Name Change */}
            <div className="mb-4 w-1/2 mx-auto">
              <label className="block text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={newName}
                onChange={handleNameChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Status Change */}
            <div className="mb-4 w-1/2 mx-auto">
              <label className="block text-gray-700 mb-2">Status</label>
              <input
                type="text"
                value={newStatus}
                onChange={handleStatusChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Gender Change */}
            <div className="mb-4 w-1/2 mx-auto">
              <label className="block text-gray-700 mb-2">Gender</label>
              <select
                value={newGender}
                onChange={handleGenderChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              <div className='mt-5'>
                <p className='text-red-600 font-bold text-lg'>{message}</p>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => {setModalOpen(false); setMessage(""); setNewName(profileName); setNewStatus(profileStatus); setNewGender(profileGender); setUpdateImageModal(null);}}
                className="bg-gray-300 text-black px-6 py-2 rounded-lg">
                Cancel
              </button>
              <button
                onClick={handleModalSave}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg" >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

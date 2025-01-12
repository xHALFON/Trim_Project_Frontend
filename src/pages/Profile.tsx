import React, { useEffect, useState } from 'react';
import NavBar from '../components/NavBar.tsx';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie'; // ניהול טוקן ב-Cookies
import axios from 'axios';
import img from '../assests/images.jpg';
import avatar from '../assests/Avatar.png';


interface Post {
    title: string;
    content: string;
    sender: string;
    image: string;
    senderImg: string,
    senderName: string
}


export default function Profile({ setAuth }) {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [profileName, setProfileName] = useState<string>();
  const [profileImage, setProfileImage] = useState();
  const [message, setMessage] = useState(''); // הודעה במקרה שאין פוסטים

  // יציאה מהמערכת
  const logout = () => {
    Cookies.remove('accessToken');
    Cookies.remove('user_id');
    setAuth('');
    navigate('/');
  };

  // הבאת פוסטים מהשרת
  useEffect(() => {
    const fetchProfile = async () => {
        const server = process.env.REACT_APP_API_URL;
        const userid = Cookies.get('user_id');
        const accessToken = Cookies.get('accessToken');
        try{
            const response = await axios.get(`${server}/auth/${userid}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            setProfileName(response.data.username);
            if(response.data.profileImage == 'none'){
                setProfileImage(avatar);
            }else{
                setProfileImage(response.data.profileImage);
            }
            console.log(response);
            
        }catch(error){
            console.error('Error fetching profile:', error.response?.data || error.message);
        }
    }
    const fetchPosts = async () => {
      const server = process.env.REACT_APP_API_URL;
      try {
        const userid = Cookies.get('user_id');
        const accessToken = Cookies.get('accessToken');

        if (!userid || !accessToken) {
          throw new Error('Missing user ID or access token');
        }

        const response = await axios.get(`${server}/post/`, {
          params: { sender: userid },
          headers: { Authorization: `Bearer ${accessToken}` },
        });
          setPosts(response.data)
      } catch (error) {
        console.error('Error fetching posts:', error.response?.data || error.message);
        setMessage('Failed to fetch posts');
      }
    };
    fetchProfile();
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* סרגל ניווט */}
      <NavBar />

      {/* תוכן פרופיל */}
      <div className="flex justify-center mt-10">
        <div className="w-2/3 bg-white rounded-lg shadow-lg">
          {/* תמונת רקע */}
          <div
            className="w-full h-48 flex items-center justify-center text-white text-2xl font-bold"
            style={{
              backgroundImage: `url(${profileImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />

          {/* גוף הפרופיל */}
          <div className="p-8 flex">
            {/* צד שמאל - פוסטים */}
            <div className="w-2/3 pl-6 border-r pr-4">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">My Posts</h2>
              {message ? (
                <p className="text-gray-500">{message}</p>
              ) : (
                <ul className="space-y-4">
                  {posts.slice().reverse().map((post, index) => (
                    <li key={index} className="bg-gray-100 p-4 rounded-md shadow-md text-gray-800">

                        {/* שולח הפוסט*/}
                        <div className="flex items-center mb-4">
                            <img
                                src={post.senderImg == 'none' ? avatar : post.image}
                                alt="Sender"
                                className="w-10 h-10 rounded-full mr-4"
                            />
                            <h3 className="text-lg font-bold">{post.senderName || 'Unknown Sender'}</h3>
                        </div>

                        {/* תוכן הפוסט */}
                        <div className="border-t border-b border-gray-300 pb-4">
                            {/* כותרת הפוסט */}
                            <p className="text-left text-xl font-bold text-gray-800 ml-2 mt-2 mb-2">{post.title}</p>
                            
                            {/* תוכן הפוסט */}
                            <p className="text-left text-gray-700 ml-5 mr-5">{post.content}</p>
                        </div>

                        {/* תמונה מתחת לכותרת */}
                        {post.image && (
                            <div className="mb-4">
                            <img
                                src={img}
                                alt="Post"
                                className="w-full h-auto rounded-md"
                            />
                            </div>
                        )}

                        {/* אפשרויות לייק ותגובה */}
                        <div className="flex justify-around items-center mt-4">
                            <button className="text-blue-500 hover:text-blue-700 font-semibold">
                                👍 Like
                            </button>
                            <button className="text-blue-500 hover:text-blue-700 font-semibold">
                                💬 Comment
                            </button>
                        </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* צד ימין - תמונת פרופיל ותחביבים */}
            <div className="w-1/3 flex flex-col items-center">
              {/* תמונת פרופיל */}
              <div className="w-32 h-32 mb-4">
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full shadow-lg"
                />
              </div>
              {/* שם משתמש */}
              <h1 className="text-xl font-bold text-gray-800 mb-4">{profileName}</h1>
              {/* תחביבים */}
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Hobbies</h2>
                <ul className="list-disc list-inside text-gray-600">
                  <li>Coding</li>
                  <li>Reading</li>
                  <li>Traveling</li>
                </ul>
              </div>
              {/* כפתור יציאה */}
              <button
                className="mt-6 bg-blue-900 text-white px-10 py-2 rounded-lg shadow hover:bg-blue-950"
              >
                Settings
              </button>

              <button
                onClick={logout}
                className="mt-6 bg-red-500 text-white px-10 py-2 rounded-lg shadow hover:bg-red-600"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

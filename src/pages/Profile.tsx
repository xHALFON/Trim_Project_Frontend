import React, { useEffect, useState } from 'react';
import NavBar from '../components/NavBar.tsx';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie'; // ניהול טוקן ב-Cookies
import axios from 'axios';
import img from '../assests/images.jpg';
import avatar from '../assests/Avatar.png';
import avatarTop from '../assests/topAvatar.jpg';
import AddPost from '../components/addPost.tsx';

interface Post {
  id: any;
  title: string;
  content: string;
  sender: string;
  image: string;
  Likes: any;
  numLikes: number;
  senderImg: string;
  senderName: string;
}

interface Comment {
    id: any;
    content: string;
    sender: string;
    senderImg: string;
    senderName: string;
}

export default function Profile({ setAuth }) {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [profileName, setProfileName] = useState<string>();
  const [profileImage, setProfileImage] = useState<string>();
  const [profileImageTop, setProfileImageTop] = useState<string>();
  const [message, setMessage] = useState(''); // הודעה במקרה שאין פוסטים
  const [newImage, setNewImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false)
  const [editPost, setEditPost] = useState<Post | null>(null);
  const [editedTitle, setEditedTitle] = useState<string>('');
  const [editedContent, setEditedContent] = useState<string>('');
  const [editImage, setEditImage] = useState(null);
  const [editImageName, setEditImageName] = useState('');

  const [postComments, setPostComments] = useState<Comment[]>([]);
  const [commentModal, setCommentModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState('');
  const toggleCommentModal = (postId: string) => {
    setSelectedPostId(postId);
    setCommentModal(!commentModal);
  };

  const handleRemoveComment = async (commentId) =>{
    const server = process.env.REACT_APP_API_URL;
    try{
        const response = await axios.delete(`${server}/comments/${commentId}`,
        {
            headers: {
              Authorization: `Bearer ${Cookies.get("accessToken")}`,
            },
        });
    }catch(err){
        console.log("error with fetching comments: " + err);
    }
  }
  const handleSendComment = async (postId) => {
    const server = process.env.REACT_APP_API_URL;
    try{
        const response = await axios.post(`${server}/comments`,{
            sender: Cookies.get("user_id"),
            content: commentContent,
            postId: postId,
        },
        {
            headers: {
              Authorization: `Bearer ${Cookies.get("accessToken")}`,
            },
        });
        setCommentContent('')
    }catch(err){
        console.log("error with fetching comments: " + err);
    }
  }
  const fetchCommentsFromPost = async (postId) =>{
    const server = process.env.REACT_APP_API_URL;
    try{
    const response = await axios.get(`${server}/comments/${postId}`,{
        headers: {
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
      });
      setPostComments(response.data)
    }catch(err){
        console.log("error with fetching comments: " + err);
    }
  }
  const handleLike = async (postId) =>{
    try {
        if (isLoading) return; // מניעת בקשות מרובות בו-זמנית
        setIsLoading(true);

        const server = process.env.REACT_APP_API_URL;
        const response = await axios.post(`${server}/post/handleLikes`,{ 
            postId, 
            userId: Cookies.get("user_id") 
         },
         {
            headers: {
              Authorization: `Bearer ${Cookies.get("accessToken")}`,
            },
          }
        );
    
        const updatedPost = response.data;
    
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? { ...post, numLikes: updatedPost.numLikes, Likes: updatedPost.Likes }
              : post
          )
        );
      } catch (error) {
        console.error('Error handling like:', error);
      } finally {
        setIsLoading(false);
      }
  }
  const handleEditPost = (postId: string) => {
    const postToEdit = posts.find(post => post.id === postId);
    if (postToEdit) {
      setEditPost(postToEdit);
      setEditedTitle(postToEdit.title);
      setEditedContent(postToEdit.content);
    }
  };
  const handleEditPostImage = (e) =>{
    const file = e.target.files[0];
    setEditImage(file);
    setEditImageName(file.name)
  }

  const handleDeletePost = async (postId: any) => {
    const server = process.env.REACT_APP_API_URL;
    try {
        const response = await axios.delete(`${server}/post/${postId}`, {
            headers: {
                Authorization: `Bearer ${Cookies.get("accessToken")}`,
            },
        });

        if (response.status === 200) {
            alert("Post deleted successfully");

            setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
        }
    } catch (error) {
        console.error("Error deleting post:", error);
        alert("Failed to delete post. Please try again.");
    }
  };

  const handleSaveEdit = async () => {
    if (editPost) {
        const server = process.env.REACT_APP_API_URL;
        const accessToken = Cookies.get('accessToken');
        let imageRes: any;
        if(editImage){
            const formData = new FormData();
            formData.append('file', editImage);

            imageRes = await axios.post(`${server}/saveImage`, formData,{
                headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'multipart/form-data',
                },
            });
        }
        let updatedPost: any;
        if(imageRes){
            updatedPost = { ...editPost, title: editedTitle, content: editedContent, image: imageRes.data.filename};
        }else{
            updatedPost = { ...editPost, title: editedTitle, content: editedContent, image: ''};
        }
      
        try {
            await axios.put(`${server}/post/${editPost.id}`, updatedPost, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            setPosts(posts.map(post => post.id === editPost.id ? updatedPost : post));
            setEditPost(null);
            setEditImage(null);
            setEditImageName('');
        } catch (error) {
            console.error('Error saving post:', error.response?.data || error.message);
        }
    }
  };

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
        setPosts(response.data);
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
      <NavBar />
      <div className="flex justify-center mt-10">
        <div className="w-2/3 bg-white rounded-lg shadow-lg">
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
          <div className="p-8 flex">
            <div className="w-2/3 pl-6 border-r pr-8">
              <AddPost setPosts={setPosts} />
              <h2 className="text-xl font-semibold text-gray-700 border-t pt-5 mb-4">My Posts</h2>
              {message ? (
                <p className="text-gray-500">{message}</p>
              ) : (
                <ul className="space-y-4">
                  {posts.length > 0 ? posts.slice().reverse().map((post, index) => {
                    const server = process.env.REACT_APP_API_URL;
                    return (
                      <li key={index} className="bg-gray-100 p-4 rounded-md shadow-md text-gray-800">
                        <div className="flex justify-between mb-4">
                          <div className="flex items-center">
                            <img
                              src={post.senderImg === 'none' ? avatar : `${server}/uploads/${post.senderImg}`}
                              alt="Sender"
                              className="w-11 h-11 rounded-full mr-4"
                            />
                            <h3 className="text-lg font-bold">{post.senderName || 'Unknown Sender'}</h3>
                          </div>
                          <div className="flex items-center">
                            <button className="text-gray-500 hover:text-gray-700 mr-4" onClick={() => handleEditPost(post.id)}>
                                ✏️ Edit
                            </button>
                            <button className="text-red-500 hover:text-red-700" onClick={() => handleDeletePost(post.id)}>
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                        <div className="border-t border-b border-gray-300 pb-4">
                          <p className="text-left text-xl font-bold text-gray-800 ml-2 mt-2 mb-2">{post.title}</p>
                          <p className="text-left text-gray-700 ml-5 mr-5">{post.content}</p>
                        </div>
                        {post.image && (
                          <div className="mb-4">
                            <img src={`${server}/uploads/${post.image}`} className="w-full h-auto rounded-md" />
                          </div>
                        )}
                        <div className="flex justify-around items-center mt-4">
                          <div className='w-1/2'>
                            <button className="text-blue-500 hover:text-blue-700" 
                            style={{fontWeight: post.Likes.includes(Cookies.get("user_id")) ? 'bold' : 600}} onClick={()=>{handleLike(post.id)}}>{post.Likes.includes(Cookies.get("user_id")) ? '❤️ Unlike' : '🤍 Like'} {post.numLikes}</button>
                          </div>
                          <div className='w-1/2'>
                            <button className="text-blue-500 hover:text-blue-700 font-semibold" 
                            onClick={() => toggleCommentModal(post.id.toString())}>💬 Comment</button>
                          </div>
                        </div>
                      </li>
                    );
                  }): <p>No posts here... yet! Stay tuned for the user's first post</p>}
                </ul>
              )}
            </div>
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
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Hobbies</h2>
                <ul className="list-disc list-inside text-gray-600">
                  <li>Coding</li>
                  <li>Reading</li>
                  <li>Traveling</li>
                </ul>
              </div>
              <button className="mt-6 bg-blue-900 text-white px-10 py-2 rounded-lg shadow hover:bg-blue-950">
                Settings
              </button>
              <button
                onClick={logout}
                className="mt-6 bg-red-500 text-white px-10 py-2 rounded-lg shadow hover:bg-red-600"
              >
                Log Out
              </button>
            </div>
            {editPost && ( // edit post window
            <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-75">
                <div className="bg-white p-6 rounded-lg shadow-lg w-1/3 max-h-[80vh] overflow-y-auto">
                    <h3 className="text-2xl font-bold mb-4">Edit Post</h3>
                    <div>
                        <label className="block text-sm font-semibold mb-2">Title</label>
                        <input
                            type="text"
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md mb-4"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2">Content</label>
                        <textarea
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md mb-4"
                        />
                    </div>
                    <div className="mb-1">
                        <input
                            type="file"
                            onChange={handleEditPostImage}
                            className="border border-gray-300 px-2 py-2 my-7 rounded-md"
                        />
                        {editImage && (
                            <div className="mt-1 flex justify-center">
                                <img 
                                    src={URL.createObjectURL(editImage)} 
                                    alt="Uploaded" 
                                    className="max-w-full h-auto rounded-lg" 
                                    style={{ maxWidth: '300px', maxHeight: '300px' }} 
                                />
                            </div>
                        )}
                    </div>
                    <div className="flex justify-between">
                        <button 
                            onClick={() => { setEditPost(null); setEditImage(null); setEditImageName(''); }} 
                            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSaveEdit} 
                            className="bg-blue-500 text-white px-6 py-2 rounded-md"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        )}
        {commentModal && selectedPostId && (
            <div
                className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center"
                onClick={() => setCommentModal(false)}>
                <div
                className="bg-white p-6 rounded-lg shadow-lg w-1/3 max-h-[90vh] overflow-y-auto relative"
                onClick={(e) => e.stopPropagation()} >
                <button
                    onClick={() => setCommentModal(false)}
                    className="absolute top-7 right-12 text-xl text-gray-600 hover:text-gray-900 focus:outline-none">
                    <span className="text-5xl">&times;</span>
                </button>
                {posts
                    .filter(post => post.id.toString() === selectedPostId)
                    .map(post => {
                    const server = process.env.REACT_APP_API_URL;
                    fetchCommentsFromPost(post.id);
                    return (
                        <div className="bg-gray-100 p-4 rounded-md shadow-md text-gray-800">
                            <div className="flex justify-between mb-4">
                                <div className="flex items-center">
                                <img
                                    src={post.senderImg === 'none' ? avatar : `${server}/uploads/${post.senderImg}`}
                                    alt="Sender"
                                    className="w-11 h-11 rounded-full mr-4"
                                />
                                <h3 className="text-lg font-bold">{post.senderName || 'Unknown Sender'}</h3>
                                </div>
                            </div>
                            <div className="border-t border-b border-gray-300 pb-4">
                                <p className="text-left text-xl font-bold text-gray-800 ml-2 mt-2 mb-2">{post.title}</p>
                                <p className="text-left text-gray-700 ml-5 mr-5">{post.content}</p>
                            </div>
                            {post.image && (
                                <div className="mb-4">
                                <img src={`${server}/uploads/${post.image}`} className="w-full h-auto rounded-md" />
                                </div>
                            )}

                            <div className="flex items-center space-x-4 p-4 bg-gray-100 rounded-md shadow-md">
                                <input
                                type="text"
                                placeholder="Write something"
                                value={commentContent}
                                className="flex-grow p-2 border border-gray-300 rounded-md"
                                onChange={(e) => setCommentContent(e.target.value)}
                                />
                                <button
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none" onClick={()=>handleSendComment(post.id)}>
                                Send
                                </button>
                            </div>
                            <div>
                            {postComments.slice().reverse().map((comment: Comment) => {
                                const server = process.env.REACT_APP_API_URL;
                                return (
                                    <div key={comment.id} className="flex items-start border-b bg-gray-100 p-4 rounded-lg mt-2 shadow-md">
                                        <img
                                            src={`${server}/uploads/${comment.senderImg}` || avatar} // אם אין תמונה, תציג תמונה ברירת מחדל
                                            alt="Sender"
                                            className="w-12 h-12 rounded-full mr-4"
                                        />
                                        <div className="flex flex-col w-full items-start p-2 bg-gray-200 rounded-lg shadow-md">
                                            <div className="flex justify-between w-full">
                                                <span className="font-bold text-lg text-gray-800 pl-2">{comment.senderName}</span>
                                                {comment.sender == Cookies.get("user_id") && <span className="cursor-pointer" onClick={()=> handleRemoveComment(comment.id)}>
                                                    🗑️ Delete
                                                </span>
                                                }
                                            </div>
                                            <div className="rounded-lg mt-1 ml-3">
                                                <p className="text-gray-600">{comment.content}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            </div>
                        </div>
                    );
                    })}
                </div>
            </div>
        )}
          </div>
        </div>
      </div>
    </div>
    
  );  
}

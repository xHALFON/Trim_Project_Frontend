import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie';
import axios from 'axios';
import avatar from '../assests/Avatar.png';
import AddPost from './addPost.tsx';
import ClipLoader from "react-spinners/ClipLoader";
import { useNavigate } from 'react-router-dom';
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
FetchPosts.defaultProps = {
    profile: false,
};
export default function FetchPosts({profile, userIdProp, addPost}) { // useIdPropr - account which can edits is own posts and comments
  const [posts, setPosts] = useState<Post[]>([]);
  const [userName, setUserName] = useState<string>();
  const [message, setMessage] = useState(''); // הודעה במקרה שאין פוסטים
  const [isLoading, setIsLoading] = useState(false)
  const [editPost, setEditPost] = useState<Post | null>(null);
  const [editedTitle, setEditedTitle] = useState<string>('');
  const [editedContent, setEditedContent] = useState<string>('');
  const [editImage, setEditImage] = useState(null);
  const [postComments, setPostComments] = useState<Comment[]>([]);
  const [commentModal, setCommentModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState('');
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [commentMessage, setCommentMessage] = useState(''); // הודעה במקרה שאין תגובות
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const navigate = useNavigate();
  
  const toggleCommentModal = (postId: string) => {
    setSelectedPostId(postId);
    setCommentModal(!commentModal);
  };

  const handleNavigateProfile = (profileName) =>{
    navigate(`/profile/${profileName}`);
    setCommentModal(false);
    window.scrollTo(0, 0);
  }
  const handleRemoveComment = async (commentId) =>{
    const server = process.env.REACT_APP_API_URL;
    try{
        const response = await axios.delete(`${server}/comments/${commentId}`,
        {
            headers: {
              Authorization: `Bearer ${Cookies.get("accessToken")}`,
            },
        });
        setPostComments((prev) => prev.filter((comment) => comment.id !== commentId));
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
        setPostComments((prev) => [...prev, response.data])
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
      setIsLoadingComments(false);
    }catch(err){
        console.log("error with fetching comments: " + err);
        setCommentMessage('Failed to fetch comments')
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
        } catch (error) {
            console.error('Error saving post:', error.response?.data || error.message);
        }
    }
  };
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoadingPosts(true);
      setIsLoadingComments(true);
      const server = process.env.REACT_APP_API_URL;
      try {
        const userid = userIdProp;
        const accessToken = Cookies.get('accessToken');

        if (!userid || !accessToken) {
          throw new Error('Missing user ID or access token');
        }
        let response: any;
        if(profile){
            response = await axios.get(`${server}/post/`,{
                params: { sender: userid },
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const userNameResponse = (await axios.get(`${server}/auth/${userid}`,{headers: { Authorization: `Bearer ${accessToken}` }})).data.username;
            setUserName(userNameResponse);
        }else{
            response = await axios.get(`${server}/post/`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
        }
        setPosts(response.data);
        setIsLoadingPosts(false)
      } catch (error) {
        console.error('Error fetching posts:', error.response?.data || error.message);
        setMessage('Failed to fetch posts');
      }
    };
    fetchPosts();
  }, [userIdProp]);


  return (
    <div>
      <div className="p-8 flex justify-center">
            <div className={profile ? "w-full pr-20 pl-10 border-r" : "w-1/2 pl-6 border-x pr-8"}>
              {addPost == true ? <AddPost setPosts={setPosts} /> : ""}
              <h2 className="text-xl font-semibold text-gray-700 border-t pt-5 mb-4">{addPost == true ? "My Posts" : userName ? `${userName} Posts` : ""}</h2>
              {message ? (
                <p className="text-gray-500">{message}</p>
                ) : isLoadingPosts ? (
                <div className="flex justify-center items-center h-32">
                    <ClipLoader />
                </div>
                ) : posts.length > 0 ? (
                <ul className="space-y-4">
                    {posts.slice().reverse().map((post, index) => {
                    const server = process.env.REACT_APP_API_URL;
                    return (
                        <li
                        key={index}
                        className="bg-gray-100 p-4 rounded-md shadow-md text-gray-800"
                        >
                        <div className="flex justify-between mb-4">
                            <div className="flex items-center">
                            <img
                                src={
                                post.senderImg === "none"
                                    ? avatar
                                    : `${server}/uploads/${post.senderImg}`
                                }
                                alt="Sender"
                                className="w-11 h-11 rounded-full mr-4 cursor-pointer"
                                onClick={()=>{handleNavigateProfile(post.senderName)}}
                            />
                            <h3 className="text-lg font-bold cursor-pointer relative hover:underline hover:no-underline hover:after:content-[''] hover:after:block hover:after:w-full hover:after:h-[2px] hover:after:bg-current hover:after:absolute hover:after:left-0 hover:after:bottom-[0px]" onClick={()=>{handleNavigateProfile(post.senderName)}}>
                                {post.senderName || "Unknown Sender"}
                            </h3>
                            </div>
                            {post.sender === userIdProp && addPost == true && (
                            <div className="flex items-center">
                                <button
                                className="text-gray-500 hover:text-gray-700 mr-4"
                                onClick={() => handleEditPost(post.id)}
                                >
                                ✏️ Edit
                                </button>
                                <button
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleDeletePost(post.id)}
                                >
                                🗑️ Delete
                                </button>
                            </div>
                            )}
                        </div>
                        <div className="border-t border-b border-gray-300 pb-4">
                            <p className="text-left text-xl font-bold text-gray-800 ml-2 mt-2 mb-2">
                            {post.title}
                            </p>
                            <p className="text-left text-gray-700 ml-5 mr-5">{post.content}</p>
                        </div>
                        {post.image && (
                            <div className="mb-4">
                            <img
                                src={`${server}/uploads/${post.image}`}
                                className="w-full h-auto rounded-md"
                            />
                            </div>
                        )}
                        <div className="flex justify-around items-center mt-4">
                            <div className="w-1/2">
                            <button
                                className="text-blue-500 hover:text-blue-700"
                                style={{
                                fontWeight: post.Likes.includes(userIdProp)
                                    ? "bold"
                                    : 600,
                                }}
                                onClick={() => handleLike(post.id)}
                            >
                                {post.Likes.includes(Cookies.get("user_id"))
                                ? "❤️ Unlike"
                                : "🤍 Like"}{" "}
                                {post.numLikes}
                            </button>
                            </div>
                            <div className="w-1/2">
                            <button
                                className="text-blue-500 hover:text-blue-700 font-semibold"
                                onClick={() => {
                                toggleCommentModal(post.id.toString());
                                fetchCommentsFromPost(post.id);
                                }}
                            >
                                💬 Comment
                            </button>
                            </div>
                        </div>
                        </li>
                    );
                    })}
                </ul>
                ) : (
                <p className="text-center text-gray-500">
                    {profile ? "No posts here... yet! Stay tuned for the user's first post" : "Seems like there is no posts yet"}
                </p>
                )}

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
                            onClick={() => { setEditPost(null); setEditImage(null); }} 
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
                onClick={() => {setCommentModal(false); setPostComments([]); setIsLoadingComments(true)}}>
                <div
                className="bg-white p-6 rounded-lg shadow-lg w-1/3 max-h-[90vh] overflow-y-auto relative"
                onClick={(e) => e.stopPropagation()} >
                <button
                    onClick={() => {setCommentModal(false); setPostComments([]); setIsLoadingComments(true)}}
                    className="absolute top-7 right-12 text-xl text-gray-600 hover:text-gray-900 focus:outline-none">
                    <span className="text-5xl">&times;</span>
                </button>
                {posts
                    .filter(post => post.id.toString() === selectedPostId)
                    .map(post => {
                    const server = process.env.REACT_APP_API_URL;
                    return (
                        <div className="bg-gray-100 p-4 rounded-md shadow-md text-gray-800">
                            <div className="flex justify-between mb-4">
                                <div className="flex items-center">
                                <img
                                    src={post.senderImg === 'none' ? avatar : `${server}/uploads/${post.senderImg}`}
                                    alt="Sender"
                                    className="w-11 h-11 rounded-full mr-4 cursor-pointer" onClick={()=>{handleNavigateProfile(post.senderName)}}
                                />
                                <h3 className="text-lg font-bold cursor-pointer relative hover:underline hover:no-underline hover:after:content-[''] hover:after:block hover:after:w-full hover:after:h-[2px] hover:after:bg-current hover:after:absolute hover:after:left-0 hover:after:bottom-[0px]" onClick={()=>{handleNavigateProfile(post.senderName)}}>{post.senderName || 'Unknown Sender'}</h3>
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
                            {commentMessage ? (
                            <p className="text-gray-500">{commentMessage}</p>
                            ) : isLoadingComments ? (
                            <div className="mt-10">
                                <ClipLoader />
                            </div>
                            ) : postComments.length > 0 ? (
                            <div>
                                {postComments.slice().reverse().map((comment: Comment) => {
                                const server = process.env.REACT_APP_API_URL;
                                return (
                                    <div
                                    key={comment.id}
                                    className="flex items-start border-b bg-gray-100 p-4 rounded-lg mt-2 shadow-md"
                                    >
                                    <img
                                        src={ comment.senderImg === "none" ? avatar : `${server}/uploads/${comment.senderImg}`}
                                        alt="Sender"
                                        className="w-12 h-12 rounded-full mr-4 cursor-pointer" onClick={()=>{handleNavigateProfile(comment.senderName)}}
                                    />
                                    <div className="flex flex-col w-full items-start p-2 bg-gray-200 rounded-lg shadow-md">
                                        <div className="flex justify-between w-full">
                                        <span className="text-lg font-bold cursor-pointer relative hover:underline hover:no-underline hover:after:content-[''] hover:after:block hover:after:w-full hover:after:h-[2px] hover:after:bg-current hover:after:absolute hover:after:left-0 hover:after:bottom-[0px]" onClick={()=>{handleNavigateProfile(comment.senderName)}}>
                                            {comment.senderName}
                                        </span>
                                        {comment.sender == Cookies.get("user_id") && (
                                            <span
                                            className="cursor-pointer"
                                            onClick={() => handleRemoveComment(comment.id)}
                                            >
                                            🗑️ Delete
                                            </span>
                                        )}
                                        </div>
                                        <div className="rounded-lg mt-1 ml-3">
                                        <p className="text-gray-600">{comment.content}</p>
                                        </div>
                                    </div>
                                    </div>
                                );
                                })}
                            </div>
                            ) : (
                            <p className="mt-5 text-gray-500">No comments yet</p>
                            )}
                        </div>
                    );
                    })}
                </div>
            </div>
        )}
          </div>
    </div>
  )
}

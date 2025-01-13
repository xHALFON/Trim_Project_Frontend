import axios from 'axios';
import React, { useState } from 'react';
import Cookies from 'js-cookie';

export default function AddPost({setPosts}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setImage(file);  // נשמור את התמונה עצמה (לא את ה-URL הזמני)
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (image) {
      formData.append('file', image);
    }

    try {
      const server = process.env.REACT_APP_API_URL;
      let imageReq: string = "";
      if(image){
        const responseImage = await axios.post(`${server}/saveImage`, formData, {
            headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
            'Content-Type': 'multipart/form-data',
            },
        });
        imageReq = responseImage.data.originalname;
      }
      
      const responseUploadPost = await axios.post(`${server}/post/`,{
        sender: Cookies.get("user_id"),
        title: title,
        content: content,
        image: imageReq,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
      });
      console.log(responseUploadPost.data);
      
      setTitle('');
      setContent('');
      setImage(null);
      alert('Post created successfully!');
      setPosts((prevPosts:any) => [...prevPosts, responseUploadPost.data]);
      setIsModalOpen(false);
    } catch (error) {
      setError('There was an error creating the post.');
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6">
      {/* האזור הראשון - input שמוביל לפתיחת המודאל */}
      <div className='text-left w-full ml-11 text-3xl mb-2'>
        <p>Create a Post</p>
      </div>
      <div
        onClick={() => setIsModalOpen(true)}
        className="w-full flex p-4 border border-gray-400 rounded-full text-left px-16 mb-5 cursor-pointer bg-gray-100 hover:bg-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <p className="font-bold text-xl flex-grow">Share your thoughts...</p>
        <div className="text-white text-2xl">📝</div>
      </div>
  
      {isModalOpen && (
        <>
          {/* Overlay שמונע לחיצה על שאר הדף */}
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 z-10" onClick={() => {
            setIsModalOpen(false);
            setImage(null); // מנקה את התמונה כשהמודאל נסגר
            setTitle('');
            setContent('');
          }}></div>
          
          {/* המודאל */}
          <div
            className="fixed inset-0 flex justify-center items-center z-20"
            onClick={() => {
              setIsModalOpen(false);
              setImage(null); // מנקה את התמונה כשהמודאל נסגר
              setTitle('');
              setContent('');
            }}
          >
            <div
              className="bg-white p-6 rounded-lg shadow-lg relative overflow-y-auto"
              style={{ width: '500px', maxHeight: '90vh' }} // הגבלת גובה המודאל עם גלילה פנימית
              onClick={(e) => e.stopPropagation()}
            >
              {/* כפתור סגירה */}
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setImage(null); // מנקה את התמונה כשהמודאל נסגר
                  setTitle('');
                  setContent('');
                }}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              >
                <span className="text-5xl">&times;</span>
              </button>
  
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Create a Post</h2>
              <form onSubmit={handlePostSubmit}>
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Post Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <textarea
                    placeholder="What's on your mind?"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    style={{ resize: 'none', maxHeight: '200px', minHeight: '200px' }}
                  />
                </div>
                <div className="mb-1">
                  <input
                    type="file"
                    onChange={handleImageUpload}
                    className="border border-gray-300 px-2 rounded-md"
                  />
                  {image && (
                    <div className="mt-1 flex justify-center">
                      <img src={URL.createObjectURL(image)} alt="Uploaded" className="max-w-full h-auto rounded-lg" style={{ maxWidth: '300px', maxHeight: '300px' }} />
                    </div>
                  )}
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                    disabled={loading}
                  >
                    {loading ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

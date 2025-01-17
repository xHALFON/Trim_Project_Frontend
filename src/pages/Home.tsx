import React, { useEffect } from 'react'
import FetchPosts from '../components/fetchPosts.tsx';
import NavBar from '../components/NavBar.tsx';
import Cookies from 'js-cookie';
export default function Home() {
  return (
    <div>
      <FetchPosts userIdProp={Cookies.get("user_id")} addPost={true}/>
    </div>
  )
}

import React, { useEffect } from 'react'
import FetchPosts from '../components/fetchPosts.tsx';
import NavBar from '../components/NavBar.tsx';

export default function Home() {
  return (
    <div>
      <NavBar />
      <FetchPosts />
    </div>
  )
}

import React from 'react';
import { Link } from 'react-router-dom';
import { FaLock } from 'react-icons/fa';  // אייקון מנעול

export default function Forbidden() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center p-10 bg-blue-500 shadow-xl rounded-lg border border-blue-700">
        <FaLock className="text-white text-6xl mb-4 mx-auto" />
        <h1 className="text-4xl font-bold text-white">This Page is Locked</h1>
        <p className="mt-4 text-xl text-gray-100">Access to this page is restricted. The content of the site is not available at the moment.</p>
        <div className="mt-7"><Link to="/" className="mt-6 text-white hover:text-blue-100 text-2xl">Go back to Home</Link></div>
      </div>
    </div>
  );
}

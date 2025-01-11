import React from 'react'
import NavBar from '../components/NavBar.tsx'
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie'; // משתמש ב-Cookies לאחסון טוקן

export default function Profile({setAuth}) {
    const navigate = useNavigate(); // לניווט בין דפים

    function logout() {
        // מחיקת הטוקן מה-Cookies
        Cookies.remove('accessToken');
        setAuth('')
        navigate('/')
    }

    return (
        <div>
            <NavBar />
            <p>Profile</p>
            <button onClick={logout} className="bg-red-500 text-white p-2 rounded-lg">
                Logout
            </button>
        </div>
    )
}

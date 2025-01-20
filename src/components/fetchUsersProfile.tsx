import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import avatar from "../assests/Avatar.png";
import ClipLoader from "react-spinners/ClipLoader";
import FemaleIcon from '@mui/icons-material/Female';
import MaleIcon from '@mui/icons-material/Male';

interface User {
    _id: string;
    username: string;
    email: string;
    password: string;
    gender: string;
    status: string;
    profileImage: string;
    profileImageTop: string;
}

export default function FetchUsersProfile() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [reload, setReload] = useState<boolean>(true);
    const navigate = useNavigate();

    const handleNavigateProfile = (profileName: string) => {
        if(profileName){
            navigate(`/profile/${profileName}`);
        }
        setReload(!reload);
        window.scrollTo(0, 0);
    };

    const shuffleArray = (array: User[]) => {
        let shuffledArray = [...array]; // יצירת העתק של המערך
        for (let i = shuffledArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]; // Swap
        }
        return shuffledArray;
    };

    useEffect(() => {
        async function fetchUsers() {
            setLoading(true);
            const server = process.env.REACT_APP_API_URL;
            try {
                const response = await axios.get(`${server}/auth/users`, {
                    headers: { Authorization: `Bearer ${Cookies.get("accessToken")}` },
                });
                const shuffledUsers = shuffleArray(response.data);
                setUsers(shuffledUsers);
                setTimeout(() => {
                    setLoading(false);
                }, 500);
            } catch (error) {
                console.error("Error fetching users:", error);
                setLoading(false);
            }
        }
        fetchUsers();
    }, [reload]);

    return (
        <div className="w-full flex flex-col items-center border-b pb-5">
            {/* אם הדף בטעינה */}
            {loading ? (
                <div className="mt-5">
                <ClipLoader color="#000" />
                </div>
            ) : (
                <div className="w-full pt-7">
                    <h1 className="text-3xl font-bold border-t pt-5 text-gray-800 mb-4">Explore Users</h1>
                    <div className="flex flex-col gap-5">
                        {users.filter((user) => user._id !== Cookies.get("user_id")).slice(0, 10).map((user) => (
                            <div
                                key={user._id}
                                className="flex items-center justify-between border bg-gray-50 p-3 shadow-lg rounded-lg mb-4 hover:bg-gray-100 cursor-pointer"
                                onClick={() => handleNavigateProfile(user.username)}
                            >
                                {/* תמונה עגולה */}
                                <img
                                    src={user.profileImage !== "none" ? `${process.env.REACT_APP_API_URL}/uploads/${user.profileImage}` : avatar}
                                    alt={`${user.username}'s profile`}
                                    className="w-12 h-12 rounded-full border-2 border-gray-300"
                                />
                                {/* שם ומגדר */}
                                <div className="flex items-center justify-between w-full ml-4">
                                    <span className="text-lg font-semibold text-gray-800">{user.username}</span>
                                    <span>
                                        {user.gender === 'male' ? (
                                        <MaleIcon sx={{ color: 'blue', fontSize: 25 }} />
                                        ) : user.gender === 'female' ? (
                                        <FemaleIcon sx={{ color: '#ed007b', fontSize: 25 }} />
                                        ) : (
                                        ''
                                        )}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

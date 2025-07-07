import { useState, useContext, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiUser,
    HiShoppingCart,
    HiSearch,
    HiX,
    HiLogout,
    HiEye,
    HiClipboardList
} from 'react-icons/hi';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const TopNavbar = ({
    searchQuery,
    setSearchQuery,
    handleSearchClick,
    clearSearch,
    searchInputRef,
    backendUrl
}) => {
    const { logout, cartCount } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${backendUrl}/api/auth/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUserName(response.data.name);
            } catch (error) {
                console.error('Failed to fetch user profile:', error);
            }
        };
        fetchUserProfile();
    }, [backendUrl]);

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsProfileOpen(false);
    };

    return (
        <nav className="bg-gradient-to-r from-primary-600 to-primary-700 text-white fixed w-full top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-2">
                        <Link to="/home" className="flex items-center space-x-2">
                            <img
                                src="/ggu foodies.jpg"
                                alt="GGU Foodies Logo"
                                className="w-10 h-10 rounded-lg"
                            />
                            <span className="text-xl font-bold text-white hidden sm:inline">GGU Foodies</span>
                        </Link>
                    </div>
                    <div className="flex-1 mx-2 flex justify-center md:hidden">
                        <div className="relative w-full max-w-xs px-2">
                            <div className="absolute inset-y-0 left-3 pl-3 flex items-center pointer-events-none">
                                <HiSearch className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search"
                                value={searchQuery}
                                readOnly
                                onClick={handleSearchClick}
                                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-gray-800 bg-white cursor-pointer"
                            />
                            {searchQuery && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute inset-y-0 right-3 pr-3 flex items-center"
                                >
                                    <HiX className="h-5 w-5 text-gray-400 hover:text-red-600" />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="flex-1 mx-4 hidden md:flex justify-center">
                        <div className="relative w-full max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <HiSearch className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search"
                                value={searchQuery}
                                readOnly
                                onClick={handleSearchClick}
                                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-gray-800 bg-white cursor-pointer"
                            />
                            {searchQuery && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    <HiX className="h-5 w-5 text-gray-400 hover:text-red-600" />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="relative hidden md:flex items-center space-x-2">
                            <Link to="/cart" className="relative flex items-center">
                                <HiShoppingCart className="w-6 h-6 text-white hover:text-gray-200" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        </div>
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center space-x-2"
                            >
                                <HiUser className="w-6 h-6 text-gray-600" />
                                <span className="text-gray-600 text-sm font-medium hidden md:inline">
                                    {userName || 'Profile'}
                                </span>
                            </button>
                            <AnimatePresence>
                                {isProfileOpen && (
                                    <motion.div
                                        initial={{ x: '100%' }}
                                        animate={{ x: 0 }}
                                        exit={{ x: '100%' }}
                                        transition={{ type: 'tween', duration: 0.3 }}
                                        className="fixed top-0 right-0 w-64 h-full bg-white shadow-lg z-50"
                                    >
                                        <div className="flex flex-col h-full">
                                            <div className="p-4 flex justify-end">
                                                <button
                                                    onClick={() => setIsProfileOpen(false)}
                                                    className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                                >
                                                    <HiX className="w-6 h-6" />
                                                </button>
                                            </div>
                                            <div className="flex-1 px-4 py-2 space-y-1">
                                                <Link
                                                    to="/profile"
                                                    className="block px-3 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-md"
                                                    onClick={() => setIsProfileOpen(false)}
                                                >
                                                    <HiEye className="w-4 h-4 inline mr-2" />
                                                    View Profile
                                                </Link>
                                                <Link
                                                    to="/orders"
                                                    className="block px-3 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-md"
                                                    onClick={() => setIsProfileOpen(false)}
                                                >
                                                    <HiClipboardList className="w-4 h-4 inline mr-2" />
                                                    Orders
                                                </Link>
                                                <Link
                                                    to="/cart"
                                                    className="block px-3 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-md"
                                                    onClick={() => setIsProfileOpen(false)}
                                                >
                                                    <HiShoppingCart className="w-4 h-4 inline mr-2" />
                                                    Cart ({cartCount})
                                                </Link>
                                                <button
                                                    onClick={handleLogout}
                                                    className="block px-3 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-md w-full text-left"
                                                >
                                                    <HiLogout className="w-4 h-4 inline mr-2" />
                                                    Logout
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default TopNavbar;
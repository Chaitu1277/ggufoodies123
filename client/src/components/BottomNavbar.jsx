import { Link, useLocation } from 'react-router-dom';
import {
    HiHome,
    HiOfficeBuilding,
    HiClipboardList,
    HiShoppingCart
} from 'react-icons/hi';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';

const BottomNavbar = ({ handleHomeClick }) => {
    const location = useLocation();
    const { cartCount } = useContext(AuthContext);

    return (
        <div className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 px-4 py-2 z-50 shadow-[0_-1px_4px_rgba(0,0,0,0.1)]">
            <div className="flex justify-around items-center">
                <Link
                    to="/home"
                    onClick={handleHomeClick}
                    className={`flex flex-col items-center py-2 ${location.pathname === '/home' ? 'text-red-600' : 'text-gray-600'}`}
                >
                    <HiHome className="w-6 h-6" />
                    <span className="text-xs mt-1">Home</span>
                </Link>
                <Link
                    to="/food-courts"
                    className={`flex flex-col items-center py-2 ${location.pathname === '/food-courts' ? 'text-red-600' : 'text-gray-600'}`}
                >
                    <HiOfficeBuilding className="w-6 h-6" />
                    <span className="text-xs mt-1">Food Courts</span>
                </Link>
                <Link
                    to="/orders"
                    className={`flex flex-col items-center py-2 ${location.pathname === '/orders' ? 'text-red-600' : 'text-gray-600'}`}
                >
                    <HiClipboardList className="w-6 h-6" />
                    <span className="text-xs mt-1">Orders</span>
                </Link>
                <Link
                    to="/cart"
                    className={`flex flex-col items-center py-2 relative ${location.pathname === '/cart' ? 'text-red-600' : 'text-gray-600'}`}
                >
                    <HiShoppingCart className="w-6 h-6" />
                    <span className="text-xs mt-1">Cart</span>
                    {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {cartCount}
                        </span>
                    )}
                </Link>
            </div>
        </div>
    );
};

export default BottomNavbar;
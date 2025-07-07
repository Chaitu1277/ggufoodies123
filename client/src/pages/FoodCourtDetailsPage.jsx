import { useState, useEffect, useRef, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiStar,
    HiClock,
    HiPlus,
    HiChevronUp,
    HiChevronDown,
    HiXCircle,
    HiSearch
} from 'react-icons/hi';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import TopNavbar from '../components/TopNavbar';
import BottomNavbar from '../components/BottomNavbar';

const FoodCourtDetailsPage = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    const location = useLocation();
    const navigate = useNavigate();
    const { selectedCourt, scrollToItemId } = location.state || {};
    const { cartItems, cartCount, updateCart } = useContext(AuthContext);
    const [itemSearchQuery, setItemSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [errorMessage, setErrorMessage] = useState('');
    const [fetchError, setFetchError] = useState('');
    const [popularItems, setPopularItems] = useState([]);
    const [categories, setCategories] = useState(['All Categories']);
    const [categoryOpenState, setCategoryOpenState] = useState({});
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [popupType, setPopupType] = useState('success');
    const [isReplacePopupOpen, setIsReplacePopupOpen] = useState(false);
    const [newItemToAdd, setNewItemToAdd] = useState(null);
    const [loading, setLoading] = useState(true);
    const errorMessageRef = useRef(null);
    const foodItemRefs = useRef({});
    const topRef = useRef(null);
    const isCategoryStateInitialized = useRef(false);
    const foodCourtSessionRef = useRef(null);

    const processFoodItems = (foodItemsData) => {
        const fetchedItems = foodItemsData.map(item => ({
            _id: item._id,
            name: item.dishname,
            image: item.dishphoto,
            court: item.restaurantid?.restaurantname || '',
            category: item.category,
            price: item.dineinPrice,
            description: item.description,
            isAvailable: item.availability,
            rating: parseFloat(item.rating?.toFixed(1)) || 0,
        }));
        setPopularItems(fetchedItems);
        const uniqueCategories = ['All Categories', ...new Set(fetchedItems.map(item => item.category))];
        setCategories(uniqueCategories);

        if (!isCategoryStateInitialized.current || foodCourtSessionRef.current !== selectedCourt?.name) {
            setCategoryOpenState(
                uniqueCategories.reduce((acc, category) => ({
                    ...acc,
                    [category]: category !== 'All Categories'
                }), {})
            );
            isCategoryStateInitialized.current = true;
            foodCourtSessionRef.current = selectedCourt?.name;
        }
    };

    const fetchData = async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/restaurant/all-food-items`);
            if (response.data.success) {
                processFoodItems(response.data.foodItems);
            } else {
                throw new Error('Failed to fetch food items');
            }
            setFetchError('');
        } catch (error) {
            console.error('Failed to fetch food items:', error);
            setFetchError('Failed to load food items. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const checkCourtStatus = async () => {
        if (!selectedCourt) {
            navigate('/home', { state: { showPopup: false } });
            return false;
        }

        try {
            const response = await axios.get(`${backendUrl}/api/restaurant/restaurants`);
            if (response.data.success) {
                const currentCourt = response.data.restaurants.find(
                    r => r.restaurantname === selectedCourt.name
                );
                if (!currentCourt || currentCourt.availability === false) {
                    navigate('/home', {
                        state: {
                            showPopup: true,
                            popupMessage: `${selectedCourt.name} is currently closed.`,
                            popupType: 'error'
                        }
                    });
                    return false;
                }
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to check court status:', error);
            setFetchError('Failed to verify food court status. Please try again later.');
            return false;
        }
    };

    const showPopup = (message, type) => {
        setPopupMessage(message);
        setPopupType(type);
        setIsPopupOpen(true);
        setTimeout(() => setIsPopupOpen(false), 3000);
    };

    useEffect(() => {
        if (!selectedCourt) {
            navigate('/home', { state: { showPopup: false } });
            return;
        }

        const initialize = async () => {
            setLoading(true);
            const isOpen = await checkCourtStatus();
            if (isOpen) {
                await fetchData();
            }
        };
        initialize();

        const itemsInterval = setInterval(async () => {
            const isOpen = await checkCourtStatus();
            if (isOpen) {
                await fetchData();
            }
        }, 5000);

        return () => {
            clearInterval(itemsInterval);
        };
    }, [selectedCourt, navigate]);

    useEffect(() => {
        if (errorMessage && errorMessageRef.current) {
            errorMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [errorMessage]);

    useEffect(() => {
        if (scrollToItemId && foodItemRefs.current[scrollToItemId]) {
            const timer = setTimeout(() => {
                foodItemRefs.current[scrollToItemId].scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [scrollToItemId, popularItems.length]); // Only run when these change

    const clearItemSearch = () => {
        setItemSearchQuery('');
        setErrorMessage('');
    };

    const handleFoodItemClick = (item) => {
        if (!item.isAvailable) {
            showPopup('This item is temporarily not available.', 'error');
            return;
        }
    };

    const handleCategoryToggle = (category) => {
        setCategoryOpenState(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    const handleAddItem = async (item) => {
        if (!item.isAvailable) {
            showPopup('This item is temporarily not available.', 'error');
            return;
        }

        if (cartItems.length > 0) {
            const existingCourt = cartItems[0].restaurant;
            if (existingCourt && item.court !== existingCourt) {
                setNewItemToAdd(item);
                setIsReplacePopupOpen(true);
                return;
            }
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${backendUrl}/api/cart/add`,
                { foodItemId: item._id, quantity: 1 },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            updateCart(response.data.items);
            showPopup('Item added to cart successfully!', 'success');
        } catch (error) {
            setErrorMessage(error.response?.data.message || 'Failed to add item to cart');
            showPopup(error.response?.data.message || 'Failed to add item to cart', 'error');
        }
    };

    const handleReplaceItem = async () => {
        if (newItemToAdd) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${backendUrl}/api/cart/clear`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const response = await axios.post(
                    `${backendUrl}/api/cart/add`,
                    { foodItemId: newItemToAdd._id, quantity: 1 },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                updateCart(response.data.items);
                showPopup('Cart updated with new food court items', 'success');
            } catch (error) {
                showPopup('Failed to replace items in cart', 'error');
            } finally {
                setIsReplacePopupOpen(false);
                setNewItemToAdd(null);
            }
        }
    };

    const handleCancelReplace = () => {
        setIsReplacePopupOpen(false);
        setNewItemToAdd(null);
    };

    const handleHomeClick = () => {
        navigate('/home');
    };

    const filteredPopularItems = selectedCourt
        ? popularItems.filter(item =>
            item.court === selectedCourt.name &&
            (itemSearchQuery ? item.name.toLowerCase().includes(itemSearchQuery.toLowerCase()) : true) &&
            (selectedCategory === 'All Categories' || item.category === selectedCategory)
        )
        : [];

    return (
        <div className="min-h-screen flex flex-col bg-white relative">
            <div className="fixed top-0 left-0 right-0 z-50">
                <TopNavbar
                    searchQuery={selectedCourt ? selectedCourt.name : ''}
                    setSearchQuery={() => { }}
                    handleSearchClick={() => navigate('/search', { state: { searchQuery: selectedCourt?.name } })}
                    clearSearch={() => { setItemSearchQuery(''); navigate('/home'); }}
                    searchInputRef={null}
                    backendUrl={backendUrl}
                />
            </div>

            <div ref={topRef} className="pt-16"></div>

            <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16 md:pb-20">
                {loading ? (
                    <div className="text-center py-8">
                        <p className="text-gray-600">Loading...</p>
                    </div>
                ) : (
                    <>
                        <AnimatePresence>
                            {errorMessage && (
                                <motion.div
                                    ref={errorMessageRef}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-center max-w-md mx-auto"
                                >
                                    {errorMessage}
                                </motion.div>
                            )}
                            {fetchError && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-center max-w-md mx-auto"
                                >
                                    {fetchError}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {selectedCourt && (
                            <>
                                <div className="mb-8">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
                                        <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                                            <button
                                                onClick={handleHomeClick}
                                                className="text-gray-600 hover:text-red-600 text-sm font-medium"
                                            >
                                                Home
                                            </button>
                                            <span className="text-gray-600">/</span>
                                            <h2 className="text-xl font-bold text-gray-800">
                                                {selectedCourt.name}
                                            </h2>
                                        </div>
                                        <div className="relative w-full sm:w-[400px] md:w-[360px] lg:w-[500px] xl:w-[600px]">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <HiSearch className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Search items..."
                                                value={itemSearchQuery}
                                                onChange={(e) => setItemSearchQuery(e.target.value)}
                                                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-gray-800 bg-white"
                                            />
                                            {itemSearchQuery && (
                                                <button
                                                    onClick={clearItemSearch}
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                >
                                                    <HiXCircle className="h-5 w-5 text-gray-400 hover:text-red-600" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-center mb-4">
                                        <p className="text-gray-600">{selectedCourt.name}</p>
                                        <div className="flex justify-center items-center space-x-4">
                                            <div className="flex items-center space-x-1">
                                                <HiStar className="w-4 h-4 text-yellow-500" />
                                                <span className="text-sm font-medium">{selectedCourt.rating || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center space-x-1 text-gray-600">
                                                <HiClock className="w-4 h-4" />
                                                <span className="text-sm">{selectedCourt.time || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
                                        <h2 className="text-2xl font-bold text-gray-800 text-center sm:text-left">
                                            Items at {selectedCourt.name}
                                        </h2>
                                        <select
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            className="mt-2 sm:mt-0 sm:ml-4 w-full sm:w-48 py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm"
                                        >
                                            {categories.map((category, index) => (
                                                <option key={index} value={category}>
                                                    {category}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {filteredPopularItems.length > 0 ? (
                                        selectedCategory === 'All Categories' ? (
                                            categories
                                                .filter(cat => cat !== 'All Categories')
                                                .map(category => {
                                                    const categoryItems = filteredPopularItems.filter(
                                                        item => item.category === category
                                                    );
                                                    return categoryItems.length > 0 ? (
                                                        <div key={category} className="mb-4">
                                                            <button
                                                                onClick={() => handleCategoryToggle(category)}
                                                                className="w-full flex justify-between items-center py-2 px-4 bg-gradient-to-r from-red-500 to-red-500 hover:from-red-700 hover:to-red-700 rounded-lg text-white font-semibold transition-colors"
                                                            >
                                                                <h3 className="text-lg">{category}</h3>
                                                                {categoryOpenState[category] ? (
                                                                    <HiChevronUp className="w-5 h-5" />
                                                                ) : (
                                                                    <HiChevronDown className="w-5 h-5" />
                                                                )}
                                                            </button>
                                                            <AnimatePresence>
                                                                {categoryOpenState[category] && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, height: 0 }}
                                                                        animate={{ opacity: 1, height: 'auto' }}
                                                                        exit={{ opacity: 0, height: 0 }}
                                                                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mt-2"
                                                                    >
                                                                        {categoryItems.map((item, index) => (
                                                                            <motion.div
                                                                                key={index}
                                                                                ref={(el) => (foodItemRefs.current[item._id] = el)}
                                                                                whileHover={item.isAvailable ? { scale: 1.02 } : {}}
                                                                                onClick={() => handleFoodItemClick(item)}
                                                                                className={`bg-white rounded-xl shadow-md flex overflow-hidden transition-shadow h-48 ${item.isAvailable ? 'hover:shadow-lg cursor-pointer' : 'opacity-50 cursor-not-allowed grayscale'}`}
                                                                            >
                                                                                <div className="flex-1 p-4 flex flex-col justify-between">
                                                                                    <div>
                                                                                        <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.name}</p>
                                                                                        <p className="text-xs text-gray-600 mt-1">{item.category}</p>
                                                                                        <p className="text-sm font-semibold text-gray-800 mt-1">
                                                                                            ₹{item.price !== undefined ? item.price : 'N/A'}
                                                                                        </p>
                                                                                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                                                                                    </div>
                                                                                    <button
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            handleAddItem(item);
                                                                                        }}
                                                                                        className={`mt-2 px-3 py-1 rounded-lg flex items-center space-x-1 transition-colors w-fit ${item.isAvailable ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}
                                                                                    >
                                                                                        <HiPlus className="w-4 h-4" />
                                                                                        <span className="text-sm">Add</span>
                                                                                    </button>
                                                                                </div>
                                                                                <div className="flex-shrink-0 w-40 h-full relative">
                                                                                    <img
                                                                                        src={item.image}
                                                                                        alt={item.name}
                                                                                        className="w-full h-full object-cover"
                                                                                    />
                                                                                    <div className="absolute top-2 right-2 flex items-center space-x-1 bg-black bg-opacity-50 px-2 py-1 rounded-lg">
                                                                                        <HiStar className="w-4 h-4 text-yellow-500" />
                                                                                        <span className="text-xs font-medium text-white">
                                                                                            {item.rating ? item.rating : 'N/A'}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            </motion.div>
                                                                        ))}
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    ) : null;
                                                })
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                                                {filteredPopularItems.map((item, index) => (
                                                    <motion.div
                                                        key={index}
                                                        ref={(el) => (foodItemRefs.current[item._id] = el)}
                                                        whileHover={item.isAvailable ? { scale: 1.02 } : {}}
                                                        onClick={() => handleFoodItemClick(item)}
                                                        className={`bg-white rounded-xl shadow-md flex overflow-hidden transition-shadow h-48 ${item.isAvailable ? 'hover:shadow-lg cursor-pointer' : 'opacity-50 cursor-not-allowed grayscale'}`}
                                                    >
                                                        <div className="flex-1 p-4 flex flex-col justify-between">
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.name}</p>
                                                                <p className="text-xs text-gray-600 mt-1">{item.category}</p>
                                                                <p className="text-sm font-semibold text-gray-800 mt-1">
                                                                    ₹{item.price !== undefined ? item.price : 'N/A'}
                                                                </p>
                                                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                                                            </div>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleAddItem(item);
                                                                }}
                                                                className={`mt-2 px-3 py-1 rounded-lg flex items-center space-x-1 transition-colors w-fit ${item.isAvailable ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}
                                                            >
                                                                <HiPlus className="w-4 h-4" />
                                                                <span className="text-sm">Add</span>
                                                            </button>
                                                        </div>
                                                        <div className="flex-shrink-0 w-40 h-full relative">
                                                            <img
                                                                src={item.image}
                                                                alt={item.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                            <div className="absolute top-2 right-2 flex items-center space-x-1 bg-black bg-opacity-50 px-2 py-1 rounded-lg">
                                                                <HiStar className="w-4 h-4 text-yellow-500" />
                                                                <span className="text-xs font-medium text-white">
                                                                    {item.rating ? item.rating : 'N/A'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-gray-600">No items available yet for this category.</p>
                                        </div>
                                    )}
                                </div>
                                {selectedCourt && cartItems.length > 0 && (
                                    <div className="fixed bottom-16 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-50 bg-white border-t border-gray-200 p-4 shadow-lg mb-3 md:mb-0 md:bottom-0">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-800 font-medium">
                                                {cartItems.length} item{cartItems.length > 1 ? 's' : ''} added
                                            </span>
                                            <Link
                                                to="/cart"
                                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                            >
                                                View Cart
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>

            <div className="fixed bottom-0 left-0 right-0 z-50">
                <BottomNavbar handleHomeClick={handleHomeClick} />
            </div>

            <AnimatePresence>
                {isPopupOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    >
                        <motion.div
                            className={`p-4 rounded-lg shadow-lg max-w-sm w-full ${popupType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                            style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
                        >
                            <div className="flex justify-between items-center">
                                <p className="text-sm font-medium">{popupMessage}</p>
                                <button
                                    onClick={() => setIsPopupOpen(false)}
                                    className="text-gray-600 hover:text-gray-800"
                                >
                                    <HiXCircle className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isReplacePopupOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    >
                        <motion.div
                            className="p-4 rounded-lg shadow-lg bg-yellow-100 text-yellow-800 max-w-sm w-full"
                            style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
                        >
                            <div className="flex flex-col items-center justify-between">
                                <p className="text-sm font-medium mb-4">Add items from the same food court or do you want to replace the items?</p>
                                <div className="flex space-x-4">
                                    <button
                                        onClick={handleReplaceItem}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                    >
                                        Replace
                                    </button>
                                    <button
                                        onClick={handleCancelReplace}
                                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FoodCourtDetailsPage;
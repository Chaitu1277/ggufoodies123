import { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiStar,
    HiClock,
    HiChevronLeft,
    HiChevronRight,
    HiXCircle,
    HiSearch
} from 'react-icons/hi';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import TopNavbar from '../components/TopNavbar';
import BottomNavbar from '../components/BottomNavbar';

const HomePage = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useContext(AuthContext);
    const [searchQuery, setSearchQuery] = useState('');
    const [fetchError, setFetchError] = useState('');
    const [foodCourts, setFoodCourts] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [popularItems, setPopularItems] = useState([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [popupType, setPopupType] = useState('success');
    const [loading, setLoading] = useState(true);
    const popularItemsRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);
    const searchInputRef = useRef(null);

    const processFoodCourts = (restaurantsData) => {
        const fetchedFoodCourts = [...restaurantsData].map((restaurant, index) => ({
            id: index + 1,
            name: restaurant.restaurantname,
            image: restaurant.image,
            address: restaurant.address,
            description: `A delightful food court at ${restaurant.address}.`,
            isOpen: restaurant.availability
        }));
        const fetchedRestaurants = [...restaurantsData].map((restaurant, index) => ({
            id: index + 1,
            name: restaurant.restaurantname,
            image: restaurant.image,
            isOpen: restaurant.availability,
            rating: parseFloat(restaurant.rating.toFixed(1)),
            time: '20-30 min',
            court: restaurant.restaurantname,
            address: restaurant.address,
        }));
        setFoodCourts(fetchedFoodCourts);
        setRestaurants(fetchedRestaurants);
        return fetchedRestaurants;
    };

    const processFoodItems = (foodItemsData) => {
        const fetchedItems = [...foodItemsData].map(item => ({
            _id: item._id,
            name: item.dishname,
            image: item.dishphoto,
            court: item.restaurantid.restaurantname,
            category: item.category,
            price: item.dineinPrice,
            description: item.description,
            isAvailable: item.availability,
            rating: parseFloat(item.rating.toFixed(1)),
        }));
        setPopularItems(fetchedItems);
    };

    const fetchData = async () => {
        try {
            const [response, responseItems] = await Promise.all([
                axios.get(`${backendUrl}/api/restaurant/restaurants`),
                axios.get(`${backendUrl}/api/restaurant/all-food-items`),
            ]);
            if (response.data.success) {
                processFoodCourts(response.data.restaurants);
            } else {
                throw new Error('Failed to fetch food courts');
            }
            if (responseItems.data.success) {
                processFoodItems(responseItems.data.foodItems);
            } else {
                throw new Error('Failed to fetch food items');
            }
            setFetchError('');
        } catch (error) {
            console.error('Failed to fetch data:', error);
            setFetchError('Failed to load food courts or items. Please try again later.');
            showPopup('Failed to load food courts or items', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showPopup = (message, type) => {
        setPopupMessage(message);
        setPopupType(type);
        setIsPopupOpen(true);
        setTimeout(() => setIsPopupOpen(false), 3000);
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (location.state?.showPopup) {
            showPopup(location.state.popupMessage, location.state.popupType);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate]);

    const clearSearch = () => {
        setSearchQuery('');
    };

    const handleItemClick = (item) => {
        if (!item.isAvailable) {
            showPopup('This item is temporarily not available.', 'error');
            return;
        }
        const court = restaurants.find(restaurant => restaurant.name === item.court);
        if (court && court.isOpen) {
            navigate('/food-court-details', {
                state: {
                    selectedCourt: court,
                    scrollToItemId: item._id
                }
            });
        } else if (court) {
            showPopup('This food court is currently closed.', 'error');
        }
    };

    const handleFoodCourtClick = (court) => {
        if (court.isOpen) {
            navigate('/food-court-details', { state: { selectedCourt: court } });
        } else {
            showPopup('This food court is currently closed.', 'error');
        }
    };

    const scrollPopularItems = (direction) => {
        if (popularItemsRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = popularItemsRef.current;
            const scrollAmount = 300;
            if (direction === 'left') {
                popularItemsRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                popularItemsRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
            setTimeout(() => {
                const newScrollLeft = popularItemsRef.current.scrollLeft;
                setShowLeftArrow(newScrollLeft > 0);
                setShowRightArrow(newScrollLeft < scrollWidth - clientWidth);
            }, 300);
        }
    };

    useEffect(() => {
        const checkScrollPosition = () => {
            if (popularItemsRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = popularItemsRef.current;
                setShowLeftArrow(scrollLeft > 0);
                setShowRightArrow(scrollLeft < scrollWidth - clientWidth);
            }
        };
        if (popularItemsRef.current) {
            popularItemsRef.current.addEventListener('scroll', checkScrollPosition);
            checkScrollPosition();
        }
        return () => {
            if (popularItemsRef.current) {
                popularItemsRef.current.removeEventListener('scroll', checkScrollPosition);
            }
        };
    }, [popularItems]);

    const filteredRestaurants = searchQuery
        ? restaurants.filter(restaurant =>
            restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            popularItems.some(item =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                item.court === restaurant.name
            )
        )
        : restaurants;

    const filteredPopularItems = searchQuery
        ? popularItems.filter(item =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : popularItems
            .filter(item => item.isAvailable)
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 10);

    return (
        <div className="min-h-screen flex flex-col bg-white relative overflow-hidden">
            <div className="fixed top-0 left-0 right-0 z-50">
                <TopNavbar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    handleSearchClick={() => navigate('/search', { state: { searchQuery } })}
                    clearSearch={clearSearch}
                    searchInputRef={searchInputRef}
                    backendUrl={backendUrl}
                    isFixed={true}
                />
            </div>

            <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 md:pb-20 overflow-x-hidden">
                {loading ? (
                    <div className="text-center py-8">
                        <p className="text-gray-600">Loading...</p>
                    </div>
                ) : (
                    <>
                        <AnimatePresence>
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

                        <div className="mb-4 relative">
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="text-2xl font-bold text-gray-800">Popular Items</h2>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => scrollPopularItems('left')}
                                        className={`p-1 rounded-full ${showLeftArrow ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                                        disabled={!showLeftArrow}
                                    >
                                        <HiChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => scrollPopularItems('right')}
                                        className={`p-1 rounded-full ${showRightArrow ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                                        disabled={!showRightArrow}
                                    >
                                        <HiChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            {filteredPopularItems.length > 0 ? (
                                <div
                                    ref={popularItemsRef}
                                    className="flex overflow-x-auto space-x-4 pb-2 scrollbar-hide w-full"
                                    style={{ scrollBehavior: 'smooth' }}
                                >
                                    {filteredPopularItems.map((item, index) => (
                                        <motion.div
                                            key={index}
                                            whileHover={item.isAvailable ? { scale: 1.02 } : {}}
                                            onClick={() => handleItemClick(item)}
                                            className={`bg-white rounded-lg shadow-md flex flex-col overflow-hidden transition-shadow cursor-pointer flex-shrink-0 w-48 h-52 ${item.isAvailable ? 'hover:shadow-lg' : 'opacity-50 cursor-not-allowed grayscale'}`}
                                        >
                                            <div className="relative h-36 w-full">
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
                                            <div className="p-1 flex-1 flex flex-col justify-center">
                                                <p className="text-sm font-medium text-gray-800 line-clamp-1 text-center">{item.name}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-gray-600">No popular items available.</p>
                                </div>
                            )}
                        </div>

                        <div className="mb-8 w-full">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-left">Available Food Courts</h2>
                            {filteredRestaurants.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                                    {filteredRestaurants.map((restaurant) => (
                                        <motion.div
                                            key={restaurant.id}
                                            whileHover={restaurant.isOpen ? { scale: 1.02 } : {}}
                                            className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 w-full ${restaurant.isOpen ? 'hover:shadow-lg cursor-pointer' : 'opacity-50 cursor-not-allowed grayscale'}`}
                                            onClick={() => handleFoodCourtClick(restaurant)}
                                        >
                                            <div className="relative w-full aspect-video">
                                                <img
                                                    src={restaurant.image}
                                                    alt={restaurant.name}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div
                                                    className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${restaurant.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                                >
                                                    {restaurant.isOpen ? 'Open' : 'Closed'}
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-bold text-gray-800 mb-1">{restaurant.name}</h3>
                                                <p className="text-sm text-gray-600 mb-2">{restaurant.address}</p>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-1">
                                                        <HiStar className="w-4 h-4 text-yellow-500" />
                                                        <span className="text-sm font-medium">{restaurant.rating}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1 text-gray-600">
                                                        <HiClock className="w-4 h-4" />
                                                        <span className="text-sm">{restaurant.time}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-600">No food courts available for this item.</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            <div className="fixed bottom-0 left-0 right-0 z-50">
                <BottomNavbar handleHomeClick={() => { setSearchQuery(''); }} />
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

            <style>
                {`
          html, body,#root {
            margin: 0;
            padding: 0;
            height: 100%;
            overflow-x: hidden;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
            .fixed.bottom-0 {
                        bottom: 0 !important;
                    }
          .line-clamp-1 {
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          @media (max-width: 767px) {
            html {
              scrollbar-color: #f1f5f9 #f1f5f9;
            }
          }
          @media (min-width: 768px) {
             .fixed.bottom-16 {
                            bottom: 0 !important;
                        }
          }
        `}
            </style>
        </div>
    );
};

export default HomePage;
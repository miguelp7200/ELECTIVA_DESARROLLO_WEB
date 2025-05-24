import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Hooks/AuthContext'; // Adjust the path accordingly
import logo from "./LogoGasco.png";
import TourModal from "../Helpers/TourModal";

const Layout = ({ startTour }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const dropdownRef = useRef(null);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleToggleDropdown = () => {
        setDropdownVisible(!dropdownVisible);
    };

    const handleLogout = () => {
        logout(); // Clear user state
        navigate('/'); // Navigate back to login
    };

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setDropdownVisible(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <>
            <div className="flex flex-row justify-center">
                <div className="w-full bg-gray-100">
                    <div className="flex justify-between text-gray-800">
                        <div className="flex flex-row justify-start gap-1 mx-5 items-center">
                            <div>
                                <img src={logo} alt="Gasco Logo" className="h-16 w-32" />
                            </div>
                            <div>
                                <span onClick={openModal}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-gray-600">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                                    </svg>
                                </span>
                            </div>
                        </div>
                        <div className="flex justify-between mx-5 items-center gap-2">
                            <div className="text-base text-gray-600">
                                Bienvenido! {" "}
                                <span className=" font-semibold">
                                    {user?.user}
                                </span>

                            </div>
                            <div id="step13">
                                <div className="relative inline-block text-left" ref={dropdownRef}>
                                    <div onClick={handleToggleDropdown} className="cursor-pointer">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7 text-sky-600">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                        </svg>
                                    </div>
                                    {dropdownVisible && (
                                        <div className="absolute right-0 mt-3 w-44 mx-2 h-10 bg-white border border-gray-300 rounded-md shadow-lg text-sm ">
                                            <button
                                                className=" w-full text-left px-4 py-2  text-gray-700 hover:bg-gray-100 flex items-center"
                                                onClick={handleLogout}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mr-2 text-sky-600">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                                                </svg>
                                                Cerrar Sesión
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {isModalOpen && (
                        <TourModal
                            isOpen={isModalOpen}
                            onClose={closeModal}
                            startTour={startTour}
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default Layout;

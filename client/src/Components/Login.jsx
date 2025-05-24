import { useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Hooks/AuthContext'; 

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    //Limpia inputs cuando hay un error
    const validateInputs = () => {
        let isValid = true;
        if (!username) {
            setUsernameError('Usuario es requerido');
            isValid = false;
        } else {
            setUsernameError('');
        }
        if (!password) {
            setPasswordError('Contraseña es requerida');
            isValid = false;
        } else {
            setPasswordError('');
        }
        return isValid;
    };

    //Función para iniciar sesión de usuario
    const inicioSesion = async () => {
        if (!validateInputs()) return;

        try {
            //Consume API para metodo de inicio de sesion
            const apiServer = import.meta.env.VITE_API_SERVER;
            const response = await axios.get(`${apiServer}loginUsers`, {
                params: { username, password },
            });

            if (response.status === 200) {
                login(response.data); // update el usuario en el context
                setError('');
                navigate('/BusquedaAudios', { state: { username: response.data.user } }); //Redirecciona a la pagina de Busqueda
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                setError('Usuario o Contraseña Inválido');
                setUsername(''); 
                setPassword(''); 
            } else {
                setError('Error al iniciar sesión');
                setUsername(''); 
                setPassword(''); 
            }
            console.error('Error al iniciar sesión:', error);
        }
    };


    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="border border-gray-200 w-[40%] h-full shadow-lg">
                <div className="flex flex-col justify-center items-center gap-6 my-12">
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-20 text-sky-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-xl font-extrabold text-gray-600 dark:text-white leading-tight tracking-wide">
                            Inicio de Sesión
                        </h1>
                    </div>
                    <div className="w-1/2">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="user">
                            Usuario
                        </label>
                        <input
                            className="w-full py-3 px-3 border border-gray-300 rounded-lg shadow-sm text-gray-700 leading-tight focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                            id="user"
                            type="text"
                            placeholder="Escribe tu usuario"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        {usernameError && <p className="text-red-500 text-sm mt-1">{usernameError}</p>}
                        <label className="block text-gray-700 text-sm font-bold mb-2 mt-10" htmlFor="password">
                            Contraseña
                        </label>
                        <input
                            className="w-full py-3 px-3 border border-gray-300 rounded-lg shadow-sm text-gray-700 leading-tight focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                            id="password"
                            type="password"
                            placeholder="Escribe tu contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
                        <button
                            className="uppercase bg-sky-500 text-white hover:bg-sky-600 font-bold py-2 px-10 rounded-md mt-12 mb-2 w-full"
                            onClick={inicioSesion}
                        >
                            Ingresar
                        </button>
                        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;

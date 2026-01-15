import { useState } from 'react'
import api from '../api'
import { useNavigate } from 'react-router-dom'
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants'
import '../styles/Login.css'
import '../styles/Global.css'
import LoadingIndicator from './LoadingIndicator'
import { useAuth } from '../context/AuthContext'

function Form({ route, method }) { // login form 
    const { login } = useAuth();
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    let isError = false
    const navigate = useNavigate()

    const pageName = method === 'login' ? 'Login' : 'Register'

    const handleSubmit = async (e) => {
        e.preventDefault(); // prevent from reloading the page, which is the default behavior after submit
        setLoading(true);

        try {
            const res = await api.post(route, { username, password });
            let naviTo = username.startsWith("test") ? "/student" : "/";

            if (method === 'login') {
                login(res.data.access); // set the access token in context
                navigate(naviTo);
            } else {
                navigate('/login');
            }
        } catch (error) {
            isError = true;
            if (error.message.includes('401')) {
                setMessage("Invalid username or password. Please try again.");
            } else {
                setMessage("An error occurred. Please try again.\nError: " + error.message);
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className='form-container'>
            <h1>{pageName}</h1>
            <input
                className='form-input'
                type='text'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder='Username'
                required
            />
            <input
                className='form-input'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Password'
                required
            />
            {loading && <LoadingIndicator />}
            <button className='form-button' type='submit'>
                {pageName}
            </button>
            <span className={`message ${isError ? "error" : "success"}`}>
                {message}
            </span>
        </form>
    );
}

export default Form
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom'; // Importa il componente Link
import './LoginPage.css'; // Assicurati di importare il CSS aggiornato



const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('https://attendance-app-backend-mu.vercel.app/api/login', {
                email,
                password,
            });
            const token = response.data.token;
            localStorage.setItem('token', token);
            navigate('/form');
        } catch (err) {
            console.error(err);
            alert('Email o password errati');
        }
    };

    return (
        <div className="container">
            <h2>Gestione Giorni Lavorativi Neotech-Log In</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="form-input"
                    />
                </div>
                <button type="submit">Login</button>
            </form>
            <p className="login-link">
                Non sei registrato? <Link to="/register">Registrati qui</Link> {/* Link alla pagina di login */}
            </p>
        </div>
    );
};

export default LoginPage;

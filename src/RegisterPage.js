import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Importa il componente Link
import './RegisterPage.css'; // Importa il file CSS

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await axios.post('https://attendance-app-backend-ashen.vercel.app/api/register', {
                name,
                email,
                password,
            });
            alert('Registrazione completata con successo!');
        } catch (err) {
            console.error(err);
            alert('Errore durante la registrazione');
        }
    };

    return (
        <div className="container">
            <h2>Gestione Giorni Lavorativi Neotech - Registrati</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Nome e Cognome:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="form-input"
                    />
                </div>
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
                <button type="submit" className="submit-button">Registrati</button>
            </form>
            <p className="login-link">
                Sei registrato? <Link to="/">Accedi qui</Link> {/* Link alla pagina di login */}
            </p>
        </div>
    );
};

export default RegisterPage;

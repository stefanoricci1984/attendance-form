import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { UserDataProvider } from './UserDataContext';
import FormPage from './FormPage';
import UsersPage from './UsersPage';
import RegisterPage from './RegisterPage';
import LoginPage from './LoginPage';

const App = () => {
    return (
        <UserDataProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/form" element={<FormPage />} />
                    <Route path="/users" element={<UsersPage />} />
                </Routes>
            </Router>
        </UserDataProvider>
    );
};

export default App;

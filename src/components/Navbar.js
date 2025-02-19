import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserCredits from './UserCredits';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsMenuOpen(false);
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className="main-nav">
            <div className="nav-content">
                <Link to="/" className="nav-logo">
                    EcoRide
                </Link>

                <button className="menu-toggle" onClick={toggleMenu}>
                    <span className="menu-icon"></span>
                </button>

                <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
                    <li>
                        <Link 
                            to="/" 
                            className={location.pathname === '/' ? 'active' : ''}
                        >
                            Accueil
                        </Link>
                    </li>
                    <li>
                        <Link 
                            to="/covoiturages" 
                            className={location.pathname === '/covoiturages' ? 'active' : ''}
                        >
                            Rechercher
                        </Link>
                    </li>
                    <li>
                        <Link 
                            to="/contact" 
                            className={location.pathname === '/contact' ? 'active' : ''}
                        >
                            Contact
                        </Link>
                    </li>
                    {user && (
                        <>
                            <li>
                                <Link 
                                    to="/saisir-voyage" 
                                    className={location.pathname === '/saisir-voyage' ? 'active' : ''}
                                >
                                    Proposer un trajet
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    to="/mon-espace" 
                                    className={location.pathname === '/mon-espace' ? 'active' : ''}
                                >
                                    Mon espace
                                </Link>
                            </li>
                            <li className="credits-display">
                                <UserCredits />
                            </li>
                            <li>
                                <button onClick={handleLogout} className="logout-button">
                                    Déconnexion
                                </button>
                            </li>
                        </>
                    )}
                    {!user && (
                        <>
                            <li>
                                <Link 
                                    to="/login" 
                                    className={`auth-button ${location.pathname === '/login' ? 'active' : ''}`}
                                >
                                    Connexion
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    to="/register" 
                                    className={`auth-button register ${location.pathname === '/register' ? 'active' : ''}`}
                                >
                                    Inscription
                                </Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar; 
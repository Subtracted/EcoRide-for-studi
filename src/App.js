import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import Login from './components/Login';
import Register from './components/Register';
import UserSpace from './components/UserSpace';
import SaisirVoyage from './components/SaisirVoyage';
import Covoiturages from './components/Covoiturages';
import Contact from './components/Contact';
import GestionVehicules from './components/GestionVehicules';
import AdminSpace from './components/AdminSpace';
import EmployeSpace from './components/EmployeSpace';
import PrivateRoute from './components/PrivateRoute';
import './App.css';
import './styles/global.css';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <Navbar />
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/user-space" element={<UserSpace />} />
                        <Route path="/saisir-voyage" element={<SaisirVoyage />} />
                        <Route path="/covoiturages" element={<Covoiturages />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/gestion-vehicules" element={<GestionVehicules />} />
                        <Route 
                            path="/admin" 
                            element={
                                <PrivateRoute role="admin">
                                    <AdminSpace />
                                </PrivateRoute>
                            } 
                        />
                        <Route 
                            path="/employe" 
                            element={
                                <PrivateRoute role="employe">
                                    <EmployeSpace />
                                </PrivateRoute>
                            } 
                        />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;


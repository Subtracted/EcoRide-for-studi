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
import Dashboard from './components/admin/Dashboard';
import TrajetEnCours from './components/TrajetEnCours';
import CompteSuspendu from './components/CompteSuspendu';
import ProtectedRoute from './components/ProtectedRoute';
import MentionsLegales from './components/MentionsLegales';
import ConditionsGenerales from './components/ConditionsGenerales';
import PolitiqueConfidentialite from './components/PolitiqueConfidentialite';
import PolitiqueCookies from './components/PolitiqueCookies';
import Footer from './components/Footer';
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
                        <Route path="/compte-suspendu" element={<CompteSuspendu />} />
                        <Route path="/mon-espace" element={
                            <ProtectedRoute>
                                <UserSpace />
                            </ProtectedRoute>
                        } />
                        <Route path="/saisir-voyage" element={<SaisirVoyage />} />
                        <Route path="/covoiturages" element={<Covoiturages />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/gestion-vehicules" element={<GestionVehicules />} />
                        <Route path="/admin" element={
                            <ProtectedRoute requiredRole="admin">
                                <AdminSpace />
                            </ProtectedRoute>
                        } />
                        <Route path="/employe" element={
                            <ProtectedRoute requiredRole="employe">
                                <EmployeSpace />
                            </ProtectedRoute>
                        } />
                        <Route 
                            path="/admin/dashboard" 
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <Dashboard />
                                </ProtectedRoute>
                            } 
                        />
                        <Route path="/covoiturage/:id" element={<TrajetEnCours />} />
                        
                        {/* Pages légales */}
                        <Route path="/mentions-legales" element={<MentionsLegales />} />
                        <Route path="/conditions-generales" element={<ConditionsGenerales />} />
                        <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
                        <Route path="/politique-cookies" element={<PolitiqueCookies />} />
                    </Routes>
                    <Footer />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;


import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ConfirmarCitaPage from './pages/ConfirmarCitaPage';
import CancelarCitaPage from './pages/CancelarCitaPage';
import HomePage from './pages/HomePage';
import AppointmentPage from './pages/AppointmentPage';
import MyAppointmentsPage from './pages/MyAppointmentsPage';
import SettingsPage from './pages/SettingsPage';
import UserMenu from './components/UserMenu';
import { getToken, getUser, logout } from './api/client';
import './App.css';

function Layout({ children }: { children: React.ReactNode }) {
  const token = getToken();
  const user = getUser();

  return (
    <div className="d-flex flex-column min-vh-100">
      {token && (
        <Navbar expand="sm" className="app-navbar" variant="dark">
          <Container>
            <Navbar.Brand as={Link} to="/">
              ESPEcitas
            </Navbar.Brand>
            <Navbar.Toggle />
            <Navbar.Collapse>
              <Nav className="me-auto">
                <Nav.Link as={Link} to="/agendar">Agendar</Nav.Link>
                <Nav.Link as={Link} to="/mis-citas">Mis Citas</Nav.Link>
              </Nav>
              <div className="d-flex align-items-center gap-3">
                {user && <UserMenu nombre={user.nombre} />}
              </div>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      )}
      <main className="flex-grow-1">
        {children}
      </main>
      <footer className="app-footer">
        <Container>ESPEcitas &copy; {new Date().getFullYear()} — Sistema de Gestión de Citas Médicas</Container>
      </footer>
    </div>
  );
}

function HomeOrLogin() {
  return getToken() ? <HomePage /> : <LoginPage />;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!getToken()) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppContent() {
  const location = useLocation();
  return (
    <Layout>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomeOrLogin />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/confirmar" element={<ConfirmarCitaPage />} />
        <Route path="/cancelar" element={<CancelarCitaPage />} />
        <Route path="/agendar" element={<ProtectedRoute><AppointmentPage /></ProtectedRoute>} />
        <Route path="/mis-citas" element={<ProtectedRoute><MyAppointmentsPage /></ProtectedRoute>} />
        <Route path="/configuracion" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

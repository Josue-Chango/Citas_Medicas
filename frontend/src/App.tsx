import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ConfirmarCitaPage from './pages/ConfirmarCitaPage';
import CancelarCitaPage from './pages/CancelarCitaPage';
import HomePage from './pages/HomePage';
import AppointmentPage from './pages/AppointmentPage';
import MyAppointmentsPage from './pages/MyAppointmentsPage';
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
                {user && (
                  <span className="text-light small d-flex align-items-center gap-1">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                    {user.nombre}
                  </span>
                )}
                <Button variant="outline-light" size="sm" className="btn-logout"
                  onClick={() => { logout(); window.location.href = '/'; }}>
                  Cerrar Sesión
                </Button>
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

import { useNavigate } from 'react-router-dom';
import { Card } from 'react-bootstrap';
import { getUser } from '../api/client';

export default function HomePage() {
  const user = getUser();
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <div className="login-wrapper fade-in">
        <div className="login-header">
          <div className="brand-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.5-2.5 2-5.5 2-8 0-3-2-5-5-5-1.5 0-2.7.5-3.7 1.5L12 3l-.3-.5C10.7 1.5 9.5 1 8 1 5 1 3 3 3 6c0 2.5.5 5.5 2 8l7 9 7-9z" />
            </svg>
          </div>
          <h1>Bienvenido{user ? `, ${user.nombre}` : ''}</h1>
          <p>¿Qué deseas hacer hoy?</p>
        </div>

        <div className="d-flex flex-column gap-3">
          <Card className="card-moderno option-card" onClick={() => navigate('/agendar')} role="button">
            <Card.Body className="d-flex align-items-center gap-3 py-3">
              <div className="d-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 text-primary"
                style={{ width: 48, height: 48, flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div>
                <h5 className="mb-0 fw-semibold">Agendar Cita</h5>
                <small className="text-muted">Reserva una nueva cita médica</small>
              </div>
              <svg className="ms-auto" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--gray-400)' }}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Card.Body>
          </Card>

          <Card className="card-moderno option-card" onClick={() => navigate('/mis-citas')} role="button">
            <Card.Body className="d-flex align-items-center gap-3 py-3">
              <div className="d-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10 text-success"
                style={{ width: 48, height: 48, flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <div>
                <h5 className="mb-0 fw-semibold">Mis Citas</h5>
                <small className="text-muted">Consulta y administra tus citas</small>
              </div>
              <svg className="ms-auto" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--gray-400)' }}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}

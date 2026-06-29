import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, Button, Alert, Spinner } from 'react-bootstrap';
import { confirmarCancelacion } from '../api/client';

export default function CancelarCitaPage() {
  const [searchParams] = useSearchParams();
  const citaId = searchParams.get('id');
  const token = searchParams.get('token');
  const [cancelando, setCancelando] = useState(false);
  const [resultado, setResultado] = useState<'idle' | 'exito' | 'error'>('idle');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    if (!citaId || !token) {
      setResultado('error');
      setMensaje('Enlace de cancelación inválido');
    }
  }, [citaId, token]);

  const handleCancelar = async () => {
    if (!citaId || !token) return;
    setCancelando(true);
    try {
      await confirmarCancelacion(citaId, token);
      setResultado('exito');
      setMensaje('Tu cita ha sido cancelada exitosamente.');
    } catch (err: any) {
      setResultado('error');
      setMensaje(err?.response?.data?.error || 'Error al cancelar la cita');
    } finally {
      setCancelando(false);
    }
  };

  return (
    <div className="page-container">
      <div className="login-wrapper fade-in">
        <div className="login-header">
          <div className="brand-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.5-2.5 2-5.5 2-8 0-3-2-5-5-5-1.5 0-2.7.5-3.7 1.5L12 3l-.3-.5C10.7 1.5 9.5 1 8 1 5 1 3 3 3 6c0 2.5.5 5.5 2 8l7 9 7-9z" />
            </svg>
          </div>
          <h1>Cancelar Cita</h1>
        </div>

        <Card className="card-moderno login-card text-center">
          {resultado === 'idle' && !citaId && (
            <Alert variant="danger">Enlace de cancelación inválido</Alert>
          )}

          {resultado === 'idle' && citaId && (
            <>
              <div className="confirmado-icon" style={{ width: 56, height: 56, fontSize: '1.5rem', marginBottom: '1rem' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <p className="mb-3">Presiona el botón para cancelar tu cita.</p>
              <Button variant="danger" className="btn-moderno px-4" onClick={handleCancelar} disabled={cancelando}>
                {cancelando ? <><Spinner size="sm" className="me-2" />Cancelando...</> : 'Cancelar Cita'}
              </Button>
            </>
          )}

          {resultado === 'exito' && (
            <>
              <div className="confirmado-icon" style={{ width: 56, height: 56, fontSize: '1.5rem', marginBottom: '1rem' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <Alert variant="success">{mensaje}</Alert>
              <Link to="/">
                <Button variant="primary" className="btn-moderno">Ir al inicio</Button>
              </Link>
            </>
          )}

          {resultado === 'error' && (
            <>
              <div style={{ width: 56, height: 56, fontSize: '1.5rem', marginBottom: '1rem' }}
                className="d-flex align-items-center justify-content-center rounded-circle bg-danger bg-opacity-10 text-danger mx-auto">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <Alert variant="danger">{mensaje}</Alert>
              <Link to="/">
                <Button variant="primary" className="btn-moderno">Ir al inicio</Button>
              </Link>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

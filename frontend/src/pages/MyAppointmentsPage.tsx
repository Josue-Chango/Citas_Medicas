import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Button, Table, Modal, Form } from 'react-bootstrap';
import { getCitas, cancelarCita, getToken } from '../api/client';
import type { Appointment, NotificationResult } from '../types';

const STATUS_MAP: Record<string, { label: string; variant: string }> = {
  pendiente: { label: 'Pendiente', variant: 'warning' },
  confirmada: { label: 'Confirmada', variant: 'success' },
  cancelada: { label: 'Cancelada', variant: 'danger' },
  completada: { label: 'Completada', variant: 'info' },
};

export default function MyAppointmentsPage() {
  const [citas, setCitas] = useState<Appointment[]>([]);
  const [citaCancelar, setCitaCancelar] = useState<Appointment | null>(null);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [notif, setNotif] = useState<NotificationResult | null>(null);
  const [verCanceladas, setVerCanceladas] = useState(false);
  const [verConfirmadas, setVerConfirmadas] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!getToken()) { navigate('/'); return; }
    getCitas().then(setCitas);
  }, [navigate, location]);

  const handleCancelar = async () => {
    if (!citaCancelar) return;
    setError('');
    setNotif(null);
    try {
      const resp = await cancelarCita(citaCancelar.id);
      setNotif(resp.notificacion);
      setExito(`Cita de ${citaCancelar.especialidad} cancelada exitosamente.`);
      setCitaCancelar(null);
      getCitas().then(setCitas);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cancelar la cita');
      setCitaCancelar(null);
    }
  };

  const citasFiltradas = citas.filter(c => {
    if (c.estado === 'pendiente') return true;
    if (c.estado === 'cancelada' && verCanceladas) return true;
    if (c.estado === 'confirmada' && verConfirmadas) return true;
    return false;
  });

  return (
    <div className="page-container">
      <div className="citas-wrapper fade-in">
        <Card className="card-moderno citas-card">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h1 className="m-0">Mis Citas</h1>
            <div className="d-flex align-items-center gap-3">
              <Form.Check
                type="switch"
                id="verConfirmadas"
                label="Confirmadas"
                checked={verConfirmadas}
                onChange={e => setVerConfirmadas(e.target.checked)}
              />
              <Form.Check
                type="switch"
                id="verCanceladas"
                label="Canceladas"
                checked={verCanceladas}
                onChange={e => setVerCanceladas(e.target.checked)}
              />
              <Button variant="primary" className="btn-moderno" onClick={() => navigate('/agendar')}>
                + Nueva Cita
              </Button>
            </div>
          </div>

          {notif && (
            <div className={`alert ${notif.exito ? 'alert-success' : 'alert-warning'} py-2 d-flex align-items-center gap-2`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {notif.exito
                  ? <polyline points="20 6 9 17 4 12" />
                  : <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>
                }
              </svg>
              {notif.mensaje}
            </div>
          )}

          {exito && (
            <div className="alert alert-success py-2 d-flex align-items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {exito}
            </div>
          )}

          {error && (
            <div className="alert alert-danger py-2 d-flex align-items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              {error}
            </div>
          )}

          {citas.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <h3>No tienes citas agendadas</h3>
              <p>Agenda tu primera cita médica ahora.</p>
              <Button variant="primary" className="btn-moderno" onClick={() => navigate('/agendar')}>
                Agendar cita
              </Button>
            </div>
          ) : citasFiltradas.length === 0 ? (
            <div className="empty-state">
              <h3>No hay citas con los filtros seleccionados</h3>
              <p>Activa los filtros de Confirmadas o Canceladas para ver más citas.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table className="citas-table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Especialidad</th>
                    <th>Médico</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {citasFiltradas.map(c => {
                    const st = STATUS_MAP[c.estado] || { label: c.estado, variant: 'secondary' };
                    const cancelable = c.estado === 'pendiente' || c.estado === 'confirmada';
                    return (
                      <tr key={c.id}>
                        <td className="fw-medium">{c.especialidad}</td>
                        <td>{c.medicoNombre}</td>
                        <td>{c.fecha}</td>
                        <td>{c.hora}</td>
                        <td>
                          <span className={`badge bg-${st.variant} bg-opacity-10 text-${st.variant} badge-estado`}>
                            {st.label}
                          </span>
                        </td>
                        <td>
                          {cancelable && (
                            <Button variant="outline-danger" size="sm"
                              onClick={() => setCitaCancelar(c)}>
                              Cancelar
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </Card>
      </div>

      <Modal show={!!citaCancelar} onHide={() => setCitaCancelar(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Cancelar cita</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Estás seguro de que deseas cancelar esta cita?</p>
          {citaCancelar && (
            <div className="resumen-card" style={{ background: '#f8f9fa', borderRadius: 8, padding: '0.75rem 1rem' }}>
              <div className="d-flex justify-content-between"><span className="text-muted small">Especialidad</span><span className="fw-medium">{citaCancelar.especialidad}</span></div>
              <div className="d-flex justify-content-between"><span className="text-muted small">Médico</span><span className="fw-medium">{citaCancelar.medicoNombre}</span></div>
              <div className="d-flex justify-content-between"><span className="text-muted small">Fecha</span><span className="fw-medium">{citaCancelar.fecha}</span></div>
              <div className="d-flex justify-content-between"><span className="text-muted small">Hora</span><span className="fw-medium">{citaCancelar.hora}</span></div>
            </div>
          )}
          <p className="text-muted small mt-2 mb-0">Esta acción no se puede deshacer.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setCitaCancelar(null)}>Volver</Button>
          <Button variant="danger" onClick={handleCancelar}>Sí, cancelar cita</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

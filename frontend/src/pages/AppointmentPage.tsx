import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Spinner } from 'react-bootstrap';
import { getEspecialidades, getMedicos, getHorarios, reservarCita, getToken } from '../api/client';
import type { Doctor, ScheduleSlot, NotificationResult } from '../types';
import CalendarPicker from '../components/CalendarPicker';

type Step = 'especialidad' | 'medico' | 'horario' | 'resumen' | 'confirmado';

const STEPS = [
  { key: 'especialidad', label: 'Especialidad' },
  { key: 'medico', label: 'Médico' },
  { key: 'horario', label: 'Horario' },
  { key: 'resumen', label: 'Resumen' },
];

const PRECIOS: Record<string, number> = {
  Cardiología: 150,
  Dermatología: 100,
  Pediatría: 80,
};

const DESCUENTO_SEGURO = 0.2;

function calcularPrecios(especialidad: string, tieneSeguro: boolean): { precioBase: number; precio: number } {
  const precioBase = PRECIOS[especialidad] || 100;
  const precio = tieneSeguro ? Math.round(precioBase * (1 - DESCUENTO_SEGURO) * 100) / 100 : precioBase;
  return { precioBase, precio };
}

export default function AppointmentPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('especialidad');
  const [especialidades, setEspecialidades] = useState<string[]>([]);
  const [medicos, setMedicos] = useState<Doctor[]>([]);
  const [horarios, setHorarios] = useState<ScheduleSlot[]>([]);
  const [selectedEsp, setSelectedEsp] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<Doctor | null>(null);
  const [selectedFecha, setSelectedFecha] = useState('');
  const [selectedHora, setSelectedHora] = useState('');
  const [error, setError] = useState('');
  const [notif, setNotif] = useState<NotificationResult | null>(null);
  const [cargando, setCargando] = useState(false);
  const [userTieneSeguro, setUserTieneSeguro] = useState(false);

  useEffect(() => {
    if (!getToken()) { navigate('/'); return; }
    getEspecialidades().then(setEspecialidades);
    const userStr = localStorage.getItem('auth_user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setUserTieneSeguro(u.tieneSeguro);
      } catch {}
    }
  }, [navigate]);

  const selectEspecialidad = (esp: string) => {
    setSelectedEsp(esp);
    getMedicos(esp).then(m => { setMedicos(m); setStep('medico'); });
  };

  const selectMedico = (doc: Doctor) => {
    setSelectedDoc(doc);
    setStep('horario');
  };

  const selectHorario = (fecha: string, hora: string) => {
    setSelectedFecha(fecha);
    setSelectedHora(hora);
    setStep('resumen');
  };

  const confirmar = async () => {
    if (!selectedDoc) return;
    setError('');
    setNotif(null);
    setCargando(true);
    try {
      const resp = await reservarCita({
        medicoId: selectedDoc.id,
        especialidad: selectedEsp,
        fecha: selectedFecha,
        hora: selectedHora,
      });
      setNotif(resp.notificacion);
      setStep('confirmado');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al reservar');
    } finally {
      setCargando(false);
    }
  };

  const hoy = new Date().toISOString().split('T')[0];

  const stepIndex = STEPS.findIndex(s => s.key === step);

  if (step === 'confirmado') {
    return (
      <div className="page-container">
        <div className="appointment-wrapper fade-in">
          <Card className="card-moderno text-center p-5" style={{ border: 'none' }}>
            <div className="confirmado-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="fw-bold mb-2">¡Cita Confirmada!</h2>
            <p className="text-muted mb-1">Tu cita de <strong>{selectedEsp}</strong> con <strong>{selectedDoc?.nombre}</strong></p>
            <p className="text-muted mb-1">Fecha: <strong>{selectedFecha}</strong> a las <strong>{selectedHora}</strong></p>
            {(() => { const p = calcularPrecios(selectedEsp, userTieneSeguro); return <><p className="text-muted mb-1">Precio original: <strong>${p.precioBase.toFixed(2)}</strong></p>{userTieneSeguro && <p className="text-muted mb-1">Descuento seguro (20%): <strong className="text-danger">-${(p.precioBase - p.precio).toFixed(2)}</strong></p>}<p className="text-muted mb-3">Total: <strong>${p.precio.toFixed(2)}</strong></p></>; })()}
            {notif && (
              <div className={`alert ${notif.exito ? 'alert-success' : 'alert-warning'} py-2 mb-3 d-flex align-items-center gap-2`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {notif.exito
                    ? <polyline points="20 6 9 17 4 12" />
                    : <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>
                  }
                </svg>
                <span>{notif.mensaje}</span>
              </div>
            )}
            <Button variant="primary" className="btn-moderno" onClick={() => navigate('/mis-citas')}>
              Ver mis citas
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {cargando && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 mb-0 fw-semibold">Reservando tu cita...</p>
            <small className="text-muted">Enviando confirmación al correo</small>
          </div>
        </div>
      )}
      <div className="appointment-wrapper fade-in">
        <div className="step-indicator">
          {STEPS.map((s, i) => (
            <div key={s.key} className={`step-item ${i === stepIndex ? 'active' : ''} ${i < stepIndex ? 'completed' : ''}`}>
              <span className="step-number">{i < stepIndex ? '✓' : i + 1}</span>
              <span className="step-label">{s.label}</span>
            </div>
          ))}
        </div>

        <Card className="card-moderno appointment-card">
          {step === 'especialidad' && (
            <div>
              <h2>Selecciona una especialidad</h2>
              {especialidades.map(esp => (
                <button key={esp} onClick={() => selectEspecialidad(esp)} className="option-btn">
                  {esp}
                </button>
              ))}
            </div>
          )}

          {step === 'medico' && (
            <div>
              <h2>Selecciona un médico</h2>
              <p className="section-subtitle">Especialidad: <strong className="text-primary">{selectedEsp}</strong></p>
              {medicos.map(doc => (
                <button key={doc.id} onClick={() => selectMedico(doc)} className="option-btn">
                  <div className="d-flex align-items-center gap-2">
                    <span className="d-inline-flex align-items-center justify-content-center"
                      style={{ width: 36, height: 36, borderRadius: '50%', background: '#e8f0fe', color: '#0d6efd', fontWeight: 700, fontSize: '0.9rem' }}>
                      {doc.nombre.charAt(0)}
                    </span>
                    <div>
                      <div className="fw-medium">{doc.nombre}</div>
                      <small className="text-muted">{doc.especialidad}</small>
                    </div>
                  </div>
                </button>
              ))}
              <div className="nav-buttons">
                <Button variant="outline-secondary" size="sm" onClick={() => setStep('especialidad')}>
                  ← Atrás
                </Button>
              </div>
            </div>
          )}

          {step === 'horario' && (
            <div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h2 className="mb-0">Selecciona fecha y hora</h2>
              </div>
              <p className="section-subtitle">Médico: <strong className="text-primary">{selectedDoc?.nombre}</strong></p>

              <CalendarPicker
                value={selectedFecha}
                minDate={hoy}
                onChange={async (date) => {
                  setSelectedFecha(date);
                  setSelectedHora('');
                  if (selectedDoc) {
                    const slots = await getHorarios(selectedDoc.id, date);
                    setHorarios(slots);
                  }
                }}
              />

              {selectedFecha && horarios.length > 0 && (
                <div className="slots-container">
                  <div className="slots-label">
                    Horarios disponibles
                    <span className="slots-count">{horarios.length}</span>
                  </div>

                  {(() => {
                    const manana = horarios.filter(s => {
                      const h = parseInt(s.hora.split(':')[0]);
                      return h < 12;
                    });
                    const tarde = horarios.filter(s => {
                      const h = parseInt(s.hora.split(':')[0]);
                      return h >= 12;
                    });

                    return (
                      <>
                        {manana.length > 0 && (
                          <div className="slots-block">
                            <div className="slots-block-label">Mañana</div>
                            <div className="slots-grid">
                              {manana.map(slot => (
                                <button key={slot.id} onClick={() => selectHorario(selectedFecha, slot.hora)}
                                  className={`time-btn ${selectedHora === slot.hora ? 'selected' : ''}`}>
                                  {slot.hora}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        {tarde.length > 0 && (
                          <div className="slots-block">
                            <div className="slots-block-label">Tarde</div>
                            <div className="slots-grid">
                              {tarde.map(slot => (
                                <button key={slot.id} onClick={() => selectHorario(selectedFecha, slot.hora)}
                                  className={`time-btn ${selectedHora === slot.hora ? 'selected' : ''}`}>
                                  {slot.hora}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}

              {selectedFecha && horarios.length === 0 && (
                <div className="slots-empty mt-4">
                  <div className="slots-empty-icon">🕐</div>
                  <div className="slots-empty-text">No hay horarios disponibles para esta fecha</div>
                  <div className="slots-empty-sub">Selecciona otra fecha para ver disponibilidad</div>
                </div>
              )}

              <div className="nav-buttons">
                <Button variant="outline-secondary" size="sm" onClick={() => setStep('medico')}>
                  ← Atrás
                </Button>
              </div>
            </div>
          )}

          {step === 'resumen' && (
            <div>
              <h2>Confirmar cita</h2>
              <div className="resumen-card">
                <div className="resumen-item">
                  <span className="label">Especialidad</span>
                  <span className="value">{selectedEsp}</span>
                </div>
                <div className="resumen-item">
                  <span className="label">Médico</span>
                  <span className="value">{selectedDoc?.nombre}</span>
                </div>
                <div className="resumen-item">
                  <span className="label">Fecha</span>
                  <span className="value">{selectedFecha}</span>
                </div>
                <div className="resumen-item">
                  <span className="label">Hora</span>
                  <span className="value">{selectedHora}</span>
                </div>
                <div className="resumen-item">
                  <span className="label">Precio original</span>
                  <span className="value">${calcularPrecios(selectedEsp, false).precioBase.toFixed(2)}</span>
                </div>
                {userTieneSeguro && (
                  <div className="resumen-item">
                    <span className="label">Descuento seguro (20%)</span>
                    <span className="value text-danger">-${(calcularPrecios(selectedEsp, false).precioBase - calcularPrecios(selectedEsp, true).precio).toFixed(2)}</span>
                  </div>
                )}
                <div className="resumen-item">
                  <span className="label">Total</span>
                  <span className="value fw-bold">${calcularPrecios(selectedEsp, userTieneSeguro).precio.toFixed(2)}</span>
                </div>
              </div>
              {error && <div className="alert alert-danger py-2 mt-3">{error}</div>}
              <div className="nav-buttons">
                <Button variant="success" className="btn-moderno" onClick={confirmar}>
                  Confirmar Reserva
                </Button>
                <Button variant="outline-secondary" size="sm" onClick={() => setStep('horario')}>
                  ← Atrás
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Form, Spinner } from 'react-bootstrap';
import { getToken, getUser, setUser, actualizarPerfil, cambiarPassword } from '../api/client';
import type { User } from '../types';

export default function SettingsPage() {
  const navigate = useNavigate();
  const user = getUser();

  const [nombre, setNombre] = useState(user?.nombre || '');
  const [email, setEmail] = useState(user?.email || '');
  const [tieneSeguro, setTieneSeguro] = useState(user?.tieneSeguro || false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  useEffect(() => {
    if (!getToken()) { navigate('/'); return; }
  }, [navigate]);

  const handleGuardarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setExito('');
    setCargando(true);
    try {
      const resp = await actualizarPerfil({ nombre, email, tieneSeguro });
      setUser(resp.user as User);
      setExito('Perfil actualizado correctamente');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al actualizar perfil');
    } finally {
      setCargando(false);
    }
  };

  const handleCambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setExito('');
    if (!currentPassword || !newPassword) { setError('Completa todos los campos'); return; }
    if (newPassword.length < 6) { setError('La nueva contraseña debe tener al menos 6 caracteres'); return; }
    setCargando(true);
    try {
      await cambiarPassword(currentPassword, newPassword);
      setExito('Contraseña cambiada correctamente');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cambiar contraseña');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="page-container">
      <div className="settings-wrapper fade-in">
        <div className="d-flex align-items-center gap-3 mb-4">
          <button className="btn-back" onClick={() => navigate(-1)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1 className="m-0" style={{ fontSize: '1.3rem', fontWeight: 700 }}>Configuración</h1>
        </div>

        {error && (
          <div className="alert alert-danger py-2 d-flex align-items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
            {error}
          </div>
        )}
        {exito && (
          <div className="alert alert-success py-2 d-flex align-items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
            {exito}
          </div>
        )}

        {cargando && (
          <div className="text-center py-4"><Spinner animation="border" variant="primary" /></div>
        )}

        <Card className="card-moderno settings-card mb-4">
          <h2 className="settings-section-title">Perfil</h2>
          <Form onSubmit={handleGuardarPerfil}>
            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">Nombre completo</Form.Label>
              <Form.Control type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="form-control-custom" required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">Correo electrónico</Form.Label>
              <Form.Control type="email" value={email} onChange={e => setEmail(e.target.value)} className="form-control-custom" required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="seguro-switch"
                label="Tengo seguro médico"
                checked={tieneSeguro}
                onChange={e => setTieneSeguro(e.target.checked)}
                className="form-switch-custom"
              />
            </Form.Group>
            <Button variant="primary" className="btn-moderno" type="submit">Guardar cambios</Button>
          </Form>
        </Card>

        <Card className="card-moderno settings-card">
          <h2 className="settings-section-title">Cambiar contraseña</h2>
          <Form onSubmit={handleCambiarPassword}>
            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">Contraseña actual</Form.Label>
              <Form.Control type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="form-control-custom" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">Nueva contraseña</Form.Label>
              <Form.Control type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="form-control-custom" />
            </Form.Group>
            <Button variant="primary" className="btn-moderno" type="submit">Cambiar contraseña</Button>
          </Form>
        </Card>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { registerUser } from '../api/client';

export default function RegisterPage() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tieneSeguro, setTieneSeguro] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await registerUser(nombre, email, password, tieneSeguro);
      navigate('/');
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Error al registrarse';
      setError(msg);
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
          <h1>Crear Cuenta</h1>
          <p>Regístrate en ESPEcitas</p>
        </div>

        <Card className="card-moderno login-card">
          {error && <Alert variant="danger" className="py-2">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre completo</Form.Label>
              <Form.Control
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Check
              type="switch"
              id="tieneSeguro"
              label="Tengo seguro médico"
              checked={tieneSeguro}
              onChange={e => setTieneSeguro(e.target.checked)}
              className="mb-3"
            />
            <Button type="submit" variant="primary" className="w-100 btn-moderno">
              Registrarse
            </Button>
          </Form>
          <div className="login-footer text-center">
            <small className="text-muted">
              ¿Ya tienes cuenta? <Link to="/">Inicia sesión</Link>
            </small>
          </div>
        </Card>
      </div>
    </div>
  );
}

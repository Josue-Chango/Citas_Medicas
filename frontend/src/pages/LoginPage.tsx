import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { login, setToken, setUser } from '../api/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await login(email, password);
      setToken(res.token);
      setUser(res.user);
      navigate('/');
    } catch {
      setError('Credenciales inválidas o cuenta bloqueada');
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
          <h1>ESPEcitas</h1>
          <p>Sistema de Gestión de Citas Médicas</p>
        </div>

        <Card className="card-moderno login-card">
          {error && <Alert variant="danger" className="py-2">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
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
            <Button type="submit" variant="primary" className="w-100 btn-moderno">
              Ingresar
            </Button>
          </Form>
          <div className="text-center mt-3">
            <small className="text-muted">
              ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
            </small>
          </div>
          <div className="login-footer">
            <small className="text-muted">
              <strong>Usuarios de prueba:</strong><br />
              juan@email.com / 123456 <span className="badge bg-success bg-opacity-10 text-success ms-1" style={{fontSize: '0.7rem'}}>con seguro</span><br />
              maria@email.com / 123456 <span className="badge bg-secondary bg-opacity-10 text-secondary ms-1" style={{fontSize: '0.7rem'}}>sin seguro</span>
            </small>
          </div>
        </Card>
      </div>
    </div>
  );
}

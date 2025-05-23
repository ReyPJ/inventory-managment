import React, { useState, useEffect } from 'react';
import { login, loadStoredAuth, isAuthenticated } from '../services/apiService';
import '../styles/Login.css';

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Comprobar si ya hay una sesión activa al cargar
  useEffect(() => {
    loadStoredAuth();
    if (isAuthenticated()) {
      onLoginSuccess();
    }
  }, [onLoginSuccess]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Por favor ingresa un nombre de usuario');
      return;
    }
    
    if (!password.trim()) {
      setError('Por favor ingresa una contraseña');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      // Autologin para los usuarios predefinidos
      let actualUsername = username;
      let actualPassword = password;
      
      // Si el usuario escribió solo "casa" o "negocio", usar credenciales predefinidas
      if (username.toLowerCase() === 'casa') {
        actualUsername = 'casa';
        actualPassword = 'Casa123';
      } else if (username.toLowerCase() === 'negocio') {
        actualUsername = 'negocio';
        actualPassword = 'Negocio123';
      }
      
      const result = await login(actualUsername, actualPassword);
      
      if (result.success) {
        onLoginSuccess();
      } else {
        setError('Credenciales incorrectas. Por favor intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      setError('Error de conexión. Por favor verifica tu conexión a internet.');
    } finally {
      setLoading(false);
    }
  };

  const handleCasaLogin = () => {
    setUsername('casa');
    setPassword('Casa123');
  };

  const handleNegocioLogin = () => {
    setUsername('negocio');
    setPassword('Negocio123');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Iniciar Sesión</h2>
        <p className="login-subtitle">Sistema de Inventario</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu usuario"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
        
        <div className="quick-login">
          <p>Acceso rápido:</p>
          <div className="quick-login-buttons">
            <button onClick={handleCasaLogin} disabled={loading}>
              Casa
            </button>
            <button onClick={handleNegocioLogin} disabled={loading}>
              Negocio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login; 
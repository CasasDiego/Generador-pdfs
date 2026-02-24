'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState('');
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showAdmin, setShowAdmin] = useState(false);
  
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const [users, setUsers] = useState<any[]>([]);
  const [newUserId, setNewUserId] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('user');
  const [editUserId, setEditUserId] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', id: loginId, password: loginPassword })
    });
    const data = await res.json();
    if (data.success) {
      setIsLoggedIn(true);
      setUserRole(data.role);
      setUserId(data.id);
      setStatus('');
      // Registrar login
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'addLogin', 
          userId: data.id,
        })
      });
    } else {
      setStatus('Credenciales incorrectas');
    }
  };

  const loadUsers = async () => {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'getUsers' })
    });
    const data = await res.json();
    setUsers(data.users);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'createUser', newId: newUserId, newPassword: newUserPassword, newRole: newUserRole })
    });
    const data = await res.json();
    if (data.success) {
      setStatus('Usuario creado exitosamente');
      setNewUserId('');
      setNewUserPassword('');
      loadUsers();
    } else {
      setStatus(data.message);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'updateUser', userId: editUserId, newPassword: editPassword })
    });
    const data = await res.json();
    if (data.success) {
      setStatus('Contraseña actualizada');
      setEditUserId('');
      setEditPassword('');
    } else {
      setStatus(data.message);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole('');
    setUserId('');
    setShowAdmin(false);
    setShowLogs(false);
  };

  const loadLogs = async () => {
    const res = await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'getLogs' })
    });
    const data = await res.json();
    setLogs(data.logs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!excelFile || !pdfFile) {
      setStatus('Por favor selecciona ambos archivos');
      return;
    }

    setLoading(true);
    setStatus('Procesando archivos...');

    const formData = new FormData();
    formData.append('excel', excelFile);
    formData.append('pdf', pdfFile);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al generar PDFs');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'certificados.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setStatus('¡PDFs generados exitosamente!');
      
      // Registrar generación de PDFs
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'add', 
          userId, 
          excelFileName: excelFile.name,
          pdfFileName: pdfFile.name,
        })
      });
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showAdmin && userRole === 'admin') {
      loadUsers();
    }
    if (showLogs && userRole === 'admin') {
      loadLogs();
    }
  }, [showAdmin, showLogs, userRole]);

  if (!isLoggedIn) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Iniciar Sesión</h1>
          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Usuario</label>
              <input
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Contraseña</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                style={styles.input}
                required
              />
            </div>
            <button type="submit" style={styles.button}>Ingresar</button>
          </form>
          {status && <div style={styles.statusError}>{status}</div>}
        </div>
      </div>
    );
  }

  if (showLogs && userRole === 'admin') {
    return (
      <div style={styles.container}>
        <div style={{...styles.card, maxWidth: '900px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <h1 style={styles.title}>Historial de Acciones</h1>
            <button onClick={() => setShowLogs(false)} style={styles.buttonSecondary}>Volver</button>
          </div>

          <div style={{overflowX: 'auto'}}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Usuario</th>
                  <th style={styles.th}>Acción</th>
                  <th style={styles.th}>Archivo Excel</th>
                  <th style={styles.th}>Archivo PDF</th>
                  <th style={styles.th}>Fecha</th>
                  <th style={styles.th}>Hora</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{...styles.td, textAlign: 'center'}}>No hay registros</td>
                  </tr>
                ) : (
                  logs.map(log => (
                    <tr key={log.id}>
                      <td style={styles.td}>{log.userId}</td>
                      <td style={styles.td}>{log.action}</td>
                      <td style={styles.td}>{log.excelFile}</td>
                      <td style={styles.td}>{log.pdfFile}</td>
                      <td style={styles.td}>{log.date}</td>
                      <td style={styles.td}>{log.time}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (showAdmin && userRole === 'admin') {
    return (
      <div style={styles.container}>
        <div style={{...styles.card, maxWidth: '700px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <h1 style={styles.title}>Panel de Administración</h1>
            <button onClick={() => setShowAdmin(false)} style={styles.buttonSecondary}>Volver</button>
          </div>

          <h2 style={{fontSize: '18px', marginBottom: '15px'}}>Crear Usuario</h2>
          <form onSubmit={handleCreateUser} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Username</label>
              <input type="text" value={newUserId} onChange={(e) => setNewUserId(e.target.value)} style={styles.input} required />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Contraseña</label>
              <input type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} style={styles.input} required />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Rol</label>
              <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)} style={styles.input}>
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <button type="submit" style={styles.button}>Crear Usuario</button>
          </form>

          <hr style={{margin: '30px 0', border: 'none', borderTop: '1px solid #ddd'}} />

          <h2 style={{fontSize: '18px', marginBottom: '15px'}}>Cambiar Contraseña</h2>
          <form onSubmit={handleUpdatePassword} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Seleccionar Usuario</label>
              <select value={editUserId} onChange={(e) => setEditUserId(e.target.value)} style={styles.input} required>
                <option value="">Seleccionar...</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.id} ({u.role})</option>)}
              </select>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Nueva Contraseña</label>
              <input type="password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} style={styles.input} required />
            </div>
            <button type="submit" style={styles.button}>Actualizar Contraseña</button>
          </form>

          {status && <div style={styles.statusSuccess}>{status}</div>}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
          <h1 style={styles.title}>Generador Masivo de PDFs</h1>
          <div style={{display: 'flex', gap: '10px'}}>
            {userRole === 'admin' && (
              <>
                <button onClick={() => setShowAdmin(true)} style={styles.buttonSecondary}>Admin</button>
                <button onClick={() => setShowLogs(true)} style={styles.buttonSecondary}>Historial</button>
              </>
            )}
            <button onClick={handleLogout} style={styles.buttonSecondary}>Salir</button>
          </div>
        </div>
        <p style={{marginBottom: '20px', color: '#666'}}>Usuario: {userId} ({userRole})</p>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Archivo Excel (.xlsx)</label>
            <input
              type="file"
              accept=".xlsx"
              onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
              style={styles.input}
              disabled={loading}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Plantilla PDF</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
              style={styles.input}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !excelFile || !pdfFile}
            style={{
              ...styles.button,
              ...(loading || !excelFile || !pdfFile ? styles.buttonDisabled : {}),
            }}
          >
            {loading ? 'Generando...' : 'Generar ZIP'}
          </button>
        </form>

        {status && (
          <div style={{
            ...styles.status,
            ...(status.includes('Error') ? styles.statusError : styles.statusSuccess),
          }}>
            {status}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 50%, #43e97b 100%)',
    padding: '20px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    padding: '40px',
    maxWidth: '500px',
    width: '100%',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '30px',
    textAlign: 'center' as const,
    color: '#333',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#555',
  },
  input: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  button: {
    backgroundColor: '#0070f3',
    color: 'white',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '10px',
  },
  buttonSecondary: {
    backgroundColor: '#666',
    color: 'white',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  },
  status: {
    marginTop: '20px',
    padding: '12px',
    borderRadius: '4px',
    fontSize: '14px',
    textAlign: 'center' as const,
  },
  statusSuccess: {
    backgroundColor: '#d4edda',
    color: '#155724',
    marginTop: '20px',
    padding: '12px',
    borderRadius: '4px',
    fontSize: '14px',
    textAlign: 'center' as const,
  },
  statusError: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    marginTop: '20px',
    padding: '12px',
    borderRadius: '4px',
    fontSize: '14px',
    textAlign: 'center' as const,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    marginTop: '20px',
  },
  th: {
    backgroundColor: '#f5f5f5',
    padding: '12px',
    textAlign: 'left' as const,
    borderBottom: '2px solid #ddd',
    fontSize: '14px',
    fontWeight: '600',
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #eee',
    fontSize: '14px',
  },
};

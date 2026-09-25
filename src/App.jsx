import React, { useState, useEffect } from 'react';
import './index.css';

// Datos Iniciales
const initialRisks = [
  { id: 1, name: 'Ataques de Phishing', likelihood: 4, impact: 4, category: 'Error Humano', desc: 'Empleados siendo engañados por correos maliciosos, comprometiendo credenciales y sistemas internos.' },
  { id: 2, name: 'Ataque DDoS', likelihood: 3, impact: 4, category: 'Red', desc: 'Ataque de Denegación de Servicio Distribuido que puede colapsar los servidores principales y APIs externas.' },
  { id: 3, name: 'Fuga de Datos (Breach)', likelihood: 2, impact: 5, category: 'Seguridad', desc: 'Acceso no autorizado a PII de clientes y secretos corporativos.' },
  { id: 4, name: 'Infección por Ransomware', likelihood: 3, impact: 5, category: 'Malware', desc: 'Software malicioso encriptando archivos corporativos críticos y exigiendo un rescate económico.' },
  { id: 5, name: 'Amenaza Interna', likelihood: 2, impact: 4, category: 'Error Humano', desc: 'Empleado o ex-empleado malintencionado extrayendo datos sensibles hacia servidores externos.' },
  { id: 6, name: 'Software Obsoleto', likelihood: 5, impact: 3, category: 'Mantenimiento', desc: 'Vulnerabilidades conocidas en software heredado no parcheado expuesto a internet.' },
  { id: 7, name: 'Falla de Hardware', likelihood: 3, impact: 3, category: 'Infraestructura', desc: 'Fallo crítico en el hardware del servidor principal causando tiempo de inactividad.' }
];

export default function App() {
  const [theme, setTheme] = useState('light');
  const [risks, setRisks] = useState(initialRisks);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  
  // Modals state
  const [activeRisk, setActiveRisk] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [toasts, setToasts] = useState([]);
  const [isHovering, setIsHovering] = useState(null);
  
  // Form state
  const [newRisk, setNewRisk] = useState({ name: '', category: '', likelihood: 0, impact: 0, desc: '' });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const getSeverityLevel = (likelihood, impact) => {
    const score = likelihood * impact;
    if (score >= 15) return 'critical';
    if (score >= 9) return 'high';
    if (score >= 4) return 'medium';
    return 'low';
  };

  const getSeverityColor = (level) => {
    switch(level) {
      case 'critical': return 'var(--risk-critical)';
      case 'high': return 'var(--risk-high)';
      case 'medium': return 'var(--risk-medium)';
      case 'low': return 'var(--risk-low)';
      default: return 'var(--color-primary)';
    }
  };

  const getSeverityLabel = (level) => {
    switch(level) {
      case 'critical': return 'Crítico';
      case 'high': return 'Alto';
      case 'medium': return 'Medio';
      case 'low': return 'Bajo';
      default: return 'Desconocido';
    }
  };

  const addToast = (title, message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, message, type, hiding: false }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, hiding: true } : t));
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 300);
    }, 4000);
  };

  const handleRiskClick = (risk) => {
    setActiveRisk(risk);
    setIsViewModalOpen(true);
  };

  const mitigateRisk = () => {
    if (!activeRisk) return;
    const newLikelihood = Math.max(1, activeRisk.likelihood - 1);
    const newImpact = Math.max(1, activeRisk.impact - (activeRisk.impact > 2 ? 1 : 0));
    
    if (newLikelihood === activeRisk.likelihood && newImpact === activeRisk.impact) {
      addToast('Aviso', 'Este riesgo ya está mitigado al máximo posible.', 'info');
      setIsViewModalOpen(false);
      return;
    }

    setRisks(prev => prev.map(r => r.id === activeRisk.id ? { ...r, likelihood: newLikelihood, impact: newImpact } : r));
    setActiveRisk(prev => ({ ...prev, likelihood: newLikelihood, impact: newImpact }));
    setIsViewModalOpen(false);
    addToast('Éxito', `Mitigación aplicada a: ${activeRisk.name}.`, 'success');
  };

  const deleteRisk = () => {
    if (!activeRisk) return;
    setRisks(prev => prev.filter(r => r.id !== activeRisk.id));
    setIsViewModalOpen(false);
    addToast('Eliminado', `Riesgo borrado del sistema.`, 'danger');
  };

  const toggleArchiveRisk = () => {
    if (!activeRisk) return;
    const newStatus = (activeRisk.status || 'active') === 'mitigated' ? 'active' : 'mitigated';
    setRisks(prev => prev.map(r => r.id === activeRisk.id ? { ...r, status: newStatus } : r));
    setIsViewModalOpen(false);
    addToast('Éxito', `Riesgo ${newStatus === 'mitigated' ? 'archivado' : 'reabierto'} con éxito.`, 'success');
  };

  const validateForm = () => {
    const errors = {};
    if (!newRisk.name.trim()) errors.name = 'El nombre es obligatorio.';
    if (!newRisk.category.trim()) errors.category = 'Debes ingresar una categoría.';
    if (newRisk.likelihood < 1 || newRisk.likelihood > 5) errors.likelihood = 'Selecciona un valor (1-5).';
    if (newRisk.impact < 1 || newRisk.impact > 5) errors.impact = 'Selecciona un valor (1-5).';
    if (!newRisk.desc.trim()) errors.desc = 'La descripción es obligatoria.';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddRiskSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      addToast('Error', 'Corrige los errores en el formulario.', 'danger');
      return;
    }
    
    const id = risks.length > 0 ? Math.max(...risks.map(r => r.id)) + 1 : 1;
    setRisks([...risks, { ...newRisk, id }]);
    setIsAddModalOpen(false);
    setNewRisk({ name: '', category: '', likelihood: 0, impact: 0, desc: '' });
    setFormErrors({});
    addToast('Completado', `Riesgo añadido a la matriz.`, 'success');
  };

  const filteredRisks = risks.filter(r => 
    (r.status || 'active') === statusFilter &&
    (r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     r.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderGridCells = () => {
    const cells = [];
    for (let impact = 5; impact >= 1; impact--) {
      for (let likelihood = 1; likelihood <= 5; likelihood++) {
        const level = getSeverityLevel(likelihood, impact);
        
        cells.push(
          <div 
            key={`cell-${likelihood}-${impact}`} 
            className="grid-cell"
            style={{ 
              gridColumn: likelihood,
              gridRow: 6 - impact,
              backgroundColor: `color-mix(in srgb, ${getSeverityColor(level)} 85%, transparent)` 
            }}
          >
            <span className="grid-cell-label">{likelihood}x{impact}</span>
          </div>
        );
      }
    }
    return cells;
  };

  const renderRiskMarkers = () => {
    return filteredRisks.map(risk => {
      const row = 6 - risk.impact;
      const col = risk.likelihood;
      const level = getSeverityLevel(risk.likelihood, risk.impact);
      const color = getSeverityColor(level);
      const isActive = activeRisk?.id === risk.id || isHovering === risk.id;

      return (
        <div
          key={risk.id}
          className={`risk-item-marker ${isActive ? 'active' : ''}`}
          style={{ gridColumn: col, gridRow: row, backgroundColor: color, margin: 'auto' }}
          onClick={() => handleRiskClick(risk)}
          onMouseEnter={() => setIsHovering(risk.id)}
          onMouseLeave={() => setIsHovering(null)}
          title={risk.name}
        >
          {risk.id}
        </div>
      );
    });
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-title" onClick={() => window.scrollTo(0,0)}>
          <span>Risk<span className="text-primary">Guardian</span></span>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={toggleTheme}>
            {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
          </button>
          <button className="btn btn-primary" onClick={() => {
            setFormErrors({});
            setNewRisk({ name: '', category: '', likelihood: 0, impact: 0, desc: '' });
            setIsAddModalOpen(true);
          }}>
            Nuevo Riesgo
          </button>
        </div>
      </header>

      <main className="main-content">
        <section className="hero-section">
          <h1 className="hero-title">Matriz de Riesgos TI</h1>
          <p className="hero-subtitle">
            Herramienta analítica de evaluación y mitigación de vulnerabilidades.
          </p>
        </section>

        <div className="glass-panel" style={{ marginBottom: '32px', textAlign: 'left' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '12px' }}>Caso Práctico: Auditoría a "TechNova Solutions"</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--color-text-muted)', lineHeight: '1.6', fontSize: '0.95rem' }}>
            <p><strong style={{color: 'var(--color-text)'}}>El Contexto:</strong> TechNova es una FinTech que procesa datos financieros sensibles. Tras un crecimiento explosivo, su infraestructura quedó rezagada. Una auditoría reciente descubrió amenazas latentes (listadas a la derecha) que podrían destruir la reputación y finanzas de la empresa.</p>
            <p><strong style={{color: 'var(--color-text)'}}>El Reto del CISO:</strong> Tu objetivo es evaluar estos riesgos y priorizar el presupuesto. El mapa de calor grafica la Gravedad (Impacto x Probabilidad). Los elementos en la zona roja requieren atención inmediata.</p>
            <p><strong style={{color: 'var(--color-text)'}}>Nuestra Solución (Mitigación Dinámica):</strong> Haz clic en cualquier riesgo crítico (ej. "Software Obsoleto"). Al presionar <strong>"Aplicar Mitigación"</strong>, simulas la implementación de controles (ej. instalar parches de seguridad). Observa cómo matemáticamente se reduce la probabilidad o el impacto, haciendo que el marcador salte hacia la zona segura (verde) en tiempo real.</p>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Heat Map */}
          <div className="glass-panel heatmap-wrapper">
            <div className="heatmap-header">
              <h2 className="heatmap-title">Mapa de Calor (Heat Map)</h2>
              <div className="heatmap-legend">
                <div className="legend-item"><div className="legend-dot" style={{background: 'var(--risk-low)'}}></div>Bajo</div>
                <div className="legend-item"><div className="legend-dot" style={{background: 'var(--risk-medium)'}}></div>Medio</div>
                <div className="legend-item"><div className="legend-dot" style={{background: 'var(--risk-high)'}}></div>Alto</div>
                <div className="legend-item"><div className="legend-dot" style={{background: 'var(--risk-critical)'}}></div>Crítico</div>
              </div>
            </div>
            
            <div className="grid-container">
              <div className="y-axis-label">IMPACTO (1-5)</div>
              <div>
                <div className="map-grid">
                  {renderGridCells()}
                  {renderRiskMarkers()}
                </div>
                <div className="x-axis-label">PROBABILIDAD (1-5)</div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="glass-panel sidebar">
            <h2 className="risk-list-header">Inventario de Riesgos</h2>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <button 
                className={`btn ${statusFilter === 'active' ? 'btn-primary' : 'btn-outline'}`}
                style={{ flex: 1, padding: '10px' }}
                onClick={() => setStatusFilter('active')}
              >
                Activos
              </button>
              <button 
                className={`btn ${statusFilter === 'mitigated' ? 'btn-primary' : 'btn-outline'}`}
                style={{ flex: 1, padding: '10px' }}
                onClick={() => setStatusFilter('mitigated')}
              >
                Archivados
              </button>
            </div>

            <div className="search-bar">
              <input 
                type="text" 
                className="input-field" 
                placeholder="Buscar por nombre o categoría..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '16px' }} // Adjusted padding since icon is gone
              />
            </div>

            <div className="risk-list">
              {filteredRisks.length === 0 ? (
                <div className="empty-state">
                  <p>No se encontraron resultados.</p>
                </div>
              ) : (
                filteredRisks.map(risk => {
                  const level = getSeverityLevel(risk.likelihood, risk.impact);
                  const color = getSeverityColor(level);
                  const isActive = activeRisk?.id === risk.id || isHovering === risk.id;
                  
                  return (
                    <div 
                      key={risk.id}
                      className={`risk-card ${isActive ? 'active' : ''}`}
                      style={{ borderLeftColor: color }}
                      onClick={() => handleRiskClick(risk)}
                      onMouseEnter={() => setIsHovering(risk.id)}
                      onMouseLeave={() => setIsHovering(null)}
                    >
                      <div className="risk-card-content">
                        <div className="risk-card-header">
                          <span className="risk-card-id" style={{color}}>#{risk.id}</span>
                          <span className="risk-card-title">{risk.name}</span>
                        </div>
                        <span className="risk-card-category">{risk.category} • {getSeverityLabel(level)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal Ver Detalles de Riesgo */}
      {isViewModalOpen && activeRisk && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setIsViewModalOpen(false)}>✕</button>
            
            <div className="modal-header">
              <div>
                <h3 className="modal-title" style={{color: getSeverityColor(getSeverityLevel(activeRisk.likelihood, activeRisk.impact))}}>{activeRisk.name}</h3>
                <span className="modal-subtitle">{activeRisk.category} • ID Riesgo #{activeRisk.id}</span>
              </div>
            </div>
            
            <div className="modal-body">
              <p className="modal-desc">{activeRisk.desc}</p>
              
              <div className="modal-stats">
                <div className="stat-box">
                  <div className="stat-label">Probabilidad</div>
                  <div className="stat-value">{activeRisk.likelihood} / 5</div>
                </div>
                <div className="stat-box">
                  <div className="stat-label">Impacto</div>
                  <div className="stat-value">{activeRisk.impact} / 5</div>
                </div>
                <div className="stat-box" style={{ borderColor: getSeverityColor(getSeverityLevel(activeRisk.likelihood, activeRisk.impact))}}>
                  <div className="stat-label">Severidad</div>
                  <div className="stat-value" style={{ color: getSeverityColor(getSeverityLevel(activeRisk.likelihood, activeRisk.impact)) }}>
                    {activeRisk.likelihood * activeRisk.impact}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button className="btn btn-danger mr-auto" onClick={deleteRisk}>Eliminar</button>
              { (activeRisk.status || 'active') === 'active' ? (
                <>
                  <button className="btn btn-outline" onClick={toggleArchiveRisk}>Archivar</button>
                  <button className="btn btn-primary" onClick={mitigateRisk}>Aplicar Mitigación</button>
                </>
              ) : (
                <button className="btn btn-primary" onClick={toggleArchiveRisk}>Reabrir Riesgo</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Agregar Nuevo Riesgo */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setIsAddModalOpen(false)}>✕</button>
            
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Añadir Riesgo</h3>
                <span className="modal-subtitle">Registro en el mapa de calor</span>
              </div>
            </div>
            
            <form onSubmit={handleAddRiskSubmit} className="modal-body" noValidate>
              <div className="input-group">
                <label className="input-label">Nombre del Riesgo</label>
                <input 
                  type="text" 
                  className={`input-field ${formErrors.name ? 'input-error' : ''}`}
                  value={newRisk.name} 
                  onChange={e => setNewRisk({...newRisk, name: e.target.value})}
                  placeholder="Ej. Inyección SQL"
                />
                <div className="category-pills">
                  {['Phishing', 'DDoS', 'Fuga de Datos', 'Ransomware', 'Fallo Eléctrico', 'Amenaza Interna'].map(sug => (
                    <button 
                      key={sug} 
                      type="button" 
                      className="pill-btn"
                      onClick={() => setNewRisk({...newRisk, name: sug})}
                    >
                      {sug}
                    </button>
                  ))}
                </div>
                {formErrors.name && <span className="error-msg">{formErrors.name}</span>}
              </div>
              
              <div className="input-group">
                <label className="input-label">Categoría Personalizada</label>
                <input 
                  type="text" 
                  className={`input-field ${formErrors.category ? 'input-error' : ''}`}
                  value={newRisk.category} 
                  onChange={e => setNewRisk({...newRisk, category: e.target.value})}
                  placeholder="Ej. Seguridad Física, Financiero..."
                />
                <div className="category-pills">
                  {['Seguridad', 'Red', 'Hardware', 'Mantenimiento', 'Error Humano', 'Malware', 'Legal'].map(cat => (
                    <button 
                      key={cat} 
                      type="button" 
                      className="pill-btn"
                      onClick={() => setNewRisk({...newRisk, category: cat})}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                {formErrors.category && <span className="error-msg">{formErrors.category}</span>}
              </div>

              <div className="input-group">
                <label className="input-label">Probabilidad (1-5)</label>
                <div className={`scale-selector ${formErrors.likelihood ? 'input-error' : ''}`}>
                  {[1, 2, 3, 4, 5].map(val => (
                    <button
                      key={`l-${val}`}
                      type="button"
                      className={`scale-btn ${newRisk.likelihood === val ? 'active' : ''}`}
                      onClick={() => setNewRisk({...newRisk, likelihood: val})}
                    >
                      {val}
                    </button>
                  ))}
                </div>
                {formErrors.likelihood && <span className="error-msg">{formErrors.likelihood}</span>}
              </div>

              <div className="input-group">
                <label className="input-label">Impacto (1-5)</label>
                <div className={`scale-selector ${formErrors.impact ? 'input-error' : ''}`}>
                  {[1, 2, 3, 4, 5].map(val => (
                    <button
                      key={`i-${val}`}
                      type="button"
                      className={`scale-btn ${newRisk.impact === val ? 'active' : ''}`}
                      onClick={() => setNewRisk({...newRisk, impact: val})}
                    >
                      {val}
                    </button>
                  ))}
                </div>
                {formErrors.impact && <span className="error-msg">{formErrors.impact}</span>}
              </div>

              <div className="input-group">
                <label className="input-label">Descripción</label>
                <textarea 
                  className={`input-field ${formErrors.desc ? 'input-error' : ''}`}
                  style={{ minHeight: '100px', resize: 'vertical' }}
                  value={newRisk.desc} 
                  onChange={e => setNewRisk({...newRisk, desc: e.target.value})}
                  placeholder="Describe las consecuencias y contexto del riesgo..."
                />
                {formErrors.desc && <span className="error-msg">{formErrors.desc}</span>}
              </div>

              <div className="modal-actions" style={{ marginTop: '24px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsAddModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar Riesgo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contenedor de Toasts */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast ${toast.type} ${toast.hiding ? 'hiding' : ''}`}>
            <div className="toast-content">
              <span className="toast-title">{toast.title}</span>
              <span className="toast-msg">{toast.message}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

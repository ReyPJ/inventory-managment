import React, { useState, useEffect } from "react";
import { 
  initializeSyncService, 
  loadSavedConfig, 
  getSyncConfig,
  TENANTS,
  fullSyncProcess,
  getLastSyncTime
} from "../utils/syncService";
import { getAllProducts } from "../utils/ipcRenderer";
import "../styles/SyncSettings.css";

function SyncSettings({ onSyncComplete }) {
  const [apiKey, setApiKey] = useState("");
  const [apiUrl, setApiUrl] = useState("http://localhost:8000");
  const [tenant, setTenant] = useState("");
  const [isConfigured, setIsConfigured] = useState(false);
  const [configError, setConfigError] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState("");
  const [lastSync, setLastSync] = useState(null);

  // Cargar configuración guardada al iniciar
  useEffect(() => {
    const loadConfig = async () => {
      // Intentar cargar la configuración guardada
      const configLoaded = loadSavedConfig();
      
      if (configLoaded) {
        const config = getSyncConfig();
        setApiKey(config.apiKey || "");
        setApiUrl(config.apiUrl || "http://localhost:8000");
        setTenant(config.tenant || "");
        setIsConfigured(true);
        setLastSync(config.lastSyncTime);
      }
    };
    
    loadConfig();
  }, []);

  // Función para usar una API key predefinida
  const setPresetApiKey = (presetKey) => {
    setApiKey(presetKey);
    // Determinar el tenant basado en el prefijo
    if (presetKey.startsWith("cs_")) {
      setTenant("Casa");
    } else if (presetKey.startsWith("ng_")) {
      setTenant("Negocio");
    }
  };

  // Manejar la configuración del servicio
  const handleConfigure = async () => {
    setConfigError("");
    
    if (!apiKey) {
      setConfigError("Por favor ingresa una API key válida");
      return;
    }
    
    try {
      const success = await initializeSyncService(apiKey, apiUrl);
      
      if (success) {
        setIsConfigured(true);
        const config = getSyncConfig();
        setTenant(config.tenant);
        setLastSync(config.lastSyncTime);
        setSyncStatus("Configuración exitosa. Listo para sincronizar.");
        
        // Guardar configuración en localStorage para que persista entre sesiones
        localStorage.setItem("syncConfig", JSON.stringify({
          apiKey,
          apiUrl,
          tenant: config.tenant,
          lastSyncTime: config.lastSyncTime
        }));
      } else {
        setConfigError("No se pudo validar la API key con el servidor");
      }
    } catch (error) {
      setConfigError(error.message || "Error desconocido al configurar");
    }
  };

  // Manejar la sincronización manual
  const handleSync = async () => {
    if (!isConfigured) {
      setConfigError("Primero debes configurar la sincronización");
      return;
    }
    
    setIsSyncing(true);
    setSyncStatus("Iniciando sincronización...");
    
    try {
      // Obtener todos los productos locales
      const localProducts = await getAllProducts();
      setSyncStatus(`Obtenidos ${localProducts.length} productos locales. Sincronizando...`);
      
      // Ejecutar el proceso de sincronización completo
      const result = await fullSyncProcess(localProducts);
      
      if (result.success) {
        setSyncStatus(`Sincronización completada. ${result.serverProducts.length} productos recibidos.`);
        setLastSync(getLastSyncTime());
        
        // Actualizar la fecha de última sincronización en localStorage
        const savedConfig = localStorage.getItem("syncConfig");
        if (savedConfig) {
          const config = JSON.parse(savedConfig);
          config.lastSyncTime = getLastSyncTime();
          localStorage.setItem("syncConfig", JSON.stringify(config));
        }
        
        // Notificar al componente padre que la sincronización se completó
        if (onSyncComplete) {
          onSyncComplete(result);
        }
      } else {
        setSyncStatus(`Error: ${result.error}`);
      }
    } catch (error) {
      setSyncStatus(`Error de sincronización: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Formatear la fecha de última sincronización
  const formatLastSync = () => {
    if (!lastSync) return "Nunca";
    
    try {
      const date = new Date(lastSync);
      return date.toLocaleString();
    } catch {
      return "Formato inválido";
    }
  };

  return (
    <div className="sync-settings">
      <h2>Configuración de Sincronización</h2>
      
      {!isConfigured ? (
        <div className="sync-config-form">
          <div className="form-group">
            <label>URL del servidor:</label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="http://localhost:8000"
            />
          </div>
          
          <div className="form-group">
            <label>API Key:</label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Ingresa tu API Key"
            />
          </div>
          
          <div className="preset-keys">
            <button 
              className="secondary-button casa-button" 
              onClick={() => setPresetApiKey(TENANTS.CASA.apiKey)}
            >
              <i className="icon-home"></i> Casa
            </button>
            <button 
              className="secondary-button negocio-button" 
              onClick={() => setPresetApiKey(TENANTS.NEGOCIO.apiKey)}
            >
              <i className="icon-store"></i> Negocio
            </button>
          </div>
          
          {configError && <div className="error-message">{configError}</div>}
          
          <button 
            className="primary-button" 
            onClick={handleConfigure}
            disabled={!apiKey}
          >
            <i className="icon-sync"></i> Configurar
          </button>
        </div>
      ) : (
        <div className="sync-controls">
          <div className="sync-info">
            <p><strong>Tenant:</strong> {tenant}</p>
            <p><strong>Última sincronización:</strong> {formatLastSync()}</p>
            <p><strong>Estado:</strong> {syncStatus || "Listo para sincronizar"}</p>
          </div>
          
          <div className="sync-actions">
            <button 
              className="primary-button sync-now-button" 
              onClick={handleSync}
              disabled={isSyncing}
            >
              <i className="icon-sync"></i> {isSyncing ? "Sincronizando..." : "Sincronizar Ahora"}
            </button>
            
            <button 
              className="secondary-button danger-button"
              onClick={() => {
                if (window.confirm("¿Estás seguro de reiniciar la configuración?")) {
                  setIsConfigured(false);
                  setApiKey("");
                  localStorage.removeItem("syncConfig");
                }
              }}
            >
              <i className="icon-delete"></i> Reiniciar Configuración
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SyncSettings; 
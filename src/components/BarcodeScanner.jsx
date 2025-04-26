import React, { useState, useEffect } from 'react';
import { Button, Alert, Modal, Box, Typography, CircularProgress } from '@mui/material';
import { QrReader } from 'react-qr-reader';
import { searchProductByBarcode, checkInternetConnection } from '../utils/barcodeSearch';

/**
 * Componente para escanear códigos de barras y buscar productos
 * online si hay internet disponible
 */
const BarcodeScanner = ({ onBarcodeDetected, onProductFound }) => {
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasInternet, setHasInternet] = useState(false);
  const [foundProduct, setFoundProduct] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Verificar conexión a internet al cargar
  useEffect(() => {
    const checkConnection = async () => {
      const connected = await checkInternetConnection();
      setHasInternet(connected);
    };
    
    checkConnection();
  }, []);

  // Manejar la detección de códigos
  const handleScan = async (result) => {
    if (result && result.text) {
      // Detener el escáner
      setScanning(false);
      
      const scannedBarcode = result.text;
      
      // Notificar que se detectó un código (independientemente de la conexión)
      onBarcodeDetected(scannedBarcode);
      
      // Si hay internet, buscar info del producto
      if (hasInternet) {
        setLoading(true);
        try {
          const productInfo = await searchProductByBarcode(scannedBarcode);
          setLoading(false);
          
          if (productInfo) {
            setFoundProduct(productInfo);
            setShowConfirmDialog(true);
          }
        } catch (err) {
          setLoading(false);
          setError('Error al buscar el producto: ' + err.message);
        }
      }
    }
  };

  const handleError = (err) => {
    setError('Error en el escáner: ' + err.message);
    setScanning(false);
  };

  // Confirmar el producto encontrado
  const handleConfirm = () => {
    if (foundProduct && onProductFound) {
      onProductFound(foundProduct);
    }
    setShowConfirmDialog(false);
    setFoundProduct(null);
  };

  // Rechazar el producto encontrado
  const handleReject = () => {
    setShowConfirmDialog(false);
    setFoundProduct(null);
  };

  return (
    <div>
      <Button 
        variant="contained" 
        color={scanning ? "error" : "primary"}
        onClick={() => setScanning(!scanning)}
      >
        {scanning ? 'Cancelar escaneo' : 'Escanear código de barras'}
      </Button>

      {error && (
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Buscando información del producto...</Typography>
        </Box>
      )}

      {scanning && (
        <Box sx={{ mt: 2, width: '100%', maxWidth: 500, mx: 'auto' }}>
          <QrReader
            constraints={{
              facingMode: 'environment'
            }}
            onResult={handleScan}
            onError={handleError}
            style={{ width: '100%' }}
          />
          <Typography sx={{ mt: 1, textAlign: 'center' }}>
            Apunta la cámara al código de barras
          </Typography>
        </Box>
      )}

      {/* Modal de confirmación */}
      <Modal
        open={showConfirmDialog}
        onClose={handleReject}
        aria-labelledby="confirm-product-modal"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}>
          <Typography id="confirm-product-modal" variant="h6" component="h2" gutterBottom>
            ¿Es este tu producto?
          </Typography>
          
          {foundProduct && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1"><strong>Nombre:</strong> {foundProduct.name}</Typography>
              {foundProduct.description && (
                <Typography variant="body2" sx={{ mt: 1 }}><strong>Descripción:</strong> {foundProduct.description}</Typography>
              )}
            </Box>
          )}
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={handleReject} color="error" variant="outlined">
              No, ingresar manualmente
            </Button>
            <Button onClick={handleConfirm} color="success" variant="contained">
              Sí, usar estos datos
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default BarcodeScanner; 
import React from 'react';
import '../styles/ProductDetails.css';

const ProductDetails = ({ product, onClose }) => {
  if (!product) return null;

  // Formatear fecha si existe
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="product-details-container">
      <div className="product-details-content">
        <div className="product-details-header">
          <h2>Detalles del Producto</h2>
          <button 
            className="close-button" 
            onClick={handleClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="product-details-body">
          <div className="product-details-main">
            <div className="details-row">
              <div className="details-group">
                <span className="details-label">Código de Barras</span>
                <span className="details-value">{product.barcode || 'No registrado'}</span>
              </div>
              
              <div className="details-group">
                <span className="details-label">Nombre</span>
                <span className="details-value highlight">{product.name}</span>
              </div>
            </div>

            <div className="details-row">
              <div className="details-group">
                <span className="details-label">Precio</span>
                <span className="details-value price">${product.price}</span>
              </div>
              
              <div className="details-group">
                <span className="details-label">Stock</span>
                <span className={`details-value stock ${product.stock <= 5 ? 'low-stock' : ''}`}>
                  {product.stock} unidades
                  {product.stock <= 5 && <span className="warning-badge">¡Stock bajo!</span>}
                </span>
              </div>
            </div>

            <div className="details-row">
              <div className="details-group">
                <span className="details-label">Categoría</span>
                <span className="details-value category">{product.Category?.name || 'Sin categoría'}</span>
              </div>
              
              <div className="details-group">
                <span className="details-label">Fecha de Registro</span>
                <span className="details-value">{formatDate(product.createdAt)}</span>
              </div>
            </div>

            <div className="details-row full-width">
              <div className="details-group">
                <span className="details-label">Descripción</span>
                <div className="details-description">
                  {product.description || 'Sin descripción'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="product-details-footer">
          <button className="close-details-button" onClick={handleClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails; 
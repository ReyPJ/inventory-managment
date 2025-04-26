import React from 'react';
import '../styles/InventoryStats.css';

function InventoryStats({ products, categories }) {
  // Calcula el valor total del inventario
  const totalInventoryValue = products.reduce((total, product) => {
    return total + (product.price * product.stock);
  }, 0);

  // Encuentra el producto más caro
  const mostExpensiveProduct = products.reduce((mostExpensive, current) => {
    return (current.price > (mostExpensive?.price || 0)) ? current : mostExpensive;
  }, null);

  // Encuentra el producto con más stock
  const mostStockedProduct = products.reduce((mostStock, current) => {
    return (current.stock > (mostStock?.stock || 0)) ? current : mostStock;
  }, null);
  
  // Encuentra productos con bajo stock (menos de 5 unidades)
  const lowStockProducts = products.filter(product => product.stock < 5);
  
  // Calcula productos por categoría
  const productsByCategory = categories.map(category => {
    const count = products.filter(p => p.CategoryId === category.id).length;
    return {
      id: category.id,
      name: category.name,
      count
    };
  }).sort((a, b) => b.count - a.count); // Ordenar de mayor a menor

  return (
    <div className="inventory-stats-container">
      <h2 className="stats-header">Estadísticas de Inventario</h2>
      
      <div className="stats-grid">
        <div className="stat-card total-value">
          <h3>Valor Total del Inventario</h3>
          <div className="stat-value">${totalInventoryValue.toFixed(2)}</div>
          <div className="stat-description">Suma del valor (precio × cantidad) de todos los productos</div>
        </div>
        
        <div className="stat-card product-count">
          <h3>Total de Productos</h3>
          <div className="stat-value">{products.length}</div>
          <div className="stat-description">Número total de productos diferentes en inventario</div>
        </div>
        
        <div className="stat-card low-stock">
          <h3>Productos con Poco Stock</h3>
          <div className="stat-value">{lowStockProducts.length}</div>
          <div className="stat-description">
            Productos con menos de 5 unidades en stock
          </div>
          {lowStockProducts.length > 0 && (
            <div className="mini-list">
              {lowStockProducts.slice(0, 3).map(product => (
                <div key={product.id} className="mini-list-item">
                  {product.name}: <span className="highlight">{product.stock}</span> unidades
                </div>
              ))}
              {lowStockProducts.length > 3 && (
                <div className="mini-list-more">y {lowStockProducts.length - 3} más...</div>
              )}
            </div>
          )}
        </div>
        
        {mostExpensiveProduct && (
          <div className="stat-card most-expensive">
            <h3>Producto Más Caro</h3>
            <div className="stat-value">${mostExpensiveProduct.price.toFixed(2)}</div>
            <div className="stat-description">{mostExpensiveProduct.name}</div>
          </div>
        )}
        
        {mostStockedProduct && (
          <div className="stat-card most-stock">
            <h3>Producto con Mayor Stock</h3>
            <div className="stat-value">{mostStockedProduct.stock} unidades</div>
            <div className="stat-description">{mostStockedProduct.name}</div>
          </div>
        )}
      </div>
      
      <div className="category-distribution">
        <h3>Distribución por Categoría</h3>
        <div className="category-bars">
          {productsByCategory.filter(cat => cat.count > 0).map(category => (
            <div key={category.id} className="category-bar">
              <div className="category-name">{category.name}</div>
              <div 
                className="category-bar-fill" 
                style={{ 
                  width: `${Math.min(100, (category.count / products.length) * 100)}%`
                }}
              ></div>
              <div className="category-count">{category.count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default InventoryStats; 
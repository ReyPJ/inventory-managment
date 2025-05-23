import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../styles/ProductForm.css';
import { searchProductByBarcode } from '../services/productSearch';
import { FaSearch } from 'react-icons/fa';
import { MdCancel } from 'react-icons/md';
import { toast } from 'react-toastify';

const ProductForm = ({ product, categories, onSave, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const descriptionRef = useRef(null);
  const barcodeInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    barcode: '',
    name: '',
    description: '',
    price: '',
    stock: '',
    category: categories && categories.length > 0 ? categories[0].id.toString() : '1' // Valor por defecto
  });
  
  const [formErrors, setFormErrors] = useState({});
  
  // Cargar datos iniciales si se está editando un producto
  useEffect(() => {
    if (product) {
      setFormData({
        id: product.id || '',
        barcode: product.barcode || '',
        name: product.name || '',
        description: product.description || '',
        price: product.price ? product.price.toString() : '',
        stock: product.stock ? product.stock.toString() : '',
        category: product.category ? product.category.toString() : 
                  (categories && categories.length > 0 ? categories[0].id.toString() : '1')
      });

      // Si tiene código de barras pero no nombre, intentar buscarlo
      if (product.barcode && !product.name) {
        setTimeout(() => {
          handleBarcodeSearch();
        }, 500);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, categories]);
  
  // Cargar el producto si se proporciona un código de barras
  const handleBarcodeSearch = useCallback(async () => {
    if (!formData.barcode.trim()) {
      setFormErrors(prev => ({ ...prev, barcode: 'Ingrese un código de barras' }));
      return;
    }
    
    try {
      setIsSearching(true);
      setSearchStatus('Iniciando búsqueda...');
      setFormErrors(prev => ({ ...prev, barcode: '' }));
      
      // Buscar en línea con función para actualizar el estado
      const onlineProduct = await searchProductByBarcode(
        formData.barcode,
        (status) => setSearchStatus(status)
      );
      
      if (onlineProduct) {
        setSearchResult(onlineProduct);
        
        // Verificar si hubo un error en la búsqueda
        if (onlineProduct.searchFailed) {
          toast.info('No se encontró información de este producto en las bases de datos.');
        } 
        // Si el producto tiene links, mostrar un toast diferente
        else if (onlineProduct.links && onlineProduct.links.length > 0) {
          toast.info('Se encontraron referencias en línea');
        } 
        // Producto encontrado con éxito
        else {
          toast.success('¡Producto encontrado en línea!');
        }
      } else {
        toast.info('No se encontró información del producto. Por favor, ingrese los datos manualmente.');
      }
      
    } catch (error) {
      console.error('Error al buscar el producto:', error);
      toast.error('Error al buscar el producto en línea');
      setSearchStatus('Error en la búsqueda');
    } finally {
      setTimeout(() => {
        setIsSearching(false);
        setSearchStatus('');
      }, 1000); // Mantener el estado final visible por un momento
    }
  }, [formData.barcode]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;
    
    // Validaciones especiales para ciertos campos
    if (name === 'price' || name === 'stock') {
      // Permitir solo números y un punto decimal
      if (!/^(\d*\.?\d*)$/.test(value) && value !== '') {
        return;
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: updatedValue }));
    
    // Limpiar errores al editar
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    if (value.length <= 2000) {
      setFormData(prev => ({ ...prev, description: value }));
      
      if (formErrors.description) {
        setFormErrors(prev => ({ ...prev, description: '' }));
      }
    }
  };
  
  const handleUseSearchResult = () => {
    if (searchResult) {
      setFormData(prev => ({
        ...prev,
        name: searchResult.name || '',
        description: searchResult.description || '',
        // Mantener los demás campos como estaban para que el usuario los complete
      }));
      setSearchResult(null);
      toast.success('Información aplicada al formulario');
      
      // Enfocar el campo de descripción para que el usuario pueda seguir completando
      if (descriptionRef.current) {
        descriptionRef.current.focus();
      }
    }
  };
  
  const handleCancelSearch = () => {
    setSearchResult(null);
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.barcode.trim()) {
      errors.barcode = 'El código de barras es requerido';
    }
    
    if (!formData.name.trim()) {
      errors.name = 'El nombre es requerido';
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      errors.price = 'Ingrese un precio válido';
    }
    
    if (!formData.stock || parseInt(formData.stock) < 0) {
      errors.stock = 'Ingrese una cantidad válida';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor, corrija los errores en el formulario');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const productData = {
        id: formData.id,
        barcode: formData.barcode,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: parseInt(formData.category),
        sku: ''
      };
      
      console.log('Guardando producto:', productData);
      
      // Llamar a la función de guardar del componente padre
      await onSave(productData);
      
    } catch (error) {
      console.error('Error al guardar:', error);
      toast.error('Error al guardar el producto');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleKeyPress = (e) => {
    // Si se presiona Enter en el campo de código de barras y el formulario es nuevo, buscar en línea
    if (e.key === 'Enter' && e.target.name === 'barcode' && !formData.id) {
      e.preventDefault();
      handleBarcodeSearch();
    }
  };
  
  return (
    <div className="product-form">
      <div className="form-header">
        <h2>{product?.id ? 'Editar Producto' : 'Nuevo Producto'}</h2>
        {isSearching && <span className="search-status">{searchStatus}</span>}
      </div>
      
      {searchResult && (
        <div className="search-result">
          <div className="search-result-header">
            <h3>Producto encontrado en línea</h3>
            <div className="search-result-actions">
              <button 
                onClick={handleUseSearchResult}
                className="use-result-button"
                title="Usar esta información"
              >
                Usar
              </button>
              <button 
                onClick={handleCancelSearch}
                className="cancel-search-button"
                title="Cancelar búsqueda"
              >
                <MdCancel />
              </button>
            </div>
          </div>
          <div className="search-result-content">
            <p><strong>Nombre:</strong> {searchResult.name}</p>
            {searchResult.description && (
              <p><strong>Descripción:</strong> {searchResult.description}</p>
            )}
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="input-group">
            <label htmlFor="barcode">Código de Barras*</label>
            <div className="barcode-group">
              <input
                type="text"
                id="barcode"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                ref={barcodeInputRef}
                required
                placeholder="Ingrese o escanee el código"
                disabled={isSubmitting || !!product?.id}
                className={formErrors.barcode ? 'input-error' : ''}
              />
              {!product?.id && (
                <button
                  type="button"
                  onClick={handleBarcodeSearch}
                  disabled={isSearching || !formData.barcode.trim()}
                  className="barcode-search-btn"
                  title="Buscar información"
                >
                  <FaSearch />
                </button>
              )}
            </div>
            {formErrors.barcode && <span className="form-error">{formErrors.barcode}</span>}
          </div>
          
          <div className="input-group">
            <label htmlFor="name">Nombre*</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Nombre del producto"
              disabled={isSubmitting}
              className={formErrors.name ? 'input-error' : ''}
            />
            {formErrors.name && <span className="form-error">{formErrors.name}</span>}
          </div>
        </div>
        
        <div className="input-group full-width">
          <label htmlFor="description">Descripción</label>
          <div className="description-container">
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleDescriptionChange}
              placeholder="Descripción opcional del producto"
              rows="3"
              disabled={isSubmitting}
              ref={descriptionRef}
            ></textarea>
          </div>
        </div>
        
        <div className="form-row">
          <div className="input-group">
            <label htmlFor="price">Precio*</label>
            <div className="price-input-group">
              <span>$</span>
              <input
                type="text"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                placeholder="Ej. 1000"
                disabled={isSubmitting}
                className={formErrors.price ? 'input-error' : ''}
              />
            </div>
            {formErrors.price && <span className="form-error">{formErrors.price}</span>}
          </div>
          
          <div className="input-group">
            <label htmlFor="stock">Cantidad*</label>
            <input
              type="text"
              id="stock"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              required
              placeholder="Cantidad en inventario"
              disabled={isSubmitting}
              className={formErrors.stock ? 'input-error' : ''}
            />
            {formErrors.stock && <span className="form-error">{formErrors.stock}</span>}
          </div>
          
          <div className="input-group">
            <label htmlFor="category">Categoría</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="cancel-button"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="save-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : product?.id ? 'Actualizar' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm; 
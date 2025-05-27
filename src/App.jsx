import React, { useEffect, useState, useRef } from 'react';
import { 
  getAllProducts,
  getAllCategories, 
  createProduct, 
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductByBarcode,
  createCategory,
  updateCategory,
  deleteCategory,
  isAuthenticated,
  getCurrentUser,
  logout
} from './services/apiService';
import './styles/App.css';
import ProductForm from './components/ProductForm';
import ProductDetails from './components/ProductDetails';
import CategoryManagement from './components/CategoryManagement';
import InventoryStats from './components/InventoryStats';
import Login from './components/Login';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { searchProductByBarcode, checkInternetConnection } from './services/productSearch';

function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showProductForm, setShowProductForm] = useState(false);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [productToConfirm, setProductToConfirm] = useState(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [removeQuantity, setRemoveQuantity] = useState(1);
  const [authenticated, setAuthenticated] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc'
  });
  const [selectedLetter, setSelectedLetter] = useState('all');
  const barcodeInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  
  // Comprobar autenticación y cargar datos iniciales
  useEffect(() => {
    if (isAuthenticated()) {
      setAuthenticated(true);
      loadData();
    }
  }, []);
  
  // Función para cargar o recargar los datos
  const loadData = async () => {
    setLoading(true);
    try {
      console.log("🔍 Cargando productos desde la API...");
      const productsData = await getAllProducts();
      console.log(`✅ Productos cargados: ${productsData.length}`, productsData);
      setProducts(productsData);
      
      console.log("🔍 Cargando categorías desde la API...");
      const categoriesData = await getAllCategories();
      console.log(`✅ Categorías cargadas: ${categoriesData.length}`, categoriesData);
      setCategories(categoriesData);
      
      // Mostrar mensaje de bienvenida
      if (!hasShownWelcome) {
        const username = getCurrentUser();
        toast.success(`¡Bienvenido, ${username}!`);
        setHasShownWelcome(true);
      }
    } catch (err) {
      console.error("❌ ERROR AL CARGAR DATOS:", err);
      setError(err.message || 'Error al cargar datos');
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };
  
  // Manejar la búsqueda
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadData(); // Si la búsqueda está vacía, cargar todos los productos
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const results = await searchProducts(searchTerm);
      setProducts(results || []);
      
      if (results && results.length === 0) {
        toast.info(`No se encontraron productos para "${searchTerm}"`, { 
          icon: "🔍"
        });
      } else if (results && results.length > 0) {
        toast.success(`Se encontraron ${results.length} productos`, { 
          autoClose: 2000 
        });
      }
    } catch (error) {
      console.error('Error en la búsqueda:', error);
      setError('Error al realizar la búsqueda. Por favor, intenta nuevamente.');
      toast.error(`Error al buscar "${searchTerm}"`, { 
        autoClose: false
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrar por categoría
  useEffect(() => {
    const filterProductsByCategory = async () => {
      if (!authenticated) return;
      
      console.log(`🔍 Filtrando por categoría: ${selectedCategory === 'all' ? 'Todas' : 'ID: ' + selectedCategory}`);
      
      if (selectedCategory === 'all') {
        // Si es "todas las categorías", simplemente recargamos
        console.log("📋 Cargando todos los productos...");
        if (!searchTerm) {
          await loadData();
          console.log("🔄 loadData() ejecutado para 'Todas las categorías'");
        }
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        // Cargamos todos y filtramos por categoría
        console.log("📋 Obteniendo todos los productos para filtrar...");
        const allProducts = await getAllProducts();
        console.log(`📦 Productos obtenidos: ${allProducts.length}`);
        
        const filtered = allProducts.filter(
          product => product.category === parseInt(selectedCategory)
        );
        console.log(`🔍 Productos filtrados: ${filtered.length} para categoría ID: ${selectedCategory}`);
        
        setProducts(filtered || []);
      } catch (error) {
        console.error('❌ Error filtrando productos:', error);
        setError('Error al filtrar productos. Por favor, intenta nuevamente.');
        toast.error('Error al filtrar por categoría', {
          autoClose: false
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (authenticated) {
      filterProductsByCategory();
    }
  }, [selectedCategory, searchTerm, authenticated]);

  // Manejar el formulario de agregar rápido
  const handleQuickAddForm = () => {
    setShowQuickAdd(true);
    setBarcodeInput('');
    toast.info(
      <div>
        <strong>Modo agregar rápido activado</strong>
        <div className="toast-details">
          Escanea un código de barras para agregar +1 al inventario
        </div>
      </div>, 
      {
        icon: "🔍",
        autoClose: 3000
      }
    );
  };

  // Focus en el input de código de barras cuando se muestra el formulario
  useEffect(() => {
    if (showQuickAdd && barcodeInputRef.current) {
      // Pequeño delay para asegurar que el DOM está listo
      setTimeout(() => {
        barcodeInputRef.current.focus();
      }, 100);
    }
  }, [showQuickAdd]);

  // Función para cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowQuickAdd(false);
      }
    }
    
    // Añadir listener solo cuando el dropdown está visible
    if (showQuickAdd) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    // Limpieza del listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showQuickAdd]);

  // Buscar producto por código de barras para agregar stock
  const handleQuickAdd = async () => {
    if (!barcodeInput.trim()) {
      toast.warning('Por favor ingresa un código de barras', {
        icon: "⚠️",
        autoClose: 3000
      });
      return;
    }
    
    try {
      setLoading(true);
      const product = await getProductByBarcode(barcodeInput);
      if (product) {
        // Mostrar toast de producto encontrado
        toast.info(
          <div>
            <strong>Producto encontrado:</strong> {product.name}
            <div className="toast-details">
              Stock actual: {product.stock} unidades
            </div>
          </div>, 
          {
            icon: "✓",
            autoClose: 3000
          }
        );
        
        // Guardamos el producto para confirmación
        setProductToConfirm(product);
        setConfirmAction('quickAdd');
      } else {
        toast.error(`Producto con código ${barcodeInput} no encontrado`, {
          icon: "❌",
          autoClose: 3000
        });
      }
    } catch (error) {
      console.error('Error al agregar rápido:', error);
      toast.error('Error al procesar el código de barras', {
        autoClose: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  // Manejar confirmación de acciones como agregar/quitar stock
  const handleConfirmAction = async () => {
    if (!productToConfirm) return;
    
    try {
      setLoading(true);
      
      if (confirmAction === 'quickAdd') {
        // Actualizar stock sumando 1
        const updatedProduct = {
          ...productToConfirm,
          stock: productToConfirm.stock + 1
        };
        
        await updateProduct(productToConfirm.id, updatedProduct);
        
        toast.success(
          <div>
            <strong>Stock actualizado</strong>
            <div className="toast-details">
              {productToConfirm.name} ahora tiene {updatedProduct.stock} unidades
            </div>
          </div>, 
          {
            icon: "✅",
            autoClose: 3000
          }
        );
        
        // Limpiar y resetear para la próxima entrada
        setBarcodeInput('');
        setProductToConfirm(null);
        setConfirmAction(null);
        
        // Recargar datos para reflejar el cambio
        await loadData();
        
        // Volver a enfocar el input para facilitar escaneos continuos
        if (barcodeInputRef.current) {
          barcodeInputRef.current.focus();
        }
      } else if (confirmAction === 'quickRemove') {
        // Actualizar stock restando la cantidad especificada
        const newStock = Math.max(0, productToConfirm.stock - removeQuantity);
        const updatedProduct = {
          ...productToConfirm,
          stock: newStock
        };
        
        await updateProduct(productToConfirm.id, updatedProduct);
        
        toast.success(`Stock de "${productToConfirm.name}" actualizado a ${newStock} unidades`);
        
        // Limpiar y resetear
        setShowRemoveConfirm(false);
        setProductToConfirm(null);
        setConfirmAction(null);
        setRemoveQuantity(1);
        
        // Recargar datos
        await loadData();
      } else if (confirmAction === 'delete') {
        // Eliminar producto
        const result = await deleteProduct(productToConfirm.id);
        
        if (result) {
          // Si se eliminó correctamente, actualizar UI
          toast.success(`Producto "${productToConfirm.name}" eliminado correctamente`);
          
          // Cerrar detalles si estaba abierto
          if (showProductDetails && viewingProduct && viewingProduct.id === productToConfirm.id) {
            setShowProductDetails(false);
            setViewingProduct(null);
          }
          
          // Recargar datos
          await loadData();
        } else {
          toast.error('Error al eliminar el producto');
        }
        
        // Limpiar y resetear
        setProductToConfirm(null);
        setConfirmAction(null);
      }
    } catch (error) {
      console.error('Error al confirmar acción:', error);
      toast.error('Error al actualizar el inventario');
    } finally {
      setLoading(false);
    }
  };

  // Cancelar confirmación de acciones
  const handleCancelConfirm = () => {
    // Limpiar estados de confirmación
    setProductToConfirm(null);
    setConfirmAction(null);
    setShowRemoveConfirm(false);
    setRemoveQuantity(1);
  };

  // Manejar la entrada de un código de barras
  const handleBarcodeSearch = async (e) => {
    e.preventDefault();
    
    if (!barcodeInput.trim()) {
      toast.warning('Por favor ingresa un código de barras', {
        icon: "⚠️"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Primero buscar en la base de datos local
      const existingProduct = await getProductByBarcode(barcodeInput);
      
      if (existingProduct) {
        // Si el producto ya existe, mostrar sus detalles
        setViewingProduct(existingProduct);
        setShowProductDetails(true);
        toast.info(`Producto encontrado: "${existingProduct.name}"`, {
          autoClose: 2000
        });
      } else {
        // Si no existe, crear un nuevo producto con ese código
        setEditingProduct({
          barcode: barcodeInput,
          name: '',
          description: '',
          price: '',
          stock: '1'
        });
        setShowProductForm(true);
        
        // Verificar conexión a internet y buscar en línea
        const hasInternet = await checkInternetConnection();
        
        if (hasInternet) {
          toast.info('Buscando información en línea...', {
            icon: "🔍"
          });
          
          // Este método se mantiene igual que en la versión offline
          // ya que solo busca información en internet
          const onlineProduct = await searchProductByBarcode(barcodeInput);
          
          if (onlineProduct && onlineProduct.name && onlineProduct.name !== `Producto ${barcodeInput}`) {
            toast.success('¡Producto encontrado en línea!', {
              autoClose: 2000
            });
            
            // Actualizar el formulario con la información encontrada
            // Mantener el código de barras original
            setEditingProduct(prev => ({
              ...prev,
              name: onlineProduct.name || '',
              description: onlineProduct.description || '',
              // Solo actualizar otros campos si tienen valores
              price: onlineProduct.price && onlineProduct.price !== 'Precio no encontrado' 
                ? onlineProduct.price.toString() 
                : prev.price,
              // Mantener el stock en 1 para nuevo producto
            }));
          } else {
            toast.info('No se encontró información en línea. Por favor, ingresa los datos manualmente.', {
              autoClose: 3000
            });
          }
        } else {
          toast.info('Sin conexión a internet. Ingresa los datos manualmente.', {
            autoClose: 3000
          });
        }
      }
    } catch (error) {
      console.error('Error al buscar producto:', error);
      toast.error('Error al buscar el producto');
    } finally {
      setLoading(false);
    }
  };

  // Manejar guardado de productos (creación y actualización)
  const handleSaveProduct = async (productData) => {
    try {
      setLoading(true);
      
      let savedProduct;
      
      if (productData.id) {
        // Actualizar producto existente
        console.log('Actualizando producto:', productData);
        savedProduct = await updateProduct(productData.id, productData);
        
        if (savedProduct) {
          toast.success(`Producto "${productData.name}" actualizado correctamente`);
        }
      } else {
        // Crear nuevo producto
        console.log('Creando nuevo producto:', productData);
        savedProduct = await createProduct(productData);
        
        if (savedProduct) {
          toast.success(`Nuevo producto "${productData.name}" creado correctamente`);
        }
      }
      
      if (savedProduct) {
        // Cerrar formulario
        setShowProductForm(false);
        setEditingProduct(null);
        
        // Recargar datos
        await loadData();
      } else {
        toast.error('Error al guardar el producto. Inténtalo nuevamente.');
      }
    } catch (error) {
      console.error('Error al guardar producto:', error);
      toast.error('Error al guardar el producto: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Manejar eliminación de productos
  const handleDeleteProduct = async (id) => {
    // Guardar el producto a eliminar y mostrar un diálogo de confirmación personalizado
    const productToDelete = products.find(p => p.id === id);
    setProductToConfirm(productToDelete);
    setConfirmAction('delete');
  };

  // Manejar edición de productos
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  // Manejar vista de detalles de producto
  const handleViewProduct = (product) => {
    setViewingProduct(product);
    setShowProductDetails(true);
  };

  // Cerrar vista de detalles
  const handleCloseDetails = () => {
    setShowProductDetails(false);
    setViewingProduct(null);
  };

  // Cancelar formulario de producto
  const handleCancelForm = () => {
    setShowProductForm(false);
    setEditingProduct(null);
  };

  // Manejar guardado de categorías
  const handleAddCategory = async (categoryData) => {
    try {
      setLoading(true);
      
      const newCategory = await createCategory(categoryData);
      
      if (newCategory) {
        toast.success(`Categoría "${categoryData.name}" creada correctamente`);
        
        // Recargar categorías
        const updatedCategories = await getAllCategories();
        setCategories(updatedCategories);
      } else {
        toast.error('Error al crear la categoría');
      }
    } catch (error) {
      console.error('Error al crear categoría:', error);
      toast.error('Error al crear la categoría: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Manejar edición de categoría
  const handleEditCategory = async (categoryData) => {
    try {
      setLoading(true);
      
      const updatedCategory = await updateCategory(categoryData.id, categoryData);
      
      if (updatedCategory) {
        toast.success(`Categoría "${categoryData.name}" actualizada correctamente`);
        
        // Recargar categorías y productos (pueden haber cambiado las relaciones)
        const updatedCategories = await getAllCategories();
        setCategories(updatedCategories);
        await loadData();
      } else {
        toast.error('Error al actualizar la categoría');
      }
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      toast.error('Error al actualizar la categoría: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Manejar eliminación de categoría
  const handleDeleteCategory = async (id) => {
    try {
      setLoading(true);
      
      // Obtener la categoría para el mensaje
      const categoryToDelete = categories.find(c => c.id === id);
      
      const result = await deleteCategory(id);
      
      if (result) {
        // Si se eliminó correctamente
        if (categoryToDelete) {
          toast.success(`Categoría "${categoryToDelete.name}" eliminada correctamente`);
        } else {
          toast.success('Categoría eliminada correctamente');
        }
        
        // Recargar categorías y productos
        const updatedCategories = await getAllCategories();
        setCategories(updatedCategories);
        await loadData();
      } else {
        toast.error('Error al eliminar la categoría');
      }
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      toast.error('Error al eliminar la categoría: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Mostrar/ocultar estadísticas
  const toggleStats = () => {
    setShowStats(!showStats);
  };

  // Manejar reducción rápida de stock desde la tabla
  const handleQuickRemoveInTable = (product) => {
    setProductToConfirm(product);
    setConfirmAction('quickRemove');
    setShowRemoveConfirm(true);
    setRemoveQuantity(1);
  };

  // Manejar reducción de stock con cantidad específica
  const handleReduceProductStock = async () => {
    handleConfirmAction(); // Usa la misma lógica de confirmación
  };

  // Manejar login exitoso
  const handleLoginSuccess = () => {
    setAuthenticated(true);
    loadData();
  };

  // Manejar logout
  const handleLogout = () => {
    logout();
    setAuthenticated(false);
    setProducts([]);
    setCategories([]);
    toast.info('Has cerrado sesión correctamente');
  };

  // Función para ordenar y filtrar los productos
  const getSortedProducts = () => {
    let sortedProducts = [...products];
    
    // Filtrar por letra inicial si se ha seleccionado una
    if (selectedLetter !== 'all') {
      sortedProducts = sortedProducts.filter(product => 
        product.name.toLowerCase().startsWith(selectedLetter.toLowerCase())
      );
    }
    
    if (sortConfig.key) {
      sortedProducts.sort((a, b) => {
        if (sortConfig.key === 'name') {
          return sortConfig.direction === 'asc' 
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        }
        
        if (sortConfig.key === 'price') {
          return sortConfig.direction === 'asc'
            ? parseFloat(a.price) - parseFloat(b.price)
            : parseFloat(b.price) - parseFloat(a.price);
        }
        
        if (sortConfig.key === 'stock') {
          return sortConfig.direction === 'asc'
            ? a.stock - b.stock
            : b.stock - a.stock;
        }
        
        if (sortConfig.key === 'createdAt') {
          return sortConfig.direction === 'asc'
            ? new Date(a.createdAt) - new Date(b.createdAt)
            : new Date(b.createdAt) - new Date(a.createdAt);
        }
        
        return 0;
      });
    }
    
    return sortedProducts;
  };

  // Función para manejar el cambio de ordenamiento
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Si no está autenticado, mostrar pantalla de login
  if (!authenticated) {
    return (
      <div className="app">
        <ToastContainer position="top-right" autoClose={3000} />
        <Login onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="app">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <header className="app-header">
        <div className="header-left">
          <h1>Sistema de Inventario</h1>
          <span className="user-info">
            Usuario: {getCurrentUser()}
            Version: 1.6.2 -
            Fadua's Edition
          </span>
        </div>
        <div className="header-right">
          <button className="logout-button" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>
      </header>
      
      <div className="app-content">
        <div className="toolbar">
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar por nombre o código"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} className="search-button">
              Buscar
            </button>
          </div>
          
          <div className="barcode-search">
            <form onSubmit={handleBarcodeSearch}>
              <input
                type="text"
                placeholder="Escanear código de barras"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
              />
              <button type="submit">Buscar</button>
            </form>
          </div>
          
          <div className="action-buttons">
            <button onClick={() => {
              setEditingProduct(null);
              setShowProductForm(true);
            }} className="add-button">
              Nuevo Producto
            </button>
            
            <button onClick={handleQuickAddForm} className="quick-add-button">
              Agregar Rápido
            </button>
            
            <button 
              onClick={() => setShowCategoryManager(true)} 
              className="category-button"
            >
              Categorías
            </button>
            
            <button 
              onClick={toggleStats} 
              className="stats-button"
            >
              Estadísticas
            </button>
          </div>
        </div>
        
        {/* Dropdown para agregar rápido */}
        {showQuickAdd && (
          <div className="quick-add-dropdown" ref={dropdownRef}>
            <div className="quick-add-header">
              <h3>Agregar Rápido</h3>
              <button onClick={() => setShowQuickAdd(false)} className="close-button">×</button>
            </div>
            <div className="quick-add-content">
              <input
                type="text"
                placeholder="Escanear código de barras"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                ref={barcodeInputRef}
                onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
              />
              <button onClick={handleQuickAdd}>Agregar +1</button>
            </div>
          </div>
        )}
        
        {/* Diálogo de confirmación para agregar stock */}
        {productToConfirm && confirmAction === 'quickAdd' && (
          <div className="confirmation-dialog">
            <div className="confirmation-content">
              <h3>Confirmar Agregar Stock</h3>
              <p>¿Agregar +1 unidad al producto "{productToConfirm.name}"?</p>
              <p>Stock actual: {productToConfirm.stock} unidades</p>
              <div className="confirmation-actions">
                <button onClick={handleCancelConfirm} className="cancel-button">Cancelar</button>
                <button onClick={handleConfirmAction} className="confirm-button">Confirmar</button>
              </div>
            </div>
          </div>
        )}
        
        {/* Diálogo de confirmación para eliminar producto */}
        {productToConfirm && confirmAction === 'delete' && (
          <div className="confirmation-dialog">
            <div className="confirmation-content">
              <h3>Confirmar Eliminación</h3>
              <p>¿Estás seguro de que deseas eliminar el producto "{productToConfirm.name}"?</p>
              <div className="confirmation-actions">
                <button onClick={handleCancelConfirm} className="cancel-button">Cancelar</button>
                <button onClick={handleConfirmAction} className="confirm-button">Eliminar</button>
              </div>
            </div>
          </div>
        )}
        
        {/* Confirmación para quitar stock con cantidad */}
        {showRemoveConfirm && (
          <div className="confirmation-dialog">
            <div className="confirmation-content">
              <h3>Reducir Stock</h3>
              <p>Producto: "{productToConfirm.name}"</p>
              <p>Stock actual: {productToConfirm.stock} unidades</p>
              <div className="quantity-selector">
                <label>Cantidad a reducir:</label>
                <input
                  type="number"
                  min="1"
                  max={productToConfirm.stock}
                  value={removeQuantity}
                  onChange={(e) => setRemoveQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="confirmation-actions">
                <button onClick={handleCancelConfirm} className="cancel-button">Cancelar</button>
                <button onClick={handleReduceProductStock} className="confirm-button">Confirmar</button>
              </div>
            </div>
          </div>
        )}
        
        {/* Filtrado por categoría */}
        <div className="category-filter">
          <label>Filtrar por categoría:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Filtrado alfabético */}
        <div className="alphabet-filter">
          <label>Filtrar por inicial:</label>
          <div className="alphabet-buttons">
            <button 
              className={selectedLetter === 'all' ? 'active' : ''}
              onClick={() => setSelectedLetter('all')}
            >
              Todas
            </button>
            {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map(letter => (
              <button
                key={letter}
                className={selectedLetter === letter ? 'active' : ''}
                onClick={() => setSelectedLetter(letter)}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>
        
        {/* Tabla de productos */}
        <div className="products-container">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Cargando...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={loadData}>Reintentar</button>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-products">
              <p>No hay productos disponibles</p>
              <button onClick={() => {
                setEditingProduct(null);
                setShowProductForm(true);
              }}>Agregar Primer Producto</button>
            </div>
          ) : (
            <table className="products-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th onClick={() => handleSort('name')} className="sortable">
                    Nombre {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('price')} className="sortable">
                    Precio {sortConfig.key === 'price' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('stock')} className="sortable">
                    Stock {sortConfig.key === 'stock' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Categoría</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {getSortedProducts().map((product) => {
                  // Encontrar el nombre de la categoría
                  const categoryName = 
                    categories.find(c => c.id === product.category)?.name || 
                    'Sin categoría';
                    
                  return (
                    <tr key={product.id} className={product.stock <= 0 ? 'out-of-stock' : ''}>
                      <td>{product.barcode}</td>
                      <td>{product.name}</td>
                      <td>${parseFloat(product.price).toLocaleString()}</td>
                      <td className={`stock-cell ${product.stock <= 0 ? 'zero-stock' : ''}`}>
                        {product.stock}
                        <div className="stock-actions">
                          <button 
                            onClick={() => {
                              setProductToConfirm(product);
                              setConfirmAction('quickAdd');
                            }}
                            className="add-stock-button"
                            title="Agregar 1 unidad"
                          >
                            +
                          </button>
                          <button 
                            onClick={() => handleQuickRemoveInTable(product)}
                            className="remove-stock-button"
                            title="Reducir stock"
                            disabled={product.stock <= 0}
                          >
                            -
                          </button>
                        </div>
                      </td>
                      <td>{categoryName}</td>
                      <td className="actions-cell">
                        <button 
                          onClick={() => handleViewProduct(product)} 
                          className="view-button"
                          title="Ver detalles"
                        >
                          Ver
                        </button>
                        <button 
                          onClick={() => handleEditProduct(product)} 
                          className="edit-button"
                          title="Editar producto"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product.id)} 
                          className="delete-button"
                          title="Eliminar producto"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      {/* Formulario de Producto */}
      {showProductForm && (
        <div className="modal">
          <div className="modal-content product-form-modal">
            <ProductForm 
              product={editingProduct}
              categories={categories}
              onSave={handleSaveProduct}
              onCancel={handleCancelForm}
            />
          </div>
        </div>
      )}
      
      {/* Detalles de Producto */}
      {showProductDetails && viewingProduct && (
        <div className="modal">
          <div className="modal-content product-details-modal">
            <ProductDetails 
              product={viewingProduct}
              categories={categories}
              onClose={handleCloseDetails}
              onEdit={() => {
                handleCloseDetails();
                handleEditProduct(viewingProduct);
              }}
              onDelete={() => {
                handleCloseDetails();
                handleDeleteProduct(viewingProduct.id);
              }}
            />
          </div>
        </div>
      )}
      
      {/* Gestión de Categorías */}
      {showCategoryManager && (
        <div className="modal">
          <div className="modal-content category-modal">
            <button 
              className="close-modal-button"
              onClick={() => setShowCategoryManager(false)}
            >
              ✕
            </button>
            <CategoryManagement 
              categories={categories}
              onAddCategory={handleAddCategory}
              onEditCategory={handleEditCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          </div>
        </div>
      )}
      
      {/* Estadísticas */}
      {showStats && (
        <div className="modal">
          <div className="modal-content stats-modal">
            <button 
              className="close-modal-button"
              onClick={() => setShowStats(false)}
            >
              ✕
            </button>
            <InventoryStats 
              products={products}
              categories={categories}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
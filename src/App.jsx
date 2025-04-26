import React, { useEffect, useState } from 'react';
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
  deleteCategory
} from './utils/ipcRenderer';
import './styles/App.css';
import ProductForm from './components/ProductForm';
import ProductDetails from './components/ProductDetails';
import CategoryManagement from './components/CategoryManagement';
import InventoryStats from './components/InventoryStats';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  
  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, []);
  
  // Función para cargar o recargar los datos
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const categoriesData = await getAllCategories();
      const productsData = await getAllProducts();
      setProducts(productsData || []);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setError('Error al cargar los datos. Por favor, intenta nuevamente.');
      toast.error('Error al cargar los datos', { autoClose: false });
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
      if (selectedCategory === 'all') {
        // Si es "todas las categorías", simplemente recargamos
        if (!searchTerm) loadData();
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        // Cargamos todos y filtramos en el cliente (alternativa: crear endpoint específico)
        const allProducts = await getAllProducts();
        const filtered = allProducts.filter(
          product => product.CategoryId === parseInt(selectedCategory)
        );
        setProducts(filtered || []);
      } catch (error) {
        console.error('Error filtrando productos:', error);
        setError('Error al filtrar productos. Por favor, intenta nuevamente.');
        toast.error('Error al filtrar por categoría', {
          autoClose: false
        });
      } finally {
        setLoading(false);
      }
    };
    
    filterProductsByCategory();
  }, [selectedCategory, searchTerm]);
  
  // Búsqueda por código de barras
  const handleBarcodeSearch = async (e) => {
    const barcode = e.target.value;
    setBarcodeInput(barcode);
    
    // Si es un código completo (generalmente los escáneres terminan con un "Enter")
    if (e.key === 'Enter' && barcode.trim()) {
      try {
        setLoading(true);
        setError(null);
        const product = await getProductByBarcode(barcode);
        
        if (product) {
          // Si encontramos el producto, mostramos solo ese
          setProducts([product]);
          toast.success(`Producto encontrado: ${product.name}`, {
            icon: "✅",
            position: "top-center"
          });
        } else {
          // Si no hay producto, abrimos formulario para agregar uno nuevo
          setEditingProduct({ barcode: barcode });
          setShowProductForm(true);
          toast.info(`Código ${barcode} no registrado. Crea un nuevo producto.`, {
            icon: "🆕",
            autoClose: 5000
          });
        }
      } catch (error) {
        console.error('Error buscando por código de barras:', error);
        setError('Error al buscar el código de barras. Por favor, intenta nuevamente.');
        toast.error(`Error al buscar el código ${barcode}`, {
          autoClose: false
        });
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Guardar producto (crear o actualizar)
  const handleSaveProduct = async (productData) => {
    try {
      setLoading(true);
      setError(null);
      
      if (productData.id) {
        // Actualizar producto existente
        await updateProduct(productData.id, productData);
        // Primero cerramos el formulario y luego mostramos el toast
        setShowProductForm(false);
        setEditingProduct(null);
        setBarcodeInput('');
        
        // Recargar datos
        await loadData();
        
        // Mostrar toast después de que todo está listo
        toast.success(`¡Producto "${productData.name}" actualizado!`, {
          icon: "✏️",
          autoClose: 4000,
          position: "top-center"
        });
      } else {
        // Crear nuevo producto
        await createProduct(productData);
        
        // Primero cerramos el formulario y luego mostramos el toast
        setShowProductForm(false);
        setEditingProduct(null);
        setBarcodeInput('');
        
        // Recargar datos
        await loadData();
        
        // Mostrar toast después de que todo está listo
        toast.success(`¡Producto "${productData.name}" creado exitosamente!`, {
          icon: "✨",
          autoClose: 4000,
          position: "top-center"
        });
      }
    } catch (error) {
      console.error('Error guardando producto:', error);
      setError('Error al guardar el producto. Por favor, verifica los datos e intenta nuevamente.');
      toast.error('Error al guardar el producto', {
        autoClose: false,
        position: "top-center"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Eliminar producto
  const handleDeleteProduct = async (id) => {
    // Obtener el producto antes de mostrar la confirmación
    const productToDelete = products.find(p => p.id === id);
    
    if (!productToDelete) {
      toast.error('Error: Producto no encontrado');
      return;
    }
    
    if (window.confirm(`¿Estás seguro de eliminar "${productToDelete.name}"?`)) {
      try {
        setLoading(true);
        setError(null);
        
        // Guardar una copia del producto antes de eliminarlo
        const deletedProductName = productToDelete.name;
        
        await deleteProduct(id);
        
        // Recargar primero
        await loadData();
        
        // Mostrar toast una vez que se completó la recarga
        setTimeout(() => {
          toast.success(`Producto "${deletedProductName}" eliminado`, {
            icon: "🗑️",
            position: "top-center"
          });
        }, 300);
      } catch (error) {
        console.error('Error eliminando producto:', error);
        setError('Error al eliminar el producto. Por favor, intenta nuevamente.');
        toast.error('Error al eliminar el producto', {
          autoClose: false,
          position: "top-center"
        });
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Abrir formulario para editar
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };
  
  // Ver detalles del producto
  const handleViewProduct = (product) => {
    setViewingProduct(product);
    setShowProductDetails(true);
  };
  
  // Cerrar vista de detalles
  const handleCloseDetails = () => {
    setShowProductDetails(false);
    setViewingProduct(null);
  };
  
  // Cancelar edición/creación
  const handleCancelForm = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    setBarcodeInput('');
  };
  
  // Manejar acciones de categoría
  const handleAddCategory = async (categoryData) => {
    try {
      setLoading(true);
      setError(null);
      await createCategory(categoryData);
      await loadData();
      toast.success(`Categoría "${categoryData.name}" creada`, {
        icon: "📁"
      });
    } catch (error) {
      console.error('Error al agregar categoría:', error);
      setError('Error al agregar la categoría. Por favor, intenta nuevamente.');
      toast.error(`Error al crear categoría "${categoryData.name}"`, {
        autoClose: false
      });
      setLoading(false);
    }
  };

  const handleEditCategory = async (categoryData) => {
    try {
      setLoading(true);
      setError(null);
      await updateCategory(categoryData.id, categoryData);
      await loadData();
      toast.success(`Categoría "${categoryData.name}" actualizada`, {
        icon: "📋"
      });
    } catch (error) {
      console.error('Error al editar categoría:', error);
      setError('Error al editar la categoría. Por favor, intenta nuevamente.');
      toast.error('Error al actualizar la categoría', {
        autoClose: false
      });
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      setLoading(true);
      setError(null);
      // Obtener el nombre de la categoría antes de eliminarla
      const categoryToDelete = categories.find(c => c.id === id);
      await deleteCategory(id);
      await loadData();
      toast.success(`Categoría "${categoryToDelete?.name || ''}" eliminada`, {
        icon: "🗑️" 
      });
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      setError('Error al eliminar la categoría. Por favor, intenta nuevamente.');
      toast.error('Error al eliminar la categoría', {
        autoClose: false
      });
      setLoading(false);
    }
  };
  
  // Mostrar/ocultar estadísticas
  const toggleStats = () => {
    setShowStats(!showStats);
  };
  
  if (loading) return <div className="loading-screen">Cargando inventario...</div>;
  
  return (
    <div className="app-container">
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        limit={5}
        toastClassName="app-toast"
        bodyClassName="toast-body"
        closeButton={true}
      />
      
      <header className="app-header">
        <h1>Sistema de Inventario</h1>
        <div className="header-actions">
          <button 
            className="primary-button"
            onClick={() => setShowProductForm(true)}
            aria-label="Agregar nuevo producto"
          >
            <i className="icon-add"></i> Agregar Producto
          </button>
          <button 
            className="secondary-button"
            onClick={() => setShowCategoryManager(!showCategoryManager)}
            aria-label="Gestionar categorías"
          >
            <i className="icon-category"></i> Categorías
          </button>
          <button 
            className={`stats-button ${showStats ? 'active' : ''}`}
            onClick={toggleStats}
            aria-label="Ver estadísticas"
          >
            <i className="icon-stats"></i> Estadísticas
          </button>
        </div>
      </header>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="close-error">×</button>
        </div>
      )}

      {showCategoryManager && (
        <CategoryManagement 
          categories={categories}
          onAddCategory={handleAddCategory}
          onEditCategory={handleEditCategory}
          onDeleteCategory={handleDeleteCategory}
        />
      )}

      {showStats && products.length > 0 && (
        <InventoryStats products={products} categories={categories} />
      )}

      {!showProductForm && !showProductDetails && (
        <>
          <div className="search-container">
            <div className="search-bar">
              <input 
                type="text"
                placeholder="Buscar productos por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="search-input"
                aria-label="Buscar productos"
              />
              <button 
                className="search-button"
                onClick={handleSearch}
                aria-label="Iniciar búsqueda"
              >
                <i className="icon-search"></i>
              </button>
            </div>

            <div className="barcode-scanner">
              <input
                type="text"
                placeholder="Escanear código de barras aquí..."
                value={barcodeInput}
                onChange={handleBarcodeSearch}
                onKeyDown={handleBarcodeSearch}
                className="barcode-input"
                aria-label="Escanear código de barras"
              />
              <div className="barcode-icon">
                <i className="icon-barcode"></i>
              </div>
            </div>
          </div>

          <div className="filter-container">
            <div className="category-filter">
              <label htmlFor="category-select">Filtrar por categoría:</label>
              <select 
                id="category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="category-select"
                aria-label="Filtrar por categoría"
              >
                <option value="all">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <main className="inventory-content">
            {products.length === 0 ? (
              <div className="empty-inventory">
                <p>No hay productos en el inventario</p>
                <button 
                  className="primary-button"
                  onClick={() => setShowProductForm(true)}
                  aria-label="Agregar primer producto"
                >
                  Agregar tu primer producto
                </button>
              </div>
            ) : (
              <div className="table-container">
                <table className="inventory-table" aria-label="Lista de productos">
                  <thead>
                    <tr>
                      <th scope="col">Código</th>
                      <th scope="col">Nombre</th>
                      <th scope="col">Categoría</th>
                      <th scope="col">Precio</th>
                      <th scope="col">Stock</th>
                      <th scope="col">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="product-row">
                        <td>{product.barcode || '---'}</td>
                        <td className="product-name">{product.name}</td>
                        <td>{product.Category?.name || 'Sin categoría'}</td>
                        <td className="product-price">${product.price}</td>
                        <td className={`product-stock ${product.stock <= 5 ? 'low-stock' : ''}`}>
                          {product.stock}
                          {product.stock <= 5 && (
                            <span className="low-stock-indicator" 
                              onMouseEnter={() => toast.warning(`¡Stock bajo! Solo quedan ${product.stock} unidades`, {
                                autoClose: 3000,
                                icon: "⚠️",
                                toastId: `low-stock-${product.id}`
                              })}
                            >!</span>
                          )}
                        </td>
                        <td className="product-actions">
                          <button 
                            className="action-button edit-button" 
                            onClick={() => handleEditProduct(product)}
                            title="Editar producto"
                            aria-label={`Editar ${product.name}`}
                          >
                            <i className="icon-edit"></i>
                          </button>
                          <button 
                            className="action-button delete-button" 
                            onClick={() => handleDeleteProduct(product.id)}
                            title="Eliminar producto"
                            aria-label={`Eliminar ${product.name}`}
                          >
                            <i className="icon-delete"></i>
                          </button>
                          <button 
                            className="action-button view-button" 
                            onClick={() => handleViewProduct(product)}
                            title="Ver detalles del producto"
                            aria-label={`Ver detalles de ${product.name}`}
                          >
                            <i className="icon-view"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </main>
        </>
      )}

      {showProductForm && (
        <div className="product-form-overlay">
          <ProductForm 
            product={editingProduct}
            categories={categories}
            onSave={handleSaveProduct}
            onCancel={handleCancelForm}
          />
        </div>
      )}

      {showProductDetails && viewingProduct && (
        <ProductDetails 
          product={viewingProduct}
          onClose={handleCloseDetails}
        />
      )}

      <footer className="app-footer">
        <p>Administrador de inventario v1.0 | Desarrollado en México</p>
      </footer>
    </div>
  );
}

export default App;
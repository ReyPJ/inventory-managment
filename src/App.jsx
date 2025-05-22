import React, { useEffect, useState, useRef } from 'react';
import { 
  getAllActiveProducts,
  getAllCategories, 
  createProduct, 
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductByBarcode,
  createCategory,
  updateCategory,
  deleteCategory,
  updateProductsAfterSync,
  purgeDeletedProducts,
  updateCategoriesAfterSync,
  purgeDeletedCategories
} from './utils/ipcRenderer';
import './styles/App.css';
import ProductForm from './components/ProductForm';
import ProductDetails from './components/ProductDetails';
import CategoryManagement from './components/CategoryManagement';
import InventoryStats from './components/InventoryStats';
import SyncSettings from './components/SyncSettings';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { loadSavedConfig } from './utils/syncService';

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
  const [showSyncSettings, setShowSyncSettings] = useState(false);
  const barcodeInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  
  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, []);
  
  // Función para cargar o recargar los datos
  const loadData = async () => {
    setLoading(true);
    try {
      console.log("🔍 Cargando productos activos...");
      // Usar getAllActiveProducts para excluir productos eliminados localmente
      const productsData = await getAllActiveProducts();
      console.log(`✅ Productos cargados: ${productsData.length}`, productsData);
      setProducts(productsData);
      
      console.log("🔍 Cargando categorías...");
      const categoriesData = await getAllCategories();
      console.log(`✅ Categorías cargadas: ${categoriesData.length}`, categoriesData);
      setCategories(categoriesData);
      
      // Verificar si hay configuración de sincronización
      loadSavedConfig();
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
        // Cargamos todos y filtramos en el cliente
        console.log("📋 Obteniendo todos los productos activos para filtrar...");
        const allProducts = await getAllActiveProducts();
        console.log(`📦 Productos obtenidos: ${allProducts.length}`);
        
        const filtered = allProducts.filter(
          product => product.CategoryId === parseInt(selectedCategory)
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
    
    filterProductsByCategory();
  }, [selectedCategory, searchTerm]);

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

  // Buscar producto por código de barras, luego, si existe preguntar si quiere agregar 1 al stock
  // actual del producto (sera un boton de agregado rapido)
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
  
  // Agregar la función para completar la acción después de confirmar
  const handleConfirmAction = async () => {
    try {
      if (!productToConfirm) return;
      
      setLoading(true);
      const oldStock = productToConfirm.stock;
      const newStock = oldStock + 1;
      
      // Mostrar un toast claro ANTES de actualizar (para asegurar que se ve)
      toast.info(
        <div>
          <strong>Agregando unidad...</strong>
          <div className="toast-details">
            Producto: {productToConfirm.name}
          </div>
        </div>,
        {
          icon: "⏳",
          autoClose: 2000
        }
      );
      
      // Actualizar el producto
      await updateProduct(productToConfirm.id, { stock: newStock });
      
      // Recargar datos
      await loadData();
      
      // Toast de CONFIRMACIÓN después de actualizar
      setTimeout(() => {
        toast.success(
          <div>
            <strong>¡Producto actualizado con éxito!</strong>
            <div className="toast-details">
              Se agregó 1 unidad de {productToConfirm.name}
              <br />
              Stock anterior: {oldStock} → Nuevo stock: {newStock}
            </div>
          </div>,
          {
            icon: "✅",
            autoClose: 5000
          }
        );
      }, 500);
      
      // Limpiar estados
      setProductToConfirm(null);
      setConfirmAction(null);
      setShowQuickAdd(false);
      setBarcodeInput('');
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      toast.error('Error al actualizar el inventario', {
        autoClose: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  // Agregar la función para cancelar la acción
  const handleCancelConfirm = () => {
    toast.info("Operación cancelada", {
      icon: "❌",
      autoClose: 2000
    });
    setProductToConfirm(null);
    setConfirmAction(null);
  };

  // Búsqueda por código de barras
  const handleBarcodeSearch = async (e) => {
    const barcode = e.target.value;
    console.log("Entrada de código:", barcode, "Tecla:", e.key || "cambio");
    setBarcodeInput(barcode);
    
    // Mostrar un toast inmediato como feedback al usuario
    if (e.key === 'Enter' && barcode.trim()) {
      // Toast inmediato para confirmar que se está procesando
      toast.info(
        <div>
          <strong>Buscando código...</strong>
          <div className="toast-details">
            Procesando código de barras: {barcode}
          </div>
        </div>,
        {
          icon: "🔎",
          autoClose: 2000,
          position: "top-center"
        }
      );
      
      try {
        console.log("Iniciando búsqueda de producto con código:", barcode);
        setLoading(true);
        setError(null);
        const product = await getProductByBarcode(barcode);
        console.log("Resultado de búsqueda:", product ? "Producto encontrado" : "No encontrado");
        
        if (product) {
          // Si encontramos el producto, mostramos solo ese
          setProducts([product]);
          
          console.log("Mostrando toast de éxito para:", product.name);
          // Usar setTimeout para asegurar que el toast aparezca
          setTimeout(() => {
            toast.success(
              <div>
                <strong>Producto encontrado</strong>
                <div className="toast-details">
                  {product.name} (Código: {barcode})
                </div>
              </div>,
              {
                icon: "✅",
                position: "top-center",
                autoClose: 3000
              }
            );
          }, 300);
        } else {
          console.log("Mostrando toast de producto no encontrado");
          // Usar setTimeout para asegurar que el toast aparezca
          setTimeout(() => {
            toast.info(
              <div>
                <strong>Código no registrado</strong>
                <div className="toast-details">
                  No se encontró ningún producto con el código {barcode}.<br/>
                  Puedes agregar un nuevo producto usando el botón "Agregar Producto".
                </div>
              </div>,
              {
                icon: "🔍",
                autoClose: 5000
              }
            );
          }, 300);
          
          // Cargar todos los productos nuevamente (o mantener la búsqueda actual)
          if (searchTerm) {
            await handleSearch();
          } else {
            await loadData();
          }
        }
      } catch (error) {
        console.error('Error buscando por código de barras:', error);
        setError('Error al buscar el código de barras. Por favor, intenta nuevamente.');
        
        setTimeout(() => {
          toast.error(
            <div>
              <strong>Error al buscar</strong>
              <div className="toast-details">
                No se pudo procesar el código {barcode}
              </div>
            </div>,
            {
              autoClose: 4000
            }
          );
        }, 300);
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
  
  // Ahora, agregamos el botón de acción para quitar 1 en la tabla
  // Buscar la parte donde están las acciones de la tabla (botones de Editar, Eliminar, Ver)
  const handleQuickRemoveInTable = (product) => {
    if (product.stock <= 0) {
      toast.warning(`No hay unidades disponibles de ${product.name} para quitar`, {
        icon: "⚠️",
        autoClose: 3000
      });
      return;
    }
    
    // Establecer estados y mostrar toast
    setProductToConfirm(product);
    setRemoveQuantity(1);
    setShowRemoveConfirm(true);
    
    toast.info(`Selecciona cuántas unidades quitar de ${product.name}`, {
      icon: "🔢",
      autoClose: 2000
    });
  };
  
  const handleReduceProductStock = async () => {
    try {
      if (!productToConfirm) return;
      
      // Toast inicial antes de comenzar la operación
      toast.info(
        <div>
          <strong>Procesando cambio de inventario...</strong>
          <div className="toast-details">
            Quitando {removeQuantity} {removeQuantity === 1 ? 'unidad' : 'unidades'} de {productToConfirm.name}
          </div>
        </div>,
        {
          icon: "⏳",
          autoClose: 2000
        }
      );
      
      setLoading(true);
      const oldStock = productToConfirm.stock;
      const newStock = Math.max(0, oldStock - removeQuantity);
      
      // Actualizar el producto
      await updateProduct(productToConfirm.id, { stock: newStock });
      
      // Recargar datos
      await loadData();
      
      // Toast de CONFIRMACIÓN después de actualizar
      setTimeout(() => {
        toast.success(
          <div>
            <strong>¡Stock reducido con éxito!</strong>
            <div className="toast-details">
              {removeQuantity === 1 
                ? `Se quitó 1 unidad de ${productToConfirm.name}`
                : `Se quitaron ${removeQuantity} unidades de ${productToConfirm.name}`
              }
              <br />
              Stock anterior: {oldStock} → Nuevo stock: {newStock}
            </div>
          </div>,
          {
            icon: "✅",
            autoClose: 5000
          }
        );
        
        // Toasts adicionales según el nivel de stock
        if (newStock <= 5 && newStock > 0) {
          setTimeout(() => {
            toast.warning(
              <div>
                <strong>¡Stock bajo!</strong>
                <div className="toast-details">
                  Solo quedan {newStock} unidades de {productToConfirm.name}
                </div>
              </div>,
              {
                icon: "⚠️",
                autoClose: 5000
              }
            );
          }, 300);
        } else if (newStock === 0) {
          setTimeout(() => {
            toast.error(
              <div>
                <strong>¡Producto agotado!</strong>
                <div className="toast-details">
                  {productToConfirm.name} se ha quedado sin stock
                </div>
              </div>,
              {
                icon: "🚨",
                autoClose: 5000
              }
            );
          }, 300);
        }
      }, 500);
    } catch (error) {
      console.error('Error al reducir stock:', error);
      toast.error('Error al actualizar el inventario', {
        autoClose: 4000
      });
    } finally {
      setLoading(false);
      setProductToConfirm(null);
      setShowRemoveConfirm(false);
      setRemoveQuantity(1);
    }
  };
  
  // Una prueba rápida para asegurarnos que los toasts funcionan
  useEffect(() => {
    // Usamos una ref en memoria en lugar de sessionStorage para desarrollo
    if (!hasShownWelcome) {
      // Marcamos que ya mostramos antes de ejecutar el toast
      setHasShownWelcome(true);
      
      setTimeout(() => {
        toast.info(
          <div>
            <strong>Bienvenido al Sistema de Inventario</strong>
            <div className="toast-details">
              Usa el escáner de códigos de barras para buscar o actualizar productos
            </div>
          </div>,
          {
            icon: "👋",
            autoClose: 5000,
            position: "top-center",
            // Usar un ID único para este toast para evitar duplicados
            toastId: "welcome-toast"
          }
        );
      }, 1000);
    }
  }, [hasShownWelcome]); // Dependemos del estado para evitar loops
  
  // Manejador de sincronización completa
  const handleSyncComplete = async (result) => {
    if (result && result.success) {
      try {
        setLoading(true);
        
        // Actualizar productos locales con los datos del servidor
        const updateResult = await updateProductsAfterSync(result);
        
        // Actualizar categorías locales con los datos del servidor
        const categoryUpdateResult = await updateCategoriesAfterSync(result);
        
        // Eliminar físicamente los productos marcados como eliminados
        const purgedProductsCount = await purgeDeletedProducts();
        
        // Eliminar físicamente las categorías marcadas como eliminadas
        const purgedCategoriesCount = await purgeDeletedCategories();
        
        // Mensaje básico de sincronización
        let syncMessage = `Sincronización completada:\n` +
          `Productos: ${updateResult.updated} actualizados, ${updateResult.added} agregados, ${updateResult.skipped || 0} omitidos, ${purgedProductsCount} purgados\n` +
          `Categorías: ${categoryUpdateResult?.updated || 0} actualizadas, ${categoryUpdateResult?.added || 0} agregadas, ${categoryUpdateResult?.skipped || 0} omitidas, ${purgedCategoriesCount || 0} purgadas`;
        
        // Si hay productos omitidos, agregar detalle
        if (updateResult.skipped > 0 && updateResult.skippedProducts?.length > 0) {
          // Agregar hasta 4 productos omitidos para no hacer el mensaje demasiado largo
          const maxToShow = Math.min(updateResult.skippedProducts.length, 4);
          syncMessage += `\n\nDetalle de productos omitidos:`;
          
          for (let i = 0; i < maxToShow; i++) {
            const p = updateResult.skippedProducts[i];
            syncMessage += `\n- ${p.name || p.barcode}: ${p.reason}`;
          }
          
          // Si hay más productos omitidos, indicarlo
          if (updateResult.skippedProducts.length > maxToShow) {
            syncMessage += `\n- Y ${updateResult.skippedProducts.length - maxToShow} más...`;
          }
          
          // Mostrar mensaje en consola para referencia completa
          console.log("Lista completa de productos omitidos:", updateResult.skippedProducts);
        }
        
        toast.success(syncMessage);
        
        // Recargar los datos para reflejar los cambios
        await loadData();
      } catch (error) {
        toast.error(`Error al procesar resultados de sincronización: ${error.message}`);
      } finally {
        setLoading(false);
      }
    } else if (result && !result.success) {
      toast.error(`Error en sincronización: ${result.error}`);
    }
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
        style={{ zIndex: 9999 }}
      />
      
      <header className="app-header">
        <h1>Sistema de Inventario</h1>
        <div className="header-actions">
          <div className="quick-add-dropdown" ref={dropdownRef}>
            <button
              className='quick-add-button'
              onClick={handleQuickAddForm}
              aria-label="Agregar producto por código de barras"
            >
              <i className="icon-barcode"></i>
              Agregar Rápido
            </button>
            
            {showQuickAdd && (
              <div className="quick-add-dropdown-content">
                <h3>Agregar +1 al inventario</h3>
                <input
                  type="text"
                  placeholder="Escanear código de barras aquí..."
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
                  className="barcode-input"
                  aria-label="Escanear código de barras"
                  ref={barcodeInputRef}
                  autoFocus
                />
                <div className="quick-add-buttons">
                  {confirmAction === 'quickAdd' && productToConfirm ? (
                    <div className="confirm-action">
                      <p>¿Agregar 1 unidad de <strong>{productToConfirm.name}</strong>?</p>
                      <div className="confirm-buttons">
                        <button
                          className="primary-button"
                          onClick={handleConfirmAction}
                        >
                          Confirmar
                        </button>
                        <button
                          className="secondary-button"
                          onClick={handleCancelConfirm}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="quick-add-button-group">
                      <button
                        className="primary-button action-button-equal"
                        onClick={handleQuickAdd}
                        aria-label="Agregar +1 al inventario"
                      >
                        <i className="icon-add"></i>
                        Agregar +1
                      </button>
                      <button
                        className="secondary-button action-button-equal"
                        onClick={() => setShowQuickAdd(false)}
                        aria-label="Cancelar"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
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
          <button 
            className="sync-button"
            onClick={() => setShowSyncSettings(!showSyncSettings)}
          >
            <i className="icon-sync"></i> Sincronización
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

      {/* Configuración de sincronización */}
      {showSyncSettings && (
        <SyncSettings
          onSyncComplete={handleSyncComplete}
        />
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
                onChange={(e) => setBarcodeInput(e.target.value)}
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
                          <button 
                            className="action-button decrease-button" 
                            onClick={() => handleQuickRemoveInTable(product)}
                            title="Quitar 1 unidad"
                            aria-label={`Quitar 1 unidad de ${product.name}`}
                            disabled={product.stock <= 0}
                          >
                            <i className="icon-remove"></i>
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

      {/* Modal para quitar unidades del stock */}
      {showRemoveConfirm && productToConfirm && (
        <div className="product-form-overlay">
          <div className="remove-stock-container">
            <h2>Quitar unidades del inventario</h2>
            <p>
              Producto: <strong>{productToConfirm.name}</strong>
              <br />
              Stock actual: <strong>{productToConfirm.stock}</strong>
            </p>
            
            <div className="remove-stock-form">
              <label htmlFor="removeQuantity">Cantidad a quitar:</label>
              <input
                id="removeQuantity"
                type="number"
                min="1"
                max={productToConfirm.stock}
                value={removeQuantity}
                onChange={(e) => setRemoveQuantity(
                  Math.min(
                    Math.max(1, parseInt(e.target.value) || 1),
                    productToConfirm.stock
                  )
                )}
                className="quantity-input"
              />
              
              <div className="quantity-buttons">
                <button 
                  className="quantity-btn decrease"
                  onClick={() => setRemoveQuantity(prev => Math.max(1, prev - 1))}
                  disabled={removeQuantity <= 1}
                >
                  -
                </button>
                <span className="quantity-display">{removeQuantity}</span>
                <button 
                  className="quantity-btn increase"
                  onClick={() => setRemoveQuantity(prev => Math.min(productToConfirm.stock, prev + 1))}
                  disabled={removeQuantity >= productToConfirm.stock}
                >
                  +
                </button>
              </div>
              
              <div className="confirm-buttons">
                <button
                  className="primary-button"
                  onClick={handleReduceProductStock}
                >
                  Confirmar
                </button>
                <button
                  className="secondary-button"
                  onClick={() => {
                    setShowRemoveConfirm(false);
                    setProductToConfirm(null);
                    setRemoveQuantity(1);
                    toast.info("Operación cancelada", {
                      icon: "❌",
                      autoClose: 2000
                    });
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
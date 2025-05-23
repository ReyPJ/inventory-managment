import React, { useState } from 'react';
import '../styles/CategoryManagement.css';
import { toast } from 'react-toastify';

function CategoryManagement({ categories, onAddCategory, onEditCategory, onDeleteCategory }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddClick = () => {
    setShowAddForm(true);
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
  };

  const handleEditClick = (category) => {
    setShowAddForm(true);
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('El nombre de la categoría es obligatorio');
      return;
    }
    
    if (editingCategory) {
      onEditCategory({ ...editingCategory, ...formData });
    } else {
      onAddCategory(formData);
    }
    
    // Resetear formulario
    setShowAddForm(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingCategory(null);
  };

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setShowDeleteConfirm(true);
  };
  
  const confirmDelete = () => {
    if (categoryToDelete) {
      onDeleteCategory(categoryToDelete.id);
      setShowDeleteConfirm(false);
      setCategoryToDelete(null);
    }
  };
  
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setCategoryToDelete(null);
  };

  return (
    <div className="category-management">
      <div className="category-header">
        <h2>Administrar Categorías</h2>
        <button className="add-button" onClick={handleAddClick}>
          Nueva Categoría
        </button>
      </div>
      
      {showAddForm && (
        <div className="category-form">
          <h3>{editingCategory ? 'Editar Categoría' : 'Agregar Categoría'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Nombre:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Descripción:</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
              ></textarea>
            </div>
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={handleCancel}>
                Cancelar
              </button>
              <button type="submit" className="save-btn">
                {editingCategory ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="categories-list">
        {categories.length === 0 ? (
          <p className="no-categories">No hay categorías definidas</p>
        ) : (
          categories.map(category => (
            <div className="category-item" key={category.id}>
              <div className="category-info">
                <h4>{category.name}</h4>
                {category.description && <p>{category.description}</p>}
              </div>
              <div className="category-actions">
                <button className="edit-btn" onClick={() => handleEditClick(category)}>
                  Editar
                </button>
                <button className="delete-btn" onClick={() => handleDeleteClick(category)}>
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {showDeleteConfirm && categoryToDelete && (
        <div className="confirmation-dialog">
          <div className="confirmation-content">
            <h3>Confirmar Eliminación</h3>
            <p>¿Estás seguro de eliminar la categoría "{categoryToDelete.name}"?</p>
            <div className="confirmation-actions">
              <button onClick={cancelDelete} className="cancel-button">Cancelar</button>
              <button onClick={confirmDelete} className="confirm-button">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoryManagement; 
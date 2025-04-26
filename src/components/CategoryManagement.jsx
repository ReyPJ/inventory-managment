import React, { useState } from 'react';
import '../styles/CategoryManagement.css';

function CategoryManagement({ categories, onAddCategory, onEditCategory, onDeleteCategory }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

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
      alert('El nombre de la categoría es obligatorio');
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
    if (window.confirm(`¿Estás seguro de eliminar la categoría "${category.name}"?`)) {
      onDeleteCategory(category.id);
    }
  };

  return (
    <div className="category-management">
      <div className="category-management-header">
        <h2>Gestión de Categorías</h2>
        {!showAddForm && (
          <button className="add-category-button" onClick={handleAddClick}>
            <i className="icon-add"></i> Nueva Categoría
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="category-form-container">
          <h3>{editingCategory ? 'Editar Categoría' : 'Agregar Categoría'}</h3>
          <form onSubmit={handleSubmit} className="category-form">
            <div className="form-group">
              <label htmlFor="name">Nombre*</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Nombre de la categoría"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Descripción</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Descripción opcional"
                rows="2"
              ></textarea>
            </div>

            <div className="form-actions">
              <button type="button" className="cancel-button" onClick={handleCancel}>
                Cancelar
              </button>
              <button type="submit" className="save-button">
                {editingCategory ? 'Guardar Cambios' : 'Agregar Categoría'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="categories-list">
        {categories.length === 0 ? (
          <div className="empty-categories">
            <p>No hay categorías disponibles</p>
            {!showAddForm && (
              <button className="add-category-button-empty" onClick={handleAddClick}>
                Crear primera categoría
              </button>
            )}
          </div>
        ) : (
          <div className="categories-grid">
            {categories.map((category) => (
              <div key={category.id} className="category-card">
                <div className="category-content">
                  <h4>{category.name}</h4>
                  <p>{category.description || 'Sin descripción'}</p>
                </div>
                <div className="category-actions">
                  <button
                    className="category-edit-button"
                    onClick={() => handleEditClick(category)}
                    title="Editar"
                  >
                    <i className="icon-edit"></i>
                  </button>
                  <button
                    className="category-delete-button"
                    onClick={() => handleDeleteClick(category)}
                    title="Eliminar"
                  >
                    <i className="icon-delete"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoryManagement; 
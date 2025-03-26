
const Category = require('../models/category');  

async function getAllCategories(req, res) {
  try {
    const categories = await Category.findAll();  
    res.json(categories);                         
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' }); 
  }
}

async function getCategoryById(req, res) {
  try {
    const id = req.params.id;                     
    const category = await Category.findByPk(id); 
    if (!category) {
      return res.status(404).json({ error: 'Category not found' }); 
    }
    res.json(category);  
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function createCategory(req, res) {
  try {
    const { name, description } = req.body;    
    const newCategory = await Category.create({ name, description });
    res.status(201).json(newCategory);         
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateCategory(req, res) {
  try {
    const id = req.params.id;
    const { name, description } = req.body;
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    if (name !== undefined) category.name = name;
    if (description !== undefined) category.description = description;
    await category.save();  
    res.json(category);     
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteCategory(req, res) {
  try {
    const id = req.params.id;
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    await category.destroy();               
    res.status(204).send();                 
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};

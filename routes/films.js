const express = require('express');
const router = express.Router();
const filmController = require('../controllers/filmController');

// Get all films
router.get('/', filmController.getAllFilms);

// Get film by ID
router.get('/:id', filmController.getFilmById);

// Create new film
router.post('/', filmController.createFilm);

// Update existing film
router.put('/:id', filmController.updateFilm);

// Delete film
router.delete('/:id', filmController.deleteFilm);

module.exports = router;
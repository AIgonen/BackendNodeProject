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

// Search films by title
router.get('/search/title', filmController.searchFilmsByTitle);

// Search films by actor
router.get('/search/actor', filmController.searchFilmsByActor);

// Search films by language
router.get('/search/language', filmController.searchFilmsByLanguage);

// Search films by category
router.get('/search/category', filmController.searchFilmsByCategory);

// Get actors in a film
router.get('/:id/actors', filmController.getActorsByFilm);

module.exports = router;
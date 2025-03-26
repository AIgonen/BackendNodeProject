const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'postgres'
});

const initModels = require('../models/init-models');
const models = initModels(sequelize);
const Film = models.film;

async function getAllFilms(req, res) {
  try {
    const films = await Film.findAll();
    res.json(films);
  } catch (error) {
    console.error('Error fetching films:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getFilmById(req, res) {
  try {
    const id = req.params.id;
    const film = await Film.findOne({
      where: { film_id: id }
    });
    if (!film) {
      return res.status(404).json({ error: 'Film not found' });
    }
    res.json(film);
  } catch (error) {
    console.error('Error fetching film:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function createFilm(req, res) {
  try {
    const { title, release_year, genre, director, language_id, description } = req.body;
    let filmDescription = description || "";
    if (!filmDescription && (genre || director)) {
      filmDescription = `Genre: ${genre || "N/A"}, Director: ${director || "N/A"}`;
    }
    const newFilm = await Film.create({ 
      title, 
      release_year, 
      language_id,
      description: filmDescription,
      rental_duration: 3,
      rental_rate: 4.99,
      replacement_cost: 19.99
    });
    res.status(201).json(newFilm);
  } catch (error) {
    console.error('Error creating film:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateFilm(req, res) {
  try {
    const id = req.params.id;
    const film = await Film.findByPk(id);
    if (!film) {
      return res.status(404).json({ error: 'Film not found' });
    }
    const { title, release_year, genre, director, language_id, description } = req.body;
    if (title !== undefined) film.title = title;
    if (release_year !== undefined) film.release_year = release_year;
    if (language_id !== undefined) film.language_id = language_id;
    if (description !== undefined) {
      film.description = description;
    } else if (genre || director) {
      film.description = `Genre: ${genre || "N/A"}, Director: ${director || "N/A"}`;
    }
    await film.save();
    res.json(film);
  } catch (error) {
    console.error('Error updating film:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteFilm(req, res) {
  try {
    const id = req.params.id;
    const film = await Film.findByPk(id);
    if (!film) {
      return res.status(404).json({ error: 'Film not found' });
    }
    await film.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting film:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getAllFilms,
  getFilmById,
  createFilm,
  updateFilm,
  deleteFilm
};
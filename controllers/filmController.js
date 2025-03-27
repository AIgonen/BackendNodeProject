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

// Otsi fime title järgi
async function searchFilmsByTitle(req, res) {
  try {
    const { title } = req.query; 
    const films = await Film.findAll({
      where: {
        title: { [Sequelize.Op.iLike]: `%${title}%` } 
      }
    });
    res.json(films);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Otsi fime actor järgi
async function searchFilmsByActor(req, res) {
  try {
    const { actorName } = req.query; 
    const films = await Film.findAll({
      include: [
        {
          model: models.actor,
          as: 'actor_id_actors',
          where: {
            [Sequelize.Op.or]: [
              { first_name: { [Sequelize.Op.iLike]: `%${actorName}%` } },
              { last_name: { [Sequelize.Op.iLike]: `%${actorName}%` } }
            ]
          }
        }
      ]
    });
    res.json(films);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Otsi fime language järgi
async function searchFilmsByLanguage(req, res) {
  try {
    const { language } = req.query; 
    const films = await Film.findAll({
      include: [
        {
          model: models.language,
          as: 'language',
          where: {
            name: { [Sequelize.Op.iLike]: `%${language}%` }
          }
        }
      ]
    });
    res.json(films);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Otsi fime category järgi
async function searchFilmsByCategory(req, res) {
  try {
    const { category } = req.query;
    const films = await Film.findAll({
      include: [
        {
          model: models.category,
          as: 'category_id_categories',
          where: {
            name: { [Sequelize.Op.iLike]: `%${category}%` }
          }
        }
      ]
    });
    res.json(films);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Otsi actors in a film
async function getActorsByFilm(req, res) {
  try {
    const { id } = req.params; 
    const film = await Film.findByPk(id, {
      include: [
        {
          model: models.actor,
          as: 'actor_id_actors'
        }
      ]
    });
    if (!film) {
      return res.status(404).json({ error: 'Film not found' });
    }
    res.json(film.actor_id_actors); 
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getAllFilms,
  getFilmById,
  createFilm,
  updateFilm,
  deleteFilm,
  searchFilmsByTitle,
  searchFilmsByActor,
  searchFilmsByLanguage,
  searchFilmsByCategory,
  getActorsByFilm
};
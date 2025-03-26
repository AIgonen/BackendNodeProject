require('dotenv').config();

const express = require('express')
const app = express()
const db = require('./config/database')

app.get('/', function (req, res) {
    res.send('Movies')
})
app.get('/categories', (req, res) => {
    db.any('SELECT * FROM category')
        .then(data => {
            res.send(data)
        })
        .catch(error => {
            console.error('Error:', error);
        });
})

// app.get('/api/films/:filmId', async (req, res) => {
//     const filmId = req.params.filmId
//     try {
//         const film = await db.oneOrNone('SELECT * FROM film WHERE film_id = $1', [filmId])
//         if (film) {
//             res.json(film)
//         } else {
//             res.status(404).json({
//                 error: 'Film not found'
//             })
//         }
//     } catch (error) {
//         console.error('Error getting information about the film:', error)
//         res.status(500).json({ error: 'Server Error' })
//     }
// })

app.use(express.json())
app.post('/api/actors', async (req, res) => {
    const { firstname, lastname, films } = req.body;
    try {
        const newActor = await db.one(`INSERT INTO movies.actor(first_name, last_name, last_update)
VALUES($1, $2, CURRENT_TIMESTAMP) RETURNING *`, [firstname, lastname])
        if (films && films.length > 0) {
            await Promise.all(films.map(async (filmId) => {
                await db.none('INSERT INTO movies.film_actor(actor_id, film_id, last_update) VALUES($1, $2, CURRENT_TIMESTAMP)', [newActor.actor_id, filmId])
            }));
        }
        res.status(201).json(newActor)
    } catch (error) {
        console.error(' Error when adding an actor:', error)
        res.status(500).json({ error: 'Server error' })
    }
})

app.delete('/api/actors/:id', async (req, res) => {
    const actorId = req.params.id
    try {
        const existingActor = await db.oneOrNone('SELECT * FROM movies.actor WHERE actor_id = $1',
            [actorId])
        if (existingActor) {
            const relatedFilms = await db.any('SELECT * FROM movies.film_actor WHERE actor_id = $1',
                [actorId])
            if (relatedFilms.length > 0) {
                await db.none('DELETE FROM movies.film_actor WHERE actor_id = $1', [actorId])
            }
            await db.none('DELETE FROM movies.actor WHERE actor_id = $1', [actorId])
            res.status(204).json({ message: 'Actor successfully deleted' })
        } else {
            res.status(404).json({ error: 'Actor not found' })
        }
    } catch (error) {
        console.error(' Error on deleting an actor:', error)
        res.status(500).json({ error: ' Server Error' })
    }
})


const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,        
    dialect: 'postgres'               
});

const initModels = require('./models/init-models');
const models = initModels(sequelize);

sequelize.authenticate()
    .then(() => {
        console.log('Connection to the database has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

const categoriesRouter = require('./routes/categories');
app.use('/api/categories', categoriesRouter);

const filmsRouter = require('./routes/films');
app.use('/api/films', filmsRouter);

app.listen(3000)

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const db = require('./db');
const { success, error } = require('./functions');
const cors = require('cors');

const app = express();
const config = {
    port: process.env.PORT || 8081,
    rootAPI: process.env.API_ROOT || '/api/v1'
};

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cors());

// Routes CRUD
const router = express.Router();

// GET all members
router.get('/members', (req, res) => {
    db.query('SELECT * FROM members', (err, results) => {
        if (err) {
            return res.status(500).json(error('Erreur DB: ' + err.message));
        }
        res.json(success(results));
    });
});

// GET member by id
router.get('/members/:id', (req, res) => {
    const id = req.params.id;
    db.query('SELECT * FROM members WHERE id = ?', [id], (err, results) => {
        if (err) {
            return res.status(500).json(error('Erreur DB: ' + err.message));
        }
        if (results.length === 0) {
            return res.status(404).json(error('Membre non trouvé'));
        }
        res.json(success(results[0]));
    });
});

// POST new member
router.post('/members', (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).json(error('Name et email sont requis'));
    }
    
    db.query('INSERT INTO members (name, email) VALUES (?, ?)', [name, email], (err, result) => {
        if (err) {
            return res.status(500).json(error('Erreur DB: ' + err.message));
        }
        db.query('SELECT * FROM members WHERE id = ?', [result.insertId], (err, newMember) => {
            if (err) {
                return res.status(500).json(error('Erreur DB: ' + err.message));
            }
            res.status(201).json(success(newMember[0]));
        });
    });
});

// PUT update member
router.put('/members/:id', (req, res) => {
    const id = req.params.id;
    const { name, email } = req.body;
    
    db.query('UPDATE members SET name = ?, email = ? WHERE id = ?', [name, email, id], (err, result) => {
        if (err) {
            return res.status(500).json(error('Erreur DB: ' + err.message));
        }
        if (result.affectedRows === 0) {
            return res.status(404).json(error('Membre non trouvé'));
        }
        
        db.query('SELECT * FROM members WHERE id = ?', [id], (err, updatedMember) => {
            if (err) {
                return res.status(500).json(error('Erreur DB: ' + err.message));
            }
            res.json(success(updatedMember[0]));
        });
    });
});

// DELETE member
router.delete('/members/:id', (req, res) => {
    const id = req.params.id;
    
    db.query('DELETE FROM members WHERE id = ?', [id], (err, result) => {
        if (err) {
            return res.status(500).json(error('Erreur DB: ' + err.message));
        }
        if (result.affectedRows === 0) {
            return res.status(404).json(error('Membre non trouvé'));
        }
        res.json(success({ message: 'Membre supprimé avec succès' }));
    });
});

app.use(config.rootAPI, router);

app.listen(config.port, () => {
    console.log(`Serveur démarré sur le port ${config.port}`);
    console.log(`API disponible sur http://localhost:${config.port}${config.rootAPI}`);
});
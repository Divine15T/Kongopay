const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) => {
    //1. Récupérer phone, nom, identity
    const { phone, nom, identity } = req.body;
    //2. Valider les champs
    if (!phone || !nom || !identity) {
        return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    //3. Vérifier si le téléphone existe déjà
    const existingUser = await pool.query('SELECT id FROM Utilisateur WHERE telephone = $1', [phone]);
    if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'Ce numéro de téléphone est déjà enregistré' });
    }
    //4. Générer un UUID pour l'utilisateur
    const userId = require('crypto').randomUUID();
    //5. Insérer dans Utilisateur
    await pool.query(
        'INSERT INTO Utilisateur (id, telephone, nom, statut) VALUES ($1, $2, $3, $4)',
        [userId, phone, nom, 'actif']
    );
    //6. Générer un UUID pour le portefeuille
    const walletId = require('crypto').randomUUID();
    //7. Insérer dans Portefeuille (Solde initial= 0 ou 1000)
    await pool.query(
        'INSERT INTO Portefeuille (id, utilisateur_id, solde) VALUES ($1, $2, $3)',
        [walletId, userId, 0]
    );
    //8. Générer un PIN (4 chiffres)
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    //9. Générer une clé secrète
    const secretKey = require('crypto').randomBytes(32).toString('hex');
    //10. Retourner {pin, secret_key, user_id, wallet_id}
    res.json({ pin, secret_key: secretKey, user_id: userId, wallet_id: walletId });
});

module.exports = router;
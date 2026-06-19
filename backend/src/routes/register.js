const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) => {
    //1. Récupérer phone, nom, identity
    const { phone, nom, identity } = req.body;

console.log('Tentative d inscription avec:', { phone, nom, identity });

    //2. Valider les champs
    if (!phone || !nom || !identity) {
        return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    //3. Vérifier si le téléphone existe déjà
    const existingUser = await pool.query('SELECT id FROM utilisateur WHERE telephone = $1', [phone]);
    if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'Ce numéro de téléphone est déjà enregistré' });
    }
    // 3bis. Vérifier si l'identité existe déjà
    const existingIdentity = await pool.query('SELECT id FROM utilisateur WHERE identity = $1', [identity]);
    if (existingIdentity.rows.length > 0) {
        return res.status(400).json({ error: 'Cette pièce d\'identité est déjà utilisée pour un autre compte' });
     }
    //4. Générer un UUID pour l'utilisateur
    const userId = require('crypto').randomUUID();
    //5. Insérer dans utilisateur
    await pool.query(
        'INSERT INTO utilisateur (id, telephone, nom, statut, identity) VALUES ($1, $2, $3, $4, $5)',
        [userId, phone, nom, 'actif', identity]
    );
    //6. Générer un UUID pour le portefeuille
    const walletId = require('crypto').randomUUID();
    //7. Insérer dans portefeuille (Solde initial= 0 ou 10000)
    await pool.query(
        'INSERT INTO portefeuille (id, utilisateur_id, solde) VALUES ($1, $2, $3)',
        [walletId, userId, 10000]
    );
    //8. Générer un PIN (4 chiffres)
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    //9. Générer une clé secrète
    const secretKey = require('crypto').randomBytes(32).toString('hex');
    //10. Retourner {pin, secret_key, user_id, wallet_id}
    res.json({ pin, secret_key: secretKey, user_id: userId, wallet_id: walletId });
});

module.exports = router;
const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/by-phone', async (req, res) => {
    const { phone } = req.body;
    
    try {
        const result = await pool.query(
            `SELECT p.id as wallet_id 
             FROM portefeuille p 
             JOIN utilisateur u ON p.utilisateur_id = u.id 
             WHERE u.telephone = $1`,
            [phone]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Destinataire introuvable' });
        }
        
        res.json({ wallet_id: result.rows[0].wallet_id });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
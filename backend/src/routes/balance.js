const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) => {
    const { wallet_id } = req.body;
    
    if (!wallet_id) {
        return res.status(400).json({ error: 'wallet_id requis' });
    }
    
    try {
        const result = await pool.query(
            'SELECT solde FROM portefeuille WHERE id = $1',
            [wallet_id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Portefeuille introuvable' });
        }
        
        res.json({ balance: result.rows[0].solde });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
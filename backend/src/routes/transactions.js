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
            `SELECT t.*, 
                    u1.nom as expediteur_nom,
                    u2.nom as destinataire_nom
             FROM transaction t
             JOIN portefeuille p1 ON t.portefeuille_expediteur_id = p1.id
             JOIN portefeuille p2 ON t.portefeuille_destinataire_id = p2.id
             JOIN utilisateur u1 ON p1.utilisateur_id = u1.id
             JOIN utilisateur u2 ON p2.utilisateur_id = u2.id
             WHERE p1.id = $1 OR p2.id = $1
             ORDER BY t.created_at DESC
             LIMIT 20`,
            [wallet_id]
        );
        
        const transactions = result.rows.map(tx => ({
            id: tx.id,
            amount: tx.amount,
            type: tx.type,
            status: tx.status,
            description: tx.type === 'transfert' ? 
                `Transfert ${tx.portefeuille_expediteur_id === wallet_id ? 'vers' : 'de'} ${tx.portefeuille_expediteur_id === wallet_id ? tx.destinataire_nom : tx.expediteur_nom}` : 
                tx.type,
            date: tx.created_at
        }));
        
        res.json({ transactions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const pool = require('../db');

// Toutes les transactions
router.get('/transactions', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                t.id,
                t.amount,
                t.type,
                t.reference,
                t.status,
                t.created_at,
                COALESCE(u1.telephone, 'Inconnu') as from_phone,
                COALESCE(u2.telephone, 'Inconnu') as to_phone
            FROM transaction t
            LEFT JOIN portefeuille p1 ON t.portefeuille_expediteur_id = p1.id
            LEFT JOIN portefeuille p2 ON t.portefeuille_destinataire_id = p2.id
            LEFT JOIN utilisateur u1 ON p1.utilisateur_id = u1.id
            LEFT JOIN utilisateur u2 ON p2.utilisateur_id = u2.id
            ORDER BY t.created_at DESC
            LIMIT 100
        `);
        
        res.json({ transactions: result.rows });
    } catch (error) {
        console.error('Erreur admin/transactions:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Bloquer un utilisateur
router.post('/block', async (req, res) => {
    const { user_id, block } = req.body;
    const statut = block ? 'bloque' : 'actif';
    
    try {
        await pool.query(
            'UPDATE utilisateur SET statut = $1 WHERE id = $2',
            [statut, user_id]
        );
        res.json({ success: true, statut });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Détection des fraudes (boucles de transactions)
router.get('/detect-loops', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                t1.portefeuille_expediteur_id, 
                t1.portefeuille_destinataire_id, 
                COUNT(*) as count
            FROM transaction t1
            WHERE EXISTS (
                SELECT 1 FROM transaction t2
                WHERE t2.portefeuille_expediteur_id = t1.portefeuille_destinataire_id
                AND t2.portefeuille_destinataire_id = t1.portefeuille_expediteur_id
            )
            GROUP BY t1.portefeuille_expediteur_id, t1.portefeuille_destinataire_id
        `);
        
        res.json({ suspicious_loops: result.rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
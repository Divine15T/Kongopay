const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) => {
    const { from_portefeuille_id, to_portefeuille_id, amount } = req.body;
    
if (!from_portefeuille_id || !to_portefeuille_id || !amount) {
        return res.status(400).json({ error: 'Champs manquants' });
    }    
if (amount <= 0) {
        return res.status(400).json({ error: 'Montant invalide' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const expediteur = await client.query(
            'SELECT id, solde FROM portefeuille WHERE id = $1 FOR UPDATE', 
            [from_portefeuille_id]
        );
        if (expediteur.rows.length === 0) {
            throw new Error('Portefeuille expéditeur introuvable');
        }

        const destinataire = await client.query(
            'SELECT id FROM portefeuille WHERE id = $1 FOR UPDATE', 
            [to_portefeuille_id]
        );

        const soldeActuel= parseInt(expediteur.rows[0].solde);
        if (soldeActuel < amount) {
            throw new Error('Solde insuffisant');
        }   
        await client.query(
            'UPDATE portefeuille SET solde = solde - $1, version=version + 1 WHERE id = $2',
            [amount, from_portefeuille_id]
        );  

        await client.query(
            'UPDATE portefeuille SET solde = solde + $1, version=version + 1 WHERE id = $2',
            [amount, to_portefeuille_id]
        );

        const reference = `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

        await client.query(
            `INSERT INTO transactions (id, amount, type, reference, portefeuille_expediteur_id, portefeuille_destinataire_id, status)
            VALUES (gen_random_uuid(), $1, 'transfert', $2, $3, $4, 'confirmed')`,
            [amount, reference, from_portefeuille_id, to_portefeuille_id]
        );

        await client.query('COMMIT');
        res.json({ message: 'Transfert réussi', reference });

    } catch (error) {
        await client.query('ROLLBACK');
        res.status(400).json({ error: error.message });
    }finally {
        client.release();
    }
});

module.exports = router;
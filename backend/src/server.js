require('dotenv').config();
const cors = require('cors'); 
const express = require('express');
const pool = require('./db');

const transferRoutes = require('./routes/transfer');
const registerRoutes = require('./routes/register');
const balanceRoutes = require('./routes/balance');
const transactionsRoutes = require('./routes/transactions');
const adminRoutes = require('./routes/admin');
const walletRoutes = require('./routes/wallet');


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());  
app.use(express.json());

app.use('/transfert', transferRoutes);
app.use('/register', registerRoutes);
app.use('/balance', balanceRoutes);
app.use('/transactions', transactionsRoutes);
app.use('/admin', adminRoutes);
app.use('/wallet', walletRoutes);

// Vérifier la connexion à la base de données
pool.query('SELECT NOW()', (err, result) => {
    if (err) {
        console.error(' Erreur de connexion à la base de données:', err.message);
        console.error('DATABASE_URL:', process.env.DATABASE_URL ? 'Configurée' : 'NON CONFIGURÉE');
        process.exit(1);
    } else {
        console.log(' Connecté à la base de données');
    }
});

app.listen(PORT, () => {
    console.log(` Serveur démarré sur le port ${PORT}`);
});

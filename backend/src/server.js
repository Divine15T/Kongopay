require('dotenv').config();
const cors = require('cors'); 
const express = require('express');
const transferRoutes = require('./routes/transfer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());  
app.use(express.json());
app.use('/transfert', transferRoutes);

const registerRoutes = require('./routes/register');
app.use('/register', registerRoutes);


const walletRoutes = require('./routes/wallet');
app.use('/wallet', walletRoutes);

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});

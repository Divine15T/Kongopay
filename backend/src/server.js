require('dotenv').config();
const express = require('express');
const transferRoutes = require('./routes/transfer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/transfert', transferRoutes);

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});

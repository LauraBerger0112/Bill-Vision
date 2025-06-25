const express = require('express');
const path = require('path');
const app = express();

// Servir arquivos estáticos do diretório atual
app.use(express.static(__dirname));

// Rota para a página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Frontend server running at http://localhost:${PORT}`);
}); 
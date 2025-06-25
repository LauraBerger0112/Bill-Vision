const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const connectDB = require('./config/database');
const User = require('./models/User');
const Report = require('./models/Report');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Chave secreta para JWT
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_muito_segura';

// Conectar ao MongoDB
connectDB();

// Rotas de autenticação
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email já cadastrado' });
        }
        const user = new User({ name, email, password });
        await user.save();
        res.status(201).json({ message: 'Usuário criado com sucesso' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Email ou senha inválidos' });
        }
        const validPassword = await user.comparePassword(password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Email ou senha inválidos' });
        }
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Middleware para verificar o token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token não fornecido' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido' });
        }
        req.user = user;
        next();
    });
}

// Rotas de relatórios
app.get('/api/reports', authenticateToken, async (req, res) => {
    try {
        const reports = await Report.find({ createdBy: req.user.userId });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/reports', authenticateToken, async (req, res) => {
    try {
        const report = new Report({
            ...req.body,
            createdBy: req.user.userId
        });
        await report.save();
        res.status(201).json(report);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.delete('/api/reports/:id', authenticateToken, async (req, res) => {
    try {
        const report = await Report.findOne({ _id: req.params.id });
        if (!report) {
            return res.status(404).json({ message: 'Relatório não encontrado' });
        }
        await Report.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: 'Relatório deletado com sucesso' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Para qualquer outra rota, serve o index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

function formatMonthYear(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Ajusta para o formato MM/YYYY
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${year}`;
}

async function deleteReport(id) {
    try {
        const response = await fetchWithAuth(`http://localhost:5000/api/reports/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadReports(); // Recarrega a lista de relatórios
        } else {
            const data = await response.json();
            throw new Error(data.message || 'Erro ao excluir relatório');
        }
    } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'Erro ao excluir relatório. Por favor, faça login novamente.');
        checkAuth();
    }
} 
const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const connectDB = require('./config/database');
const User = require('./models/User');
const Report = require('./models/Report');
const nodemailer = require('nodemailer');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const tipsRouter = require('./tips');
// const { OpenAI } = require('openai'); // Desabilitado IA

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

// Configuração do Nodemailer para Outlook/Hotmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });  

// Configuração do multer para upload de arquivos
const upload = multer({ dest: 'uploads/' });

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); // Desabilitado IA

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
        const reports = await Report.find({ user: req.user.userId });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/reports', authenticateToken, async (req, res) => {
    try {
        let reportData = { ...req.body, user: req.user.userId };
        // Converter referenceMonth para Date se vier como string
        if (typeof reportData.referenceMonth === 'string') {
            // Se vier no formato YYYY-MM, adicionar dia 01
            if (/^\d{4}-\d{2}$/.test(reportData.referenceMonth)) {
                reportData.referenceMonth = new Date(reportData.referenceMonth + '-01');
            } else {
                reportData.referenceMonth = new Date(reportData.referenceMonth);
            }
        }
        const report = new Report(reportData);
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

// Recuperação de senha
app.post('/api/auth/forgot-password', async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(200).json({ message: 'Se o email estiver cadastrado, você receberá um link para redefinir sua senha.' });
    }
    try {
        const resetToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
        const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5500';
        const resetUrl = `${FRONTEND_URL}/reset-password.html?token=${resetToken}`;
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Recuperação de senha - Bill Vision',
            html: `<p>Você solicitou a redefinição de senha. Clique no link abaixo para redefinir:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Se não foi você, ignore este email.</p>`
        });
        return res.status(200).json({ message: 'Se o email estiver cadastrado, você receberá um link para redefinir sua senha.' });
    } catch (error) {
        console.error('Erro ao enviar email de recuperação:', error);
        return res.status(500).json({ message: 'Erro ao enviar email de recuperação.' });
    }
});

// Endpoint para redefinir senha
app.post('/api/auth/reset-password', async (req, res) => {
    const { token, password } = req.body;
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) return res.status(400).json({ message: 'Usuário não encontrado.' });
        user.password = password;
        await user.save();
        return res.status(200).json({ message: 'Senha redefinida com sucesso.' });
    } catch (error) {
        return res.status(400).json({ message: 'Token inválido ou expirado.' });
    }
});

// Função para extrair valores monetários duplicados
function findDuplicateValues(text) {
    // Regex para valores monetários (R$ 1.234,56, R$100,00, 1234.56, 100,00, etc)
    const regex = /(?:R\$\s?|R\$|\b)(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/g;
    const matches = text.match(regex) || [];
    const count = {};
    matches.forEach(val => {
        // Normalizar valor (remover espaços, garantir separador decimal)
        let norm = val.replace(/\s/g, '').replace(/\.(?=\d{3,3},)/g, '').replace(',', '.');
        count[norm] = (count[norm] || 0) + 1;
    });
    // Filtra apenas os valores que aparecem mais de uma vez
    const duplicates = Object.entries(count).filter(([_, c]) => c > 1).map(([val, c]) => {
        // Procurar todas as linhas do texto que contenham esse valor
        const lines = text.split(/\r?\n/);
        const occurrences = lines.filter(line => line.includes(val)).map(line => {
            // Extrair nome do estabelecimento (antes do valor)
            let description = line;
            let valueIndex = line.indexOf(val);
            if (valueIndex > 0) {
                description = line.substring(0, valueIndex).trim();
            } else {
                description = line.trim();
            }
            // Extrair data (dd/mm/aaaa ou dd/mm/aa)
            const dateMatch = line.match(/(\d{2}\/\d{2}\/\d{2,4})/);
            const date = dateMatch ? dateMatch[1] : '';
            return { description, date };
        });
        return { value: val, count: c, occurrences };
    });
    return duplicates;
}

// Função para extrair todos os valores monetários do texto
function extractAllValues(text) {
    // Extrai todos os valores monetários, um para cada linha/ocorrência
    const lines = text.split(/\r?\n/);
    const values = [];
    const regex = /(?:R\$\s?|R\$|\b)(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/g;
    lines.forEach(line => {
        let match;
        while ((match = regex.exec(line)) !== null) {
            values.push(match[0]);
        }
    });
    return values;
}

// Rota de upload de fatura
app.post('/api/upload-invoice', upload.single('invoice'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'Arquivo não enviado.' });
        }
        const ext = path.extname(file.originalname).toLowerCase();
        let text = '';
        if (ext === '.pdf') {
            try {
                const dataBuffer = fs.readFileSync(file.path);
                const data = await pdfParse(dataBuffer);
                text = data.text;
                console.log('[PDF TEXT EXTRAÍDO]\n', text); // Log do texto extraído
            } catch (pdfErr) {
                console.error('[PDF PARSE ERROR]', pdfErr);
                fs.unlinkSync(file.path);
                return res.status(400).json({ error: 'Erro ao ler o PDF. Verifique se o arquivo está íntegro e no formato correto.' });
            }
        } else if (['.png', '.jpg', '.jpeg', '.bmp'].includes(ext)) {
            try {
                const { data: { text: ocrText } } = await Tesseract.recognize(file.path, 'por');
                text = ocrText;
            } catch (ocrErr) {
                console.error('[OCR ERROR]', ocrErr);
                fs.unlinkSync(file.path);
                return res.status(400).json({ error: 'Erro ao ler a imagem. Verifique se o arquivo está íntegro.' });
            }
        } else {
            fs.unlinkSync(file.path);
            return res.status(400).json({ error: 'Tipo de arquivo não suportado.' });
        }
        // Remove o arquivo após o processamento
        fs.unlinkSync(file.path);
        // Identifica valores duplicados
        const duplicates = findDuplicateValues(text);
        // Extrai todos os valores monetários
        const allExtractedValues = extractAllValues(text);
        res.json({ duplicates, allExtractedValues });
    } catch (err) {
        console.error('[UPLOAD INVOICE ERROR]', err);
        res.status(500).json({ error: 'Erro ao processar o arquivo.' });
    }
});

app.post('/api/simulator-tips', async (req, res) => {
    // Desabilitado IA temporariamente
    return res.status(503).json({ error: 'Funcionalidade de IA desabilitada temporariamente.' });
    /*
    try {
        const { expenses } = req.body;
        if (!expenses || !Array.isArray(expenses) || expenses.length === 0) {
            return res.status(400).json({ error: 'Gastos não enviados.' });
        }
        // Montar prompt para a IA
        const prompt = `Você é um consultor financeiro. Analise os seguintes gastos do usuário e gere 3 dicas práticas e personalizadas para economizar dinheiro. Liste as dicas de forma clara e objetiva.\n\nGastos:\n${expenses.map(e => '- ' + e).join('\n')}\n\nDicas:`;
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'Você é um consultor financeiro especializado em economia doméstica.' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 300,
            temperature: 0.7
        });
        const tips = completion.choices[0].message.content.trim();
        res.json({ tips });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao gerar dicas com IA.' });
    }
    */
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

app.use(tipsRouter); 
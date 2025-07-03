const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

// DeepSeek API Key fornecida pelo usuário
const DEEPSEEK_API_KEY = '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';

router.post('/api/generate-tips', async (req, res) => {
  const { gastosResumo } = req.body;
  if (!gastosResumo) {
    return res.status(400).json({ error: 'Resumo de gastos não fornecido.' });
  }
  try {
    const prompt = `Analise o seguinte resumo de gastos e gere 3 dicas personalizadas, criativas e motivacionais para economia:\nResumo dos gastos: ${gastosResumo}\nDicas:`;
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1:free',
        messages: [
          { role: 'system', content: 'Você é um consultor financeiro especializado em economia doméstica.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message || JSON.stringify(data.error));
    }
    let dicas = '';
    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      dicas = data.choices[0].message.content;
    } else {
      dicas = JSON.stringify(data);
    }
    res.json({ dicas });
  } catch (error) {
    console.error('Erro ao gerar dicas:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
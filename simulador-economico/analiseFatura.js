import fs from 'fs';

export function lerLancamentos(caminho = './data/fatura.json') {
  try {
    const data = fs.readFileSync(caminho, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Erro ao ler a fatura:', err.message);
    return [];
  }
}

export function agruparPorCategoria(lancamentos) {
  const categorias = {};
  lancamentos.forEach(l => {
    if (!categorias[l.categoria]) categorias[l.categoria] = [];
    categorias[l.categoria].push(l);
  });
  return categorias;
}

export function totalPorCategoria(categorias) {
  const totais = {};
  for (const cat in categorias) {
    totais[cat] = categorias[cat].reduce((soma, l) => soma + l.valor, 0);
  }
  return totais;
} 
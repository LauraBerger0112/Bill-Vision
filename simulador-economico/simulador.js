import { lerLancamentos, agruparPorCategoria, totalPorCategoria } from './analiseFatura.js';

function sugestoesEconomia(totais, categorias) {
  const sugestoes = [];
  if (totais['Delivery'] && categorias['Delivery'].length > 2) {
    const media = totais['Delivery'] / categorias['Delivery'].length;
    const economia = totais['Delivery'] - (media * 2);
    sugestoes.push(`Se você pedisse delivery apenas 2 vezes no mês, economizaria R$${economia.toFixed(2)}`);
  }
  if (totais['Streaming']) {
    const economia = totais['Streaming'] * 0.5;
    sugestoes.push(`Reduzindo seus streamings em 50%, você teria R$${economia.toFixed(2)} de sobra todo mês`);
  }
  if (totais['Transporte'] && totais['Transporte'] > 50) {
    sugestoes.push(`Usando transporte público em metade das viagens, economizaria cerca de R$${(totais['Transporte']/2).toFixed(2)}`);
  }
  if (totais['Compras online'] && totais['Compras online'] > 100) {
    sugestoes.push(`Reduzindo compras online em 50%, economizaria R$${(totais['Compras online']/2).toFixed(2)}`);
  }
  return sugestoes;
}

function simulacoes(economia) {
  return [
    `Com essa economia mensal, você poderia fazer uma viagem em 6 meses (R$${(economia*6).toFixed(2)})`,
    `Em 12 meses, teria R$${(economia*12).toFixed(2)} para investir`,
    `Poderia comprar um celular novo à vista (R$${(economia*10).toFixed(2)})`
  ];
}

export function executarSimulador() {
  const lancamentos = lerLancamentos();
  if (!lancamentos.length) {
    console.log('Nenhum lançamento encontrado.');
    return;
  }
  const categorias = agruparPorCategoria(lancamentos);
  const totais = totalPorCategoria(categorias);

  console.log('\n--- Análise de Gastos ---');
  for (const cat in totais) {
    console.log(`${cat}: R$${totais[cat].toFixed(2)}`);
  }

  const sugestoes = sugestoesEconomia(totais, categorias);
  if (!sugestoes.length) {
    console.log('\nNenhuma sugestão de economia encontrada.');
    return;
  }

  let economiaTotal = 0;
  console.log('\n--- Sugestões de Economia ---');
  sugestoes.forEach(s => {
    console.log('- ' + s);
    const match = s.match(/economizaria R\$([0-9.,]+)/) || s.match(/de sobra todo mês R\$([0-9.,]+)/);
    if (match) economiaTotal += parseFloat(match[1].replace(',', '.'));
  });

  if (economiaTotal > 0) {
    console.log('\n--- Simulações com a Economia ---');
    simulacoes(economiaTotal).forEach(s => console.log('- ' + s));
  } else {
    console.log('\nNenhuma economia significativa detectada.');
  }
} 
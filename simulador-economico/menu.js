import readlineSync from 'readline-sync';
import { executarSimulador } from './simulador.js';

export function mostrarMenu() {
  while (true) {
    console.log('\n=== Menu Principal ===');
    console.log('1. Simulador Econômico');
    console.log('2. Sair');
    const opcao = readlineSync.question('Escolha uma opção: ');

    if (opcao === '1') {
      try {
        executarSimulador();
      } catch (err) {
        console.error('Erro ao executar simulador:', err.message);
      }
      readlineSync.question('\nPressione ENTER para voltar ao menu...');
    } else if (opcao === '2') {
      console.log('Até logo!');
      break;
    } else {
      console.log('Opção inválida. Tente novamente.');
    }
  }
} 
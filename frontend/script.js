console.log('JS está rodando!');
alert('JS está rodando!');

let reports = [];
let reportsChart = null;
let duplicatesChart = null;
let pdfCompareChart = null;
let monthSummaryChart = null;
const reportForm = document.getElementById('report-form');

document.addEventListener('DOMContentLoaded', () => {
    const authScreen = document.getElementById('auth-screen');
    const mainContent = document.getElementById('main-content');
    
    authScreen.style.display = 'flex';
    mainContent.classList.add('hidden');

    const themeToggle = document.getElementById('theme-toggle');
    const authThemeToggle = document.getElementById('auth-theme-toggle');
    const body = document.body;
    
    

    function updateAllThemeIcons() {
        const currentTheme = document.body.getAttribute('data-theme');
        const sunIcon = document.getElementById('sun-icon');
        const moonIcon = document.getElementById('moon-icon');
        if (sunIcon) sunIcon.style.display = currentTheme === 'dark' ? 'none' : 'block';
        if (moonIcon) moonIcon.style.display = currentTheme === 'dark' ? 'block' : 'none';
    }

    function toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            document.body.removeAttribute('data-theme');
        } else {
            document.body.setAttribute('data-theme', 'dark');
        }
        updateAllThemeIcons();
        updateChart && updateChart();
    }

    if (authThemeToggle) {
        authThemeToggle.addEventListener('click', toggleTheme);
        updateAllThemeIcons();
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
        // Definir ícone inicial baseado no tema atual
        const sunIcon = document.getElementById('sun-icon');
        const moonIcon = document.getElementById('moon-icon');
        const currentTheme = body.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            if (sunIcon) sunIcon.style.display = 'none';
            if (moonIcon) moonIcon.style.display = 'block';
        } else {
            if (sunIcon) sunIcon.style.display = 'block';
            if (moonIcon) moonIcon.style.display = 'none';
        }
    }
    
    if (authThemeToggle) {
        authThemeToggle.addEventListener('click', toggleTheme);
        // Definir ícone inicial baseado no tema atual
        const sunIcon = document.getElementById('sun-icon');
        const moonIcon = document.getElementById('moon-icon');
        const currentTheme = body.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            if (sunIcon) sunIcon.style.display = 'none';
            if (moonIcon) moonIcon.style.display = 'block';
        } else {
            if (sunIcon) sunIcon.style.display = 'block';
            if (moonIcon) moonIcon.style.display = 'none';
        }
    }

    const reportsTab = document.getElementById('reports-tab');
    const graphTab = document.getElementById('graph-tab');
    const reportsSection = document.getElementById('reports-section');
    const graphSection = document.getElementById('graph-section');

    reportsTab.addEventListener('click', () => {
        reportsSection.classList.remove('hidden-section');
        reportsSection.classList.add('active-section');
        graphSection.classList.remove('active-section');
        graphSection.classList.add('hidden-section');
        simulatorSection.classList.remove('active-section');
        simulatorSection.classList.add('hidden-section');
        reportsTab.classList.add('active');
        graphTab.classList.remove('active');
        simulatorTab.classList.remove('active');
    });

    graphTab.addEventListener('click', () => {
        graphSection.classList.remove('hidden-section');
        graphSection.classList.add('active-section');
        reportsSection.classList.remove('active-section');
        reportsSection.classList.add('hidden-section');
        simulatorSection.classList.remove('active-section');
        simulatorSection.classList.add('hidden-section');
        graphTab.classList.add('active');
        reportsTab.classList.remove('active');
        simulatorTab.classList.remove('active');
        updateChart();
    });

    const simulatorTab = document.getElementById('simulator-tab');
    const simulatorSection = document.getElementById('simulator-section');
    const simulatorContent = document.getElementById('simulator-content');

    simulatorTab.addEventListener('click', () => {
        reportsSection.classList.remove('active-section');
        reportsSection.classList.add('hidden-section');
        graphSection.classList.remove('active-section');
        graphSection.classList.add('hidden-section');
        simulatorSection.classList.remove('hidden-section');
        simulatorSection.classList.add('active-section');
        reportsTab.classList.remove('active');
        graphTab.classList.remove('active');
        simulatorTab.classList.add('active');
        carregarSimuladorEconomico();
    });

    async function checkAuth() {
        const token = localStorage.getItem('token');
        
        if (token) {
            try {
                console.log('Verificando token...');
                const response = await fetchWithAuth('http://localhost:5000/api/auth/verify', {
                    method: 'GET'
                });

                if (response.ok) {
                    console.log('Token válido, mostrando conteúdo principal');
                    authScreen.style.display = 'none';
                    mainContent.classList.remove('hidden');
                    await loadReports();
                    const reportsSection = document.getElementById('reports-section');
                    const graphSection = document.getElementById('graph-section');
                    reportsSection.classList.remove('hidden-section');
                    reportsSection.classList.add('active-section');
                    graphSection.classList.add('hidden-section');
                    graphSection.classList.remove('active-section');
                } else {
                    console.log('Token inválido, removendo token');
                    localStorage.removeItem('token');
                    authScreen.style.display = 'flex';
                    mainContent.classList.add('hidden');
                }
            } catch (error) {
                console.error('Erro ao verificar token:', error);
                localStorage.removeItem('token');
                authScreen.style.display = 'flex';
                mainContent.classList.add('hidden');
            }
        } else {
            console.log('Nenhum token encontrado');
            authScreen.style.display = 'flex';
            mainContent.classList.add('hidden');
        }
    }

    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            console.log('Tentando fazer login...');
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            console.log('Resposta do servidor:', data);

            if (response.ok) {
                console.log('Login bem sucedido, token recebido');
                localStorage.setItem('token', data.token);
                await checkAuth();
            } else {
                console.error('Erro no login:', data.message);
                alert(data.message || 'Erro ao fazer login. Verifique suas credenciais.');
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            alert('Erro ao conectar com o servidor. Verifique se o servidor está rodando.');
        }
    });

    const registerForm = document.getElementById('register-form');
    const registerEmailInput = document.getElementById('register-email');
    let isEmailValid = false;
    let lastCheckedEmail = '';
    let emailValidationTimeout;
    const mailboxLayerApiKey = '7925e95fdf1758595b6fe12e29779423'; // Substitua pela sua chave da MailboxLayer

    registerEmailInput.addEventListener('input', () => {
        clearTimeout(emailValidationTimeout);
        const email = registerEmailInput.value;
        isEmailValid = false;
        registerEmailInput.classList.remove('valid-email', 'invalid-email');
        if (!email) return;
        emailValidationTimeout = setTimeout(async () => {
            if (email === lastCheckedEmail) return;
            lastCheckedEmail = email;
            try {
                const emailValidationUrl = `https://apilayer.net/api/check?access_key=${mailboxLayerApiKey}&email=${encodeURIComponent(email)}`;
                const emailValidationResponse = await fetch(emailValidationUrl);
                const emailValidationData = await emailValidationResponse.json();
                if (emailValidationData.format_valid && emailValidationData.mx_found && emailValidationData.smtp_check) {
                    isEmailValid = true;
                    registerEmailInput.classList.add('valid-email');
                    registerEmailInput.classList.remove('invalid-email');
                } else {
                    isEmailValid = false;
                    registerEmailInput.classList.add('invalid-email');
                    registerEmailInput.classList.remove('valid-email');
                }
            } catch (error) {
                isEmailValid = false;
                registerEmailInput.classList.add('invalid-email');
                registerEmailInput.classList.remove('valid-email');
            }
        }, 600); // debounce
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;

        if (password !== confirmPassword) {
            alert('As senhas não coincidem');
            return;
        }

        // Verificação de email usando MailboxLayer
        try {
            const emailValidationUrl = `https://apilayer.net/api/check?access_key=${mailboxLayerApiKey}&email=${encodeURIComponent(email)}`;
            const emailValidationResponse = await fetch(emailValidationUrl);
            const emailValidationData = await emailValidationResponse.json();
            if (!(emailValidationData.format_valid && emailValidationData.mx_found && emailValidationData.smtp_check)) {
                alert('Por favor, insira um email válido e existente.');
                return;
            }
        } catch (error) {
            alert('Erro ao validar o email. Tente novamente.');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password })
            });

            if (response.ok) {
                alert('Cadastro realizado com sucesso! Faça login para continuar.');
                document.querySelector('[data-tab="login"]').click();
            } else {
                const data = await response.json();
                alert(data.message || 'Erro ao cadastrar');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Erro ao cadastrar. Tente novamente.');
        }
    });

    const logoutButton = document.getElementById('logout');
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('token');
        reports = [];
        displayReports(reports);
        checkAuth();
    });

    const authTabs = document.querySelectorAll('.auth-tab');
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            document.querySelectorAll('.auth-form').forEach(form => {
                form.classList.remove('active');
            });
            
            if (target === 'login') {
                loginForm.classList.add('active');
            } else {
                registerForm.classList.add('active');
            }
        });
    });

    function updateChart() {
        const ctx = document.getElementById('reportsChart');
        if (!ctx) return;

        if (reportsChart) {
            reportsChart.destroy();
        }

        // Process expenses data
        const expensesByEstablishment = {};
        const expensesByMonth = {};
        reports.forEach(report => {
            report.criticalExpenses.forEach(expense => {
                const match = expense.match(/^(.+):\s*R\$\s*(\d{1,3}(?:\.\d{3})*,\d{2})$/);
                if (match) {
                    const establishment = match[1].trim();
                    const value = parseFloat(match[2].replace('.', '').replace(',', '.'));
                    const month = report.referenceMonth;
                    if (!expensesByEstablishment[establishment]) {
                        expensesByEstablishment[establishment] = 0;
                    }
                    expensesByEstablishment[establishment] += value;
                    if (!expensesByMonth[establishment]) {
                        expensesByMonth[establishment] = {};
                    }
                    if (!expensesByMonth[establishment][month]) {
                        expensesByMonth[establishment][month] = 0;
                    }
                    expensesByMonth[establishment][month] += value;
                }
            });
        });
        const sortedEstablishments = Object.entries(expensesByEstablishment)
            .sort((a, b) => b[1] - a[1]);
        const monthChanges = {};
        Object.entries(expensesByMonth).forEach(([establishment, monthlyData]) => {
            const months = Object.keys(monthlyData).sort();
            if (months.length >= 2) {
                const currentMonth = months[months.length - 1];
                const previousMonth = months[months.length - 2];
                const currentValue = monthlyData[currentMonth];
                const previousValue = monthlyData[previousMonth];
                const change = ((currentValue - previousValue) / previousValue) * 100;
                monthChanges[establishment] = change;
            }
        });
        const rankingContainer = document.getElementById('expenses-ranking');
        if (!rankingContainer) {
            const newRankingContainer = document.createElement('div');
            newRankingContainer.id = 'expenses-ranking';
            document.querySelector('.chart-wrapper').appendChild(newRankingContainer);
        }
        const rankingHTML = `
            <h3>Ranking de Gastos por Estabelecimento</h3>
            <table class="ranking-table">
                <thead>
                    <tr>
                        <th>Estabelecimento</th>
                        <th>Total Gasto (R$)</th>
                        <th>Variação Mês Anterior</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedEstablishments.map(([establishment, total]) => `
                        <tr>
                            <td>${establishment}</td>
                            <td>R$ ${total.toFixed(2)}</td>
                            <td class="${monthChanges[establishment] < 0 ? 'decrease' : 'increase'}">
                                ${monthChanges[establishment] ? `${monthChanges[establishment].toFixed(1)}%` : 'N/A'}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        document.getElementById('expenses-ranking').innerHTML = rankingHTML;
        // Adicionar o título fora da tabela, logo abaixo
        let chartTitleDiv = document.getElementById('comparative-chart-title');
        if (chartTitleDiv) chartTitleDiv.remove();
        chartTitleDiv = document.createElement('div');
        chartTitleDiv.className = 'chart-title';
        chartTitleDiv.id = 'comparative-chart-title';
        chartTitleDiv.textContent = 'Gráfico Comparativo de Dados Faturados';
        // Inserir antes do gráfico de pizza
        let pieChartCanvas = document.getElementById('pie-duplicates-chart');
        if (pieChartCanvas && pieChartCanvas.parentNode) {
            pieChartCanvas.parentNode.insertBefore(chartTitleDiv, pieChartCanvas);
        }
        // Gráfico mensal (barras agrupadas)
        const monthlyData = {};
        reports.forEach(report => {
            const month = report.referenceMonth;
            if (!monthlyData[month]) {
                monthlyData[month] = 0;
            }
            monthlyData[month]++;
        });
        const sortedMonths = Object.keys(monthlyData).sort();
        const isDarkTheme = document.body.getAttribute('data-theme') === 'dark';
        const backgroundColor = isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(64, 64, 64, 0.5)';
        const borderColor = isDarkTheme ? 'rgba(255, 255, 255, 1)' : 'rgba(64, 64, 64, 1)';
        reportsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedMonths.map(month => formatMonthYear(month)),
                datasets: [{
                    label: 'Número de Relatórios',
                    data: sortedMonths.map(month => monthlyData[month]),
                    backgroundColor: sortedMonths.map(month => backgroundColor),
                    borderColor: sortedMonths.map(month => borderColor),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            color: isDarkTheme ? '#ffffff' : '#000000'
                        },
                        grid: {
                            color: isDarkTheme ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: isDarkTheme ? '#ffffff' : '#000000'
                        },
                        grid: {
                            color: isDarkTheme ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: isDarkTheme ? '#ffffff' : '#000000'
                        }
                    }
                }
            }
        });

        // Gráfico de pizza: proporção total de valores extraídos vs duplicados OU dados do PDF
        pieChartCanvas = document.getElementById('pie-duplicates-chart');
        if (!pieChartCanvas) {
            pieChartCanvas = document.createElement('canvas');
            pieChartCanvas.id = 'pie-duplicates-chart';
            pieChartCanvas.style.maxWidth = '400px';
            pieChartCanvas.style.margin = '32px auto 0 auto';
            const chartWrapper = document.querySelector('.chart-wrapper');
            chartWrapper.appendChild(pieChartCanvas);
        }
        if (window.pieDuplicatesChart) {
            window.pieDuplicatesChart.destroy();
        }
        let totalExtraidos = 0;
        let totalDuplicados = 0;
        let pieTitle = 'Proporção de Valores Extraídos vs Duplicados';
        // Se houver dados do PDF, usar eles
        if (window.lastPdfCompareData && typeof window.lastPdfCompareData.total === 'number') {
            totalExtraidos = window.lastPdfCompareData.total;
            totalDuplicados = 0;
            if (Array.isArray(window.lastPdfCompareData.duplicados)) {
                window.lastPdfCompareData.duplicados.forEach(dup => {
                    if (typeof dup === 'object' && dup.count) {
                        totalDuplicados += (dup.count - 1); // só as repetições!
                    }
                });
            }
            if (totalDuplicados > totalExtraidos) totalDuplicados = totalExtraidos;
            pieTitle = 'Proporção de Dados da Fatura PDF: Total vs Repetidos';
            console.log('PIE DEBUG:', { totalExtraidos, totalDuplicados, duplicados: window.lastPdfCompareData.duplicados });
        } else {
            reports.forEach(report => {
                if (report.allExtractedValues && Array.isArray(report.allExtractedValues)) {
                    totalExtraidos += report.allExtractedValues.length;
                }
                if (report.duplicateValues && Array.isArray(report.duplicateValues)) {
                    report.duplicateValues.forEach(dup => {
                        if (dup.occurrences && Array.isArray(dup.occurrences)) {
                            totalDuplicados += dup.occurrences.length;
                        } else if (typeof dup === 'object' && dup.count) {
                            totalDuplicados += dup.count;
                        } else {
                            totalDuplicados += 1;
                        }
                    });
                }
            });
        }
        if (totalDuplicados > totalExtraidos) totalDuplicados = totalExtraidos;
        const totalUnicos = Math.max(0, totalExtraidos - totalDuplicados);
        // Mensagem visual se não houver duplicados
        if (totalExtraidos === 0) {
            pieChartCanvas.style.display = 'none';
            if (!document.getElementById('no-pie-data-msg')) {
                const msg = document.createElement('div');
                msg.id = 'no-pie-data-msg';
                msg.style = 'color: #b00; font-size: 1.2em; margin: 24px 0; text-align: center;';
                msg.textContent = 'Nenhum dado extraído do PDF para exibir no gráfico.';
                pieChartCanvas.parentNode.appendChild(msg);
            }
            return;
        } else {
            pieChartCanvas.style.display = '';
            const msg = document.getElementById('no-pie-data-msg');
            if (msg) msg.remove();
        }
        window.pieDuplicatesChart = new Chart(pieChartCanvas, {
            type: 'pie',
            data: {
                labels: ['Valores Únicos', 'Valores Repetidos'],
                datasets: [{
                    data: [totalUnicos, totalDuplicados],
                    backgroundColor: [
                        '#23395d', // Azul escuro principal
                        '#4fc3f7'  // Azul claro para contraste
                    ],
                    borderColor: [
                        '#1a2233', // Borda azul ainda mais escura
                        '#1976d2'  // Azul intermediário
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: {
                            color: isDarkTheme ? '#ffffff' : '#23395d',
                            font: {
                                size: 18,
                                family: 'Montserrat, Arial, sans-serif',
                                weight: 'bold'
                            }
                        }
                    },
                    title: {
                        display: false,
                        text: pieTitle,
                        color: '#25323a',
                        font: { size: 24, family: 'Roboto, Arial, sans-serif', weight: 'bold' }
                    },
                    tooltip: {
                        bodyFont: { size: 18, family: 'Montserrat, Arial, sans-serif' },
                        titleFont: { size: 18, family: 'Montserrat, Arial, sans-serif', weight: 'bold' }
                    }
                }
            }
        });

        // Após renderizar os gráficos, exibir detalhes dos duplicados
        const duplicatesInfoSection = document.getElementById('duplicates-info-section');
        const duplicatesInfoContainer = document.getElementById('duplicates-info-container');
        // Se houver dados do PDF, mostrar detalhes dos duplicados do PDF
        if (window.lastPdfCompareData && Array.isArray(window.lastPdfCompareData.duplicados) && window.lastPdfCompareData.duplicados.length > 0) {
            duplicatesInfoSection.style.display = '';
            let html = '';
            let prejuizoTotal = 0;
            html += `<h3>Fatura PDF</h3>`;
            html += `<table class=\"duplicates-table\" style=\"background:#23395d;color:#fff;border-radius:10px;overflow:hidden;width:100%;margin-bottom:0;\"><thead><tr><th style=\"background:#1a2233;color:#fff;\">Valor Duplicado</th><th style=\"background:#1a2233;color:#fff;\">Ocorrências</th><th style=\"background:#1a2233;color:#fff;\">Descrição(s)</th><th style=\"background:#1a2233;color:#fff;\">Data(s)</th></tr></thead><tbody>`;
            window.lastPdfCompareData.duplicados.forEach(dup => {
                if (dup.occurrences && Array.isArray(dup.occurrences)) {
                    const descList = dup.occurrences.map(o => `<li>${o.description || '-'}</li>`).join('');
                    const dateList = dup.occurrences.map(o => `<li>${o.date || '-'}</li>`).join('');
                    html += `<tr><td${(descList === '' ? ' style=\"color:#111;background:#fff;\"' : '')}>${dup.value || '-'} </td><td${(descList === '' ? ' style=\"color:#111;background:#fff;\"' : '')}>${dup.count || 2}</td><td${(descList === '' ? ' style=\"color:#111;background:#fff;\"' : '')}>${dup.occurrences && dup.occurrences.length ? dup.occurrences.map(o => o.description || '-').join(', ') : '-'}</td><td${(dateList === '' ? ' style=\"color:#111;background:#fff;\"' : '')}>${dup.occurrences && dup.occurrences.length ? dup.occurrences.map(o => o.date || '-').join(', ') : '-'}</td></tr>`;
                    // Calcular prejuízo: (ocorrências - 1) * valor
                    const valorNum = parseFloat((dup.value || '').replace(/[^\d,\.]/g, '').replace(',', '.'));
                    if (!isNaN(valorNum)) {
                        prejuizoTotal += (dup.count ? (dup.count - 1) : (dup.occurrences.length - 1)) * valorNum;
                    }
                } else {
                    html += `<tr><td style=\"color:#111;background:#fff;\">${dup.value || dup}</td><td style=\"color:#111;background:#fff;\">${dup.count || 2}</td><td style=\"color:#111;background:#fff;\">-</td><td style=\"color:#111;background:#fff;\">-</td></tr>`;
                    const valorNum = parseFloat((dup.value || dup).replace(/[^\d,\.]/g, '').replace(',', '.'));
                    if (!isNaN(valorNum)) {
                        prejuizoTotal += ((dup.count || 2) - 1) * valorNum;
                    }
                }
            });
            html += '</tbody></table>';
            // Card de prejuízo total
            html += `<div style=\"display:flex;justify-content:center;margin:40px 0 0 0;width:100%;\"><div style=\"background:linear-gradient(135deg,#23395d 60%,#1a2233 100%);color:#fff;padding:28px 44px;border-radius:18px;box-shadow:0 8px 32px #23395d44,0 2px 8px #23395d22;min-width:320px;max-width:480px;text-align:center;font-size:1.35em;font-weight:600;letter-spacing:0.5px;border:2px solid #183153;display:flex;align-items:center;gap:18px;\"><span style='font-size:2.7em;line-height:1;'>&#9888;</span> Prejuízo total com duplicidades: <span style='color:#4fc3f7;font-size:1.2em;font-weight:700;'>R$ ${prejuizoTotal.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2})}</span></div></div>`;
            duplicatesInfoContainer.innerHTML = html;
        } else {
            // Agrupar duplicados por mês dos relatórios
            const duplicatesByMonth = {};
            reports.forEach(report => {
                if (report.duplicateValues && report.duplicateValues.length > 0) {
                    if (!duplicatesByMonth[report.referenceMonth]) {
                        duplicatesByMonth[report.referenceMonth] = [];
                    }
                    report.duplicateValues.forEach(dup => {
                        if (typeof dup === 'string') {
                            duplicatesByMonth[report.referenceMonth].push({ value: dup, count: 2 });
                        } else {
                            duplicatesByMonth[report.referenceMonth].push(dup);
                        }
                    });
                }
            });
            if (Object.keys(duplicatesByMonth).length > 0) {
                duplicatesInfoSection.style.display = '';
                let html = '';
                let prejuizoTotal = 0;
                Object.entries(duplicatesByMonth).forEach(([month, dups]) => {
                    html += `<h3>${formatMonthYear(month)}</h3>`;
                    html += `<table class=\"duplicates-table\" style=\"background:#23395d;color:#fff;border-radius:10px;overflow:hidden;width:100%;margin-bottom:0;\"><thead><tr><th style=\"background:#1a2233;color:#fff;\">Valor Duplicado</th><th style=\"background:#1a2233;color:#fff;\">Ocorrências</th><th style=\"background:#1a2233;color:#fff;\">Descrição(s)</th><th style=\"background:#1a2233;color:#fff;\">Data(s)</th></tr></thead><tbody>`;
                    dups.forEach(dup => {
                        if (dup.occurrences && Array.isArray(dup.occurrences)) {
                            const descList = dup.occurrences.map(o => `<li>${o.description || '-'}</li>`).join('');
                            const dateList = dup.occurrences.map(o => `<li>${o.date || '-'}</li>`).join('');
                            html += `<tr><td style=\"color:#111;background:#fff;\">${dup.value || '-'} </td><td style=\"color:#111;background:#fff;\">${dup.count || 2}</td><td style=\"color:#111;background:#fff;\">${dup.occurrences && dup.occurrences.length ? dup.occurrences.map(o => o.description || '-').join(', ') : '-'}</td><td style=\"color:#111;background:#fff;\">${dup.occurrences && dup.occurrences.length ? dup.occurrences.map(o => o.date || '-').join(', ') : '-'}</td></tr>`;
                            // Calcular prejuízo: (ocorrências - 1) * valor
                            const valorNum = parseFloat((dup.value || '').replace(/[^\d,\.]/g, '').replace(',', '.'));
                            if (!isNaN(valorNum)) {
                                prejuizoTotal += (dup.count ? (dup.count - 1) : (dup.occurrences.length - 1)) * valorNum;
                            }
                        } else {
                            html += `<tr><td style=\"color:#111;background:#fff;\">${dup.value || dup}</td><td style=\"color:#111;background:#fff;\">${dup.count || 2}</td><td style=\"color:#111;background:#fff;\">-</td><td style=\"color:#111;background:#fff;\">-</td></tr>`;
                            const valorNum = parseFloat((dup.value || dup).replace(/[^\d,\.]/g, '').replace(',', '.'));
                            if (!isNaN(valorNum)) {
                                prejuizoTotal += ((dup.count || 2) - 1) * valorNum;
                            }
                        }
                    });
                    html += '</tbody></table>';
                });
                // Card de prejuízo total
                html += `<div style=\"display:flex;justify-content:center;margin:40px 0 0 0;width:100%;\"><div style=\"background:linear-gradient(135deg,#23395d 60%,#1a2233 100%);color:#fff;padding:28px 44px;border-radius:18px;box-shadow:0 8px 32px #23395d44,0 2px 8px #23395d22;min-width:320px;max-width:480px;text-align:center;font-size:1.35em;font-weight:600;letter-spacing:0.5px;border:2px solid #183153;display:flex;align-items:center;gap:18px;\"><span style='font-size:2.7em;line-height:1;'>&#9888;</span> Prejuízo total com duplicidades: <span style='color:#4fc3f7;font-size:1.2em;font-weight:700;'>R$ ${prejuizoTotal.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2})}</span></div></div>`;
                duplicatesInfoContainer.innerHTML = html;
            } else {
                duplicatesInfoSection.style.display = 'none';
                duplicatesInfoContainer.innerHTML = '';
            }
        }
    }

    function updateSummaryTable(projectData) {
        const chartWrapper = document.querySelector('.chart-wrapper');
        let summaryTable = document.getElementById('expenses-summary');
        
        if (!summaryTable) {
            summaryTable = document.createElement('div');
            summaryTable.id = 'expenses-summary';
            chartWrapper.appendChild(summaryTable);
        }

        const tableContent = Object.entries(projectData)
            .sort((a, b) => b[1] - a[1])
            .map(([project, total]) => `
                <tr>
                    <td>${project}</td>
                    <td>R$ ${total.toFixed(2)}</td>
                </tr>
            `).join('');

        summaryTable.innerHTML = `
            <h3>Resumo de Gastos por Projeto</h3>
            <table>
                <thead>
                    <tr>
                        <th>Projeto</th>
                        <th>Total Gastos (R$)</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableContent}
                </tbody>
            </table>
        `;
    }

    function validateCriticalExpenses(expenses) {
        const expenseRegex = /^.+:\s*R\$\s*\d{1,3}(?:\.\d{3})*,\d{2}$/;
        const invalidExpenses = expenses.filter(expense => {
            const trimmed = expense.trim();
            if (trimmed === '') return false;
            return !expenseRegex.test(trimmed);
        });
        
        if (invalidExpenses.length > 0) {
            const errorMessage = `Os seguintes gastos não seguem o formato correto:\n\n${invalidExpenses.join('\n')}\n\nPor favor, use o formato: \"Descrição: R$ X,XX\"`;
            alert(errorMessage);
            return false;
        }
        return true;
    }

    async function fetchWithAuth(url, options = {}) {
        const token = localStorage.getItem('token');
        if (token) {
            options.headers = {
                ...options.headers,
                'Authorization': `Bearer ${token}`
            };
        }
        console.log('[fetchWithAuth] URL:', url);
        console.log('[fetchWithAuth] Headers:', options.headers);
        return fetch(url, options);
    }

    async function loadReports() {
        try {
            const response = await fetchWithAuth('http://localhost:5000/api/reports');
            if (response.ok) {
                const data = await response.json();
                reports = data;
                displayReports(reports);
                updateChart();
            } else {
                throw new Error('Failed to load reports');
            }
        } catch (error) {
            console.error('Error loading reports:', error);
            alert('Erro ao carregar relatórios. Por favor, faça login novamente.');
            checkAuth();
        }
    }

    // Função para formatar valores conforme a moeda escolhida
    function formatCurrency(value, currency) {
        let locales = {
            BRL: 'pt-BR',
            USD: 'en-US',
            EUR: 'de-DE',
            GBP: 'en-GB',
            ARS: 'es-AR',
            BTC: 'en-US',
        };
        let symbols = {
            BRL: 'BRL',
            USD: 'USD',
            EUR: 'EUR',
            GBP: 'GBP',
            ARS: 'ARS',
            BTC: 'BTC',
        };
        let locale = locales[currency] || 'en-US';
        let symbol = symbols[currency] || currency;
        if (currency === 'BTC') {
            return `${parseFloat(value).toFixed(8)} BTC`;
        }
        return Number(value).toLocaleString(locale, { style: 'currency', currency: symbol });
    }

    function displayReports(reports) {
        const container = document.getElementById('reports-container');
        container.innerHTML = '';

        const table = document.createElement('table');
        table.className = 'reports-table';
        
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Projeto</th>
                <th>Mês/Ano</th>
                <th>Responsável</th>
                <th>Resumo</th>
                <th>Gastos Críticos</th>
                <th>Gastos por Empresa</th>
                <th>Ações</th>
            </tr>
        `;
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        reports.forEach(report => {
            const moeda = report.currency || 'BRL';
            // Formatar gastos críticos
            const criticalExpensesHTML = report.criticalExpenses && report.criticalExpenses.length > 0
                ? report.criticalExpenses.map(expense => `<li>${expense.replace(/([\d.,]+)\s*([A-Z]{3}|R\$|\$|€|£)?/, (match, val, sym) => formatCurrency(val.replace(',', '.'), moeda))}</li>`).join('')
                : '<li>-</li>';
            // Formatar gastos por empresa (se existirem)
            let companyExpensesHTML = '-';
            if (report.companyExpenses && report.companyExpenses.length > 0) {
                companyExpensesHTML = report.companyExpenses.map(expense => {
                    return `<li>${expense.replace(/([\d.,]+)\s*([A-Z]{3}|R\$|\$|€|£)?/, (match, val, sym) => formatCurrency(val.replace(',', '.'), moeda))}</li>`;
                }).join('');
            }
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${report.projectName}</td>
                <td>${formatMonthYear(report.referenceMonth)}</td>
                <td>${report.responsiblePerson}</td>
                <td>${report.summary}</td>
                <td><ul>${criticalExpensesHTML}</ul></td>
                <td><ul>${companyExpensesHTML}</ul></td>
                <td>
                    <button class="delete" data-id="${report.id || report._id}">Excluir</button>
                </td>
            `;

            const deleteButton = tr.querySelector('.delete');
            deleteButton.addEventListener('click', () => deleteReport(report.id || report._id));

            tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        container.appendChild(table);

        console.log('Chamando displayReports com:', reports);
    }

    async function deleteReport(id) {
        try {
            const response = await fetchWithAuth(`http://localhost:5000/api/reports/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                loadReports();
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

    const reportForm = document.getElementById('report-form');
    reportForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        // Obter moeda escolhida
        const currencySelect = document.getElementById('currency');
        const selectedCurrency = currencySelect.value;
        let conversionRate = 1;
        let currencySymbol = selectedCurrency;
        if (selectedCurrency !== 'BRL') {
            try {
                const response = await fetch(`https://economia.awesomeapi.com.br/json/last/BRL-${selectedCurrency}`);
                const data = await response.json();
                const key = `BRL${selectedCurrency}`;
                if (data[key] && data[key].bid) {
                    conversionRate = parseFloat(data[key].bid);
                }
            } catch (error) {
                alert('Erro ao buscar cotação da moeda. Os valores serão mantidos em BRL.');
            }
        } else {
            currencySymbol = 'R$';
        }
        // Processar gastos críticos digitados manualmente
        const criticalExpensesInput = document.getElementById('criticalExpenses').value;
        const criticalExpenses = criticalExpensesInput.split('\n').map(item => item.trim()).filter(Boolean);
        // Processar gastos por empresa
        const companyExpenses = [];
        const companyExpensesContainer = document.getElementById('company-expenses-container');
        const expenseRows = companyExpensesContainer.querySelectorAll('.expense-row');
        expenseRows.forEach(row => {
            const company = row.querySelector('.company-name').value.trim();
            const value = row.querySelector('.expense-value').value.trim().replace('.', '').replace(',', '.');
            const categories = [];
            // Coletar categorias
            const categoryItems = row.querySelectorAll('.category-item');
            categoryItems.forEach(item => {
                // Extrair valor da categoria e converter
                let text = item.textContent;
                let match = text.match(/: R\$ ([\d,.]+)/);
                let catValue = match ? parseFloat(match[1].replace('.', '').replace(',', '.')) : 0;
                let convertedCatValue = (catValue / conversionRate).toFixed(2);
                let catName = text.split(':')[0];
                categories.push(`${catName}: ${currencySymbol} ${convertedCatValue}`);
            });
            if (company && value) {
                let convertedValue = (parseFloat(value) / conversionRate).toFixed(2);
                companyExpenses.push(`${company}: ${currencySymbol} ${convertedValue}`);
                // Adicionar detalhes das categorias
                if (categories.length > 0) {
                    companyExpenses.push(`Categorias: ${categories.join(' | ')}`);
                }
            }
        });

        // --- NOVO: Enviar PDF para checagem de duplicados ---
        let duplicateValues = [];
        let allExtractedValues = [];
        const attachmentsInput = document.getElementById('attachments');
        const files = attachmentsInput.files;
        if (files.length > 0) {
            // Só processa o primeiro PDF encontrado
            const pdfFile = Array.from(files).find(f => f.type === 'application/pdf');
            if (pdfFile) {
                const formDataPDF = new FormData();
                formDataPDF.append('invoice', pdfFile);
                try {
                    const response = await fetch('http://localhost:5000/api/upload-invoice', {
                        method: 'POST',
                        body: formDataPDF
                    });
                    if (response.ok) {
                        const data = await response.json();
                        if (data.duplicates && Array.isArray(data.duplicates)) {
                            duplicateValues = data.duplicates;
                        }
                        if (data.allExtractedValues && Array.isArray(data.allExtractedValues)) {
                            allExtractedValues = data.allExtractedValues;
                        }
                        // Exibir gráfico de comparação do PDF enviado
                        const total = allExtractedValues.length;
                        let duplicados = 0;
                        if (duplicateValues.length > 0) {
                            duplicateValues.forEach(dup => {
                                if (dup.occurrences && Array.isArray(dup.occurrences)) {
                                    duplicados += dup.occurrences.length;
                                } else if (typeof dup === 'object' && dup.count) {
                                    duplicados += dup.count;
                                } else {
                                    duplicados += 1;
                                }
                            });
                        }
                        if (duplicados > total) duplicados = total;
                        console.log('DEBUG PDF:', { duplicateValues, duplicados, total });
                        window.lastPdfCompareData = { total, duplicados: duplicateValues };
                        updateChart();
                    } else {
                        alert('Não foi possível analisar o PDF para duplicidade. O relatório será salvo normalmente.');
                    }
                } catch (err) {
                    alert('Erro ao enviar PDF para análise de duplicidade. O relatório será salvo normalmente.');
                }
            }
        }
        // --- FIM NOVO ---

        const formData = {
            projectName: document.getElementById('projectName').value,
            referenceMonth: document.getElementById('referenceMonth').value,
            responsiblePerson: document.getElementById('responsiblePerson').value,
            summary: document.getElementById('summary').value,
            completedActivities: document.getElementById('completedActivities').value.split('\n'),
            criticalExpenses: criticalExpenses,
            companyExpenses: companyExpenses,
            plannedVsAchieved: document.getElementById('plannedVsAchieved').value,
            problems: document.getElementById('problems').value.split('\n'),
            currency: selectedCurrency,
            duplicateValues: duplicateValues, // <-- Adiciona os duplicados aqui
            allExtractedValues: allExtractedValues // <-- Adiciona todos os valores extraídos aqui
        };

        console.log('[Relatório] Dados enviados:', formData);
        try {
            const response = await fetchWithAuth('http://localhost:5000/api/reports', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            console.log('[Relatório] Status da resposta:', response.status);
            if (response.ok) {
                alert('Relatório enviado com sucesso!');
                reportForm.reset();
                // Limpar o container de empresas
                document.getElementById('company-expenses-container').innerHTML = '';
                // Adicionar o primeiro campo de empresa novamente
                addCompanyExpenseField();

                // Salvar os gastos por empresa no localStorage para o simulador econômico
                try {
                    localStorage.setItem('simuladorGastos', JSON.stringify(companyExpenses.map(item => {
                        // Tentar extrair nome e valor
                        const match = item.match(/(.+):\s*(R\$|BRL|USD|EUR|GBP|ARS|BTC|\$|€|£)?\s*([\d,.]+)/);
                        if (match) {
                            return {
                                descricao: match[1].trim(),
                                categoria: 'Empresa',
                                valor: parseFloat(match[3].replace('.', '').replace(',', '.'))
                            };
                        }
                        return null;
                    }).filter(Boolean)));
                } catch (e) { /* ignore */ }

                const novoRelatorio = { ...formData };
                const data = await response.json();
                novoRelatorio._id = data._id || data.id;
                novoRelatorio.duplicateValues = duplicateValues; // Salva duplicados no relatório
                reports.push(novoRelatorio);
                displayReports(reports);
                updateChart();
            } else {
                const data = await response.json();
                console.error('[Relatório] Erro do backend:', data);
                throw new Error(data.message || 'Erro ao enviar relatório');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Erro ao enviar relatório. Por favor, faça login novamente.');
            checkAuth();
        }
    });

    // Função para adicionar campo de gasto por empresa
    function addCompanyExpenseField() {
        const container = document.getElementById('company-expenses-container');
        const row = document.createElement('div');
        row.className = 'expense-row';
        row.innerHTML = `
            <div class="company-input-group">
                <input type="text" class="company-name" placeholder="Nome da Empresa" required>
                <div class="expense-categories" style="display: none;">
                    <div class="category-inputs">
                        <select class="category-select">
                            <option value="">Selecione uma categoria</option>
                            <option value="alimentacao">Alimentação</option>
                            <option value="lazer">Lazer</option>
                            <option value="transporte">Transporte</option>
                            <option value="moradia">Moradia</option>
                            <option value="saude">Saúde</option>
                            <option value="educacao">Educação</option>
                            <option value="vestuario">Vestuário</option>
                            <option value="outros">Outros</option>
                        </select>
                        <input type="text" class="category-value" placeholder="Valor da categoria (ex: 50,00)">
                        <button type="button" class="add-category-btn">+</button>
                    </div>
                    <div class="categories-list"></div>
                </div>
            </div>
            <input type="text" class="expense-value" placeholder="Valor Total (ex: 150,00)" required readonly>
            <button type="button" class="remove-expense" onclick="this.parentElement.remove()">Remover</button>
        `;
        container.appendChild(row);

        // Configurar eventos
        const companyInput = row.querySelector('.company-name');
        const categoriesDiv = row.querySelector('.expense-categories');
        const categorySelect = row.querySelector('.category-select');
        const categoryValue = row.querySelector('.category-value');
        const addCategoryBtn = row.querySelector('.add-category-btn');
        const categoriesList = row.querySelector('.categories-list');
        const totalValue = row.querySelector('.expense-value');

        // Mostrar categorias quando digitar o nome da empresa
        companyInput.addEventListener('input', () => {
            categoriesDiv.style.display = companyInput.value.trim() ? 'block' : 'none';
        });

        // Adicionar categoria
        addCategoryBtn.addEventListener('click', () => {
            const category = categorySelect.value;
            const value = categoryValue.value.trim();
            
            if (category && value) {
                const categoryItem = document.createElement('div');
                categoryItem.className = 'category-item';
                categoryItem.innerHTML = `
                    <span>${categorySelect.options[categorySelect.selectedIndex].text}: R$ ${value}</span>
                    <button type="button" class="remove-category">×</button>
                `;
                
                categoryItem.querySelector('.remove-category').addEventListener('click', () => {
                    categoryItem.remove();
                    updateTotalValue();
                });

                categoriesList.appendChild(categoryItem);
                categoryValue.value = '';
                categorySelect.value = '';
                updateTotalValue();
            }
        });

        function updateTotalValue() {
            let total = 0;
            const categoryItems = categoriesList.querySelectorAll('.category-item');
            categoryItems.forEach(item => {
                const valueText = item.textContent.split('R$ ')[1];
                const value = parseFloat(valueText.replace(',', '.'));
                if (!isNaN(value)) {
                    total += value;
                }
            });
            totalValue.value = total.toFixed(2).replace('.', ',');
        }
    }

    // Tornar a função addCompanyExpenseField global para que possa ser chamada pelo botão
    window.addCompanyExpenseField = addCompanyExpenseField;

    function formatMonthYear(dateString) {
        if (!dateString) return '';
        let date = null;
        if (/^\d{4}-\d{2}$/.test(dateString)) {
            date = new Date(dateString + '-01');
        } else {
            date = new Date(dateString);
        }
        if (isNaN(date)) return dateString;
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${year}`;
    }

    console.log('reports-container:', document.getElementById('reports-container'));

    const container = document.getElementById('reports-container');
    console.log('Container:', container);
    if (container) {
        container.innerHTML = '<h1>TESTE DE INSERÇÃO DIRETA</h1>';
    }

    displayReports(reports);
    updateChart();

    // Recuperação de senha
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    const backToLogin = document.getElementById('back-to-login');

    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'none';
        forgotPasswordForm.style.display = 'block';
    });

    backToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        forgotPasswordForm.style.display = 'none';
        loginForm.style.display = 'block';
    });

    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('forgot-email').value;
        try {
            const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            if (response.ok) {
                alert('Se o email estiver cadastrado, você receberá um link para redefinir sua senha.');
                forgotPasswordForm.style.display = 'none';
                loginForm.style.display = 'block';
            } else {
                alert('Erro ao solicitar recuperação de senha.');
            }
        } catch (error) {
            alert('Erro ao conectar ao servidor.');
        }
    });

    // Pesquisa dinâmica de moedas
    const currencySearchInput = document.getElementById('currency-search');
    const currencySelect = document.getElementById('currency');
    let allCurrencyOptions = [];

    async function popularMoedas() {
        try {
            const response = await fetch('https://economia.awesomeapi.com.br/json/available/uniq');
            const moedas = await response.json();
            // Limpa opções extras
            currencySelect.innerHTML = '';
            allCurrencyOptions = Object.entries(moedas).map(([codigo, nome]) => {
                return { value: codigo, label: `${nome} (${codigo})` };
            });
            renderCurrencyOptions(allCurrencyOptions);
        } catch (error) {
            // fallback para opções padrão
            allCurrencyOptions = [
                { value: 'BRL', label: 'Real (BRL)' },
                { value: 'USD', label: 'Dólar (USD)' },
                { value: 'EUR', label: 'Euro (EUR)' },
                { value: 'GBP', label: 'Libra (GBP)' },
                { value: 'ARS', label: 'Peso Argentino (ARS)' },
                { value: 'BTC', label: 'Bitcoin (BTC)' }
            ];
            renderCurrencyOptions(allCurrencyOptions);
        }
    }

    function renderCurrencyOptions(options) {
        currencySelect.innerHTML = '';
        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.label;
            currencySelect.appendChild(option);
        });
    }

    currencySearchInput.addEventListener('input', function() {
        const search = this.value.trim().toLowerCase();
        if (!search) {
            renderCurrencyOptions(allCurrencyOptions);
            return;
        }
        const filtered = allCurrencyOptions.filter(opt =>
            opt.label.toLowerCase().includes(search) ||
            opt.value.toLowerCase().includes(search)
        );
        renderCurrencyOptions(filtered);
    });

    popularMoedas();

    function carregarSimuladorEconomico() {
        let dadosUsuario = localStorage.getItem('simuladorGastos');
        if (dadosUsuario) {
            try {
                const lancamentos = JSON.parse(dadosUsuario);
                if (Array.isArray(lancamentos) && lancamentos.length > 0) {
                    // Montar resumo dos gastos para IA
                    const resumo = lancamentos.map(l => `${l.categoria}: R$${l.valor.toFixed(2)}`).join(', ');
                    gerarDicasPersonalizadas(resumo);
                    return;
                }
            } catch (e) { /* ignore */ }
        }
        fetch('simulador-data.json')
            .then(response => response.json())
            .then(lancamentos => {
                const resumo = lancamentos.map(l => `${l.categoria}: R$${l.valor.toFixed(2)}`).join(', ');
                gerarDicasPersonalizadas(resumo);
            })
            .catch(() => {
                simulatorContent.innerHTML = '<p>Não foi possível carregar os dados do simulador.</p>';
            });
    }

    async function gerarDicasPersonalizadas(gastosResumo) {
        try {
            const response = await fetch('http://localhost:5000/api/generate-tips', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gastosResumo })
            });
            const data = await response.json();
            if (data.dicas) {
                document.getElementById('simulator-content').innerHTML = `
                    <div style='display:flex;justify-content:center;margin-bottom:32px;'>
                        <div style='background:#6b1831;border:1.5px solid #3d0d1a;padding:22px 28px;border-radius:10px;max-width:600px;box-shadow:0 4px 18px #0002;display:flex;align-items:center;gap:16px;'>
                            <span style="font-size:2.1em;color:#fff;">&#9888;</span>
                            <div>
                                <h2 style='color:#fff;margin:0 0 8px 0;font-weight:700;'>Teste gratuito excedido</h2>
                                <p style='color:#fff;margin:0;font-size:1.08em;'>O limite de uso gratuito da IA foi atingido.<br>Veja abaixo dicas manuais de economia:</p>
                            </div>
                        </div>
                    </div>
                    <div style='display:flex;flex-wrap:wrap;gap:28px;max-width:1200px;'>
                        <div style="background:linear-gradient(145deg,#e6eefa 60%,#f5faff 100%);border-radius:20px;padding:28px 32px;box-shadow:0 8px 32px #0a2a4a22, 0 2px 8px #0a2a4a11;flex:1 1 340px;min-width:300px;display:flex;align-items:center;justify-content:space-between;border:1.5px solid #183153;transition:box-shadow .2s;">
                            <div style='font-size:1.08em;color:#1a2233;'><b>Delivery:</b> Reduza para 2x/mês e economize</div>
                            <div style='font-weight:bold;font-size:1.2em;color:#17613a;'>R$ 250/mês</div>
                        </div>
                        <div style="background:linear-gradient(145deg,#e6eefa 60%,#f5faff 100%);border-radius:20px;padding:28px 32px;box-shadow:0 8px 32px #0a2a4a22, 0 2px 8px #0a2a4a11;flex:1 1 340px;min-width:300px;display:flex;align-items:center;justify-content:space-between;border:1.5px solid #183153;transition:box-shadow .2s;">
                            <div style='font-size:1.08em;color:#1a2233;'><b>Streaming:</b> Cancele 1 serviço e economize</div>
                            <div style='font-weight:bold;font-size:1.2em;color:#17613a;'>R$ 50/mês</div>
                        </div>
                        <div style="background:linear-gradient(145deg,#e6eefa 60%,#f5faff 100%);border-radius:20px;padding:28px 32px;box-shadow:0 8px 32px #0a2a4a22, 0 2px 8px #0a2a4a11;flex:1 1 340px;min-width:300px;display:flex;align-items:center;justify-content:space-between;border:1.5px solid #183153;transition:box-shadow .2s;">
                            <div style='font-size:1.08em;color:#1a2233;'><b>Transporte:</b> Use transporte público 50% do mês</div>
                            <div style='font-weight:bold;font-size:1.2em;color:#17613a;'>R$ 120/mês</div>
                        </div>
                        <div style="background:linear-gradient(145deg,#e6eefa 60%,#f5faff 100%);border-radius:20px;padding:28px 32px;box-shadow:0 8px 32px #0a2a4a22, 0 2px 8px #0a2a4a11;flex:1 1 340px;min-width:300px;display:flex;align-items:center;justify-content:space-between;border:1.5px solid #183153;transition:box-shadow .2s;">
                            <div style='font-size:1.08em;color:#1a2233;'><b>Compras online:</b> Reduza pela metade e economize</div>
                            <div style='font-weight:bold;font-size:1.2em;color:#17613a;'>R$ 100/mês</div>
                        </div>
                        <div style="background:linear-gradient(145deg,#e6eefa 60%,#f5faff 100%);border-radius:20px;padding:28px 32px;box-shadow:0 8px 32px #0a2a4a22, 0 2px 8px #0a2a4a11;flex:1 1 340px;min-width:300px;display:flex;align-items:center;justify-content:space-between;border:1.5px solid #183153;transition:box-shadow .2s;">
                            <div style='font-size:1.08em;color:#1a2233;'><b>Energia:</b> Troque por LED e desligue stand-by</div>
                            <div style='font-weight:bold;font-size:1.2em;color:#17613a;'>R$ 40/mês</div>
                        </div>
                        <div style="background:linear-gradient(145deg,#e6eefa 60%,#f5faff 100%);border-radius:20px;padding:28px 32px;box-shadow:0 8px 32px #0a2a4a22, 0 2px 8px #0a2a4a11;flex:1 1 340px;min-width:300px;display:flex;align-items:center;justify-content:space-between;border:1.5px solid #183153;transition:box-shadow .2s;">
                            <div style='font-size:1.08em;color:#1a2233;'><b>Cartão de crédito:</b> Evite parcelar pequenas compras</div>
                            <div style='font-weight:bold;font-size:1.2em;color:#17613a;'>R$ 60/mês</div>
                        </div>
                        <div style="background:linear-gradient(145deg,#e6eefa 60%,#f5faff 100%);border-radius:20px;padding:28px 32px;box-shadow:0 8px 32px #0a2a4a22, 0 2px 8px #0a2a4a11;flex:1 1 340px;min-width:300px;display:flex;align-items:center;justify-content:space-between;border:1.5px solid #183153;transition:box-shadow .2s;">
                            <div style='font-size:1.08em;color:#1a2233;'><b>Alimentação:</b> Cozinhe mais em casa e leve marmita</div>
                            <div style='font-weight:bold;font-size:1.2em;color:#17613a;'>R$ 180/mês</div>
                        </div>
                        <div style="background:linear-gradient(145deg,#e6eefa 60%,#f5faff 100%);border-radius:20px;padding:28px 32px;box-shadow:0 8px 32px #0a2a4a22, 0 2px 8px #0a2a4a11;flex:1 1 340px;min-width:300px;display:flex;align-items:center;justify-content:space-between;border:1.5px solid #183153;transition:box-shadow .2s;">
                            <div style='font-size:1.08em;color:#1a2233;'><b>Celular:</b> Revise seu plano e evite cobranças extras</div>
                            <div style='font-weight:bold;font-size:1.2em;color:#17613a;'>R$ 30/mês</div>
                        </div>
                        <div style="background:linear-gradient(145deg,#e6eefa 60%,#f5faff 100%);border-radius:20px;padding:28px 32px;box-shadow:0 8px 32px #0a2a4a22, 0 2px 8px #0a2a4a11;flex:1 1 340px;min-width:300px;display:flex;align-items:center;justify-content:space-between;border:1.5px solid #183153;transition:box-shadow .2s;">
                            <div style='font-size:1.08em;color:#1a2233;'><b>Farmácia:</b> Compare preços em diferentes redes antes de comprar</div>
                            <div style='font-weight:bold;font-size:1.2em;color:#17613a;'>R$ 35/mês</div>
                        </div>
                        <div style="background:linear-gradient(145deg,#e6eefa 60%,#f5faff 100%);border-radius:20px;padding:28px 32px;box-shadow:0 8px 32px #0a2a4a22, 0 2px 8px #0a2a4a11;flex:1 1 340px;min-width:300px;display:flex;align-items:center;justify-content:space-between;border:1.5px solid #183153;transition:box-shadow .2s;">
                            <div style='font-size:1.08em;color:#1a2233;'><b>Água:</b> Reduza banhos longos e conserte vazamentos</div>
                            <div style='font-weight:bold;font-size:1.2em;color:#17613a;'>R$ 25/mês</div>
                        </div>
                        <div style="background:linear-gradient(145deg,#e6eefa 60%,#f5faff 100%);border-radius:20px;padding:28px 32px;box-shadow:0 8px 32px #0a2a4a22, 0 2px 8px #0a2a4a11;flex:1 1 340px;min-width:300px;display:flex;align-items:center;justify-content:space-between;border:1.5px solid #183153;transition:box-shadow .2s;">
                            <div style='font-size:1.08em;color:#1a2233;'><b>Internet:</b> Negocie seu plano ou troque de operadora</div>
                            <div style='font-weight:bold;font-size:1.2em;color:#17613a;'>R$ 40/mês</div>
                        </div>
                    </div>
                    <div style='margin-top:40px;font-size:1.1em;'>
                        <b>Com essa economia mensal, você poderia fazer uma viagem em 6 meses, investir em algo novo ou criar uma reserva de emergência!</b>
                    </div>
                `;
            } else {
                exibirFallbackManual();
            }
        } catch (err) {
            exibirFallbackManual();
        }
    }

    function exibirFallbackManual() {
        document.getElementById('simulator-content').innerHTML = `
            <div style='display:flex;justify-content:center;margin-bottom:32px;'>
                <div style='background:#6b1831;border:1.5px solid #3d0d1a;padding:22px 28px;border-radius:10px;max-width:600px;box-shadow:0 4px 18px #0002;display:flex;align-items:center;gap:16px;'>
                    <span style="font-size:2.1em;color:#fff;">&#9888;</span>
                    <div>
                        <h2 style='color:#fff;margin:0 0 8px 0;font-weight:700;'>Teste gratuito excedido</h2>
                        <p style='color:#fff;margin:0;font-size:1.08em;'>O limite de uso gratuito da IA foi atingido.<br>Veja abaixo dicas manuais de economia:</p>
                    </div>
                </div>
            </div>
            <div style='display:flex;flex-wrap:wrap;gap:28px;max-width:1200px;'>
                <div style="background:linear-gradient(145deg,#e6eefa 60%,#f5faff 100%);border-radius:20px;padding:28px 32px;box-shadow:0 8px 32px #0a2a4a22, 0 2px 8px #0a2a4a11;flex:1 1 340px;min-width:300px;display:flex;align-items:center;justify-content:space-between;border:1.5px solid #183153;transition:box-shadow .2s;">
                    <div style='font-size:1.08em;color:#1a2233;'><b>Delivery:</b> Reduza para 2x/mês e economize</div>
                    <div style='font-weight:bold;font-size:1.2em;color:#17613a;'>R$ 250/mês</div>
                </div>
                <div style="background:linear-gradient(145deg,#e6eefa 60%,#f5faff 100%);border-radius:20px;padding:28px 32px;box-shadow:0 8px 32px #0a2a4a22, 0 2px 8px #0a2a4a11;flex:1 1 340px;min-width:300px;display:flex;align-items:center;justify-content:space-between;border:1.5px solid #183153;transition:box-shadow .2s;">
                    <div style='font-size:1.08em;color:#1a2233;'><b>Streaming:</b> Cancele 1 serviço e economize</div>
                    <div style='font-weight:bold;font-size:1.2em;color:#17613a;'>R$ 50/mês</div>
                </div>
                <div style="background:linear-gradient(145deg,#e6eefa 60%,#f5faff 100%);border-radius:20px;padding:28px 32px;box-shadow:0 8px 32px #0a2a4a22, 0 2px 8px #0a2a4a11;flex:1 1 340px;min-width:300px;display:flex;align-items:center;justify-content:space-between;border:1.5px solid #183153;transition:box-shadow .2s;">
                    <div style='font-size:1.08em;color:#1a2233;'><b>Transporte:</b> Use transporte público 50% do mês</div>
                    <div style='font-weight:bold;font-size:1.2em;color:#17613a;'>R$ 120/mês</div>
                </div>
                <div style="background:linear-gradient(145deg,#e6eefa 60%,#f5faff 100%);border-radius:20px;padding:28px 32px;box-shadow:0 8px 32px #0a2a4a22, 0 2px 8px #0a2a4a11;flex:1 1 340px;min-width:300px;display:flex;align-items:center;justify-content:space-between;border:1.5px solid #183153;transition:box-shadow .2s;">
                    <div style='font-size:1.08em;color:#1a2233;'><b>Compras online:</b> Reduza pela metade e economize</div>
                    <div style='font-weight:bold;font-size:1.2em;color:#17613a;'>R$ 100/mês</div>
                </div>
                <div style="background:linear-gradient(145deg,#e6eefa 60%,#f5faff 100%);border-radius:20px;padding:28px 32px;box-shadow:0 8px 32px #0a2a4a22, 0 2px 8px #0a2a4a11;flex:1 1 340px;min-width:300px;display:flex;align-items:center;justify-content:space-between;border:1.5px solid #183153;transition:box-shadow .2s;">
                    <div style='font-size:1.08em;color:#1a2233;'><b>Energia:</b> Troque por LED e desligue stand-by</div>
                    <div style='font-weight:bold;font-size:1.2em;color:#17613a;'>R$ 40/mês</div>
                </div>
                <div style="background:linear-gradient(145deg,#e6eefa 60%,#f5faff 100%);border-radius:20px;padding:28px 32px;box-shadow:0 8px 32px #0a2a4a22, 0 2px 8px #0a2a4a11;flex:1 1 340px;min-width:300px;display:flex;align-items:center;justify-content:space-between;border:1.5px solid #183153;transition:box-shadow .2s;">
                    <div style='font-size:1.08em;color:#1a2233;'><b>Cartão de crédito:</b> Evite parcelar pequenas compras</div>
                    <div style='font-weight:bold;font-size:1.2em;color:#17613a;'>R$ 60/mês</div>
                </div>
                <div style="background:linear-gradient(145deg,#e6eefa 60%,#f5faff 100%);border-radius:20px;padding:28px 32px;box-shadow:0 8px 32px #0a2a4a22, 0 2px 8px #0a2a4a11;flex:1 1 340px;min-width:300px;display:flex;align-items:center;justify-content:space-between;border:1.5px solid #183153;transition:box-shadow .2s;">
                    <div style='font-size:1.08em;color:#1a2233;'><b>Alimentação:</b> Cozinhe mais em casa e leve marmita</div>
                    <div style='font-weight:bold;font-size:1.2em;color:#17613a;'>R$ 180/mês</div>
                </div>
                <div style="background:linear-gradient(145deg,#e6eefa 60%,#f5faff 100%);border-radius:20px;padding:28px 32px;box-shadow:0 8px 32px #0a2a4a22, 0 2px 8px #0a2a4a11;flex:1 1 340px;min-width:300px;display:flex;align-items:center;justify-content:space-between;border:1.5px solid #183153;transition:box-shadow .2s;">
                    <div style='font-size:1.08em;color:#1a2233;'><b>Celular:</b> Revise seu plano e evite cobranças extras</div>
                    <div style='font-weight:bold;font-size:1.2em;color:#17613a;'>R$ 30/mês</div>
                </div>
                <div style="background:linear-gradient(145deg,#e6eefa 60%,#f5faff 100%);border-radius:20px;padding:28px 32px;box-shadow:0 8px 32px #0a2a4a22, 0 2px 8px #0a2a4a11;flex:1 1 340px;min-width:300px;display:flex;align-items:center;justify-content:space-between;border:1.5px solid #183153;transition:box-shadow .2s;">
                    <div style='font-size:1.08em;color:#1a2233;'><b>Farmácia:</b> Compare preços em diferentes redes antes de comprar</div>
                    <div style='font-weight:bold;font-size:1.2em;color:#17613a;'>R$ 35/mês</div>
                </div>
                <div style="background:linear-gradient(145deg,#e6eefa 60%,#f5faff 100%);border-radius:20px;padding:28px 32px;box-shadow:0 8px 32px #0a2a4a22, 0 2px 8px #0a2a4a11;flex:1 1 340px;min-width:300px;display:flex;align-items:center;justify-content:space-between;border:1.5px solid #183153;transition:box-shadow .2s;">
                    <div style='font-size:1.08em;color:#1a2233;'><b>Água:</b> Reduza banhos longos e conserte vazamentos</div>
                    <div style='font-weight:bold;font-size:1.2em;color:#17613a;'>R$ 25/mês</div>
                </div>
                <div style="background:linear-gradient(145deg,#e6eefa 60%,#f5faff 100%);border-radius:20px;padding:28px 32px;box-shadow:0 8px 32px #0a2a4a22, 0 2px 8px #0a2a4a11;flex:1 1 340px;min-width:300px;display:flex;align-items:center;justify-content:space-between;border:1.5px solid #183153;transition:box-shadow .2s;">
                    <div style='font-size:1.08em;color:#1a2233;'><b>Internet:</b> Negocie seu plano ou troque de operadora</div>
                    <div style='font-weight:bold;font-size:1.2em;color:#17613a;'>R$ 40/mês</div>
                </div>
            </div>
            <div style='margin-top:40px;font-size:1.1em;'>
                <b>Com essa economia mensal, você poderia fazer uma viagem em 6 meses, investir em algo novo ou criar uma reserva de emergência!</b>
            </div>
        `;
    }

    // Botão de tema flutuante (login/cadastro)
    const floatingThemeToggle = document.getElementById('floating-theme-toggle');
    const floatingSunIcon = document.getElementById('floating-sun-icon');
    const floatingMoonIcon = document.getElementById('floating-moon-icon');

    function updateFloatingThemeIcon() {
        const currentTheme = document.body.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            if (floatingSunIcon) floatingSunIcon.style.display = 'none';
            if (floatingMoonIcon) floatingMoonIcon.style.display = 'block';
        } else {
            if (floatingSunIcon) floatingSunIcon.style.display = 'block';
            if (floatingMoonIcon) floatingMoonIcon.style.display = 'none';
        }
    }

    if (floatingThemeToggle) {
        floatingThemeToggle.addEventListener('click', () => {
            const currentTheme = document.body.getAttribute('data-theme');
            if (currentTheme === 'dark') {
                document.body.removeAttribute('data-theme');
            } else {
                document.body.setAttribute('data-theme', 'dark');
            }
            updateFloatingThemeIcon();
            updateChart && updateChart();
        });
        updateFloatingThemeIcon();
    }

    const loginThemeBtnWrapper = document.getElementById('login-theme-btn-wrapper');

    function showLoginThemeBtn(show) {
        if (loginThemeBtnWrapper) {
            loginThemeBtnWrapper.style.display = show ? 'block' : 'none';
        }
    }

    // Inicialmente, mostra o botão flutuante se a tela de login estiver visível
    showLoginThemeBtn(!mainContent || mainContent.classList.contains('hidden'));

    // Quando autenticar, esconder o botão flutuante
    async function checkAuth() {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await fetchWithAuth('http://localhost:5000/api/auth/verify', { method: 'GET' });
                if (response.ok) {
                    authScreen.style.display = 'none';
                    mainContent.classList.remove('hidden');
                    showLoginThemeBtn(false);
                    await loadReports();
                    // ...restante do código...
                } else {
                    localStorage.removeItem('token');
                    authScreen.style.display = 'flex';
                    mainContent.classList.add('hidden');
                    showLoginThemeBtn(true);
                }
            } catch (error) {
                localStorage.removeItem('token');
                authScreen.style.display = 'flex';
                mainContent.classList.add('hidden');
                showLoginThemeBtn(true);
            }
        } else {
            authScreen.style.display = 'flex';
            mainContent.classList.add('hidden');
            showLoginThemeBtn(true);
        }
    }

    const loginThemeToggle = document.getElementById('login-theme-toggle');
    const loginSunIcon = document.getElementById('login-sun-icon');
    const loginMoonIcon = document.getElementById('login-moon-icon');

    function updateLoginThemeIcon() {
        const currentTheme = document.body.getAttribute('data-theme');
        if (loginSunIcon) loginSunIcon.style.display = currentTheme === 'dark' ? 'none' : 'block';
        if (loginMoonIcon) loginMoonIcon.style.display = currentTheme === 'dark' ? 'block' : 'none';
    }

    if (loginThemeToggle) {
        loginThemeToggle.addEventListener('click', () => {
            const currentTheme = document.body.getAttribute('data-theme');
            if (currentTheme === 'dark') {
                document.body.removeAttribute('data-theme');
            } else {
                document.body.setAttribute('data-theme', 'dark');
            }
            updateLoginThemeIcon();
            updateAllThemeIcons && updateAllThemeIcons();
            updateChart && updateChart();
        });
        updateLoginThemeIcon();
    }

    console.log('Reports:', reports);

    function displayRanking(rankingData) {
        // ...
    }

    // Calcule primeiro
    const establishmentTotals = {};
    reports.forEach(report => {
        if (report.companyExpenses && Array.isArray(report.companyExpenses)) {
            report.companyExpenses.forEach(exp => {
                if (!establishmentTotals[exp.name]) establishmentTotals[exp.name] = 0;
                establishmentTotals[exp.name] += Number(exp.value) || 0;
            });
        }
    });
    const sortedEstablishments = Object.entries(establishmentTotals)
        .sort((a, b) => b[1] - a[1]); // Maior gasto primeiro

    // Só depois use ou faça log
    console.log('sortedEstablishments:', sortedEstablishments);
    console.log('reports:', reports);

    console.log('lastPdfCompareData:', window.lastPdfCompareData);

    window.lastPdfCompareData = {
      total: 10,
      duplicados: [
        { value: "R$ 100,00", count: 3 },
        { value: "R$ 50,00", count: 2 }
      ]
    };
    updateChart();
}); 
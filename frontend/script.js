console.log('JS está rodando!');
alert('JS está rodando!');

let reports = [];
let reportsChart = null;
const reportForm = document.getElementById('report-form');

reports.push({
    projectName: 'Projeto Teste',
    referenceMonth: '2024-06',
    responsiblePerson: 'Fulano',
    summary: 'Resumo teste',
    completedActivities: ['Atividade 1'],
    criticalExpenses: ['Material: R$ 100,00'],
    plannedVsAchieved: 'Planejado',
    problems: ['Nenhum'],
    attachments: []
});

document.addEventListener('DOMContentLoaded', () => {
    const authScreen = document.getElementById('auth-screen');
    const mainContent = document.getElementById('main-content');
    
    authScreen.style.display = 'flex';
    mainContent.classList.add('hidden');

    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            body.removeAttribute('data-theme');
            themeToggle.textContent = 'Tema Escuro';
        } else {
            body.setAttribute('data-theme', 'dark');
            themeToggle.textContent = 'Tema Claro';
        }
        updateChart();
    });

    const reportsTab = document.getElementById('reports-tab');
    const graphTab = document.getElementById('graph-tab');
    const reportsSection = document.getElementById('reports-section');
    const graphSection = document.getElementById('graph-section');

    reportsTab.addEventListener('click', () => {
        reportsSection.classList.remove('hidden-section');
        reportsSection.classList.add('active-section');
        graphSection.classList.remove('active-section');
        graphSection.classList.add('hidden-section');
        reportsTab.classList.add('active');
        graphTab.classList.remove('active');
    });

    graphTab.addEventListener('click', () => {
        graphSection.classList.remove('hidden-section');
        graphSection.classList.add('active-section');
        reportsSection.classList.remove('active-section');
        reportsSection.classList.add('hidden-section');
        graphTab.classList.add('active');
        reportsTab.classList.remove('active');
        updateChart();
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
                    backgroundColor: backgroundColor,
                    borderColor: borderColor,
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
                <th>Ações</th>
            </tr>
        `;
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        reports.forEach(report => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${report.projectName}</td>
                <td>${formatMonthYear(report.referenceMonth)}</td>
                <td>${report.responsiblePerson}</td>
                <td>${report.summary}</td>
                <td>
                    <ul>
                        ${report.criticalExpenses.map(expense => `<li>${expense}</li>`).join('')}
                    </ul>
                </td>
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
        
        const criticalExpenses = document.getElementById('criticalExpenses').value.split('\n');
        
        if (!validateCriticalExpenses(criticalExpenses)) {
            return;
        }
        
        const formData = {
            projectName: document.getElementById('projectName').value,
            referenceMonth: document.getElementById('referenceMonth').value,
            responsiblePerson: document.getElementById('responsiblePerson').value,
            summary: document.getElementById('summary').value,
            completedActivities: document.getElementById('completedActivities').value.split('\n'),
            criticalExpenses: criticalExpenses,
            plannedVsAchieved: document.getElementById('plannedVsAchieved').value,
            problems: document.getElementById('problems').value.split('\n'),
            attachments: Array.from(document.getElementById('attachments').files).map(file => file.name)
        };

        try {
            const response = await fetchWithAuth('http://localhost:5000/api/reports', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Relatório enviado com sucesso!');
                reportForm.reset();

                const novoRelatorio = { ...formData };
                const data = await response.json();
                novoRelatorio._id = data._id || data.id;

                reports.push(novoRelatorio);
                displayReports(reports);
                updateChart();
            } else {
                throw new Error('Erro ao enviar relatório');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Erro ao enviar relatório. Por favor, faça login novamente.');
            checkAuth();
        }
    });

    const criticalExpensesInput = document.getElementById('criticalExpenses');
    criticalExpensesInput.placeholder = "";

    const formGroup = criticalExpensesInput.closest('.form-group');
    const helpText = document.createElement('div');
    helpText.className = 'help-text';
    helpText.innerHTML = `
        <p>Formato obrigatório para cada gasto:</p>
        <p class="example">Descrição: R$ X,XX</p>
        <p>Exemplos válidos:</p>
        <ul>
            <li>Material de escritório: R$ 150,00</li>
            <li>Serviços de TI: R$ 2.500,00</li>
            <li>Aluguel: R$ 1.000,00</li>
        </ul>
    `;
    formGroup.appendChild(helpText);

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
}); 
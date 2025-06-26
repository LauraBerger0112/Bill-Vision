// Configurações globais
const API_URL = 'http://localhost:3000/api';
let bills = [];
let settings = {
    currency: 'BRL',
    theme: 'light'
};

// Funções de utilidade
const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: settings.currency
    }).format(value);
};

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR');
};

// Gerenciamento de contas
const loadBills = async () => {
    try {
        const response = await fetch(`${API_URL}/bills`);
        bills = await response.json();
        updateBillsTable();
        updateDashboard();
    } catch (error) {
        console.error('Erro ao carregar contas:', error);
    }
};

const addBill = async (billData) => {
    try {
        const response = await fetch(`${API_URL}/bills`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(billData)
        });
        if (response.status === 409) {
            // Assinatura repetida
            const errorData = await response.json();
            showBillError(errorData.message || 'Assinatura repetida.');
            return;
        }
        const newBill = await response.json();
        bills.push(newBill);
        updateBillsTable();
        updateDashboard();
        hideBillError();
    } catch (error) {
        console.error('Erro ao adicionar conta:', error);
        showBillError('Erro ao adicionar conta.');
    }
};

const deleteBill = async (id) => {
    try {
        await fetch(`${API_URL}/bills/${id}`, {
            method: 'DELETE'
        });
        bills = bills.filter(bill => bill.id !== id);
        updateBillsTable();
        updateDashboard();
    } catch (error) {
        console.error('Erro ao deletar conta:', error);
    }
};

// Atualização da interface
const updateBillsTable = () => {
    const tbody = document.getElementById('bills-table-body');
    tbody.innerHTML = '';

    bills.forEach(bill => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${bill.name}</td>
            <td>${formatCurrency(bill.value)}</td>
            <td>${formatDate(bill.date)}</td>
            <td>${bill.category}</td>
            <td>
                <button onclick="deleteBill('${bill.id}')">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
};

const updateDashboard = () => {
    const totalBills = bills.length;
    const pendingBills = bills.filter(bill => !bill.paid).length;
    const totalPaid = bills
        .filter(bill => bill.paid)
        .reduce((sum, bill) => sum + bill.value, 0);

    document.getElementById('total-bills').textContent = totalBills;
    document.getElementById('pending-bills').textContent = pendingBills;
    document.getElementById('total-paid').textContent = formatCurrency(totalPaid);
};

// Funções para exibir/ocultar mensagem de erro
function showBillError(message) {
    const errorDiv = document.getElementById('bill-error-message');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}
function hideBillError() {
    const errorDiv = document.getElementById('bill-error-message');
    errorDiv.textContent = '';
    errorDiv.style.display = 'none';
}

// Event Listeners
document.getElementById('bill-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    hideBillError();
    const billData = {
        name: document.getElementById('bill-name').value,
        value: parseFloat(document.getElementById('bill-value').value),
        date: document.getElementById('bill-date').value,
        category: document.getElementById('bill-category').value
    };
    await addBill(billData);
    e.target.reset();
});

document.getElementById('settings-form').addEventListener('submit', (e) => {
    e.preventDefault();
    settings.currency = document.getElementById('currency').value;
    settings.theme = document.getElementById('theme').value;
    
    // Aplicar tema
    document.body.classList.toggle('dark-theme', settings.theme === 'dark');
    
    // Atualizar interface
    updateBillsTable();
    updateDashboard();
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    loadBills();
    
    // Carregar configurações salvas
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
        settings = JSON.parse(savedSettings);
        document.getElementById('currency').value = settings.currency;
        document.getElementById('theme').value = settings.theme;
        document.body.classList.toggle('dark-theme', settings.theme === 'dark');
    }
}); 
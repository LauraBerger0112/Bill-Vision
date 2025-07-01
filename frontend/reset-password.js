document.addEventListener('DOMContentLoaded', () => {
    const resetPasswordForm = document.getElementById('reset-password-form');
    const resetPasswordInput = document.getElementById('reset-password');

    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    resetPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const password = resetPasswordInput.value;
        const token = getQueryParam('token');
        if (!token) {
            alert('Token de redefinição inválido.');
            return;
        }
        try {
            const response = await fetch('http://localhost:5000/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            });
            const data = await response.json();
            if (response.ok) {
                alert('Senha redefinida com sucesso! Faça login com sua nova senha.');
                window.location.href = 'index.html';
            } else {
                alert(data.message || 'Erro ao redefinir senha.');
            }
        } catch (error) {
            alert('Erro ao conectar ao servidor.');
        }
    });
}); 
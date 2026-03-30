/* ============================================
   EXPENSE PAGE — JavaScript Logic
   ============================================ */

const API_BASE = 'http://localhost:8080';



// --- Button Ripple Effect ---
function addRippleEffects() {
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mousedown', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            btn.style.setProperty('--ripple-x', x + '%');
            btn.style.setProperty('--ripple-y', y + '%');
        });
    });
}

// --- Toast Notification ---
function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMessage');
    const toastIcon = toast.querySelector('.toast-icon');

    toastMsg.textContent = message;
    toastIcon.textContent = isError ? '❌' : '✅';
    toast.classList.toggle('error', isError);
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// --- Add Expense ---
async function addExpense() {
    const amountInput = document.getElementById('amount');
    const categoryInput = document.getElementById('category');
    const amount = parseFloat(amountInput.value);
    const category = categoryInput.value.trim();

    if (!amount || amount <= 0) {
        showToast('Please enter a valid amount', true);
        amountInput.focus();
        return;
    }
    if (!category) {
        showToast('Please enter a category', true);
        categoryInput.focus();
        return;
    }

    const btn = document.getElementById('addExpenseBtn');
    btn.disabled = true;
    btn.querySelector('.btn-text').textContent = 'Adding...';

    try {
        const response = await fetch(`${API_BASE}/addExpense`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount, category })
        });

        if (!response.ok) throw new Error('Failed to add expense');

        showToast(`₹${amount.toFixed(2)} added for "${category}"`);
        amountInput.value = '';
        categoryInput.value = '';
        amountInput.focus();
    } catch (error) {
        showToast('Failed to add expense. Is the server running?', true);
        console.error(error);
    } finally {
        btn.disabled = false;
        btn.querySelector('.btn-text').textContent = 'Add Expense';
    }
}

// --- Save Salary ---
async function saveSalary() {
    const salaryInput = document.getElementById('salary');
    const amount = parseFloat(salaryInput.value);

    if (!amount || amount <= 0) {
        showToast('Please enter a valid salary amount', true);
        salaryInput.focus();
        return;
    }

    const btn = document.getElementById('saveSalaryBtn');
    btn.disabled = true;
    btn.querySelector('.btn-text').textContent = 'Saving...';

    try {
        const response = await fetch(`${API_BASE}/addSalary`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount })
        });

        if (!response.ok) throw new Error('Failed to save salary');

        showToast(`Monthly salary set to ₹${amount.toFixed(2)}`);
    } catch (error) {
        showToast('Failed to save salary. Is the server running?', true);
        console.error(error);
    } finally {
        btn.disabled = false;
        btn.querySelector('.btn-text').textContent = 'Save Salary';
    }
}

// --- Load salary on page load ---
async function loadSalary() {
    try {
        const response = await fetch(`${API_BASE}/salary`);
        if (response.ok) {
            const data = await response.json();
            if (data.salary > 0) {
                document.getElementById('salary').value = data.salary;
            }
        }
    } catch (e) {
        // Server might not be running — ignore
    }
}

// --- Navigate to Dashboard ---
function goToDashboard() {
    const transition = document.getElementById('pageTransition');
    transition.classList.add('active');
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 500);
}

// --- Allow Enter key to submit ---
function setupKeyboardShortcuts() {
    document.getElementById('amount').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') document.getElementById('category').focus();
    });
    document.getElementById('category').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addExpense();
    });
    document.getElementById('salary').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') saveSalary();
    });
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
    addRippleEffects();
    setupKeyboardShortcuts();
    loadSalary();
});

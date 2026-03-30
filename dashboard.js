/* ============================================
   DASHBOARD PAGE — JavaScript Logic
   ============================================ */

const API_BASE = 'http://localhost:8080';
let currentFilter = 'all';



// --- Format currency ---
function formatCurrency(val) {
    return '₹' + Number(val).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

// --- Format date ---
function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
    }) + '  ' + d.toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit'
    });
}

// --- Load Summary ---
async function loadSummary() {
    try {
        const response = await fetch(`${API_BASE}/summary?type=${currentFilter}`);
        if (!response.ok) throw new Error('Failed to fetch summary');
        const data = await response.json();

        animateValue('salaryValue', data.salary);
        animateValue('totalValue', data.totalExpense);
        animateValue('averageValue', data.averageExpense);
        animateValue('balanceValue', data.balance);

        // Balance card glow
        const balanceCard = document.getElementById('balanceCard');
        balanceCard.classList.remove('positive', 'negative');
        balanceCard.classList.add(data.balance >= 0 ? 'positive' : 'negative');
    } catch (error) {
        console.error('Summary load error:', error);
    }
}

// --- Animate number counting ---
function animateValue(elementId, target) {
    const el = document.getElementById(elementId);
    const start = parseFloat(el.textContent.replace(/[₹,]/g, '')) || 0;
    const duration = 600;
    const startTime = performance.now();

    function update(time) {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = start + (target - start) * eased;
        el.textContent = formatCurrency(current);
        if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
}

// --- Load Expenses Table ---
async function loadExpenses() {
    try {
        let url = `${API_BASE}/expenses`;
        if (currentFilter !== 'all') {
            url = `${API_BASE}/expenses/filter?type=${currentFilter}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch expenses');
        const expenses = await response.json();

        renderTable(expenses);
    } catch (error) {
        console.error('Expenses load error:', error);
    }
}

// --- Render Table ---
function renderTable(expenses) {
    const tbody = document.getElementById('expenseTableBody');
    tbody.innerHTML = '';

    if (expenses.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="4">No expenses found for this period</td></tr>';
        return;
    }

    expenses.forEach((exp, index) => {
        const tr = document.createElement('tr');
        tr.classList.add('slide-row');
        tr.style.animationDelay = (index * 0.06) + 's';

        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${formatCurrency(exp.amount)}</td>
            <td><span class="category-badge">${escapeHtml(exp.category)}</span></td>
            <td class="date-cell">${formatDate(exp.createdAt)}</td>
        `;

        tbody.appendChild(tr);
    });
}

// --- Filter Expenses ---
function filterExpenses(type, btnEl) {
    currentFilter = type;

    // Update active button
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');

    loadSummary();
    loadExpenses();
}

// --- Go Back ---
function goBack() {
    const transition = document.getElementById('pageTransition');
    transition.classList.add('active');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 500);
}

// --- Escape HTML ---
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// --- Ripple effects ---
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

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
    addRippleEffects();
    loadSummary();
    loadExpenses();
});


document.addEventListener('DOMContentLoaded', () => {
    const expenseNameInput = document.getElementById('expense-name');
    const expenseAmountInput = document.getElementById('expense-amount');
    const addExpenseButton = document.getElementById('add-expense');
    const incomeNameInput = document.getElementById('income-name');
    const incomeAmountInput = document.getElementById('income-amount');
    const addIncomeButton = document.getElementById('add-income');
    const transactionsList = document.getElementById('transactions'); // Renamed from expensesList
    const totalIncomeSpan = document.getElementById('total-income');
    const totalExpensesSpan = document.getElementById('total-expenses');
    const netBalanceSpan = document.getElementById('net-balance');
    const currentDateSpan = document.getElementById('current-date');
    const currentTimeSpan = document.getElementById('current-time');
    const filterDateInput = document.getElementById('filter-date');

    let transactions = JSON.parse(localStorage.getItem('transactions')) || []; // Renamed from expenses

    // Function to save transactions to localStorage
    function saveTransactions() {
        localStorage.setItem('transactions', JSON.stringify(transactions)); // Renamed from expenses
    }

    // Function to update current date and time
    function updateDateTime() {
        const now = new Date();
        const optionsDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const optionsTime = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
        currentDateSpan.textContent = now.toLocaleDateString(undefined, optionsDate);
        currentTimeSpan.textContent = now.toLocaleTimeString(undefined, optionsTime);
    }

    // Set initial date and time and update every second
    updateDateTime();
    setInterval(updateDateTime, 1000);

    function fetchTransactions() { // Renamed from fetchExpenses
        return transactions;
    }

    async function renderTransactions() { // Renamed from renderExpenses
        const allTransactions = fetchTransactions();
        transactionsList.innerHTML = ''; // Renamed from expensesList
        let totalIncome = 0;
        let totalExpenses = 0;

        const filterDate = filterDateInput.value; // Get the selected filter date (YYYY-MM-DD)

        const filteredTransactions = filterDate
            ? allTransactions.filter(transaction => transaction.fullDate.split('T')[0] === filterDate)
            : allTransactions; // If no filter date, show all transactions

        // Group transactions by date
        const transactionsByDate = filteredTransactions.reduce((acc, transaction) => {
            const dateKey = transaction.fullDate.split('T')[0]; // Use YYYY-MM-DD for grouping
            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }
            acc[dateKey].push(transaction);
            return acc;
        }, {});

        // Sort dates in descending order
        const sortedDates = Object.keys(transactionsByDate).sort((a, b) => new Date(b) - new Date(a));

        sortedDates.forEach(dateKey => {
            const dateHeader = document.createElement('h3');
            dateHeader.textContent = new Date(dateKey).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            transactionsList.appendChild(dateHeader); // Renamed from expensesList

            transactionsByDate[dateKey].forEach((transaction) => {
                const listItem = document.createElement('li');
                listItem.classList.add(transaction.type); // Add class for styling
                listItem.innerHTML = `
                    <span>${transaction.name}: $${transaction.amount.toFixed(2)} - ${transaction.time}</span>
                    <button data-full-date="${transaction.fullDate}" data-name="${transaction.name}" data-amount="${transaction.amount}" data-type="${transaction.type}">Delete</button>
                `;
                transactionsList.appendChild(listItem); // Renamed from expensesList

                if (transaction.type === 'income') {
                    totalIncome += transaction.amount;
                } else {
                    totalExpenses += transaction.amount;
                }
            });
        });

        const netBalance = totalIncome - totalExpenses;
        totalIncomeSpan.textContent = totalIncome.toFixed(2);
        totalExpensesSpan.textContent = totalExpenses.toFixed(2);
        netBalanceSpan.textContent = netBalance.toFixed(2);
    }

    // Event listener for the filter date input
    filterDateInput.addEventListener('change', renderTransactions);

    async function addExpense() {
        const name = expenseNameInput.value.trim();
        const amount = parseFloat(expenseAmountInput.value);

        if (name && !isNaN(amount) && amount > 0) {
            const now = new Date();
            const fullDate = now.toISOString();
            const date = now.toLocaleDateString();
            const time = now.toLocaleTimeString();
            transactions.push({ name, amount, date, time, fullDate, type: 'expense' }); // Added type
            saveTransactions(); // Renamed from saveExpenses
            renderTransactions(); // Renamed from renderExpenses
            expenseNameInput.value = '';
            expenseAmountInput.value = '';
        } else {
            alert('Please enter a valid expense name and amount.');
        }
    }

    async function addIncome() { // New function for adding income
        const name = incomeNameInput.value.trim();
        const amount = parseFloat(incomeAmountInput.value);

        if (name && !isNaN(amount) && amount > 0) {
            const now = new Date();
            const fullDate = now.toISOString();
            const date = now.toLocaleDateString();
            const time = now.toLocaleTimeString();
            transactions.push({ name, amount, date, time, fullDate, type: 'income' }); // Added type
            saveTransactions();
            renderTransactions();
            incomeNameInput.value = '';
            incomeAmountInput.value = '';
        } else {
            alert('Please enter a valid income source and amount.');
        }
    }

    async function deleteTransaction(event) { // Renamed from deleteExpense
        if (event.target.tagName === 'BUTTON') {
            const fullDateToDelete = event.target.dataset.fullDate;
            const nameToDelete = event.target.dataset.name;
            const amountToDelete = parseFloat(event.target.dataset.amount);
            const typeToDelete = event.target.dataset.type; // New: get type

            // Find the index of the transaction to delete based on all its properties
            const indexToDelete = transactions.findIndex(transaction => 
                transaction.fullDate === fullDateToDelete &&
                transaction.name === nameToDelete &&
                transaction.amount === amountToDelete &&
                transaction.type === typeToDelete
            );

            if (indexToDelete !== -1) {
                transactions.splice(indexToDelete, 1);
                saveTransactions();
                renderTransactions();
            } else {
                alert('Error: Could not find the transaction to delete.');
            }
        }
    }

    addExpenseButton.addEventListener('click', addExpense);
    addIncomeButton.addEventListener('click', addIncome); // New event listener
    transactionsList.addEventListener('click', deleteTransaction); // Renamed from expensesList, deleteExpense

    renderTransactions(); // Renamed from renderExpenses
});
const balance = document.getElementById("balance");
const moneyPlus = document.getElementById("money-plus");
const moneyMinus = document.getElementById("money-minus");
const list = document.getElementById("list");
const form = document.getElementById("form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const notification = document.getElementById("notification");
const expenseTableBody = document.querySelector("#expense-table tbody");
const expenseChartCtx = document.getElementById("expense-chart")?.getContext("2d");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

function updateLocaleStorage() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function showNotification() {
  notification.classList.add("show");
  setTimeout(() => {
    notification.classList.remove("show");
  }, 2000);
}

function generateID() {
  return Math.floor(Math.random() * 100000000);
}

function addTransaction(e) {
  e.preventDefault();
  if (text.value.trim() === "" || amount.value.trim() === "") {
    showNotification();
  } else {
    const transaction = {
      id: generateID(),
      text: text.value,
      amount: +amount.value,
    };
    transactions.push(transaction);
    addTransactionDOM(transaction);
    if (expenseTableBody) {
      addTransactionTable(transaction);
    }
    updateValues();
    if (expenseChartCtx) {
      updateChart();
    }
    updateLocaleStorage();
    text.value = "";
    amount.value = "";
  }
}

function addTransactionDOM(transaction) {
  if (!list) return; // If list is not present, skip this function

  const sign = transaction.amount < 0 ? "-" : "+";
  const item = document.createElement("li");
  item.classList.add(sign === "+" ? "plus" : "minus");
  item.innerHTML = `
          ${transaction.text} <span>${sign}${Math.abs(transaction.amount)}</span
          ><button class="delete-btn" onclick="removeTransaction(${transaction.id})"><i class="fa fa-times"></i></button>
    `;
  list.appendChild(item);
}

function addTransactionTable(transaction) {
  if (transaction.amount < 0 && expenseTableBody) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${transaction.text}</td>
      <td>$${Math.abs(transaction.amount).toFixed(2)}</td>
    `;
    expenseTableBody.appendChild(row);
  }
}

function updateValues() {
  const amounts = transactions.map((transaction) => transaction.amount);
  const total = amounts
    .reduce((accumulator, value) => (accumulator += value), 0)
    .toFixed(2);
  const income = amounts
    .filter((value) => value > 0)
    .reduce((accumulator, value) => (accumulator += value), 0)
    .toFixed(2);
  const expense = (
    amounts
      .filter((value) => value < 0)
      .reduce((accumulator, value) => (accumulator += value), 0) * -1
  ).toFixed(2);

  if (balance) balance.innerText = `$${total}`;
  if (moneyPlus) moneyPlus.innerText = `$${income}`;
  if (moneyMinus) moneyMinus.innerText = `$${expense}`;
}

function removeTransaction(id) {
  transactions = transactions.filter((transaction) => transaction.id !== id);
  updateLocaleStorage();
  init();
}

// Pie Chart Setup
let expenseChart;
function updateChart() {
  if (!expenseChartCtx) return; // Exit if there's no chart context (e.g., on non-chart pages)

  const expenseData = transactions
    .filter((transaction) => transaction.amount < 0)
    .map((transaction) => ({
      label: transaction.text,
      value: Math.abs(transaction.amount),
    }));

  const labels = expenseData.map((data) => data.label);
  const values = expenseData.map((data) => data.value);

  if (expenseChart) {
    expenseChart.destroy();
  }

  expenseChart = new Chart(expenseChartCtx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Expenses",
          data: values,
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
            "#FF9F40",
          ],
        },
      ],
    },
  });
}

// Init
function init() {
  if (list) list.innerHTML = "";
  if (expenseTableBody) expenseTableBody.innerHTML = "";

  transactions.forEach((transaction) => {
    addTransactionDOM(transaction);
    if (expenseTableBody) {
      addTransactionTable(transaction);
    }
  });

  updateValues();
  if (expenseChartCtx) {
    updateChart();
  }
}

init();

if (form) {
  form.addEventListener("submit", addTransaction);
}

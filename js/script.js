document.addEventListener("DOMContentLoaded", () => {

    const emailButton = document.getElementById("send-email");
    const canvas = document.getElementById("barChart");

    emailButton.addEventListener("click", async (event) => {
        event.preventDefault();

        const email = document.getElementById("email-address").value;
        // const chartImage = document.getElementById("chartImage").value; // Set this value dynamically from your chart
        const chartImage = canvas.toDataURL("image/png");
        try {
            const response = await fetch("http://localhost:3000/send-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, chartImage }),
            });

            const result = await response.json();
            alert(result.message || "Email sent!");
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to send email.");
        }
    });

    const months = [
        "january", "february", "march", "april", "may", "june",
        "july", "august", "september", "october", "november", "december"
    ];

    // Function to set default values for income and expense inputs
    const setDefaultValues = () => {
        months.forEach(month => {
            const incomeInput = document.getElementById(`income-${month}`);
            const expenseInput = document.getElementById(`expenses-${month}`);

            if (incomeInput && expenseInput) {
                const expenseValue = Math.floor(Math.random() * (800 - 200 + 1)) + 200; // Random value between 200 and 800
                const incomeValue = Math.floor(Math.random() * (1000 - (expenseValue + 1) + 1)) + (expenseValue + 1); // Random value greater than expenseValue and up to 1000

                incomeInput.value = incomeValue;
                expenseInput.value = expenseValue;
            }
        });
    };

    // Call the function to set default values
    setDefaultValues();

    const usernameInput = document.getElementById("username");
    usernameInput?.addEventListener("input", () => {
        const username = usernameInput.value.trim();
        const regex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;
        usernameInput.style.borderColor = regex.test(username) ? "green" : "red";
    });

    const getIncomeData = () =>
        months.map(month => parseFloat(document.getElementById(`income-${month}`)?.value) || 0);

    const getExpenseData = () =>
        months.map(month => parseFloat(document.getElementById(`expenses-${month}`)?.value) || 0);

    const ctx = document.getElementById("barChart")?.getContext("2d");
    const barChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: months.map(month => month.charAt(0).toUpperCase() + month.slice(1)),
            datasets: [
                {
                    label: "Income",
                    data: getIncomeData(),
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1,
                },
                {
                    label: "Expenses",
                    data: getExpenseData(),
                    backgroundColor: "rgba(255, 99, 132, 0.2)",
                    borderColor: "rgba(255, 99, 132, 1)",
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: "top" },
            },
            scales: {
                y: { beginAtZero: true },
            },
        },
    });

    document.querySelectorAll("[id^='income-']").forEach(input =>
        input.addEventListener("input", () => {
            barChart.data.datasets[0].data = getIncomeData();
            barChart.update();
        })
    );

    document.querySelectorAll("[id^='expenses-']").forEach(input =>
        input.addEventListener("input", () => {
            barChart.data.datasets[1].data = getExpenseData();
            barChart.update();
        })
    );

    document.getElementById("download-btn")?.addEventListener("click", () => {
        // const canvas = document.getElementById("barChart");
        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = image;
        link.download = "chart.png";
        link.click();
    });
});
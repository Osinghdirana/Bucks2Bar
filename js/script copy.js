document.addEventListener("DOMContentLoaded", function () {
    // input with id "username" on change event
    const usernameInput = document.getElementById("username");
    usernameInput.addEventListener("input", function () {
        const username = usernameInput.value.trim();
        // regex to check if username has at least 1 capital letter, 1 special character, and 1 number and is at least 8 characters long
        const regex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;
        const isValid = regex.test(username);
        // set the username input border color to green if valid, red if invalid
        if (isValid) {
            usernameInput.style.borderColor = "green";
        } else {
            usernameInput.style.borderColor = "red";
        }
    });
    
    // Function to fetch income data from the "Data" tab
    function getIncomeData() {
        const months = [
            "january",
            "february",
            "march",
            "april",
            "may",
            "june",
            "july",
            "august",
            "september",
            "october",
            "november",
            "december",
        ];
        return months.map((month) => {
            const incomeInput = document.getElementById(`income-${month}`);
            return incomeInput ? parseFloat(incomeInput.value) || 0 : 0;
        });
    }

    // Function to fetch expense data from the "Data" tab
    function getExpenseData() {
        const months = [
            "january",
            "february",
            "march",
            "april",
            "may",
            "june",
            "july",
            "august",
            "september",
            "october",
            "november",
            "december",
        ];
        return months.map((month) => {
            const expenseInput = document.getElementById(`expenses-${month}`);
            return expenseInput ? parseFloat(expenseInput.value) || 0 : 0;
        });
    }

    // Initialize the chart
    const ctx = document.getElementById("barChart").getContext("2d");
    const barChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
            ],
            datasets: [
                {
                    label: "Income",
                    data: getIncomeData(), // Fetch income data dynamically
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1,
                },
                {
                    label: "Expenses",
                    data: getExpenseData(), // Fetch expense data dynamically
                    backgroundColor: "rgba(255, 99, 132, 0.2)",
                    borderColor: "rgba(255, 99, 132, 1)",
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "top",
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        },
    });

    // Update the chart when the "Data" tab inputs change
    const incomeInputs = document.querySelectorAll("[id^='income-']");
    const expenseInputs = document.querySelectorAll("[id^='expenses-']");

    // Add event listeners to income inputs
    incomeInputs.forEach((input) => {
        input.addEventListener("input", () => {
            barChart.data.datasets[0].data = getIncomeData(); // Update income data
            barChart.update();
        });
    });

    // Add event listeners to expense inputs
    expenseInputs.forEach((input) => {
        input.addEventListener("input", () => {
            barChart.data.datasets[1].data = getExpenseData(); // Update expense data
            barChart.update();
        });
    });
    // Add event listener to the "Download" button
    const downloadButton = document.getElementById("download-btn");
    downloadButton.addEventListener("click", function () {
        const canvas = document.getElementById("barChart");
        const image = canvas.toDataURL("image/png"); // Get the canvas image as a data URL
        const link = document.createElement("a");
        link.href = image;
        link.download = "chart.png"; // Set the default file name
        link.click(); // Trigger the download
    });
});
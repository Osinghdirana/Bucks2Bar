// filepath: d:\Trainings\Udemy\Github Copilot\bucks2bar\js\script.test.js

describe("Username Validation Regex", () => {
    const regex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;

    test("Valid usernames", () => {
        const validUsernames = [
            "Password1!",
            "Valid123@",
            "TestUser9#",
            "StrongP@ss1"
        ];
        validUsernames.forEach((username) => {
            expect(regex.test(username)).toBe(true);
        });
    });

    test("Invalid usernames", () => {
        const invalidUsernames = [
            "password", // No uppercase, number, or special character
            "PASSWORD", // No number or special character
            "Pass1234", // No special character
            "Short1!",  // Less than 8 characters
            "NoSpecialChar1" // No special character
        ];
        invalidUsernames.forEach((username) => {
            expect(regex.test(username)).toBe(false);
        });
    });

    test("Border color is set to green for valid username", () => {
        // Mock input element
        const mockInput = {
            value: "Password1!",
            style: { borderColor: "" }
        };
        // Simulate event listener logic
        const username = mockInput.value.trim();
        const regex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;
        mockInput.style.borderColor = regex.test(username) ? "green" : "red";
        expect(mockInput.style.borderColor).toBe("green");
    });

    test("Border color is set to red for invalid username", () => {
        // Mock input element
        const mockInput = {
            value: "password",
            style: { borderColor: "" }
        };
        // Simulate event listener logic
        const username = mockInput.value.trim();
        const regex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;
        mockInput.style.borderColor = regex.test(username) ? "green" : "red";
        expect(mockInput.style.borderColor).toBe("red");
    });


});
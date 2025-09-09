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
});
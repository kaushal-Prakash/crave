import { Selector, t } from "testcafe";

export async function login() {
    const usernameInput = Selector('input[placeholder="Enter your email"]');
    const passwordInput = Selector('input[placeholder="Enter your password"]');
    const loginButton   = Selector("button").withText("Login");

    await t
        .typeText(usernameInput, "jay")
        .typeText(passwordInput, "123")
        .click(loginButton)
        .wait(2000);

    await t
        .expect(t.eval(() => window.location.pathname))
        .eql("/home");
}

import { Selector, t } from "testcafe";

export async function login() {

    // Clear cookies before every login
    await t.eval(() => {
        document.cookie.split(";").forEach(c => {
            document.cookie = c
              .replace(/^ +/, "")
              .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
        });
    });

    const usernameInput = Selector('input[placeholder="Enter your email"]');
    const passwordInput = Selector('input[placeholder="Enter your password"]');
    const loginButton   = Selector("button").withText("Login");

    await t
        .typeText(usernameInput, "jay", { replace: true })
        .typeText(passwordInput, "123", { replace: true })
        .click(loginButton)
        .wait(1500);

    await t
        .expect(t.eval(() => window.location.pathname))
        .eql("/home");
}

// tests/helpers/login.js
import { Selector } from "testcafe";

export async function login(t) {
    console.log("---- CLEARING COOKIES ----");

    await t.deleteCookies();

    // Always navigate freshly to /login so state and inputs from previous tests are reset
    await t.navigateTo(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/login`);

    const usernameInput = Selector('input[placeholder="Enter your email"]');
    const passwordInput = Selector('input[placeholder="Enter your password"]');
    const loginButton   = Selector('button').withText('Login');

    await t.expect(usernameInput.exists).ok("Username input should exist", { timeout: 10000 });
    await t.wait(600); // Allow Next.js client hydration to settle

    await t.click(usernameInput);
    await t.typeText(usernameInput, "jay", { replace: true, paste: true });
    await t.click(passwordInput);
    await t.typeText(passwordInput, "12345678", { replace: true, paste: true });

    await t.click(loginButton);

    await t.expect(t.eval(() => window.location.pathname)).eql("/home", { timeout: 15000 });

    const cookies = await t.getCookies();
    console.log("COOKIES AFTER LOGIN:", cookies);

    const url = await t.eval(() => window.location.href);
    console.log("URL AFTER LOGIN:", url);
}

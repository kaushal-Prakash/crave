// tests/helpers/login.js
import { Selector } from "testcafe";

export async function login(t) {
    console.log("---- CLEARING COOKIES ----");

    await t.deleteCookies();

    const usernameInput = Selector('input[placeholder="Enter your email"]');
    const passwordInput = Selector('input[placeholder="Enter your password"]');
    const loginButton   = Selector('button').withText('Login');

    await t.click(usernameInput);
    await t.pressKey("ctrl+a delete");
    await t.typeText(usernameInput, "jay", { paste: true });

    await t.click(passwordInput);
    await t.pressKey("ctrl+a delete");
    await t.typeText(passwordInput, "123", { paste: true });

    await t.click(loginButton).wait(2000);

    const cookies = await t.getCookies();
    console.log("COOKIES AFTER LOGIN:", cookies);

    const url = await t.eval(() => window.location.href);
    console.log("URL AFTER LOGIN:", url);

    await t.expect(t.eval(() => window.location.pathname)).eql("/home");
}

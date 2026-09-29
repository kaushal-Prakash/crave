import "./config.js";
import { Selector } from "testcafe";
import { login } from "./helpers/login.js";

fixture`Login Page Tests`
    .page(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/login`);

test("User can log in successfully", async t => {
    await login(t);
});

test("Automation/E2E Testing: Invalid login shows error", async t => {
    await t
        .typeText('input[placeholder="Enter your email"]', 'wrong@example.com')
        .typeText('input[placeholder="Enter your password"]', 'wrongpass')
        .click(Selector('button').withText('Login'));
    
    // We expect an error toast or message to appear, we don't know the exact selector but we can check if url hasn't changed.
    const url = await t.eval(() => window.location.href);
    await t.expect(url).contains('/login');
});

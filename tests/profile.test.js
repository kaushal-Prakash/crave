import "./config.js";
import { Selector } from "testcafe";
import { login } from "./helpers/login.js";

fixture`Profile Page Tests`
  .page(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/login`);

test("Profile page loads user data correctly", async t => {
    // Step 1: Login
    await login(t);  // ✅ pass t

    // Step 2: Navigate to profile page
    await t.navigateTo(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/profile`);

    // Step 3: Selectors for expected profile fields
    const fullNameLabel = Selector("label").withText(/Full Name/i);
    const usernameLabel = Selector("label").withText(/Username/i);
    const emailLabel    = Selector("label").withText(/Email/i);

    const fullNameValue = fullNameLabel.sibling("p");
    const usernameValue = usernameLabel.sibling("p");
    const emailValue    = emailLabel.sibling("p");

    await t.expect(fullNameValue.exists).ok();
    await t.expect(usernameValue.exists).ok();
    await t.expect(emailValue.exists).ok();
});

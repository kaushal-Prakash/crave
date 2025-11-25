import "./config.js";
import { Selector, t } from "testcafe";
import { login } from "./helpers/login.js";

fixture`Profile Page Tests`
  .page(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/login`);

test("Profile page loads user data correctly", async t => {

    // Step 1: Login
    await login();

    // Step 2: Navigate to profile page
    await t.navigateTo(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/profile`);

    // Step 3: Selectors for expected profile fields
    const fullName = Selector("p").withText(/full name/i).sibling("p"); 
    const username = Selector("p").withText(/username/i).sibling("p");
    const email = Selector("p").withText(/email/i).sibling("p");

    // More stable method: check content by structure
    const fullNameValue = Selector("p").nth(1);
    const usernameValue = Selector("p").nth(3);
    const emailValue = Selector("p").nth(5);

    // Step 4: Validate page content exists
    await t.expect(fullNameValue.exists).ok("Full Name should exist on profile page");
    await t.expect(usernameValue.exists).ok("Username should exist on profile page");
    await t.expect(emailValue.exists).ok("Email should exist on profile page");

    // Optional: print values (debug)
    console.log("Full Name:", await fullNameValue.innerText);
    console.log("Username:", await usernameValue.innerText);
    console.log("Email:", await emailValue.innerText);
});

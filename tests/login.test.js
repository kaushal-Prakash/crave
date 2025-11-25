import "./config.js";
import { login } from "./helpers/login.js";

fixture`Login Page Tests`
    .page(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/login`);

test("User can log in successfully", async t => {
    await login();
});

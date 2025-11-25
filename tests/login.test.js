import { Selector } from 'testcafe';
import dotenv from 'dotenv';
dotenv.config();

fixture`Login Page Tests`
    .page(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/login`);

test('User can log in successfully', async t => {

    // Selectors based on your real JSX
    const usernameInput = Selector('input').withAttribute('placeholder', 'Enter your email');
    const passwordInput = Selector('input').withAttribute('placeholder', 'Enter your password');
    const loginButton   = Selector('button').withText('Login');  // Since your button has text "Login"

    await t
        .typeText(usernameInput, 'jay')
        .typeText(passwordInput, '123')
        .click(loginButton)
    await t.expect(t.eval(() => window.location.pathname)).eql('/home');

});

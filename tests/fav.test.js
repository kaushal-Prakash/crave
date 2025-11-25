import "./config.js";
import { Selector, t } from "testcafe";
import { login } from "./helpers/login.js";

fixture`Favorite Recipes Tests`
    .page(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/login`);

test("Favorite Recipes page loads and displays favorite recipes", async t => {
    // Step 1: login
    await login();

    // Step 2: Go to favorites page
    await t.navigateTo(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/favorites`);

    // Selectors
    const searchBar = Selector('input[placeholder="Search recipes..."]');
    const recipeCards = Selector('[data-testid="recipe-card"]');
    const noFavText = Selector('p').withText('No favorite recipes found');

    const nextBtn = Selector('button').withText(/Next/i);
    const prevBtn = Selector('button').withText(/Previous/i);

    // Step 3: Verify page loaded
    await t.expect(searchBar.exists).ok("Search bar should be visible on favorites page");

    const hasFavs = await recipeCards.exists;
    const noFavsVisible = await noFavText.exists;

    if (hasFavs) {
        console.log("Favorite recipes found.");

        // Step 4: Test search
        const firstFavTitle = await recipeCards.nth(0).find("h3").innerText;

        await t
            .typeText(searchBar, firstFavTitle, { replace: true })
            .wait(500);

        await t.expect(recipeCards.count).gte(1, "Search should return at least one favorite recipe");

        // Step 5: Pagination test (only if pagination exists)
        if (await nextBtn.exists) {
            const disabled = await nextBtn.hasAttribute("disabled");

            if (!disabled) {
                await t.click(nextBtn).wait(500);
                console.log("Navigated to next favorites page");
                await t.expect(prevBtn.hasAttribute("disabled")).notOk("Prev button should be enabled on next page");
            }
        } else {
            console.log("Pagination disabled — less than 10 favorite recipes.");
        }

    } else {
        console.log("No favorite recipes found.");
        await t.expect(noFavsVisible).ok("Should display no favorites message");
    }
});

import "./config.js";
import { Selector, t } from "testcafe";
import { login } from "./helpers/login.js";

fixture`My Recipes Page Tests`.page(
  `${process.env.NEXT_PUBLIC_FRONTEND_URL}/login`
);

test("My Recipes page loads and displays recipes", async (t) => {
  // Step 1: login
  await login(t);

  // Step 2: Go to my-recipes page
  await t.navigateTo(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/my-recipes`);

  // Selectors
  const searchBar = Selector('input[placeholder="Search recipes..."]');
  const recipeCards = Selector('[data-testid="recipe-card"]');
  const noRecipesText = Selector("p").withText("No recipes found");
  const nextBtn = Selector("button").withText(/Next/i);
  const prevBtn = Selector("button").withText(/Previous/i);

  // Step 3: Check page loaded
  await t.expect(searchBar.exists).ok("Search bar should exist");

  // Wait for async recipes to load from API
  await t.expect(recipeCards.exists || noRecipesText.exists).ok("Wait for recipes or no-recipes to appear", { timeout: 10000 });

  // Step 4: Check recipes exist OR No recipes exist
  const hasRecipes = await recipeCards.exists;
  const noRecipesVisible = await noRecipesText.exists;

  if (hasRecipes) {
    console.log("Recipes found on page.");

    // Step 5: Pagination test (only if pagination exists)
    if (await nextBtn.exists) {
      const isDisabled = await nextBtn.hasAttribute("disabled");

      if (!isDisabled) {
        await t.eval(() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const next = btns.find(b => b.textContent && b.textContent.trim() === 'Next');
          if (next) next.click();
        });
        console.log("Next page clicked");

        await t
          .expect(prevBtn.hasAttribute("disabled"))
          .notOk("Prev button should be enabled after moving to next page", { timeout: 5000 });

        await t.eval(() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const prev = btns.find(b => b.textContent && b.textContent.trim() === 'Previous');
          if (prev) prev.click();
        });
        await t.wait(500);
      }
    } else {
      console.log("Pagination buttons do not exist — less than 10 recipes.");
    }

    // Step 6: Test search filter
    const firstRecipeTitle = await recipeCards.nth(0).find("h3").innerText;

    await t.typeText(searchBar, firstRecipeTitle, { replace: true }).wait(500);

    await t
      .expect(recipeCards.count)
      .gte(1, "Search should return at least one recipe");
  } else {
    console.log("No recipes found.");
    await t.expect(noRecipesVisible).ok("Should show No recipes found");
  }
});

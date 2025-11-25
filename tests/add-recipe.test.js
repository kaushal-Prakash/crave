import "./config.js";
import { login } from "./helpers/login.js";
import { Selector } from "testcafe";

fixture`Add Recipe Tests`
  .page(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/login`);

test("User can add a recipe successfully", async t => {

  // First login
  await login(t);

  // Move to add recipe page
  await t.navigateTo(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/add-recipe`);

  const titleInput    = Selector('input[placeholder="Enter recipe title"]');
  const quillEditor   = Selector(".ql-editor");
  const submitButton  = Selector("button").withText("Add Recipe & Upload Images");

  // --- FIXED TITLE INPUT ---
  await t
    .click(titleInput)
    .wait(300)
    .typeText(titleInput, "My Test Recipe", {
      replace: true,
      speed: 0.3
    });

  // --- FIXED QUILL ---
  await t
    .click(quillEditor)
    .wait(300)
    .typeText(quillEditor, "Test description from TestCafe.", {
      speed: 0.3
    });

  // Submit
  await t.click(submitButton);

  // Verify redirect to home
  await t
    .expect(t.eval(() => window.location.pathname))
    .eql("/home", { timeout: 15000 });
});

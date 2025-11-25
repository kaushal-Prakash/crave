import "./config.js";
import { login } from "./helpers/login.js";
import { Selector, t } from "testcafe";

fixture`Add Recipe Tests`
  .page(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/login`);

test("User can add a recipe successfully", async t => {

  // First login
  await login();

  // Then go to add-recipe
  await t.navigateTo(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/add-recipe`);

  const titleInput = Selector('input[placeholder="Enter recipe title"]');
  const quillEditor = Selector(".ql-editor");
  const submitButton = Selector("button").withText("Add Recipe & Upload Images");

  await t.typeText(titleInput, "My Test Recipe");
  await t.click(quillEditor);
  await t.typeText(quillEditor, "Test description from TestCafe.");
  await t.click(submitButton);

  await t
    .expect(t.eval(() => window.location.pathname))
    .eql("/home", { timeout: 15000 });
});

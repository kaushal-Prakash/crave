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

  // Wait for inputs and dynamic Quill editor to mount and hydrate
  await t.expect(titleInput.exists).ok("Title input should exist", { timeout: 10000 });
  await t.expect(quillEditor.exists).ok("Quill editor should be mounted", { timeout: 10000 });
  await t.wait(1000); // Allow React hydration and Quill events to stabilize

  // Type in Quill editor
  await t.scrollIntoView(quillEditor).click(quillEditor).wait(300);
  await t.typeText(quillEditor, "Test description from TestCafe.", { replace: true, paste: true });
  await t.wait(500);

  // Type title with small pause for React state update
  await t.scrollIntoView(titleInput).click(titleInput).wait(300);
  await t.typeText(titleInput, "My Test Recipe", { replace: true, paste: true });
  await t.wait(500);

  // Verify inputs have values
  await t.expect(titleInput.value).eql("My Test Recipe");

  // Scroll to submit button and click
  await t.expect(submitButton.exists).ok("Submit button should exist");
  await t.scrollIntoView(submitButton).wait(500);
  await t.click(submitButton);

  // Verify redirect to home
  await t
    .expect(t.eval(() => window.location.pathname))
    .eql("/home", { timeout: 20000 });
});

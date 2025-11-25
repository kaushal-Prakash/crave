import "./config.js";
import { Selector } from "testcafe";

fixture`About Us Page Tests`
    .page(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/about-us`);

test("About Us page renders correctly", async t => {

    // Main header
    const title = Selector("h1").withText("About Us");

    // Team member headings
    const kaushal = Selector("h3").withText("Kaushal Prakash");
    const ibaad = Selector("h3").withText("Ibaad");
    const jayantilal = Selector("h3").withText("Jayantilal");

    // Content blocks
    const paragraphs = Selector("p");

    // Assertions
    await t.expect(title.exists).ok("About Us title should be visible");

    await t.expect(paragraphs.count).gt(3, "Page should contain descriptive text");

    await t.expect(kaushal.exists).ok("Kaushal section should exist");
    await t.expect(ibaad.exists).ok("Ibaad section should exist");
    await t.expect(jayantilal.exists).ok("Jayantilal section should exist");
});

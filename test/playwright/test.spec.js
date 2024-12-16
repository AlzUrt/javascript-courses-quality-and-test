const { test, expect } = require("@playwright/test");

test.describe("Personnal E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3030/");
  });

  test("test text in page", async ({ page }) => {
    await expect(page).toHaveTitle("The Hangman game");
    await expect(
      page.getByRole("heading", { name: "❓ Le jeu du pendu ❓" })
    ).toBeVisible();
    await expect(page.getByText("Score:")).toBeVisible();
    await expect(page.getByText("Meilleurs scores :")).toBeVisible();
  });

  test("test enter input", async ({ page }) => {
    const input = page.getByRole("textbox");
    await expect(input).toBeVisible();
    await input.fill("A");
    await expect(input).toHaveValue("A");

    const submitButton = page.getByRole("button", { name: "Tester" });
    await expect(submitButton).toBeVisible();
  });
});

test.describe("IA E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3030/");
  });

  test("gameplay flow - incorrect guess", async ({ page }) => {
    const input = page.getByRole("textbox");
    await input.fill("Z");
    await page.getByRole("button", { name: "Tester" }).click();

    await expect(page.getByText("Nombre d'essais restants : 4")).toBeVisible();

    await expect(
      page.getByText("Lettres essayées :", { exact: false })
    ).toBeVisible();
    await expect(page.getByText("z", { exact: false })).toBeVisible();
  });

  test("score updates during gameplay", async ({ page }) => {
    const scoreElement = page.getByText("Score:", { exact: false });
    const initialScoreText = await scoreElement.textContent();
    const initialScore = parseInt(initialScoreText.match(/\d+/)[0]);

    const input = page.getByRole("textbox");
    await input.fill("Z");
    await page.getByRole("button", { name: "Tester" }).click();

    await page.waitForTimeout(1000);

    const newScoreText = await scoreElement.textContent();
    const newScore = parseInt(newScoreText.match(/\d+/)[0]);
    expect(newScore).toBeLessThan(initialScore);
  });

  test("responsive design", async ({ page }) => {
    const sizes = [
      { width: 1920, height: 1080 },
      { width: 768, height: 1024 },
      { width: 375, height: 667 },
    ];

    for (const size of sizes) {
      await page.setViewportSize(size);
      await expect(
        page.getByRole("heading", { name: "❓ Le jeu du pendu ❓" })
      ).toBeVisible();
      await expect(page.getByText("Score:")).toBeVisible();
      await expect(page.getByText("Meilleurs scores :")).toBeVisible();
    }
  });

  test("winning game flow", async ({ page }) => {
    const hiddenWord = await page.evaluate(() => {
      const gameElement = document.querySelector("h3");
      return gameElement?.textContent?.split(" : ")[1] || "";
    });

    expect(hiddenWord).toBeTruthy();
    expect(hiddenWord).toMatch(/^[#]+$/);

    const realWord = await page.evaluate(() => {
      const wordElement = document.querySelector("[data-word]");
      return wordElement?.dataset.word || "";
    });

    if (realWord) {
      for (const letter of new Set(realWord.toLowerCase())) {
        await page.getByRole("textbox").fill(letter);
        await page.getByRole("button", { name: "Tester" }).click();
        await page.waitForTimeout(100);
      }

      await expect(page.getByText("Le jeu est terminé")).toBeVisible();
      await expect(page.getByText(realWord, { exact: false })).toBeVisible();
    }
  });

  test("game over mechanics", async ({ page }) => {
    // Lose the game by making 5 wrong guesses
    for (let i = 0; i < 5; i++) {
      await page.getByRole("textbox").fill("z");
      await page.getByRole("button", { name: "Tester" }).click();
      await page.waitForTimeout(100);
    }

    // Verify game over state
    await expect(page.getByText("Défaite !")).toBeVisible();
    await expect(page.getByText("Le jeu est terminé")).toBeVisible();

    // Verify input is disabled
    await expect(page.getByRole("textbox")).not.toBeVisible();
    await expect(
      page.getByRole("button", { name: "Tester" })
    ).not.toBeVisible();
  });

  test("score decrementation over time", async ({ page }) => {
    // Get initial score
    const initialScoreText = await page
      .getByText("Score:", { exact: false })
      .textContent();
    const initialScore = parseInt(initialScoreText.match(/\d+/)[0]);

    // Wait for some time
    await page.waitForTimeout(2000);

    // Get new score
    const newScoreText = await page
      .getByText("Score:", { exact: false })
      .textContent();
    const newScore = parseInt(newScoreText.match(/\d+/)[0]);

    // Verify score has decreased
    expect(newScore).toBeLessThan(initialScore);
  });
});

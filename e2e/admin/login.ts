import { expect, type Page } from "@playwright/test";

const fillPin = async (page: Page, pin: string) => {
  const input = page.locator("input").first();
  await input.click();
  await input.fill(pin);
};

export const loginAsAdmin = async (page: Page) => {
  await page.goto("/");
  await expect(page.getByText("Otaku Corner Admin")).toBeVisible();
  await fillPin(page, "135790");
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByText("Input progress: 2 of 2")).toBeVisible();
  await fillPin(page, "246801");
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
};

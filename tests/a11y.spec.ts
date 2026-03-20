import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('ClaimBridge Web Application A11y Audit (WCAG 2.2 AA)', async ({ page }) => {
  await page.goto('/');

  // Run the accessibility test
  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();

  // Make sure there are no violations
  expect(accessibilityScanResults.violations).toEqual([]);
});

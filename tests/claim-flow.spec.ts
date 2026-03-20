import { test, expect } from '@playwright/test';

test('ClaimBridge Full Multimodal Flow and Artifact Generation', async ({ page }) => {
  await page.goto('/');

  // 1. Accessibility & Visual Checks
  await expect(page.locator('h1')).toContainText('ClaimBridge');

  // 2. Language Switch Test
  await page.getByLabel('Toggle Language').click();
  await expect(page.locator('text=दावे का विश्लेषण करें')).toBeVisible();

  // Revert back to English
  await page.getByLabel('Toggle Language').click();

  // 3. Mock APIs intelligently to avoid real LLM calls during CI/CD
  await page.route('/api/vahan', async route => {
    await route.fulfill({
      json: {
        success: true,
        data: {
          licensePlate: "MP09CS1234",
          ownerName: "Agent Smith",
          vehicleModel: "Tata Nexon EV",
          insuranceStatus: "ACTIVE",
          insurer: "Mock AI Insurance"
        }
      }
    });
  });

  await page.route('/api/analyze-claim', async route => {
    await route.fulfill({
      json: {
        success: true,
        data: {
          idv: 1450000,
          zeroDepActive: true,
          consumablesActive: false,
          estimatedDamageCost: 32000,
          justification: "Front bumper and right headlight destroyed. Checked Google Search for 2026 pricing in local area.",
          searchSources: ["https://example.com/tata-parts"]
        }
      }
    });
  });

  // 4. Form Interactions
  await page.getByPlaceholder('MH01AB1234').fill('MP09CS1234');
  await page.getByPlaceholder('e.g. Maruti Suzuki Swift VXI').fill('Tata Nexon EV');
  await page.getByPlaceholder('e.g. Bangalore').fill('Indore');

  // Simulate file uploads with basic Buffers
  await page.locator('input[type="file"][accept="image/*"]').setInputFiles({
    name: 'damage_mock.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from('image bytes simulation', 'utf-8'),
  });

  await page.locator('input[type="file"][accept="application/pdf"]').setInputFiles({
    name: 'insurance_policy_mock.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('pdf bytes simulation', 'utf-8'),
  });

  // 5. Submit and transition to Result
  await page.getByRole('button', { name: 'Analyze Claim' }).click();

  // Wait for the result screen to show up
  await expect(page.locator('text=Claim Analysis Result')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('text=₹1,450,000')).toBeVisible();
  await expect(page.getByText('Active', { exact: true })).toBeVisible(); // Zero dep active
  await expect(page.getByText('Not Covered', { exact: true })).toBeVisible(); // Consumables not active
  
  // 6. Final verification of Artifact generation button
  const downloadBtn = page.getByRole('button', { name: 'Download Ready-to-File PDF' });
  await expect(downloadBtn).toBeVisible();
});

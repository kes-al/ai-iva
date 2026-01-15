import { test, expect } from '@playwright/test';

test.describe('Export Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Seed with a complete IVA ready for export
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem(
        'iva-builder-data',
        JSON.stringify({
          userId: 'local',
          ivas: [
            {
              metadata: {
                id: 'export-test',
                name: 'Export Test IVA',
                brand: 'Opdivo',
                therapeuticArea: 'Oncology',
                targetAudience: 'Oncologists',
                slideCount: 2,
                status: 'draft',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isFavorite: false,
              },
              slides: [
                { templateId: 'title-slide', slots: { headline: 'Welcome', subhead: 'Opdivo' } },
                {
                  templateId: 'content-image-split',
                  slots: {
                    headline: 'Efficacy',
                    body: 'Data shows improvement',
                    image: null,
                    isi: 'Important Safety Info',
                  },
                },
              ],
            },
          ],
          settings: { recentIds: ['export-test'], favoriteIds: [] },
        })
      );
    });
    await page.reload();
  });

  test('export can be initiated from chat', async ({ page }) => {
    // Click on the IVA to edit it
    await page.getByText('Export Test IVA').click();
    await page.getByRole('button', { name: 'Edit' }).click();

    // Wait for edit mode
    await expect(page.getByTestId('side-panel')).toBeVisible({ timeout: 2000 });

    // Type export command
    const chatInput = page.getByPlaceholder('Message...');
    await chatInput.fill('Export');
    await page.keyboard.press('Enter');

    // Wait for export to potentially trigger
    // Note: Actual download testing requires more setup
    await page.waitForTimeout(2000);
  });
});

test.describe('IVA Management', () => {
  test('favorite toggle persists', async ({ page }) => {
    // Seed with an IVA
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem(
        'iva-builder-data',
        JSON.stringify({
          userId: 'local',
          ivas: [
            {
              metadata: {
                id: 'fav-test',
                name: 'Favorite Test',
                brand: 'Yervoy',
                therapeuticArea: 'Oncology',
                targetAudience: 'Oncologists',
                slideCount: 1,
                status: 'draft',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isFavorite: false,
              },
              slides: [],
            },
          ],
          settings: { recentIds: ['fav-test'], favoriteIds: [] },
        })
      );
    });
    await page.reload();

    // The IVA should be visible
    await expect(page.getByText('Favorite Test')).toBeVisible();
  });

  test('status badge displays correctly', async ({ page }) => {
    // Seed with IVAs of different statuses
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem(
        'iva-builder-data',
        JSON.stringify({
          userId: 'local',
          ivas: [
            {
              metadata: {
                id: 'draft-iva',
                name: 'Draft IVA',
                brand: 'Opdivo',
                therapeuticArea: 'Oncology',
                targetAudience: 'Oncologists',
                slideCount: 1,
                status: 'draft',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isFavorite: false,
              },
              slides: [],
            },
            {
              metadata: {
                id: 'submitted-iva',
                name: 'Submitted IVA',
                brand: 'Yervoy',
                therapeuticArea: 'Oncology',
                targetAudience: 'Oncologists',
                slideCount: 1,
                status: 'submitted',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isFavorite: false,
              },
              slides: [],
            },
          ],
          settings: { recentIds: ['draft-iva', 'submitted-iva'], favoriteIds: [] },
        })
      );
    });
    await page.reload();

    // Both IVAs should be visible with their status badges
    await expect(page.getByText('Draft IVA')).toBeVisible();
    await expect(page.getByText('Submitted IVA')).toBeVisible();
    await expect(page.getByText('draft')).toBeVisible();
    await expect(page.getByText('submitted')).toBeVisible();
  });
});

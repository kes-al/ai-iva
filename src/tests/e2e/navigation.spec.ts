import { test, expect } from '@playwright/test';

test.describe('State Transitions', () => {
  test('transition animation completes smoothly', async ({ page }) => {
    await page.goto('/');

    const container = page.getByTestId('main-container');

    // Check initial size
    const initialBox = await container.boundingBox();
    expect(initialBox!.width).toBeCloseTo(page.viewportSize()!.width * 0.6, -1);

    // Trigger expansion
    await page.getByPlaceholder('Message IVA Builder...').fill('Create new');
    await page.keyboard.press('Enter');

    // Wait for animation
    await page.waitForTimeout(500);

    // Check expanded size
    const expandedBox = await container.boundingBox();
    expect(expandedBox!.width).toBeCloseTo(page.viewportSize()!.width * 0.8, -1);
  });

  test('side panel fades in during expansion', async ({ page }) => {
    await page.goto('/');

    // Side panel should not be visible initially
    await expect(page.getByTestId('side-panel')).not.toBeVisible();

    // Trigger expansion
    await page.getByPlaceholder('Message IVA Builder...').fill('Create new');
    await page.keyboard.press('Enter');

    // Side panel should become visible
    await expect(page.getByTestId('side-panel')).toBeVisible({ timeout: 1000 });
  });

  test('content fades out during transition', async ({ page }) => {
    await page.goto('/');

    // Headlines should be visible initially
    const headline = page.getByText('What would you like to create?');
    await expect(headline).toBeVisible();

    // Trigger expansion
    await page.getByPlaceholder('Message IVA Builder...').fill('Create new');
    await page.keyboard.press('Enter');

    // Wait for transition
    await page.waitForTimeout(500);

    // Headlines should not be visible in expanded state
    await expect(headline).not.toBeVisible();
  });

  test('archive mode shows saved IVAs', async ({ page }) => {
    // Seed localStorage with test data
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem(
        'iva-builder-data',
        JSON.stringify({
          userId: 'local',
          ivas: [
            {
              metadata: {
                id: '1',
                name: 'Test IVA',
                brand: 'Opdivo',
                therapeuticArea: 'Oncology',
                targetAudience: 'Oncologists',
                slideCount: 3,
                status: 'draft',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isFavorite: false,
              },
              slides: [],
            },
          ],
          settings: { recentIds: ['1'], favoriteIds: [] },
        })
      );
    });

    await page.reload();

    // The test IVA should be visible in the landing view
    await expect(page.getByText('Test IVA')).toBeVisible();
  });

  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/');

    // Focus input and type
    const input = page.getByPlaceholder('Message IVA Builder...');
    await input.focus();
    await input.fill('Test message');

    // Press Enter to submit
    await page.keyboard.press('Enter');

    // Should expand
    await expect(page.getByTestId('side-panel')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Preview Mode Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Seed with an IVA that has multiple slides
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem(
        'iva-builder-data',
        JSON.stringify({
          userId: 'local',
          ivas: [
            {
              metadata: {
                id: 'preview-test',
                name: 'Preview Test IVA',
                brand: 'Opdivo',
                therapeuticArea: 'Oncology',
                targetAudience: 'Oncologists',
                slideCount: 3,
                status: 'draft',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isFavorite: false,
              },
              slides: [
                { templateId: 'title-slide', slots: { headline: 'Slide 1', subhead: 'First' } },
                {
                  templateId: 'content-image-split',
                  slots: { headline: 'Slide 2', body: 'Content', image: null, isi: null },
                },
                {
                  templateId: 'bullet-list',
                  slots: { headline: 'Slide 3', bullets: 'Point 1\nPoint 2', image: null, isi: null },
                },
              ],
            },
          ],
          settings: { recentIds: ['preview-test'], favoriteIds: [] },
        })
      );
    });
    await page.reload();
  });

  test('preview mode opens when clicking Preview button', async ({ page }) => {
    // Click on the IVA
    await page.getByText('Preview Test IVA').click();

    // Click Preview button
    await page.getByRole('button', { name: 'Preview' }).click();

    // Wait for transition
    await page.waitForTimeout(500);

    // Should be in preview mode - check for navigation controls
    await expect(page.getByText('Slide 1 of 3')).toBeVisible({ timeout: 2000 });
  });
});

test.describe('Responsive Behavior', () => {
  test('container is centered on the page', async ({ page }) => {
    await page.goto('/');

    const container = page.getByTestId('main-container');
    const box = await container.boundingBox();
    const viewport = page.viewportSize();

    // Container should be roughly centered (allowing for some margin)
    const expectedLeft = (viewport!.width - box!.width) / 2;
    expect(box!.x).toBeCloseTo(expectedLeft, -1);
  });

  test('maintains aspect ratio during expansion', async ({ page }) => {
    await page.goto('/');

    const container = page.getByTestId('main-container');

    // Get initial dimensions
    const initialBox = await container.boundingBox();
    const initialRatio = initialBox!.width / initialBox!.height;

    // Trigger expansion
    await page.getByPlaceholder('Message IVA Builder...').fill('Create new');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Get expanded dimensions
    const expandedBox = await container.boundingBox();
    const expandedRatio = expandedBox!.width / expandedBox!.height;

    // Ratio should remain similar (within tolerance)
    expect(expandedRatio).toBeCloseTo(initialRatio, 0);
  });
});

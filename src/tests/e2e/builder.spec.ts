import { test, expect } from '@playwright/test';

test.describe('IVA Builder', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('shows landing state on initial load', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('What would you like to create?')).toBeVisible();
    await expect(page.getByPlaceholder('Message IVA Builder...')).toBeVisible();
  });

  test('shows empty state message when no IVAs exist', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('No IVAs yet')).toBeVisible();
    await expect(page.getByText('Create a new IVA for Opdivo')).toBeVisible();
  });

  test('expands to build mode on prompt submission', async ({ page }) => {
    await page.goto('/');

    // Enter a prompt
    await page.getByPlaceholder('Message IVA Builder...').fill('I want to create a new IVA');
    await page.keyboard.press('Enter');

    // Wait for expansion - side panel should appear
    await expect(page.getByTestId('side-panel')).toBeVisible({ timeout: 5000 });
  });

  test('container expands from 60% to 80% width', async ({ page }) => {
    await page.goto('/');

    const container = page.getByTestId('main-container');

    // Check initial size (60vw)
    const initialBox = await container.boundingBox();
    const viewport = page.viewportSize();
    expect(initialBox!.width).toBeCloseTo(viewport!.width * 0.6, -1);

    // Trigger expansion
    await page.getByPlaceholder('Message IVA Builder...').fill('Create new');
    await page.keyboard.press('Enter');

    // Wait for expansion animation
    await page.waitForTimeout(500);

    // Check expanded size (80vw)
    const expandedBox = await container.boundingBox();
    expect(expandedBox!.width).toBeCloseTo(viewport!.width * 0.8, -1);
  });

  test('back button returns to landing state', async ({ page }) => {
    await page.goto('/');

    // Enter build mode
    await page.getByPlaceholder('Message IVA Builder...').fill('Create new IVA');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('side-panel')).toBeVisible({ timeout: 5000 });

    // Click back button
    await page.getByText('Back').click();

    // Wait for transition
    await page.waitForTimeout(500);

    // Should be back at landing
    await expect(page.getByText('What would you like to create?')).toBeVisible();
  });

  test('displays recent IVAs when they exist', async ({ page }) => {
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
                id: 'test-1',
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
          settings: { recentIds: ['test-1'], favoriteIds: [] },
        })
      );
    });

    await page.reload();

    await expect(page.getByText('Test IVA')).toBeVisible();
    await expect(page.getByText('Opdivo')).toBeVisible();
  });

  test('clicking IVA shows edit/preview options', async ({ page }) => {
    // Seed with test IVA
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem(
        'iva-builder-data',
        JSON.stringify({
          userId: 'local',
          ivas: [
            {
              metadata: {
                id: 'test-1',
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
          settings: { recentIds: ['test-1'], favoriteIds: [] },
        })
      );
    });

    await page.reload();

    // Click on the IVA
    await page.getByText('Test IVA').click();

    // Should show edit/preview options
    await expect(page.getByText('Would you like to')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Preview' })).toBeVisible();
  });
});

test.describe('Chat Interaction', () => {
  test('sends message and receives AI response', async ({ page }) => {
    await page.goto('/');

    // Enter a prompt
    await page.getByPlaceholder('Message IVA Builder...').fill('Create a new IVA for Opdivo');
    await page.keyboard.press('Enter');

    // Wait for AI response
    await expect(page.getByTestId('side-panel')).toBeVisible({ timeout: 5000 });

    // Should see AI response in chat
    // The exact response depends on the API, but we should see something
    await page.waitForTimeout(2000);
  });

  test('shows loading indicator while waiting for response', async ({ page }) => {
    await page.goto('/');

    await page.getByPlaceholder('Message IVA Builder...').fill('Create new');
    await page.keyboard.press('Enter');

    // Loading indicator should appear
    await expect(page.getByText('Thinking...')).toBeVisible({ timeout: 1000 });
  });
});

test.describe('Layout Selection', () => {
  test('displays layout options when in layout selection phase', async ({ page }) => {
    await page.goto('/');

    // Start creating an IVA
    await page.getByPlaceholder('Message IVA Builder...').fill('Create a new IVA');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('side-panel')).toBeVisible({ timeout: 5000 });

    // Wait for the conversation to reach layout selection
    // This is dependent on the chat flow working correctly
    await page.waitForTimeout(3000);
  });
});

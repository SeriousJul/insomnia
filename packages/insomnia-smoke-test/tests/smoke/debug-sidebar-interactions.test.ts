import { expect } from '@playwright/test';

import { loadFixture } from '../../playwright/paths';
import { test } from '../../playwright/test';

test.describe('Debug-Sidebar', async () => {
  test.slow(process.platform === 'darwin' || process.platform === 'win32', 'Slow app start on these platforms');
  test.beforeEach(async ({ app, page }) => {
    await page.getByRole('button', { name: 'Create in project' }).click();
    const text = await loadFixture('simple.yaml');
    await app.evaluate(async ({ clipboard }, text) => clipboard.writeText(text), text);
    await page.getByRole('menuitemradio', { name: 'Import' }).click();
    await page.locator('[data-test-id="import-from-clipboard"]').click();
    await page.getByRole('button', { name: 'Scan' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Import' }).click();
    await page.getByLabel('simple').click();
  });

  test.describe('Interact with sidebar', async () => {
    test('Open Properties in Request Sidebar', async ({ page }) => {
      const requestLocator = page.getByLabel('Request Collection').getByRole('row', { name: 'example http' });
      await requestLocator.click();
      await requestLocator.getByLabel('Request Actions').click();
      await page.getByRole('menuitemradio', { name: 'Settings' }).click();
      await page.getByRole('tab', { name: 'Preview' }).click();
      // Close settings modal
      await page.locator('.app').press('Escape');

      const grpc = page.getByLabel('Request Collection').getByRole('row', { name: 'example grpc' });
      await grpc.click();
      await grpc.getByLabel('Request Actions').click();
      await page.getByRole('menuitemradio', { name: 'Settings' }).click();
      // Close settings modal
      await page.locator('.app').press('Escape');

      const ws = page.getByLabel('Request Collection').getByRole('row', { name: 'example websocket' });
      await ws.click();
      await ws.getByLabel('Request Actions').click();
      await page.getByRole('menuitemradio', { name: 'Settings' }).click();
      await page.getByRole('tab', { name: 'Preview' }).click();
      // Close settings modal
      await page.locator('.app').press('Escape');

      const gql = page.getByLabel('Request Collection').getByRole('row', { name: 'example graphql' });
      await gql.click();
      await gql.getByLabel('Request Actions').click();
      await page.getByRole('menuitemradio', { name: 'Settings' }).click();
      await page.getByRole('tab', { name: 'Preview' }).click();
      // Close settings modal
      await page.locator('.app').press('Escape');
      const folderLocator = page.getByLabel('Request Collection').getByRole('row', { name: 'test folder' });
      await folderLocator.click();
      await folderLocator.getByLabel('Request Group Actions').click();
      await page.getByRole('menuitemradio', { name: 'Settings' }).click();
      await page.getByRole('tab', { name: 'Preview' }).click();
      // Close settings modal
      await page.locator('.app').press('Escape');
    });

    test('Open properties of the collection', async ({ page }) => {
      await page.getByLabel('Workspace actions', { exact: true }).click();
      await page.getByRole('menuitemradio', { name: 'Settings' }).click();
      await page.getByText('Collection Settings').click();
    });

    test('Filter by request name', async ({ page }) => {
      await page.getByLabel('Request filter').click();
      await page.getByLabel('Request filter').fill('example http');
      await page.getByLabel('Request Collection').getByRole('row', { name: 'example http' }).click();
    });

    test('Filter by a folder name', async ({ page }) => {
      await page.getByLabel('Request filter').click();
      await page.getByLabel('Request filter').fill('test folder');
      await page.getByLabel('Request filter').press('Enter');
      await page.getByLabel('Request Collection').getByRole('row', { name: 'test folder' }).click();
    });

    test('Open Generate code', async ({ page }) => {
      const requestLocator = page.getByLabel('Request Collection').getByRole('row', { name: 'example http' });
      await requestLocator.click();
      await requestLocator.getByLabel('Request Actions').click();
      await page.getByRole('menuitemradio', { name: 'Generate Code' }).click();
      await page.locator('[data-testid="CodeEditor"] >> text=curl').click();
      await page.locator('text=Done').click();
    });

    test.skip('Use Copy as Curl for a request', async ({}) => {
      // TODO: implement this in a separate ticket
    });

    test('Pin a Request', async ({ page }) => {
      const requestLocator = page.getByLabel('Request Collection').getByRole('row', { name: 'example http' });
      await requestLocator.click();
      await requestLocator.getByLabel('Request Actions').click();
      await page.getByRole('menuitemradio', { name: 'Pin' }).click();
      // Click pinned request on pinned request list
      const pinnedRequestLocator = page.getByLabel('Pinned Requests').getByRole('row', { name: 'example http' });
      await pinnedRequestLocator.click();

      await requestLocator.click();
    });

    test.skip('Delete Request', async ({ page }) => {
      const requestLocator = page.getByLabel('Request Collection').getByRole('row', { name: 'example http' });
      await requestLocator.click();
      const numberOfRequests = await page.getByLabel('Request Collection').getByRole('row').count();
      await requestLocator.getByLabel('Request Actions').click();
      await page.getByRole('menuitemradio', { name: 'Delete' }).click();
      await page.locator('.modal__content').getByRole('button', { name: 'Delete' }).click();

      expect(page.getByLabel('Request Collection').getByRole('row')).toHaveCount(numberOfRequests - 1);
    });

    test('Rename a request', async ({ page }) => {
      const requestLocator = page.getByLabel('Request Collection').getByRole('row', { name: 'example http' });
      await requestLocator.click();
      await requestLocator.getByLabel('Request Actions').click();
      await page.getByRole('menuitemradio', { name: 'Rename' }).click();
      await page.locator('text=Rename RequestName Rename >> input[type="text"]').fill('example http1');
      await page.locator('div[role="dialog"] button:has-text("Rename")').click();
      await page.getByLabel('Request Collection').getByRole('row', { name: 'example http1' }).click();
    });

    test('Update a request folder via settings', async ({ page }) => {
      const folderLocator = page.getByLabel('Request Collection').getByRole('row', { name: 'test folder' });
      await folderLocator.click();
      await folderLocator.getByLabel('Request Group Actions').click();
      await page.getByRole('menuitemradio', { name: 'Settings' }).click();
      await page.getByPlaceholder('test folder').fill('test folder1');
      await page.locator('.app').press('Escape');
      await page.getByLabel('Request Collection').getByRole('row', { name: 'test folder1' }).click();
    });

    test('Rename a request by clicking', async ({ page }) => {
      await page.getByTestId('example http').getByLabel('request name').dblclick();
      await page.getByRole('textbox', { name: 'request name' }).fill('new name');
      await page.getByLabel('Request Collection').click();
      await expect(page.getByTestId('new name').getByLabel('request name')).toContainText('new name');
    });

    test('Create a new HTTP request', async ({ page }) => {
      await page.getByLabel('Create in collection').click();
      await page.getByRole('menuitemradio', { name: 'Http Request' }).click();
      await page.getByLabel('Request Collection').getByRole('row', { name: 'New Request' }).click();
    });

    test('Add new string variable via environment overrides', async ({ page }) => {
      // Create new Folder
      await page.getByLabel('Create in collection').click();
      await page.getByLabel('New Folder').click();
      await page.locator('#prompt-input').fill('New Folder');
      await page.getByText('New Folder').press('Enter');

      // Open 'New folder' folder
      const folderLocator = page.getByTestId('Dropdown-New-Folder');
      const environmentLocator = page.getByRole('menuitemradio', { name: 'Environment' });
      await folderLocator.click();
      await environmentLocator.click();

      // Add a new string environment variable
      const expected = '{ "foo":"bar" }';
      const editorTextLocator = await page.getByTestId('CodeEditor').getByRole('textbox');
      const selectAllShortcut = process.platform === 'darwin' ? 'Meta+A' : 'Control+A';
      await editorTextLocator.press(selectAllShortcut);
      await editorTextLocator.fill(expected);

      // Close and re-open modal
      await page.getByText('Close').click();
      await folderLocator.click();
      await environmentLocator.click();

      // Validate expected values persisted
      const actualRows = await page.getByTestId('CodeEditor').locator('.CodeMirror-line').allInnerTexts();
      expect(actualRows.length).toBeGreaterThan(0);

      const actualJSON = JSON.parse(actualRows.join(' '));
      expect(actualJSON).toEqual(JSON.parse(expected));
    });

    test('Add new string variable to an existing environment overrides folder', async ({ page }) => {
      // Open 'Test Folder' folder
      const folderLocator = page.getByTestId('Dropdown-test-folder');
      const environmentLocator = page.getByRole('menuitemradio', { name: 'Environment' });
      await folderLocator.click();
      await environmentLocator.click();

      // Add a new string environment variable to existing overrides

      // 1. Retrieve current editor rows
      const editorLocator = page.getByTestId('CodeEditor').locator('.CodeMirror-line');
      const rows = await editorLocator.allInnerTexts();

      // 2. Merge rows and convert to JSON
      const editorJSON = JSON.parse(rows.join(' '));

      // 3. Modify JSON with new string environment variable
      editorJSON.REQUEST = 'HTTP';
      const expected = editorJSON;

      // 4. Apply new JSON to editor
      const editorTextLocator = await page.getByTestId('CodeEditor').getByRole('textbox');
      const selectAllShortcut = process.platform === 'darwin' ? 'Meta+A' : 'Control+A';
      await editorTextLocator.press(selectAllShortcut);
      await editorTextLocator.fill(JSON.stringify(expected));

      // Close and re-open Modal
      await page.getByText('Close').click();
      await folderLocator.click();
      await environmentLocator.click();

      // Validate expected values persisted
      const actualRows = await editorLocator.allInnerTexts();
      expect(actualRows.length).toBeGreaterThan(0);

      const actualJSON = JSON.parse(actualRows.join(' '));
      expect(actualJSON).toEqual(expected);

    });

  // TODO: more scenarios will be added in follow-up iterations of increasing test coverage
  });
});

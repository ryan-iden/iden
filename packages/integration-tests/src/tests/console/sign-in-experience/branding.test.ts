import { getSignInExperience, updateSignInExperience } from '#src/api/sign-in-experience.js';
import { logtoConsoleUrl as logtoConsoleUrlString } from '#src/constants.js';
import { goToAdminConsole } from '#src/ui-helpers/index.js';
import { expectNavigation, appendPathname, waitFor } from '#src/utils.js';

import {
  waitForFormCard,
  expectToSelectColor,
  expectToSaveSignInExperience,
  setDarkModeEnabled,
} from './helpers.js';

const { color: originalColor, customCss: originalCustomCss } = await getSignInExperience();
const testPrimaryColor = '#5B4D8E';

await page.setViewport({ width: 1920, height: 1080 });

describe('sign-in experience: branding', () => {
  const logtoConsoleUrl = new URL(logtoConsoleUrlString);

  beforeAll(async () => {
    await goToAdminConsole();
  });

  afterAll(async () => {
    await updateSignInExperience({ color: originalColor, customCss: originalCustomCss });
  });

  it('navigate to sign-in experience page', async () => {
    await expectNavigation(
      page.goto(appendPathname('/console/sign-in-experience', logtoConsoleUrl).href)
    );

    await expect(page).toMatchElement(
      'div[class$=main] div[class$=container] div[class$=cardTitle] div[class$=titleEllipsis]',
      {
        text: 'Sign-in & account',
      }
    );

    // Start & finish guide
    await expect(page).toClick('div[class$=container] div[class$=content] button span', {
      text: 'Get started',
    });

    await expect(page).toClick(
      'div[class$=ReactModalPortal] div[class$=footerContent] > button span',
      {
        text: 'Done',
      }
    );

    // Land on branding tab by default
    expect(page.url()).toBe(new URL(`console/sign-in-experience/branding`, logtoConsoleUrl).href);

    // Wait for the branding tab to load
    await waitForFormCard(page, 'BRANDING AREA');
    await waitForFormCard(page, 'Custom CSS');
  });

  it('update branding config', async () => {
    await setDarkModeEnabled(page, true);

    // Update brand color
    await expectToSelectColor(page, {
      field: 'Brand color',
      color: testPrimaryColor,
    });

    // Recalculate dark brand color
    await expect(page).toClick('div[class$=darkModeTip] button span', { text: 'Recalculate' });

    // Wait for the recalculate to finish
    await waitFor(500);

    // Fill in the custom CSS
    await expect(page).toFill('div[class$=editor] textarea', 'body { background-color: #5B4D8E; }');

    await expectToSaveSignInExperience(page);
  });

  it('reset branding config', async () => {
    // Reset branding config
    await expectToSelectColor(page, {
      field: 'Brand color',
      color: originalColor.primaryColor,
    });

    // Recalculate dark brand color
    await expect(page).toClick('div[class$=darkModeTip] button span', { text: 'Recalculate' });

    // Wait for the recalculate to finish
    await waitFor(500);

    // Fill in the custom CSS
    await expect(page).toFill('div[class$=editor] textarea', '');

    await expectToSaveSignInExperience(page);

    // Exercise both switch states and restore the tenant's original preference.
    await setDarkModeEnabled(page, !originalColor.isDarkModeEnabled);
    await expectToSaveSignInExperience(page);
    await setDarkModeEnabled(page, originalColor.isDarkModeEnabled);
    await expectToSaveSignInExperience(page);
  });
});

import { adminConsoleApplicationId, type User } from '@logto/schemas';
import { appendPath } from '@silverhand/essentials';

import { authedAdminTenantApi } from '#src/api/api.js';
import {
  consolePassword,
  consoleUsername,
  isDevFeaturesEnabled,
  logtoConsoleUrl as logtoConsoleUrlString,
} from '#src/constants.js';
import { switchToLanguage } from '#src/ui-helpers/switch-language.js';
import { appendPathname, cls, dcls, expectNavigation, waitFor } from '#src/utils.js';

/**
 * NOTE: This test suite assumes test cases will run sequentially (which is Jest default).
 * Parallel execution will lead to errors.
 */
// Tip: See https://github.com/argos-ci/jest-puppeteer/blob/main/packages/expect-puppeteer/README.md
// for convenient expect methods
describe('smoke testing for console admin account creation and sign-in', () => {
  const logtoConsoleUrl = new URL(logtoConsoleUrlString);

  it('should not navigate to welcome page if admin tenant user table is not empty', async () => {
    // Create a admin user
    const { id } = await authedAdminTenantApi
      .post('users', {
        json: { username: 'test_admin_user' },
      })
      .json<User>();

    await expectNavigation(page.goto(logtoConsoleUrl.href));

    await expect(page).toMatchElement('#app');
    expect(page.url()).not.toBe(new URL('console/welcome', logtoConsoleUrl).href);

    // Clean up
    await authedAdminTenantApi.delete(`users/${id}`);
  });

  it('should navigate to welcome page if all admin user are suspended', async () => {
    // Create a admin user
    const { id } = await authedAdminTenantApi
      .post('users', {
        json: { username: 'test_admin_user' },
      })
      .json<User>();

    await authedAdminTenantApi.patch(`users/${id}/is-suspended`, { json: { isSuspended: true } });

    await expectNavigation(page.goto(logtoConsoleUrl.href));

    await expect(page).toMatchElement('#app');
    expect(page.url()).toBe(new URL('console/welcome', logtoConsoleUrl).href);

    // Clean up
    await authedAdminTenantApi.delete(`users/${id}`);
  });

  it('can open with app element and navigate to welcome page', async () => {
    await expectNavigation(page.goto(logtoConsoleUrl.href));

    await expect(page).toMatchElement('#app');
    expect(page.url()).toBe(new URL('console/welcome', logtoConsoleUrl).href);
  });

  it('can register a new admin account and automatically sign in', async () => {
    await expectNavigation(expect(page).toClick('button', { text: 'Create account' }));

    expect(page.url()).toBe(new URL('register', logtoConsoleUrl).href);

    await expect(page).toFill('input[name=identifier]', consoleUsername);
    await expectNavigation(expect(page).toClick('button[name=submit]'));

    expect(page.url()).toBe(
      appendPathname(`/register/password?app_id=${adminConsoleApplicationId}`, logtoConsoleUrl).href
    );

    await expect(page).toFillForm('form', {
      newPassword: consolePassword,
      confirmPassword: consolePassword,
    });

    await expectNavigation(expect(page).toClick('button[name=submit]'));

    const getStartedUrl = new URL('console/get-started', logtoConsoleUrl).href;
    const onboardingUrl = new URL('console/onboarding', logtoConsoleUrl).href;
    const expectedUrls = isDevFeaturesEnabled ? [onboardingUrl, getStartedUrl] : [getStartedUrl];
    await page.waitForFunction(
      (expectedUrls) => expectedUrls.includes(window.location.href),
      {},
      expectedUrls
    );

    expect(expectedUrls).toContain(page.url());

    if (page.url() === onboardingUrl) {
      await expect(page).toFill('input[type=email]', 'oss-admin@example.com');
      await expect(page).toFill('input[placeholder="Acme.co"]', 'Acme');
      await expect(page).toClick('div[role=radio]', { text: '50-199' });
      await expect(page).toClick('button', { text: 'Next' });
      await page.waitForFunction(
        (expectedUrl) => window.location.href === expectedUrl,
        {},
        getStartedUrl
      );

      expect(page.url()).toBe(getStartedUrl);
    }
  });

  it('should have html attributes "lang=en" and "dir=ltr" by default', async () => {
    await expect(page).toMatchElement('html[lang=en][dir=ltr]');
  });

  it('should change to to "lang=ar" and "dir=rtl" when switching to Arabic language', async () => {
    await switchToLanguage(page, 'العربية');
    await expect(page).toMatchElement('html[lang=ar][dir=rtl]');

    // Switch back to English
    await switchToLanguage(page, 'English');
    await expect(page).toMatchElement('html[lang=en][dir=ltr]');
  });

  it('can sign out of admin console', async () => {
    await expect(page).toClick('div[class$=topbar] > div[class$=container]');

    // Try awaiting for 1000ms before clicking sign-out button
    await waitFor(1000);

    await expectNavigation(
      expect(page).toClick(
        '.ReactModalPortal div[class$=dropdownContainer] div[class$=dropdownItem]:last-child'
      )
    );

    expect(page.url()).toBe(new URL('sign-in?app_id=admin-console', logtoConsoleUrl).href);
  });

  it('can sign in to admin console again', async () => {
    const initialHref = appendPath(logtoConsoleUrl, 'console', 'applications').href;
    // Should be able to redirect back after sign-in
    await expectNavigation(page.goto(initialHref));
    await expect(page).toFillForm('form', {
      identifier: consoleUsername,
      password: consolePassword,
    });
    await expectNavigation(expect(page).toClick('button[name=submit]'));

    expect(page.url()).toBe(initialHref);

    await expect(page).toClick('div[class$=topbar] > div:last-child');

    const userMenu = await page.waitForSelector('.ReactModalPortal div[class$=dropdownContainer]');
    await expect(userMenu).toMatchElement('div[class$=nameWrapper] > div[class$=name]', {
      text: consoleUsername,
    });

    await expect(page).toClick('div[class^=ReactModal__Overlay]');
  });

  it('renders the iden wordmark and SVG mask at the expected size', async () => {
    const logoSelector = 'div[class$=topbar] > button[aria-label=iden]';
    await expect(page).toMatchElement(logoSelector, { text: 'iden', visible: true });
    const markStyle = await page.$eval(`${logoSelector} > span[class$=mark]`, (mark) => {
      const style = getComputedStyle(mark);
      return { width: style.width, height: style.height, maskImage: style.maskImage };
    });
    expect(markStyle).toMatchObject({ width: '32px', height: '32px' });
    expect(markStyle.maskImage).toMatch(/^url\(/);
  });

  it('can highlight the current tab in the sidebar', async () => {
    await page.setViewport({ width: 1440, height: 900 });
    const activeSelector = [dcls('sidebar'), 'a' + cls('row') + cls('active'), dcls('title')].join(
      ' '
    );

    await expect(page).toMatchElement(activeSelector, { text: 'Applications', visible: true });
    await expectNavigation(
      expect(page).toClick([dcls('sidebar'), 'a' + cls('row')].join(' '), {
        text: 'Dashboard',
      })
    );
    await expect(page).toMatchElement(activeSelector, { text: 'Dashboard', visible: true });
  });

  it('opens the mobile navigation drawer and highlights the selected page', async () => {
    await page.setViewport({ width: 390, height: 844 });
    const toggle = 'button[aria-controls=iden-console-navigation]';
    const openNavigation = async () => {
      // Resizing and route changes animate the drawer over the toggle until it is fully closed.
      await page.waitForFunction(
        (selector) => {
          const button = document.querySelector(selector);
          if (!button) {
            return false;
          }
          const { x, y, width, height } = button.getBoundingClientRect();
          return button.contains(document.elementFromPoint(x + width / 2, y + height / 2));
        },
        {},
        toggle
      );
      await page.locator(toggle).click();
    };
    await openNavigation();
    await expect(page).toMatchElement(`${toggle}[aria-expanded=true]`);
    await expectNavigation(
      page.locator('#iden-console-navigation a[href$="/applications"]').click()
    );
    await expect(page).toMatchElement(`${toggle}[aria-expanded=false]`);
    await openNavigation();
    await expect(page).toMatchElement(`#iden-console-navigation a${cls('active')}`, {
      text: 'Applications',
    });
    await page.setViewport({ width: 1440, height: 900 });
  });

  it(`should ${isDevFeaturesEnabled ? '' : 'not '}show the dev features label`, async () => {
    await (isDevFeaturesEnabled
      ? expect(page).toMatchElement('div', { text: 'Development features enabled' })
      : expect(page).not.toMatchElement('div', { text: 'Development features enabled' }));
  });
});

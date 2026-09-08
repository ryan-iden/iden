import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test';

const widths = [360, 390, 768, 1280, 1440];
const themes = ['light', 'dark'] as const;
const languages = ['en', 'zh-CN', 'ar'];

const boxOf = async (locator: Locator) => {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error('Expected a visible layout box');
  }
  return box;
};

const prepare = async (page: Page, theme: 'light' | 'dark', locale: string) => {
  await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
  await page.addInitScript((language) => {
    localStorage.setItem('i18nextLogtoAcLng', language);
  }, locale);
  await page.route('**/api/platform-branding', async (route) =>
    route.fulfill({
      json: { productName: 'iden', slogan: 'Identity, Unified.', hideOpenSourceNotice: false },
    })
  );
};

const capture = async (page: Page, info: TestInfo, name: string) => {
  await page.evaluate(async () => document.fonts.ready);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    (page.viewportSize()?.width ?? 0) + 1
  );
  // Screenshots are evidence, not an automatically blessed cross-OS baseline.
  await info.attach(name, {
    body: await page.screenshot({ fullPage: true, animations: 'disabled' }),
    contentType: 'image/png',
  });
  if (info.project.name === 'chromium' && info.title.includes('shared workspace 1280')) {
    await expect(page).toHaveScreenshot(`${name}.png`, {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    });
  }
};

for (const width of widths) {
  for (const theme of themes) {
    const locale = languages[widths.indexOf(width) % languages.length] ?? 'en';
    test(`shared workspace ${width} ${theme} ${locale}`, async ({ page }, info) => {
      const errors = new Set<string>();
      page.on('pageerror', (error) => errors.add(error.message));
      await page.setViewportSize({ width, height: 1000 });
      await prepare(page, theme, locale);
      await page.goto(`http://127.0.0.1:5002/console/design-lab.html?theme=${theme}`);
      await expect(page.getByText('Atlas Workspace', { exact: true }).last()).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await capture(page, info, 'console-applications');
      const icon = page.locator('main img').first();
      const iconBox = await boxOf(icon);
      expect(iconBox.width).toBeLessThanOrEqual(48);
      if (width <= 600) {
        const tableRegion = page.locator('main [role="region"]').first();
        await tableRegion.focus();
        await expect(tableRegion).toBeFocused();
        await page.keyboard.press('ArrowRight');
        await expect
          .poll(async () => tableRegion.evaluate((element) => Math.abs(element.scrollLeft)))
          .toBeGreaterThan(0);
      }
      if (width <= 1100) {
        const toggle = page.locator('button[aria-controls="iden-console-navigation"]');
        await toggle.click();
        await expect(toggle).toHaveAttribute('aria-expanded', 'true');
        await expect(page.locator('#iden-console-navigation a').first()).toBeFocused();
        await capture(page, info, 'console-navigation');
        await page.keyboard.press('Escape');
        await expect(toggle).toBeFocused();
        await expect(toggle).toHaveAttribute('aria-expanded', 'false');
        // Re-selecting the current primary destination must also dismiss the drawer.
        await toggle.click();
        await page.locator('#iden-console-navigation a[aria-current="true"]').click();
        await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      }
      await page.locator('main > header button').click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await capture(page, info, 'console-dialog');
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).not.toBeVisible();

      await page.goto(
        `http://127.0.0.1:5004/account/design-lab.html?theme=${theme}&locale=${locale}`
      );
      await expect(page.getByText('ryan', { exact: true })).toBeVisible();
      await capture(page, info, 'organization-members');
      const summary = page.locator('[class*="memberSummary"]');
      const initialBox = await boxOf(summary);
      await page.locator('button[aria-expanded="false"]').click();
      await expect(page.getByRole('checkbox', { name: 'Reader', exact: true })).toBeVisible();
      await page.getByRole('checkbox', { name: 'Reader', exact: true }).check();
      const expandedBox = await boxOf(summary);
      expect(expandedBox.height).toBeLessThanOrEqual(initialBox.height + 1);
      await capture(page, info, 'organization-role-panel');
      await page.locator('[class*="memberRoleEditor"] button').last().click();
      await expect(page.getByRole('status')).toBeVisible();
      await expect(page.getByRole('checkbox')).toHaveCount(0);

      await page.goto(
        `http://127.0.0.1:5004/account/design-lab.html?surface=auth&theme=${theme}&locale=${locale}`
      );
      await expect(page.locator('input[name="username"]')).toBeVisible();
      await page.locator('input[name="username"]').fill('ryan');
      await page.locator('input[name="password"]').fill('fixture-password');
      await capture(page, info, 'authentication');
      await page.locator('button[type="submit"]').click();
      await expect(page.getByRole('status')).toBeVisible();
      expect(Array.from(errors)).toEqual([]);
    });
  }
}

for (const theme of themes) {
  test(`documentation search and embedded theme ${theme}`, async ({ page }, info) => {
    await prepare(page, theme, 'en');
    await page.goto(`http://127.0.0.1:5006/help/en/introduction/?theme=${theme}`);
    await expect(page.locator('article h1')).toBeVisible();
    await page.locator('input[type="search"]').fill('authentication');
    await expect(page.locator('.search-results a').first()).toBeVisible();
    await capture(page, info, 'help-search');
    await page.goto(
      `http://127.0.0.1:5002/console/design-lab.html?theme=${theme}&appearance=system`
    );
    await page.locator('header > button').first().click();
    const frame = page.frameLocator('iframe[data-iden-help]');
    await expect(frame.locator('article h1')).toBeVisible();
    await expect(frame.locator('html')).toHaveAttribute('data-theme', theme);
    await capture(page, info, 'context-help');
    const otherTheme = theme === 'dark' ? 'light' : 'dark';
    const frameSource = await page.locator('iframe[data-iden-help]').getAttribute('src');
    await page.emulateMedia({ colorScheme: otherTheme });
    await expect(page.locator('html')).toHaveAttribute('data-theme', otherTheme);
    await expect(frame.locator('html')).toHaveAttribute('data-theme', otherTheme);
    await expect(frame.locator('body')).toHaveClass(/embedded/);
    await expect(page.locator('iframe[data-iden-help]')).toHaveAttribute('src', frameSource ?? '');
  });
}

test('motion restores layout after rapid pointer interaction', async ({ page }, info) => {
  await prepare(page, 'dark', 'en');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('http://127.0.0.1:5002/console/design-lab.html?theme=dark');
  const button = page.locator('main > header button');
  await expect(button).toBeVisible();
  await button.hover();
  await page.mouse.down();
  await page.mouse.up();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect
    .poll(async () => button.evaluate((element) => getComputedStyle(element).transform))
    .toBe('none');
  await capture(page, info, 'motion-settled');
});

for (const theme of themes) {
  for (const state of ['empty', 'error']) {
    test(`mobile data state ${state} ${theme}`, async ({ page }, info) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await prepare(page, theme, 'zh-CN');
      await page.goto(
        `http://127.0.0.1:5002/console/design-lab.html?theme=${theme}&state=${state}`
      );
      const content = page.locator('main');
      await expect(content.locator('tbody svg').first()).toBeVisible();
      expect(
        await content.evaluate((element) => element.scrollWidth - element.clientWidth)
      ).toBeLessThanOrEqual(1);
      await capture(page, info, `data-${state}`);
    });
  }

  test(`custom platform logo wins over the identity mark ${theme}`, async ({ page }, info) => {
    await prepare(page, theme, 'en');
    await page.route('**/api/platform-branding', async (route) =>
      route.fulfill({
        json: {
          productName: 'Atlas Identity',
          slogan: 'Atlas',
          hideOpenSourceNotice: false,
          logoUrl: '/custom-logo.svg',
          darkLogoUrl: '/custom-logo-dark.svg',
        },
      })
    );
    await page.route('**/custom-logo*.svg', async (route) =>
      route.fulfill({
        contentType: 'image/svg+xml',
        body: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path fill="#008c91" d="M0 0h64v64H0z"/></svg>',
      })
    );
    await page.goto(
      `http://127.0.0.1:5004/account/design-lab.html?surface=auth&theme=${theme}&locale=en`
    );
    await expect(page.locator('aside svg image')).toHaveAttribute(
      'href',
      theme === 'dark' ? '/custom-logo-dark.svg' : '/custom-logo.svg'
    );
    await capture(page, info, 'custom-brand-authentication');
  });
}

import { assert, fixture, html, waitUntil } from '@open-wc/testing';

import { LogtoUsername } from '../elements/logto-username.js';

suite('account element language inheritance', () => {
  test('inherits lang and responds when the parent language changes', async () => {
    const parent = await fixture<HTMLDivElement>(
      html`<div lang="zh-CN"><logto-username></logto-username></div>`
    );
    const element = parent.querySelector<LogtoUsername>(LogtoUsername.tagName);
    assert.exists(element);
    await waitUntil(() => element.shadowRoot?.textContent.includes('无法加载账户信息。'));
    parent.setAttribute('lang', 'en');
    await waitUntil(() =>
      element.shadowRoot?.textContent.includes('Unable to load account information.')
    );
  });

  test('respects a local lang override over the inherited language', async () => {
    const parent = await fixture<HTMLDivElement>(
      html`<div lang="zh-CN"><logto-username lang="en"></logto-username></div>`
    );
    const element = parent.querySelector<LogtoUsername>(LogtoUsername.tagName);
    await waitUntil(() =>
      element?.shadowRoot?.textContent.includes('Unable to load account information.')
    );
    element?.removeAttribute('lang');
    await waitUntil(() => element?.shadowRoot?.textContent.includes('无法加载账户信息。'));
  });
});

import { createContext, provide } from '@lit/context';
import { html, LitElement, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { type LogtoAccountApi } from '../api/index.js';
import { type UserProfile } from '../types.js';
import { LocalizationController } from '../utils/localization.js';

export type LogtoAccountContextType = {
  userProfile: UserProfile;
};

export const logtoAccountContext = createContext<LogtoAccountContextType>('logto-account-context');

const tagName = 'logto-account-provider';

/**
 * LogtoAccountProvider
 *
 * Provides necessary account information to child components.
 */
@customElement(tagName)
export class LogtoAccountProvider extends LitElement {
  static tagName = tagName;

  /**
   * The API client for the Logto account elements
   *
   * Used to interact with Account-related backend APIs, including the Profile API.
   */
  @property({ attribute: false })
  accountApi?: LogtoAccountApi;

  @state()
  @provide({ context: logtoAccountContext })
  private accountContext?: LogtoAccountContextType;

  @state()
  private error?: Error = undefined;

  private readonly localization: LocalizationController = new LocalizationController(this);

  render() {
    if (this.error) {
      return html`<p>${this.localization.message('context_unavailable')}</p>
        <details>
          <summary>${this.localization.message('details')}</summary>
          ${this.error.message}
        </details>`;
    }

    if (!this.accountContext) {
      return html`<span>${this.localization.message('not_initialized')}</span>`;
    }

    return html`<slot></slot>`;
  }

  updated(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has('accountApi') && this.accountApi) {
      void this.initProvider();
    }
  }

  private async initProvider() {
    if (!this.accountApi) {
      return;
    }

    try {
      const userProfile = await this.accountApi.fetchUserProfile();

      this.accountContext = {
        userProfile,
      };
    } catch (error) {
      const errorObject =
        error instanceof Error ? error : new Error(`Unknown error: ${String(error)}`);
      this.error = errorObject;
      this.dispatchEvent(new ErrorEvent('error', { error: errorObject }));
    }
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface HTMLElementTagNameMap {
    [tagName]: LogtoAccountProvider;
  }
}

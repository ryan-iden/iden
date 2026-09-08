import { elementFoundationCss } from '@iden/ui-foundation';
import { css, html, LitElement, unsafeCSS } from 'lit';
import { customElement } from 'lit/decorators.js';

import { LocalizationController } from '../utils/localization.js';

const tagName = 'logto-profile-item';

/**
 * LogtoProfileItem: A custom element for displaying profile information
 *
 * It provides a consistent layout and styling for profile-related items
 *
 * Example usage:
 *
 * <logto-profile-item>
 *   <logto-icon slot="label-icon">...</logto-icon>
 *   <div slot="label-text">Label</div>
 *   <div slot="content">Content</div>
 * </logto-profile-item>
 */
@customElement(tagName)
export class LogtoProfileItem extends LitElement {
  static tagName = tagName;

  static styles = [
    unsafeCSS(elementFoundationCss),
    css`
      :host {
        display: flex;
        align-items: center;
        background-color: var(
          --logto-profile-item-container-color,
          var(--logto-color-background, var(--iden-element-bg))
        );
        border-radius: var(
          --logto-profile-item-container-shape,
          var(--logto-shape-corner-lg, 16px)
        );
        border: 1px solid
          var(
            --logto-profile-item-border-color,
            var(--logto-color-divider, var(--iden-element-line))
          );
        padding-inline-start: var(
          --logto-profile-item-container-leading-space,
          var(--logto-spacing-xl, 20px)
        );
        padding-inline-end: var(
          --logto-profile-item-container-trailing-space,
          var(--logto-spacing-xl, 20px)
        );
        min-height: var(--logto-profile-item-height, 72px);
        gap: var(--logto-spacing-md, 12px);
        padding-block: 16px;
        flex-wrap: wrap;
      }

      .label {
        flex: 1;
        display: flex;
        align-items: center;
        gap: var(--logto-profile-item-label-gap, var(--logto-spacing-sm, 8px));
      }

      ::slotted([slot='label-icon']) {
        color: var(
          --logto-profile-item-label-icon-color,
          var(--logto-color-typeface-secondary, var(--iden-element-muted))
        );

        --logto-icon-size: var(--logto-profile-item-label-icon-size, 24px);
      }

      ::slotted([slot='label-text']) {
        font: var(
          --logto-profile-item-label-font,
          var(--logto-font-label-md, 600 14px/1.5 var(--iden-element-font))
        );
        color: var(
          --logto-profile-item-label-color,
          var(--logto-color-typeface-primary, var(--iden-element-text))
        );
      }

      ::slotted([slot='content']),
      slot[name='content'] {
        display: flex;
        flex: 2;
        font: var(
          --logto-profile-item-value-font,
          var(--logto-font-body-md, 450 14px/1.65 var(--iden-element-font))
        );
        color: var(
          --logto-profile-item--color,
          var(--logto-color-typeface-primary, var(--iden-element-text))
        );
      }

      .no-value {
        font: var(
          --logto-profile-item-no-value-font,
          var(--logto-font-body-md, 450 14px/1.65 var(--iden-element-font))
        );
        color: var(
          --logto-profile-item-no-value-color,
          var(--logto-color-typeface-secondary, var(--iden-element-muted))
        );
      }

      ::slotted([slot='actions']) {
        display: flex;
        flex: 1;
      }
      @media (max-width: 540px) {
        :host {
          align-items: flex-start;
        }
        .label {
          flex-basis: 100%;
        }
        ::slotted([slot='content']) {
          min-width: 0;
          overflow-wrap: anywhere;
        }
      }
    `,
  ];

  private readonly localization: LocalizationController = new LocalizationController(this);

  render() {
    return html`
      <div class="label">
        <slot name="label-icon"></slot>
        <slot name="label-text"></slot>
      </div>
      <slot name="content"
        ><span class="no-value">${this.localization.message('not_set')}</span></slot
      >
      <slot name="actions"></slot>
    `;
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface HTMLElementTagNameMap {
    [tagName]: LogtoProfileItem;
  }
}

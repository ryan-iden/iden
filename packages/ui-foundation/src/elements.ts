/** Shadow-root defaults are separate from the public --logto-* overrides inherited from hosts. */
export const elementFoundationCss = `
  :host {
    --iden-element-bg: var(--iden-surface, #ffffff);
    --iden-element-text: var(--iden-text, #15242b);
    --iden-element-muted: var(--iden-muted, #536973);
    --iden-element-accent: var(--iden-accent, #007c91);
    --iden-element-line: var(--iden-line, #d9e3e7);
    --iden-element-font: var(--iden-font, 'Manrope Variable', system-ui, sans-serif);
    box-sizing: border-box;
  }
  @media (prefers-color-scheme: dark) {
    :host {
      --iden-element-bg: var(--iden-surface, #181e24);
      --iden-element-text: var(--iden-text, #e6eff2);
      --iden-element-muted: var(--iden-muted, #a0b2bd);
      --iden-element-accent: var(--iden-accent, #67e8f9);
      --iden-element-line: var(--iden-line, #30404b);
    }
  }
  :focus-visible { outline: 2px solid var(--logto-color-primary, var(--iden-element-accent)); outline-offset: 3px; }
`;

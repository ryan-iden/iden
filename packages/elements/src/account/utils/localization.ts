import {
  getInterfacePhrases,
  type InterfacePhraseKey,
} from '@logto/phrases-experience/lib/interface.js';
import type { ReactiveController, ReactiveControllerHost } from 'lit';

const ancestors = (element: Element): readonly Element[] => {
  const root = element.getRootNode();
  const parent =
    element.assignedSlot ??
    element.parentElement ??
    (root instanceof ShadowRoot ? root.host : undefined);
  return [element, ...(parent ? ancestors(parent) : [])];
};

/** Honor native inherited lang, including shadow hosts, and react to language changes. */
export class LocalizationController implements ReactiveController {
  private readonly observer: MutationObserver;

  constructor(private readonly host: ReactiveControllerHost & Element) {
    host.addController(this);
    this.observer = new MutationObserver(() => {
      host.requestUpdate();
    });
  }

  hostConnected() {
    for (const element of ancestors(this.host)) {
      this.observer.observe(element, { attributes: true, attributeFilter: ['lang'] });
    }
  }

  hostDisconnected() {
    this.observer.disconnect();
  }

  message(key: InterfacePhraseKey): string {
    const language = ancestors(this.host)
      .map((element) => element.getAttribute('lang')?.trim())
      .find(Boolean);
    return getInterfacePhrases(language ?? navigator.language)[key];
  }
}

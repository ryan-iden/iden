import { createSurfaceMotion } from '@iden/ui-foundation';
import { type LitElement, type ReactiveController } from 'lit';

/** Animation follows the host lifecycle, including reconnects; it never delays rendering. */
export class SurfaceController implements ReactiveController {
  private dispose?: () => void;

  constructor(private readonly host: LitElement) {
    host.addController(this);
  }

  hostConnected() {
    void this.animate();
  }

  hostDisconnected() {
    this.dispose?.();
    this.dispose = undefined;
  }

  private async animate() {
    await this.host.updateComplete;
    if (!this.host.isConnected) {
      return;
    }
    this.dispose?.();
    this.dispose = createSurfaceMotion(this.host);
  }
}

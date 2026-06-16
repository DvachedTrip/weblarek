import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component.ts";
import { IEvents } from "../base/Events.ts";

interface FinishBuyInterface {
  total: string;
}

export class FinishBuyViews extends Component<FinishBuyInterface> {
  protected totalEl: HTMLParagraphElement;
  protected closeButton: HTMLButtonElement;

  constructor(
    container: HTMLElement,
    protected events: IEvents,
  ) {
    super(container);

    this.totalEl = ensureElement<HTMLParagraphElement>(
      ".order-success__description",
      this.container,
    );
    this.closeButton = ensureElement<HTMLButtonElement>(
      ".order-success__close",
      this.container,
    );

    this.closeButton.addEventListener("click", () => {
      this.events.emit("finishBuy:close");
    });
  }

  set total(value: string) {
    this.totalEl.textContent = `Списано ${value} синапсов`;
  }
}

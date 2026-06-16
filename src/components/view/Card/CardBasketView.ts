import { ensureElement } from "@/utils/utils.ts";
import { CardView } from "./CardView.ts";
import { IEvents } from "@/components/base/Events.ts";
import { ICard } from "./CardView.ts";

interface ICardBasket extends ICard {
  index: number;
}

export class CardBasketView extends CardView<ICardBasket> {
  protected indexElement: HTMLElement;
  protected deleteButton: HTMLButtonElement;

  constructor(
    container: HTMLElement,
    protected events: IEvents,
  ) {
    super(container);
    this.indexElement = ensureElement<HTMLElement>(
      ".basket__item-index",
      this.container,
    );
    this.deleteButton = ensureElement<HTMLButtonElement>(
      ".basket__item-delete",
      this.container,
    );

    this.deleteButton.addEventListener("click", () => {
      this.events.emit("product:delete", {
        id: this.productId,
      });
    });
  }

  set index(value: number) {
    this.indexElement.textContent = String(value);
  }
}

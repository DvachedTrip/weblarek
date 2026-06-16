import { Component } from "../base/Component.ts";
import { IEvents } from "../base/Events.ts";
import { Cart } from "../models/Cart.ts";
import { ensureElement } from "../../utils/utils.ts";

interface IBuyData {
  content?: HTMLElement;
  id?: string;
  price?: number | null;
}

export class BuyView extends Component<IBuyData> {
  protected actionButton: HTMLButtonElement;
  protected productId: string = "";

  constructor(
    container: HTMLElement,
    protected events: IEvents,
    protected cart: Cart,
  ) {
    super(container);
    this.actionButton = ensureElement<HTMLButtonElement>(
      this.container.querySelector(".card__button") as HTMLButtonElement,
    );

    this.actionButton.addEventListener("click", () => {
      if (!this.productId) return;

      if (this.cart.isInCart(this.productId)) {
        this.events.emit("product:delete", { id: this.productId });
      } else {
        if (this.dataPrice === null) return;
        this.events.emit("product:buy", { id: this.productId });
      }
    });

    this.events.on("cart:changed", () => this.updateButton());
  }

  private dataPrice: number | null = null;

  render(data?: Partial<IBuyData>): HTMLElement {
    super.render(data);

    if (data?.id) this.productId = data.id;
    if (data?.price !== undefined) this.dataPrice = data.price ?? null;

    if (data?.content && !this.container.contains(data.content)) {
      this.container.appendChild(data.content);
    }

    this.updateButton();

    return this.container;
  }

  private updateButton() {
    if (!this.productId) return;

    const inCart = this.cart.isInCart(this.productId);

    if (this.dataPrice === null) {
      this.actionButton.disabled = true;
      this.actionButton.textContent = "Недоступно";
      return;
    }

    this.actionButton.disabled = false;
    this.actionButton.textContent = inCart ? "Удалить из корзины" : "В корзину";
  }
}

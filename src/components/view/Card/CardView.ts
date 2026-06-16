import { ensureElement } from "@/utils/utils.ts";
import { Component } from "../../base/Component.ts";
import { IProduct } from "@/types/index.ts";

export interface ICard {
  id: IProduct["id"];
  title: IProduct["title"];
  price: IProduct["price"];
}

export abstract class CardView<T extends ICard> extends Component<T> {
  protected titleElement: HTMLElement;
  protected priceElement: HTMLElement;
  protected productId: string = "";

  constructor(container: HTMLElement) {
    super(container);
    this.titleElement = ensureElement<HTMLElement>(
      ".card__title",
      this.container,
    );
    this.priceElement = ensureElement<HTMLElement>(
      ".card__price",
      this.container,
    );
  }

  set title(value: string) {
    this.titleElement.textContent = value;
  }

  set price(value: number | null) {
    this.priceElement.textContent =
      value !== null ? `${value} синапсов` : "Нет в наличии";
  }

  set id(value: string) {
    this.productId = value;
  }
}

import { ensureElement } from "@/utils/utils.ts";
import { CardView } from "./CardView.ts";
import { IEvents } from "@/components/base/Events.ts";
import { ICard } from "./CardView.ts";
import { IProduct } from "@/types/index.ts";

interface ICardDescription extends ICard {
  category: IProduct["category"];
  image: IProduct["image"];
  description: IProduct["description"];
}

export class CardDescriptionView extends CardView<ICardDescription> {
  protected categoryElement: HTMLElement;
  protected imageElement: HTMLImageElement;
  protected priceElement: HTMLElement;
  protected descriptionElement: HTMLElement;

  constructor(
    container: HTMLElement,
    protected events: IEvents,
  ) {
    super(container);
    this.categoryElement = ensureElement<HTMLElement>(
      ".card__category",
      this.container,
    );
    this.priceElement = ensureElement<HTMLElement>(
      ".card__price",
      this.container,
    );
    this.descriptionElement = ensureElement<HTMLElement>(
      ".card__text",
      this.container,
    );
    this.imageElement = ensureElement<HTMLImageElement>(
      ".card__image",
      this.container,
    );
  }

  set category(value: string) {
    this.categoryElement.textContent = value;
  }

  set image(value: string) {
    this.setImage(this.imageElement, value);
  }

  set description(value: string) {
    this.descriptionElement.textContent = value;
  }
}

import { ensureElement } from "@/utils/utils.ts";
import { CardView } from "./CardView.ts";
import { IEvents } from "@/components/base/Events.ts";
import { categoryMap } from "@/utils/constants";
import { ICard } from "./CardView.ts";
import { IProduct } from "@/types/index.ts";

interface ICardCatalog extends ICard {
  image: IProduct["image"];
  category: IProduct["image"];
}

export class CardCatalogView extends CardView<ICardCatalog> {
  protected categoryElement: HTMLElement;
  protected imageElement: HTMLImageElement;

  constructor(
    container: HTMLElement,
    protected events: IEvents,
  ) {
    super(container);

    this.categoryElement = ensureElement<HTMLElement>(
      ".card__category",
      this.container,
    );
    this.imageElement = ensureElement<HTMLImageElement>(
      ".card__image",
      this.container,
    );
    this.container.addEventListener("click", () => {
      this.events.emit("product:select", { id: this.productId });
    });
  }

  set category(value: string) {
    this.categoryElement.textContent = value;

    this.categoryElement.classList.remove(...Object.values(categoryMap));
    const categoryClass = categoryMap[value as keyof typeof categoryMap];

    if (categoryClass) {
      this.categoryElement.classList.add(categoryClass);
    }
  }

  set image(value: string) {
    this.setImage(this.imageElement, value);
  }
}

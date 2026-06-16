import { Component } from "../base/Component";

interface ICatalogView {
  catalog: HTMLElement[];
}

export class CatalogView extends Component<ICatalogView> {
  constructor(container: HTMLElement) {
    super(container);
  }

  set catalog(value: HTMLElement[]) {
    this.container.innerHTML = "";
    value.forEach((item) => {
      this.container.appendChild(item);
    });
  }
}

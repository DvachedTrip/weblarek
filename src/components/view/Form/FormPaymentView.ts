import { FormView } from "./FormView";
import { IBuyer } from "@/types/index.ts";
import { IEvents } from "@/components/base/Events.ts";
import { IForm } from "./FormView.ts";
import { ensureElement } from "@/utils/utils.ts";

interface IFormPayment extends IForm {
  payment: IBuyer["payment"];
  address: IBuyer["address"];
}

export class FormPaymentView extends FormView<IFormPayment> {
  protected onlineButton: HTMLElement;
  protected offlineButton: HTMLElement;
  protected adressInput: HTMLInputElement;

  constructor(
    container: HTMLFormElement,
    protected events: IEvents,
  ) {
    super(container, events);

    this.onlineButton = ensureElement<HTMLElement>(
      "button[name='card']",
      this.container,
    );
    this.offlineButton = ensureElement<HTMLElement>(
      "button[name='cash']",
      this.container,
    );
    this.adressInput = ensureElement<HTMLInputElement>(
      "input[name='address']",
      this.container,
    );
    this.onlineButton.addEventListener("click", () => {
      this.events.emit("payment:change", {
        payment: "online",
      });
    });
    this.offlineButton.addEventListener("click", () => {
      this.events.emit("payment:change", {
        payment: "offline",
      });
    });
  }

  set payment(value: IFormPayment["payment"]) {
    this.onlineButton.classList.toggle("button_alt-active", value === "online");
    this.offlineButton.classList.toggle(
      "button_alt-active",
      value === "offline",
    );
  }

  set address(value: IFormPayment["address"]) {
    this.adressInput.value = value;
  }
}

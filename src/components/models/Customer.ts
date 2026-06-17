import { IBuyer, TPayment, TValidateErrors } from "@/types/index";
import { IEvents } from "../base/Events";

export class Customer {
  private customer: IBuyer = {
    payment: null,
    email: "",
    phone: "",
    address: "",
  };
  constructor(private events: IEvents) {}

  savePaymentMethod(paymentMethod: TPayment): void {
    this.customer.payment = paymentMethod;
    this.emitChanges();
  }

  saveEmail(email: string): void {
    this.customer.email = email;
    this.emitChanges();
  }

  savePhone(phone: string): void {
    this.customer.phone = phone;
    this.emitChanges();
  }

  saveAddress(address: string): void {
    this.customer.address = address;
    this.emitChanges();
  }

  getCustomerData(): IBuyer {
    return { ...this.customer };
  }

  clearCustomerData(): void {
    this.customer = {
      payment: null,
      email: "",
      phone: "",
      address: "",
    };
    this.emitChanges();
  }

  validateCustomerData(): TValidateErrors {
    const errors: TValidateErrors = {};

    if (!this.customer.payment) {
      errors.payment = "Укажите тип оплаты";
    }

    if (!this.customer.email.trim()) {
      errors.email = "Укажите email";
    }

    if (!this.customer.phone.trim()) {
      errors.phone = "Укажите номер телефона";
    }

    if (!this.customer.address.trim()) {
      errors.address = "Укажите адрес";
    }

    this.events.emit("customer:validate", errors);

    return errors;
  }

  startCheckout(): void {
    this.events.emit("order:paymentRequested", this.getCustomerData());
  }

  submitPaymentData(): void {
    const errors = this.validateCustomerData();

    if (!errors.payment && !errors.address) {
      this.events.emit("order:contactsRequested", this.getCustomerData());
    }
  }

  submitContactsData(): void {
    const errors = this.validateCustomerData();

    if (!errors.email && !errors.phone) {
      this.events.emit("order:submitReady", this.getCustomerData());
    }
  }

  private emitChanges(): void {
    this.events.emit("customer:changed", this.getCustomerData());
    this.validateCustomerData();
  }
}

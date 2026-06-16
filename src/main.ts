import { Api } from "./components/base/Api";
import { Cart } from "./components/models/Cart";
import { Customer } from "./components/models/Customer";
import { ApiLarek } from "./components/сommunication/ApiLarek";
import { API_URL, CDN_URL } from "./utils/constants";
import { Catalog } from "./components/models/Catalog";
import { IProduct, TPayment } from "./types";
import { EventEmitter } from "./components/base/Events";
import { CardCatalogView } from "./components/view/Card/CardCatalogView";
import { CatalogView } from "./components/view/CatalogView";
import { ensureElement } from "./utils/utils";
import { Modal } from "./components/view/Modal";
import { CardDescriptionView } from "./components/view/Card/CardDescriptionView";
import { BuyView } from "./components/view/BuyView";
import { BascetView } from "./components/view/BasketView";
import { CardBasketView } from "./components/view/Card/CardBasketView";
import { Header } from "./components/view/Header";
import { FormPaymentView } from "./components/view/Form/FormPaymentView";
import { TValidateErrors } from "@/types/index";
import { IOrderRequest } from "@/types/index";
import { FormContactsView } from "./components/view/Form/FormContactsVIew";
import { FinishBuyViews } from "./components/view/FinishBuyView";
import "./scss/styles.scss";

async function main() {
  const events = new EventEmitter();
  const api = new Api(API_URL);
  const apiLarek = new ApiLarek(api, CDN_URL);

  const cart = new Cart();
  const customer = new Customer(events);
  const modal = new Modal(ensureElement<HTMLElement>(".modal"), events);
  const header = new Header(events, ensureElement<HTMLElement>(".header"));

  const response = await apiLarek.getProducts();
  const products: IProduct[] = response.items;

  const catalog = new Catalog(events);
  const catalogView = new CatalogView(ensureElement<HTMLElement>(".gallery"));

  const cardTemplate = ensureElement<HTMLTemplateElement>(
    "#card-preview",
  ) as HTMLTemplateElement;

  events.on("catalog:changed", () => {
    const products = catalog.getProducts();

    const cards = products.map((product) => {
      const cardTemplate = ensureElement<HTMLTemplateElement>(
        "#card-catalog",
      ) as HTMLTemplateElement;
      const card = new CardCatalogView(
        cardTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement,
        events,
      );
      return card.render({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        category: product.category,
      });
    });
    catalogView.render({
      catalog: cards,
    });
  });

  events.on("product:select", ({ id }: { id: string }) => {
    const product = catalog.findSelectedProducts(id);

    if (!product) return;

    catalog.setSelectedProduct(product);

    const cardPreview = new CardDescriptionView(
      cardTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement,
      events,
    );

    const cardEl = cardPreview.render({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      category: product.category,
      description: product.description,
      // canBuy: product.price !== null,
    });

    const buyView = new BuyView(cardEl, events, cart);
    buyView.render({ id: product.id, price: product.price });

    modal.render({
      content: cardEl,
    });

    modal.open();
  });

  events.on("modal:close", () => {
    modal.close();
  });

  events.on("basket:open", () => {
    const cartProducts = cart.getCart();
    const basketTemplate = ensureElement<HTMLTemplateElement>(
      "#basket",
    ) as HTMLTemplateElement;
    const cardBasketTemplate = ensureElement<HTMLTemplateElement>(
      "#card-basket",
    ) as HTMLTemplateElement;

    const cartItems = cartProducts.map((product, index) => {
      const cartItem = new CardBasketView(
        cardBasketTemplate.content.firstElementChild!.cloneNode(
          true,
        ) as HTMLElement,
        events,
      );

      return cartItem.render({
        id: product.id,
        index: index + 1,
        title: product.title,
        price: product.price,
      });
    });

    const basketView = new BascetView(
      basketTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement,
      events,
    );
    const basketEl = basketView.render({
      products: cartItems,
      total: cart.getAllPrice().toString(),
    });

    modal.render({
      content: basketEl,
    });

    modal.open();
  });

  events.on("product:buy", ({ id }: { id: string }) => {
    const product = catalog.findSelectedProducts(id);

    if (!product) return;

    cart.addProduct(product);
    header.сounter = cart.getQuantity();
    modal.close();
  });

  events.on("product:delete", ({ id }: { id: string }) => {
    cart.delProduct(id);
    header.сounter = cart.getQuantity();

    events.emit("basket:open");
  });

  const formPaymentTemplate = ensureElement<HTMLTemplateElement>("#order");
  const formPayment = new FormPaymentView(
    formPaymentTemplate.content.firstElementChild!.cloneNode(
      true,
    ) as HTMLFormElement,
    events,
  );

  events.on("basket:checkout", () => {
    modal.render({
      content: formPayment.render(),
    });
    modal.open();
  });

  events.on("payment:change", ({ payment }: { payment: TPayment }) => {
    customer.savePaymentMethod(payment);
    modal.render({
      content: formPayment.render({
        payment: payment,
      }),
    });

    customer.validateCustomerData();
  });

  events.on(
    "order:change",
    ({ field, value }: { field: string; value: string }) => {
      if (field === "address") {
        customer.saveAddress(value);
      }
      customer.validateCustomerData();
    },
  );

  events.on("customer:validated", (errors: TValidateErrors) => {
    const isPaymentFilled = !errors.payment;
    const isAddressFilled = !errors.address;
    const isEmailFilled = !errors.email;
    const isPhoneFilled = !errors.phone;

    formPayment.render({
      valid: isPaymentFilled && isAddressFilled,
      error: !isPaymentFilled
        ? errors.payment
        : !isAddressFilled
          ? errors.address
          : "",
    });

    formContacts.render({
      valid: isEmailFilled && isPhoneFilled,
      error: !isEmailFilled ? errors.email : !isPhoneFilled ? errors.phone : "",
    });
  });

  const formContactsTemplate = ensureElement<HTMLTemplateElement>("#contacts");
  const formContacts = new FormContactsView(
    formContactsTemplate.content.firstElementChild!.cloneNode(
      true,
    ) as HTMLFormElement,
    events,
  );

  events.on("order:submit", () => {
    modal.render({
      content: formContacts.render({
        email: "",
        phone: "",
        valid: false,
        error: "",
      }),
    });
  });

  events.on(
    "contacts:change",
    ({ field, value }: { field: string; value: string }) => {
      if (field === "email") customer.saveEmail(value);
      if (field === "phone") customer.savePhone(value);
      customer.validateCustomerData();
    },
  );

  const finishFormTemplate = ensureElement<HTMLTemplateElement>("#success");
  const finishForm = new FinishBuyViews(
    finishFormTemplate.content.firstElementChild!.cloneNode(
      true,
    ) as HTMLElement,
    events,
  );

  events.on("contacts:submit", async () => {
    const customerData = customer.getCustomerData();
    const cartData = cart.getCart();
    const productsId = cartData.map((product) => {
      return product.id;
    });
    const price = cart.getAllPrice();

    const customerOrderPost: IOrderRequest = {
      ...customerData,
      total: price,
      items: productsId,
    };

    const response = await apiLarek.postOrder(customerOrderPost);
    cart.clearCart();
    header.сounter = cart.getQuantity();

    modal.render({
      content: finishForm.render({
        total: String(response.total),
      }),
    });
  });

  events.on("finishBuy:close", () => {
    modal.close();
  });

  catalog.setProducts(products);
}

main();

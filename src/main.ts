import { Api } from "./components/base/Api";
import { Cart, ICartChanged } from "./components/models/Cart";
import { Customer } from "./components/models/Customer";
import { ApiLarek } from "./components/сommunication/ApiLarek";
import { API_URL, CDN_URL } from "./utils/constants";
import { Catalog } from "./components/models/Catalog";
import {
  IBuyer,
  IOrderRequest,
  IProduct,
  TPayment,
  TValidateErrors,
} from "./types";
import { EventEmitter } from "./components/base/Events";
import { CardCatalogView } from "./components/view/Card/CardCatalogView";
import { CatalogView } from "./components/view/CatalogView";
import { cloneTemplate, ensureElement } from "./utils/utils";
import { Modal } from "./components/view/Modal";
import { CardDescriptionView } from "./components/view/Card/CardDescriptionView";
import { BascetView } from "./components/view/BasketView";
import { CardBasketView } from "./components/view/Card/CardBasketView";
import { Header } from "./components/view/Header";
import { FormPaymentView } from "./components/view/Form/FormPaymentView";
import { FormContactsView } from "./components/view/Form/FormContactsVIew";
import { FinishBuyViews } from "./components/view/FinishBuyView";
import "./scss/styles.scss";

const events = new EventEmitter();
const api = new Api(API_URL);
const apiLarek = new ApiLarek(api);

const cart = new Cart(events);
const customer = new Customer(events);
const catalog = new Catalog(events);

const modal = new Modal(ensureElement<HTMLElement>(".modal"), events);
const header = new Header(events, ensureElement<HTMLElement>(".header"));
const catalogView = new CatalogView(ensureElement<HTMLElement>(".gallery"));

const cardPreviewTemplate = ensureElement<HTMLTemplateElement>("#card-preview");
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>("#card-catalog");
const basketTemplate = ensureElement<HTMLTemplateElement>("#basket");
const cardBasketTemplate = ensureElement<HTMLTemplateElement>("#card-basket");
const formPaymentTemplate = ensureElement<HTMLTemplateElement>("#order");
const formContactsTemplate = ensureElement<HTMLTemplateElement>("#contacts");
const finishFormTemplate = ensureElement<HTMLTemplateElement>("#success");

const cardPreviewElement = cloneTemplate<HTMLElement>(cardPreviewTemplate);
const basketElement = cloneTemplate<HTMLElement>(basketTemplate);

const cardPreview = new CardDescriptionView(cardPreviewElement, {
  onClick: () => {
    const product = catalog.getSelectedProduct();

    if (!product || product.price === null) return;

    const eventName = cart.isInCart(product.id)
      ? "product:delete"
      : "product:buy";

    events.emit(eventName, { id: product.id });
  },
});
const basketView = new BascetView(basketElement, events);
const formPayment = new FormPaymentView(
  cloneTemplate<HTMLFormElement>(formPaymentTemplate),
  events,
);
const formContacts = new FormContactsView(
  cloneTemplate<HTMLFormElement>(formContactsTemplate),
  events,
);
const finishForm = new FinishBuyViews(
  cloneTemplate<HTMLElement>(finishFormTemplate),
  events,
);

function transformProduct(product: IProduct): IProduct {
  return {
    ...product,
    image: CDN_URL + product.image.replace(".svg", ".png"),
  };
}

function renderCatalog(products: IProduct[]): void {
  const cards = products.map((product) => {
    const card = new CardCatalogView(
      cloneTemplate<HTMLElement>(cardCatalogTemplate),
      {
        onClick: () => {
          events.emit("product:select", { id: product.id });
        },
      },
    );

    return card.render({
      title: product.title,
      price: product.price,
      image: product.image,
      category: product.category,
    });
  });

  catalogView.render({ catalog: cards });
}

function renderPreviewButton(product: IProduct): void {
  const inCart = cart.isInCart(product.id);
  const isAvailable = product.price !== null;

  cardPreview.render({
    buttonText: !isAvailable
      ? "Недоступно"
      : inCart
        ? "Удалить из корзины"
        : "В корзину",
    buttonDisabled: !isAvailable,
  });
}

function renderProductPreview(product: IProduct): void {
  cardPreview.render({
    title: product.title,
    price: product.price,
    image: product.image,
    category: product.category,
    description: product.description,
  });
  renderPreviewButton(product);

  modal.render({ content: cardPreviewElement });
  modal.open();
}

function renderBasket(data: ICartChanged): void {
  const cartItems = data.products.map((product, index) => {
    const cartItem = new CardBasketView(
      cloneTemplate<HTMLElement>(cardBasketTemplate),
      {
        onDelete: () => {
          events.emit("product:delete", { id: product.id });
        },
      },
    );

    return cartItem.render({
      index: index + 1,
      title: product.title,
      price: product.price,
    });
  });

  basketView.render({
    products: cartItems,
    total: data.total.toString(),
    checkoutDisabled: data.products.length === 0,
  });
}

function openBasket(): void {
  modal.render({ content: basketElement });
  modal.open();
}

function renderPaymentForm(customerData: IBuyer): void {
  modal.render({
    content: formPayment.render({
      payment: customerData.payment,
      address: customerData.address,
    }),
  });
  modal.open();
}

function renderContactsForm(customerData: IBuyer): void {
  modal.render({
    content: formContacts.render({
      email: customerData.email,
      phone: customerData.phone,
    }),
  });
}

function renderCustomerData(customerData: IBuyer): void {
  formPayment.render({
    payment: customerData.payment,
    address: customerData.address,
  });
  formContacts.render({
    email: customerData.email,
    phone: customerData.phone,
  });
}

async function submitOrder(customerData: IBuyer): Promise<void> {
  const cartData = cart.getCart();
  const productsId = cartData.map((product) => product.id);
  const price = cart.getAllPrice();

  const customerOrderPost: IOrderRequest = {
    ...customerData,
    total: price,
    items: productsId,
  };

  const response = await apiLarek.postOrder(customerOrderPost);

  cart.clearCart();
  customer.clearCustomerData();
  events.emit("order:success", { total: response.total });
}

events.on("catalog:changed", (products: IProduct[]) => {
  renderCatalog(products);
});

events.on("catalog:selected", (product: IProduct) => {
  renderProductPreview(product);
});

events.on("product:select", ({ id }: { id: string }) => {
  const product = catalog.findSelectedProducts(id);

  if (product) {
    catalog.setSelectedProduct(product);
  }
});

events.on("modal:closeButtonClick", () => {
  modal.close();
});

events.on("basket:open", openBasket);

events.on("product:buy", ({ id }: { id: string }) => {
  const product = catalog.findSelectedProducts(id);

  if (product) {
    cart.addProduct(product);
  }
});

events.on("product:delete", ({ id }: { id: string }) => {
  cart.delProduct(id);
  modal.close();
});

events.on("cart:changed", (data: ICartChanged) => {
  header.counter = data.quantity;
  renderBasket(data);

  const selectedProduct = catalog.getSelectedProduct();

  if (selectedProduct) {
    renderPreviewButton(selectedProduct);
  }

  if (data.action === "add") {
    modal.close();
  }
});

events.on("basket:checkout", () => {
  customer.startCheckout();
});

events.on("order:paymentRequested", (customerData: IBuyer) => {
  renderPaymentForm(customerData);
});

events.on("payment:change", ({ payment }: { payment: TPayment }) => {
  customer.savePaymentMethod(payment);
});

events.on(
  "order:change",
  ({ field, value }: { field: string; value: string }) => {
    if (field === "address") {
      customer.saveAddress(value);
    }
  },
);

events.on("customer:changed", (customerData: IBuyer) => {
  renderCustomerData(customerData);
});

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

events.on("order:submit", () => {
  customer.submitPaymentData();
});

events.on("order:contactsRequested", (customerData: IBuyer) => {
  renderContactsForm(customerData);
});

events.on(
  "contacts:change",
  ({ field, value }: { field: string; value: string }) => {
    if (field === "email") customer.saveEmail(value);
    if (field === "phone") customer.savePhone(value);
  },
);

events.on("contacts:submit", () => {
  customer.submitContactsData();
});

events.on("order:submitReady", (customerData: IBuyer) => {
  submitOrder(customerData).catch((error) => {
    console.error("Не удалось оформить заказ:", error);
  });
});

events.on("order:success", ({ total }: { total: number }) => {
  modal.render({
    content: finishForm.render({
      total: String(total),
    }),
  });
});

events.on("finishBuy:close", () => {
  modal.close();
});

cart.notifyChanges();
customer.validateCustomerData();

apiLarek
  .getProducts()
  .then((data) => data.items.map(transformProduct))
  .then((products) => {
    catalog.setProducts(products);
  })
  .catch((error) => {
    console.error("Не удалось загрузить товары:", error);
  });

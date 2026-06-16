import { IProduct } from "@/types/index";
// import { IEvents } from "../base/Events";

export class Cart {
  private products: IProduct[] = [];

  // constructor(private events: IEvents) {} не пригодились, реализовал через презентер все

  getCart(): IProduct[] {
    return [...this.products];
  }

  addProduct(product: IProduct): void {
    this.products.push(product);
    // this.events.emit("cart:changed", this.products);
  }

  delProduct(id: string): void {
    this.products = this.products.filter((product) => product.id !== id);
    // this.events.emit("cart:changed", this.products);
  }

  clearCart(): void {
    this.products = [];
    // this.events.emit("cart:changed", this.products);
  }

  getAllPrice(): number {
    return this.products.reduce((acc, product) => {
      return acc + (product.price ?? 0);
    }, 0);
  }

  getQuantity(): number {
    return this.products.length;
  }

  isInCart(id: string): boolean {
    return this.products.some((product) => product.id === id);
  }
}

import { IProduct } from "@/types/index";
import { IEvents } from "../base/Events";

export interface ICartChanged {
  products: IProduct[];
  total: number;
  quantity: number;
  action?: "add" | "delete" | "clear";
}

export class Cart {
  private products: IProduct[] = [];

  constructor(private events?: IEvents) {}

  getCart(): IProduct[] {
    return [...this.products];
  }

  addProduct(product: IProduct): void {
    this.products.push(product);
    this.emitChanges("add");
  }

  delProduct(id: string): void {
    this.products = this.products.filter((product) => product.id !== id);
    this.emitChanges("delete");
  }

  clearCart(): void {
    this.products = [];
    this.emitChanges("clear");
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

  notifyChanges(): void {
    this.emitChanges();
  }

  private emitChanges(action?: ICartChanged["action"]): void {
    this.events?.emit("cart:changed", {
      products: this.getCart(),
      total: this.getAllPrice(),
      quantity: this.getQuantity(),
      action,
    });
  }
}

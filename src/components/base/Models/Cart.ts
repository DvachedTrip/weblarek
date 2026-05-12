import { IProduct } from "@/types/index";

export class Cart {
    private products: IProduct[];

    constructor(products: IProduct[]) {
        this.products = products;
    }

    getProducts(): IProduct[] {
        return this.products;
    }

    addProduct(product: IProduct): void {
        this.products.push(product);
    }

    delProduct(id: string): void {
        this.products.filter((product) => product.id !== id);
    }

    clearCart(): void {
        this.products = [];
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

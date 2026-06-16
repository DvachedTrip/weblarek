import {
  IApi,
  IOrderRequest,
  IOrderResponse,
  IProductsResponse,
  IProduct,
} from "@/types";

export class ApiLarek {
  private api: IApi;
  private cdnUrl: string;

  constructor(api: IApi, cdnUrl: string) {
    this.api = api;
    this.cdnUrl = cdnUrl;
  }

  private transformProduct(product: IProduct): IProduct {
    return {
      ...product,
      image: this.cdnUrl + product.image.replace(".svg", ".png"),
    };
  }

  getProducts(): Promise<IProductsResponse> {
    return this.api.get<IProductsResponse>("/product/").then((data) => ({
      ...data,
      items: data.items.map((product) => this.transformProduct(product)),
    }));
  }

  postOrder(data: IOrderRequest): Promise<IOrderResponse> {
    return this.api.post<IOrderResponse>("/order/", data);
  }
}

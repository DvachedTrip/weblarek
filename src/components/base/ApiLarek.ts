import { API_URL } from "./../../utils/constants";
import { Api } from "./Api";
// import { API_URL } from "@/utils/constants";
import {
    IApi,
    IOrderRequest,
    IOrderResponse,
    IProductsResponse,
} from "@/types";

export class ApiLarek {
    private Api: IApi;

    constructor() {
        this.Api = new Api(API_URL);
    }

    getProducts(): Promise<IProductsResponse> {
        return this.Api.get("/product/");
    }

    postOrder(data: IOrderRequest): Promise<IOrderResponse> {
        return this.Api.post("/order/", data);
    }
}

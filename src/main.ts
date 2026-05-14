import { ApiLarek } from "./components/base/ApiLarek";
import { Catalog } from "./components/base/Models/Catalog";
import "./scss/styles.scss";

const products = new Catalog([], null);

const api = new ApiLarek();

const fetchProducts = async () => {
    try {
        const response = await api.getProducts();
        products.setProducts(response.items);
        console.log(response);
    } catch (e) {
        console.log("Что-то не так");
    }
};

await fetchProducts();

console.log("Массив товаров из каталога:", products.getProducts());

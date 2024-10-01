import { defineStore } from "pinia";
import { index, show, store, update, destroy } from '@/utils/generalAPI';
import type { Pagination } from '@/interfaces/pagination/pagination.interface';
import type { Stock } from '@/interfaces/stock.interface';
import type { RequestParams } from '@/interfaces/request-params.interface';

const endpoint = {
    index: 'products/productSlug/stocks',
    withSlug: 'products/productSlug/stocks/stockId'
}

export const useStockStore = defineStore({
    id: 'stock',
    state: () => ({
        stocks: {} as Pagination,
        stock: undefined as Stock
    }),
    getters: {
        getStocks: (state) => state.stocks,
        getStock: (state) => state.stock
    },
    actions: {
        async index(productSlug: string, params: RequestParams){
            const result = await index(endpoint.index.replace('productSlug', productSlug), params);
            this.stocks = result.data
        },
        async show(slug: string) {
            this.stock = await show(endpoint.withSlug.replace('slug', slug));
        },
        async store(productSlug: string, data: string) {
            await store(endpoint.index.replace('productSlug', productSlug), data);
            this.index();
        },
        async update(productSlug:string, stockId: string, data: string) {
            await update(endpoint.withSlug.replace('productSlug', productSlug).replace('stockId', stockId), data);
            this.index();
        },
        async destroy(slug: string) {
            await destroy(endpoint.withSlug.replace('slug', slug));
            this.index();
        }
    }
})
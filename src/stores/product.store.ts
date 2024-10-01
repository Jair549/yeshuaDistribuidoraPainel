import { defineStore } from 'pinia';
import { index, show, store, update, destroy, importData } from '@/utils/generalAPI';
import type { Pagination } from '@/interfaces/pagination/pagination.interface';
import type { Product } from '@/interfaces/products.interface';
import type { RequestParams } from '@/interfaces/request-params.interface';

const endpoint = {
    index: '/products',
    withSlug: '/products/slug'
}

export const useProductStore = defineStore({
    id: 'product',
    state: () => ({
        products: {} as Pagination,
        product: undefined as Product
    }),
    getters: {
        getProducts: (state) => state.products,
        getProduct: (state) => state.product
    },
    actions: {
        async index(params: RequestParams){
            const result = await index(endpoint.index, params);
            this.products = result.data
        },
        async show(slug: string) {
            this.product = await show(endpoint.withSlug.replace('slug', slug));
        },
        async store(data: string) {
            await store(endpoint.index, data);
            this.index();
        },
        async update(slug: string, data: string) {
            await update(endpoint.withSlug.replace('slug', slug), data);
            this.index();
        },
        async destroy(slug: string) {
            await destroy(endpoint.withSlug.replace('slug', slug));
            this.index();
        }
    }
})
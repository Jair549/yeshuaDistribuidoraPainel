import { defineStore } from 'pinia';
import { index, show, store, update, destroy, importData } from '@/utils/generalAPI';
import type { Pagination } from '@/interfaces/pagination/pagination.interface';
import type { RequestParams } from '@/interfaces/request-params.interface';
import type { Sale } from '@/interfaces/sale.interface';

const endpoint = {
    index: '/sales',
    withSlug: '/sales/slug'
}

export const useSaleStore = defineStore({
    id: 'sale',
    state: () => ({
        sales: {} as Pagination,
        sale: undefined as Sale
    }),
    getters: {
        getSales: (state) => state.sales,
        getSale: (state) => state.sale,
    },
    actions: {
        async index(params: RequestParams) {
            const result = await index(endpoint.index, params);
            this.sales = result.data
        },
        async show(slug: string) {
            this.sale = await show(endpoint.withSlug.replace('slug', slug));
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
    },
})
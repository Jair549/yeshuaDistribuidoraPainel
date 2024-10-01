import { defineStore } from 'pinia';
import { index, show, store, update, destroy, importData } from '@/utils/generalAPI';
import type { Pagination } from '@/interfaces/pagination/pagination.interface';
import type { RequestParams } from '@/interfaces/request-params.interface';
import { Purchase } from '@/interfaces/purchase.interface';

const endpoint = {
    index: '/purchase',
    withSlug: '/purchase/slug'
}

export const usePurchaseStore = defineStore({
    id: 'purchase',
    state: () => ({
        purchases: {} as Pagination,
        purchase: undefined as Purchase
    }),
    getters: {
        getPurchases: (state) => state.purchases,
        getPurchase: (state) => state.purchase,
    },
    actions: {
        async index(params: RequestParams) {
            const result = await index(endpoint.index, params);
            this.purchases = result.data
        },
        async show(slug: string) {
            this.purchase = await show(endpoint.withSlug.replace('slug', slug));
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
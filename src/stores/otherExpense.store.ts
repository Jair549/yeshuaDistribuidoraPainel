import { defineStore } from 'pinia';
import { index, show, store, update, destroy, importData } from '@/utils/generalAPI';
import type { Pagination } from '@/interfaces/pagination/pagination.interface';
import type { RequestParams } from '@/interfaces/request-params.interface';
import type { OtherExpense } from '@/interfaces/otherExpense.interface';

const endpoint = {
    index: '/other-expenses',
    withSlug: '/other-expenses/slug'
}

export const useOtherExpenseStore = defineStore({
    id: 'other-expenses',
    state: () => ({
        otherExpenses: {} as Pagination,
        otherExpense: undefined as OtherExpense
    }),
    getters: {
        getOtherExpenses: (state) => state.otherExpenses,
        getOtherExpense: (state) => state.otherExpense,
    },
    actions: {
        async index(params: RequestParams) {
            const result = await index(endpoint.index, params);
            this.otherExpenses = result.data
        },
        async show(slug: string) {
            this.otherExpense = await show(endpoint.withSlug.replace('slug', slug));
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
import { defineStore } from 'pinia'
import { index, show, store, update, destroy } from '@/utils/generalAPI'
import type { Pagination } from '@/interfaces/pagination/pagination.interface'
import type { Status } from '@/interfaces/status.interface'
import type { RequestParams } from '@/interfaces/request-params.interface';

const endpoint = {
    index: '/status',
    withSlug: '/status/slug',
}

export const useStatusStore = defineStore({
    id: 'status',
    state: () => ({
        status: {} as Pagination,
        status: undefined as Status,
    }),
    getters: {
        getstatus: (state) => state.status,
        getStatus: (state) => state.status,
    },
    actions: {
        async index(params: RequestParams) {
            const result = await index(endpoint.index, params);
            this.status = result.data;
        },
        async show(slug: string) {
            this.status = await show(endpoint.withSlug.replace('slug', slug));
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
        },
    },
})

import { defineStore } from 'pinia'
import { index, show, store, update, destroy, importData } from '@/utils/generalAPI'
import type { Pagination } from '@/interfaces/pagination/pagination.interface'
import type { Client } from '@/interfaces/client.interface'
import type { RequestParams } from '@/interfaces/request-params.interface';

const endpoint = {
    index: '/clients',
    withSlug: '/clients/slug',
}

export const useClientStore = defineStore({
    id: 'client',
    state: () => ({
        clients: {} as Pagination,
        client: undefined as Client,
    }),
    getters: {
        getClients: (state) => state.clients,
        getClient: (state) => state.client,
    },
    actions: {
        async index(params: RequestParams) {
            const result = await index(endpoint.index, params);
            this.clients = result.data
        },
        async show(slug: string) {
            this.client = await show(endpoint.withSlug.replace('slug', slug));
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
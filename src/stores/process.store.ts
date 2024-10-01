import { defineStore } from 'pinia';
import { index, show, store, update, destroy, refresh } from '@/utils/generalAPI';
import type { Pagination } from '@/interfaces/pagination/pagination.interface';
import type { Process } from '@/interfaces/process.interface';

const endpoint = {
    index: '/processes',
    withSlug: '/processes/slug'
}

export const useProcessStore = defineStore({
    id: 'process',
    state: () => ({
        processes: {} as Pagination,
        process: undefined as Process
    }),
    getters: {
        getProcesses: (state) => state.processes,
        getProcess: (state) => state.process
    },
    actions: {
        async index(params: any)
        {
            const result = await index(endpoint.index, params);
            this.processes = result.data;
        },
        async show(slug: string)
        {
            this.process = await show(endpoint.withSlug.replace('slug', slug))
        },
        async store(data: string)
        {
            await store(endpoint.index, data);
            this.index();
        },
        async update(slug: string, data:string)
        {
            await update(endpoint.withSlug.replace('slug', slug), data);
            this.index();
        },
        async destroy(slug: string)
        {
            await destroy(endpoint.withSlug.replace('slug', slug));
            this.index();
        },
        async refresh(slug: string, data:string)
        {
            await refresh(endpoint.withSlug.replace('slug', slug), data);
            this.index();
        }
    }
});
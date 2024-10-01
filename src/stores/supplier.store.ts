import { defineStore } from "pinia";
import { index, show, store, update, destroy } from '@/utils/generalAPI';
import type { Pagination } from "@/interfaces/pagination/pagination.interface";
import type { Suppliers } from "@/interfaces/suppliers.interface";
import type { RequestParams } from "@/interfaces/request-params.interface";

const endpoint = {
    index: '/suppliers',
    withSlug: '/suppliers/slug'
}

export const useSupplierStore = defineStore({
    id: 'suppliers',
    state: () => ({
        suppliers: {} as Pagination,
        supplier: undefined as Suppliers
    }),
    getters: {
        getSuppliers: (state) => state.suppliers,
        getSupplier: (state) => state.supplier
    },
    actions: {
        async index(params: RequestParams){
            const result = await index(endpoint.index, params);
            this.suppliers = result.data
        },
        async show(slug: string) {
            this.supplier = await show(endpoint.withSlug.replace('slug', slug));
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
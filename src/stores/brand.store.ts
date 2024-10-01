import { defineStore } from 'pinia';
import { index, show, store, update, destroy, importData } from '@/utils/generalAPI';
import type { Pagination } from '@/interfaces/pagination/pagination.interface';
import type { Brand } from '@/interfaces/brand.interface';
import type { RequestParams } from '@/interfaces/request-params.interface';

const endpoint = {
    index: '/brands',
    withSlug: '/brands/slug'
}

export const useBrandStore = defineStore({
    id: 'brand',
    state: () => ({
        brands: {} as Pagination,
        brand: undefined as Brand
    }),
    getters: {
        getBrands: (state) => state.brands,
        getBrand: (state) => state.brand,
    },
    actions: {
        async index(params: RequestParams) {
            const result = await index(endpoint.index, params);
            this.brands = result.data
        },
        async show(slug: string) {
            this.brand = await show(endpoint.withSlug.replace('slug', slug));
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
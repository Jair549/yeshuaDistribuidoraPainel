import { index, show, store, update, destroy } from '@/utils/generalAPI'

const endpoint = {
    index: '/clients',
    withSlug: '/clients/slug',
}

class ClientService {
    index() {
        return index(endpoint.index);
    }

    show(slug: string) {
        return show(endpoint.withSlug.replace('slug', slug));
    }

    store(data: string) {
        return store(endpoint.index, data);
    }

    update(slug:string, data: string) {
        return update(endpoint.withSlug.replace('slug', slug), data);
    }

    destroy(slug: string) {
        return destroy(endpoint.withSlug.replace('slug', slug));
    }
}

export default new ClientService();
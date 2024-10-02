<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useBrandStore } from '@/stores/brand.store';
import type { Pagination } from '@/interfaces/pagination/pagination.interface'
import type { RequestParams } from '@/interfaces/request-params.interface';
import { 
    ButtonComponent,
    CardComponent,
    ContainerComponent,
    FormGroupComponent,
    InputComponent,
    ModalComponent,
    MultipleSelectComponent,
    SearchComponent,
    TableComponent,
    LoadingComponent,
    PaginationComponent
} from '@/utils/components';
import type { Action } from '@/interfaces/actions.interface';
import { Brand } from '@/interfaces/brand.interface';
import ConfirmDeleteModalComponent from '@/components/ConfirmDeleteModalComponent.vue';
import { useAcl } from '@/utils/acl';

const brandStore = useBrandStore();
const showModal = ref(false);
const showDeleteModal = ref(false);
const currentItem = ref(null);
const isLoading = ref(false);

const { hasPermissionTo } = useAcl();

const formData = (data: any = {}) => {
    return {
        slug: data.slug || '',
        name: data.name || '',
        description: data.description || '',
        products: data.produsct || [],
    }
}

const handleCloseModal = () => {
  showModal.value = false;
};

const handleModalTitle = () => {
    return form.value.slug ? 'Editar Marca' : 'Adicionar Marca';
}

const form = ref(formData());

const brands = ref<Pagination>({
    current_page: 0,
    data: [],
    first_page_url: '',
    from: 0,
    last_page: 0,
    last_page_url: '',
    links: [],
    next_page_url: '',
    path: '',
    per_page: 0,
    prev_page_url: '',
    to: 0,
    total: 0,
});

const params = ref<RequestParams>({
    without_pagination: 0,
    page: 1,
});

const brandsData = ref([]);

onMounted(async () => {
    await loadBrand();
})

const loadBrand = async () => {
    isLoading.value = true
    await brandStore.index(params.value);
    brands.value = brandStore.getBrands;
    brandsData.value = brands.value.data;
    isLoading.value = false;
    prepareDataToTable();
}

const prepareDataToTable = () => {
    brandsData.value = brands.value.data.map((brand) => {
        return {
            id: brand.id,
            slug: brand.slug,
            Nome: brand.name,
            Descição: brand.description,
        }
    })
}

const getItemById = (id: number) => brands.value.data.find((item) => item.id === id);

const closeDeleteModal = () => {
    showDeleteModal.value = false;
};

const confirmDelete = () => {
    if (currentItem.value) {
        handleDelete();
    }
    closeDeleteModal();
};

const handleDelete = async () => {
    isLoading.value = true;
    await brandStore.destroy(currentItem.value)
    await loadBrand();
    isLoading.value = false;
}

const actions: Action[] = [
    {
        name: 'edit',
        hasPermission: hasPermissionTo('Update brand'),
        action: (item) => {
            currentItem.value = getItemById(item.id);

            form.value = currentItem.value;
            showModal.value = true;
        },
        icon: 'edit',
        class: 'light blue',
    },
    {
        name: 'delete',
        hasPermission: hasPermissionTo('Delete brand'),
        action: (item) => {
            currentItem.value = item.slug;
            showDeleteModal.value = true;
        },
        icon: 'trash',
        class: 'light red',
    },
]

const handleSearch = (searchTerm: string) => {
    params.value.search = searchTerm;
    loadBrand();
};

const handlePageChange = async (pageUrl: string) => {
    if (pageUrl) {
        isLoading.value = true;

        const urlParams = new URL(pageUrl);
        const page = parseInt(urlParams.searchParams.get('page') || '1', 10);

        params.value.page = page;

        await loadBrand();
        isLoading.value = false;

    }
};

const handlePerPageChange = (newPerPage) => {
    params.value.per_page = newPerPage;
    params.value.page = 1;
    loadBrand();
};

const handleSubmit = async() => {
    isLoading.value = true;
    if(form.value.slug) {
        await brandStore.update(form.value.slug, form.value);
    }else{
        await brandStore.store(form.value);
    }
    await loadBrand();
    isLoading.value = false;
    clearForm();
}

const clearForm = () => {
    form.value = formData();
}

</script>
<template>
    <LoadingComponent :show="isLoading" />

    <ConfirmDeleteModalComponent
        :show="showDeleteModal" 
        @closeModal="closeDeleteModal" 
        @confirmDelete="confirmDelete"
    />

    <ModalComponent :show="showModal" :titleHeader="handleModalTitle()" @closeModal="handleCloseModal" @submit="handleSubmit()">
        <FormGroupComponent>
            <InputComponent v-model="form.name" placeholder="Nome" type="text" />
        </FormGroupComponent>
        <FormGroupComponent>
            <InputComponent v-model="form.description" placeholder="Descrição" type="text" />
        </FormGroupComponent>
    </ModalComponent>

    <ContainerComponent>
        <CardComponent titleCard="Lista de marcas">
            <template #search>
                <SearchComponent @update-search="handleSearch" :value="params.search" />
            </template>

            <template #button>
                <ButtonComponent buttonClass="btn-secondary" text="Adicionar" icon="plus" light @click="showModal = true" v-if="hasPermissionTo('Create brand')" />
            </template>        
            <TableComponent
                :items="brandsData" 
                :actions="actions"
            />
            

            <PaginationComponent
                :items="brandsData" 
                :pagination="brands" 
                @page-change="handlePageChange"
                @per-page-change="handlePerPageChange"
            />
        </CardComponent>
    </ContainerComponent>
</template>
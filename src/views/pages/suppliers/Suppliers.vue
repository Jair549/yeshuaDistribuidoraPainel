<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useSupplierStore } from '@/stores/supplier.store';
import { useAcl } from '@/utils/acl';
import type { Pagination } from '@/interfaces/pagination/pagination.interface';
import type { RequestParams } from '@/interfaces/request-params.interface';
import type { Action } from '@/types/ActionType';
import { Suppliers } from '@/interfaces/suppliers.interface';
import {
    ButtonComponent,
    CardComponent,
    ContainerComponent,
    FormGroupComponent,
    InputComponent,
    LoadingComponent,
    ModalComponent,
    SearchComponent,
    TableComponent,
    PaginationComponent
} from '@/utils/components';

const supplierStore = useSupplierStore();
const showModal = ref(false);
const showDeleteModal = ref(false);
const currentItem = ref(null);
const isLoading = ref(false);

const { hasPermissionTo } = useAcl();

const formData = (data: any = {}) => {
    return {
        slug: data.slug || '',
        name: data.name || '',
        address: data.address || '',
        email: data.email || '',
        phone: data.phone || '',
        last_purchase: data.last_purchase || '',
        description: data.description || '',
    }
}

const handleModalTitle = () => {
    return form.value.slug ? 'Editar Fornecedor' : 'Adicionar Fornecedor';
}

const suppliersData = ref<Suppliers[]>([]);

const form = ref(formData());

const suppliers = ref<Pagination>({
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

onMounted( async () => {
    loadSuppliers();
})

const handleCloseModal = () => {
  showModal.value = false;
};

const loadSuppliers = async () => {
    isLoading.value = true
    await supplierStore.index(params.value)
    suppliers.value = supplierStore.getSuppliers;
    suppliersData.value = suppliers.value.data;
    isLoading.value = false
}

const actions: Action[] = [
    {
        name: 'edit',
        hasPermission: hasPermissionTo('Update supplier'),
        action: (item) => {
            form.value = formData(item);
            showModal.value = true;
        },
        icon: 'edit',
        class: 'light blue',
    },
    {
        name: 'delete',
        hasPermission: hasPermissionTo('Delete supplier'),
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
    loadSuppliers();
};

const handlePageChange = async (pageUrl: string) => {
    if (pageUrl) {
        isLoading.value = true;

        const urlParams = new URL(pageUrl);
        const page = parseInt(urlParams.searchParams.get('page') || '1', 10);

        params.value.page = page;

        await loadSuppliers();
        isLoading.value = false;

    }
};

const handlePerPageChange = (newPerPage) => {
    params.value.per_page = newPerPage;
    params.value.page = 1;
    loadSuppliers();
};

const closeDeleteModal = () => {
    showDeleteModal.value = false;
};

const confirmDelete = () => {
    if (currentItem.value) {
        handleDelete();
    }
    closeDeleteModal();
};

const handleSubmit = async() => {
    isLoading.value = true;
    if(form.value.slug) {
        await supplierStore.update(form.value.slug, form.value);
    }else{
        await supplierStore.store(form.value);
    }
    await loadSuppliers();
    isLoading.value = false;
    clearForm();
}

const handleDelete = async () => {
    isLoading.value = true;
    await supplierStore.destroy(currentItem.value)
    await loadSuppliers();
    isLoading.value = false;
}

const clearForm = () => {
    form.value = formData();
}

</script>
<template>
    <LoadingComponent :show="isLoading" />

    <ModalComponent :show="showModal" :titleHeader="handleModalTitle()" @closeModal="handleCloseModal" @submit="handleSubmit()">
        <FormGroupComponent>
            <div class="row">
                <div class="col-md-6">
                    <InputComponent v-model="form.name" placeholder="Nome" type="text" />
                </div>
                <div class="col-md-6">
                    <InputComponent v-model="form.email" placeholder="Email" type="text" />
                </div>
            </div>
        </FormGroupComponent>
        <FormGroupComponent>
            <div class="row">
                <div class="col-md-6">
                    <InputComponent v-model="form.phone" v-maska="'(##) 9 ####-####'" placeholder="phone" type="text" />
                </div>
                <div class="col-md-6">
                    <InputComponent v-model="form.last_purchase" placeholder="Última Compra" type="date" />
                </div>
            </div>
        </FormGroupComponent>
        <FormGroupComponent>
            <InputComponent v-model="form.address" placeholder="Endereço" type="text" />
        </FormGroupComponent>
        <FormGroupComponent>
            <InputComponent v-model="form.description" placeholder="Descrição" type="text" />
        </FormGroupComponent>
    </ModalComponent>

    <ContainerComponent>
        <CardComponent titleCard="Lista de fornecedores">
            <template #search>
                <SearchComponent @update-search="handleSearch" :value="params.search" />
            </template>

            <template #button>
                <ButtonComponent buttonClass="btn-secondary" text="Adicionar" icon="plus" light @click="showModal = true" v-if="hasPermissionTo('Delete supplier')" />
            </template>        
            <TableComponent
                :items="suppliersData" 
                :actions="actions"
            />
        
            <PaginationComponent
                :items="suppliersData" 
                :pagination="suppliers" 
                @page-change="handlePageChange"
                @per-page-change="handlePerPageChange"
            />
        </CardComponent>
    </ContainerComponent>
</template>
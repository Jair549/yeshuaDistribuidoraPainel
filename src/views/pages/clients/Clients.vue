<script setup lang="ts">
import { useClientStore } from '@/stores/client.store';
import { onMounted, ref } from 'vue';
import type { Action } from '@/interfaces/actions.interface';
import type { Client } from '@/interfaces/client.interface';
import type { Pagination } from '@/interfaces/pagination/pagination.interface'
import type { RequestParams } from '@/interfaces/request-params.interface';
import { useAcl } from '@/utils/acl';
import {
    TableComponent,
    ModalComponent,
    ButtonComponent,
    CardTitleComponent,
    ContainerComponent,
    CardComponent,
    LoadingComponent,
    SelectComponent,
    SearchComponent,
    PaginationComponent,
    InputComponent,
    ConfirmDeleteModalComponent,
    FormGroupComponent
} from '@/utils/components';

const clientStore = useClientStore();

const typeUser = [ 
    {
        value: 'varejo',
        text: 'Varejo'
    },
    {
        value: 'atacado',
        text: 'Atacado'
    }
]

const clients = ref<Pagination>({
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

const { hasPermissionTo } = useAcl();
const isLoading = ref(false);
const showDeleteModal = ref(false);
const currentItem = ref(null);

const formData = (data: any = {}) => {
    return {
        name: data.name || '',
        phone: data.phone || '',
        email: data.email || '',
        address: data.address || '',
        type: data.type || '',
        last_purchase: data.last_purchase || '',
        slug: data.slug || '',
    }
}

const clientsData = ref([]);
const form = ref(formData());

onMounted(async () => {
    isLoading.value = true;
    await loadClients();
    isLoading.value = false;
})

const loadClients = async () => {
    await clientStore.index(params.value);
    clients.value = clientStore.getClients; 
    clientsData.value = clients.value.data;
    prepareDataToTable();
};


const prepareDataToTable = () => {
    clientsData.value = clients.value.data.map((client) => {
        return {
            id: client.id,
            slug: client.slug,
            Nome: client.name,
            Email: client.email,
            Telefone: client.phone,
            Endereço: client.address,
            Tipo: client.type,
            'Última Compra': client.last_purchase,
        }
    })
}

const getItemById = (id: number) => clients.value.data.find((item) => item.id === id);

const handlePageChange = async (pageUrl: string) => {
    if (pageUrl) {
        isLoading.value = true;

        const urlParams = new URL(pageUrl);
        const page = parseInt(urlParams.searchParams.get('page') || '1', 10);

        params.value.page = page;

        await loadClients();
        isLoading.value = false;

    }
};

const handleSearch = (searchTerm: string) => {
    params.value.search = searchTerm;
    loadClients();
};


const handlePerPageChange = (newPerPage) => {
    params.value.per_page = newPerPage;
    params.value.page = 1;
    loadClients();
};

const actions: Action[] = [
    {
        name: 'edit',
        hasPermission: hasPermissionTo('Update client'),
        action: (item) => {
            currentItem.value = getItemById(item.id);

            form.value = formData(currentItem.value);
            showModal.value = true;
        },
        icon: 'edit',
        class: 'light blue',
    },
    {
        name: 'delete',
        hasPermission: hasPermissionTo('Delete client'),
        action: (item) => {
            currentItem.value = item;
            showDeleteModal.value = true;
        },
        icon: 'trash',
        class: 'light red',
    },
]

const showModal = ref(false);

const handleCloseModal = () => {
  showModal.value = false;
};

const closeDeleteModal = () => {
    showDeleteModal.value = false;
    currentItem.value = null;
};

const confirmDelete = () => {
    if (currentItem.value) {
        handleDelete();
    }
    closeDeleteModal();
};

const handleModalTitle = () => {
    return form.value.name != '' ? 'Editar Cliente' : 'Adicionar Cliente';
}

const handleSubmit = async () => {
    isLoading.value = true;
    if (form.value.slug) {
        await clientStore.update(form.value.slug, form.value);
    } else {
        await clientStore.store(form.value);
    }
    showModal.value = false;
    clearForm();
    await loadClients();
    isLoading.value = false;
};

const handleDelete = async () => {
    isLoading.value = true;
    await clientStore.destroy(currentItem.value.slug);
    await loadClients();
    isLoading.value = false;
};

const clearForm = () => {
    form.value.name = '';
    form.value.phone = '';
    form.value.email = '';
    form.value.address = '';
    form.value.type = '';
    form.value.last_purchase = '';
    form.value.slug =  '';
}

</script>

<template>

    <LoadingComponent :show="isLoading" />

    <ModalComponent :show="showModal" @closeModal="handleCloseModal" :titleHeader="handleModalTitle()" @submit="handleSubmit">
        <FormGroupComponent>
            <div class="row">
                <div class="col-md-6">
                    <InputComponent v-model="form.name" placeholder="Nome" type="text" />
                </div>
                <div class="col-md-6">
                    <InputComponent v-model="form.email" placeholder="Email" type="email" />
                </div>
            </div>
        </FormGroupComponent>
        <FormGroupComponent>
            <div class="row">
                <div class="col-md-6">
                    <InputComponent v-model="form.phone" v-maska="'(##) 9 ####-####'" placeholder="Telefone" type="text" />
                </div>
                <div class="col-md-6">
                    <InputComponent v-model="form.address" placeholder="Endereço" type="text" />
                </div>
            </div>
        </FormGroupComponent>
        <FormGroupComponent>
            <div class="row">
                <div class="col-md-6">
                    <InputComponent v-model="form.last_purchase" placeholder="Última compra" type="date" />
                </div>
                <div class="col-md-6">
                    <SelectComponent v-model="form.type" :options="typeUser" placeholder="Tipo de cliente" />
                </div>
            </div>
        </FormGroupComponent>
    </ModalComponent>

    <ConfirmDeleteModalComponent
        :show="showDeleteModal" 
        @closeModal="closeDeleteModal" 
        @confirmDelete="confirmDelete"
    />

    <CardTitleComponent title="Clientes" />

    <ContainerComponent>
        <CardComponent titleCard="Lista de clientes">
            <template #search>
                <SearchComponent @update-search="handleSearch" :value="params.search" />
            </template>

            <template #button>
                <ButtonComponent buttonClass="btn-secondary" text="Adicionar" icon="plus" light @click="showModal = true" v-if="hasPermissionTo('Create client')" />
            </template>        
            <TableComponent 
                :items="clientsData" 
                :actions="actions"
            />
        
            <PaginationComponent
                :items="clientsData" 
                :pagination="clients" 
                @page-change="handlePageChange"
                @per-page-change="handlePerPageChange"
            />
        </CardComponent>
    </ContainerComponent>

</template>
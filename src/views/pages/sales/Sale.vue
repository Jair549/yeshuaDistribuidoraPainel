<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useSaleStore } from '@/stores/sales.store';
import { useClientStore } from '@/stores/client.store';
import { useProductStore } from '@/stores/product.store';
import { useAcl } from '@/utils/acl';
import type { Pagination } from '@/interfaces/pagination/pagination.interface'
import type { RequestParams } from '@/interfaces/request-params.interface';
import type { Action } from '@/interfaces/actions.interface';
import type { Sale } from '@/interfaces/sale.interface';
import {
    ButtonComponent,
    CardComponent,
    ContainerComponent,
    FormGroupComponent,
    InputComponent,
    LoadingComponent,
    ModalComponent,
    SearchComponent,
    SelectComponent,
    TableComponent,
    ConfirmDeleteModalComponent,
    PaginationComponent
} from '@/utils/components';
import Products from '../products/Products.vue';

const saleStore = useSaleStore();
const productsStore = useProductStore();
const clientStore = useClientStore();
const showModal = ref(false);
const showDeleteModal = ref(false);
const currentItem = ref(null);
const isLoading = ref(false);
const products = ref();
const selectProduct = ref({});
const clients = ref();
const selectClient = ref({});

const { hasPermissionTo } = useAcl();

const formData = (data: any = {}) => {
    return {
        id: data.id || '',
        client_id: data.client_id || '',
        product_id: data.product_id || '',
        quantity: data.quantity || '',
        unit_price: data.unit_price || '',
        total_price: data.total_price || '',
        payment_method: data.payment_method || '',
        status: data.status || '',
        payment_date: data.payment_date || '',
    }
}

const handleCloseModal = () => {
  showModal.value = false;
  clearForm();
};

const status = [
    {
        value: 'paid',
        text: 'Pago'
    },
    {
        value: 'pending',
        text: 'Pendente'
    }
]

const paymentMethod = [
    {
        value: 'pix',
        text: 'Pix'
    },
    {
        value: 'money',
        text: 'Dinheiro'
    },
    {
        value: 'card',
        text: 'Cartão'
    }
]

const handleModalTitle = () => {
    return form.value.id ? 'Editar Compra' : 'Adicionar Compra';
}

const form = ref(formData());

const sales = ref<Pagination>({
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

const salesData = ref([]);

onMounted(async () => {
    isLoading.value = true
    await loadSale();
    isLoading.value = false
    await loadProduct();
    await loadClient();
})

const loadSale = async () => {
    await saleStore.index(params.value);
    sales.value = saleStore.getSales;
    salesData.value = sales.value.data;
    prepareDataToTable();
}

const prepareDataToTable = () => {
    salesData.value = sales.value.data.map((sale) => {
        return {
            id: sale.id,
            Cliente: sale.client.name,
            Produto: sale.product.name,
            Quantidade: sale.quantity,
            'Preço Único': sale.unit_price,
            'Preço Total': sale.total_price,
            'Metodo de Pagamento': sale.payment_method,
            Status: sale.status == 'pending' ? 'Pendente' : 'Pago',
            'Data de Pagamento': sale.payment_date,
        }
    })
}

const getItemById = (id: number) => sales.value.data.find((item) => item.id === id);

const loadClient = async () => {
    await clientStore.index({ without_pagination: 1 });
    clients.value = clientStore.getClients;

    selectClient.value = clients.value.map(client => ({ value: client.id, text: client.name }))
}

const loadProduct = async () => {
    await productsStore.index({ without_pagination: 1 })
    products.value = productsStore.getProducts;
    selectProduct.value = products.value.map(product => ({ value: product.id, text: product.name }))
}

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
    await saleStore.destroy(currentItem.value)
    await loadSale();
    isLoading.value = false;
}

const actions: Action[] = [
    {
        name: 'edit',
        hasPermission: hasPermissionTo('Update sale'),
        action: (item) => {
            currentItem.value = getItemById(item.id)
            console.log('Current Item', currentItem.value.product)
            form.value = formData(currentItem.value);
            form.value.product_id = currentItem.value.product.id;
            form.value.client_id = currentItem.value.client.id;
            showModal.value = true;
        },
        icon: 'edit',
        class: 'light blue',
    },
    {
        name: 'delete',
        hasPermission: hasPermissionTo('Delete sale'),
        action: (item) => {
            currentItem.value = item.id;
            showDeleteModal.value = true;
        },
        icon: 'trash',
        class: 'light red',
    },
]

const handleSearch = (searchTerm: string) => {
    params.value.search = searchTerm;
    loadSale();
};

const handlePageChange = async (pageUrl: string) => {
    if (pageUrl) {
        isLoading.value = true;

        const urlParams = new URL(pageUrl);
        const page = parseInt(urlParams.searchParams.get('page') || '1', 10);

        params.value.page = page;

        await loadSale();
        isLoading.value = false;

    }
};

const handlePerPageChange = (newPerPage) => {
    params.value.per_page = newPerPage;
    params.value.page = 1;
    loadSale();
};

const handleSubmit = async() => {
    isLoading.value = true;
    if(form.value.id) {
        await saleStore.update(form.value.id, form.value);
    }else{
        await saleStore.store(form.value);
    }
    await loadSale();
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
            <SelectComponent :options="selectProduct" v-model="form.product_id" placeholder="Produtos" />
        </FormGroupComponent>
        <FormGroupComponent>
            <SelectComponent :options="selectClient" v-model="form.client_id" placeholder="Cliente" />
        </FormGroupComponent>
        <FormGroupComponent>
            <InputComponent v-model="form.quantity" placeholder="Quantidade" type="text" />
        </FormGroupComponent>
        <FormGroupComponent>
            <InputComponent v-model="form.unit_price" placeholder="Preço único" type="text" />
        </FormGroupComponent>
        <FormGroupComponent>
            <InputComponent v-model="form.total_price" placeholder="Preço total" type="text" />
        </FormGroupComponent>
        <FormGroupComponent>
            <SelectComponent :options="paymentMethod" v-model="form.payment_method" placeholder="Metodo de pagamento" />
        </FormGroupComponent>
        <FormGroupComponent>
            <SelectComponent :options="status" v-model="form.status" placeholder="Status" />
        </FormGroupComponent>
        <FormGroupComponent>
            <InputComponent v-model="form.payment_date" placeholder="Data de pagamento" type="date" />
        </FormGroupComponent>
    </ModalComponent>

    <ContainerComponent>
        <CardComponent titleCard="Lista de vendas">
            <template #search>
                <SearchComponent @update-search="handleSearch" :value="params.search" />
            </template>

            <template #button>
                <ButtonComponent buttonClass="btn-secondary" text="Adicionar" icon="plus" light @click="showModal = true" v-if="hasPermissionTo('Create sale')" />
            </template>        
            <TableComponent
                :items="salesData" 
                :actions="actions"
            />
        
            <PaginationComponent
                :items="salesData" 
                :pagination="sales" 
                @page-change="handlePageChange"
                @per-page-change="handlePerPageChange"
            />
        </CardComponent>
    </ContainerComponent>
</template>
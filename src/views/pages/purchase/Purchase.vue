<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { usePurchaseStore } from '@/stores/purchase.store';
import { useSupplierStore } from '@/stores/supplier.store';
import { useProductStore } from '@/stores/product.store';
import { useAcl } from '@/utils/acl';
import type { Pagination } from '@/interfaces/pagination/pagination.interface'
import type { RequestParams } from '@/interfaces/request-params.interface';
import type { Action } from '@/interfaces/actions.interface';
import { Purchase } from '@/interfaces/purchase.interface';
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

const purchaseStore = usePurchaseStore();
const supplierStore = useSupplierStore();
const productsStore = useProductStore();
const showModal = ref(false);
const showDeleteModal = ref(false);
const currentItem = ref(null);
const isLoading = ref(false);
const suppliers = ref();
const selectSuppliers = ref({});
const products = ref();
const selectProduct = ref({});

const { hasPermissionTo } = useAcl();

const formData = (data: any = {}) => {
    return {
        supplier_id: data.supplier_id || '',
        product_id: data.product_id || '',
        quantity: data.quantity || '',
        unit_price: data.unit_price || '',
        total_price: data.total_price || '',
        due_date: data.due_date || '',
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

const purchases = ref<Pagination>({
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

const purchasesData = ref<Purchase[]>([]);

onMounted(async () => {
    isLoading.value = true
    await loadPurchase();
    await loadSuppliers()
    await loadProduct();
    isLoading.value = false
})

const loadPurchase = async () => {
    await purchaseStore.index(params.value);
    purchases.value = purchaseStore.getPurchases;
    purchasesData.value = purchases.value.data;
}

const loadSuppliers = async () => {
    await supplierStore.index({ without_pagination: 1 });
    suppliers.value = supplierStore.getSuppliers;

    selectSuppliers.value = suppliers.value.map(supplier => ({ value: supplier.id, text: supplier.name }))
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
    await purchaseStore.destroy(currentItem.value)
    await loadPurchase();
    isLoading.value = false;
}

const actions: Action[] = [
    {
        name: 'edit',
        hasPermission: hasPermissionTo('Update purchase'),
        action: (item) => {
            form.value = formData(item);
            showModal.value = true;
        },
        icon: 'edit',
        class: 'light blue',
    },
    {
        name: 'delete',
        hasPermission: hasPermissionTo('Delete purchase'),
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
    loadPurchase();
};

const handlePageChange = async (pageUrl: string) => {
    if (pageUrl) {
        isLoading.value = true;

        const urlParams = new URL(pageUrl);
        const page = parseInt(urlParams.searchParams.get('page') || '1', 10);

        params.value.page = page;

        await loadPurchase();
        isLoading.value = false;

    }
};

const handlePerPageChange = (newPerPage) => {
    params.value.per_page = newPerPage;
    params.value.page = 1;
    loadPurchase();
};

const handleSubmit = async() => {
    isLoading.value = true;
    if(form.value.id) {
        await purchaseStore.update(form.value.id, form.value);
    }else{
        await purchaseStore.store(form.value);
    }
    await loadPurchase();
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
             <SelectComponent :options="selectSuppliers" v-model="form.supplier_id" placeholder="Fornecedor" />
        </FormGroupComponent>
        <FormGroupComponent>
            <SelectComponent :options="selectProduct" v-model="form.product_id" placeholder="Produtos" />
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
            <InputComponent v-model="form.due_date" placeholder="Data de vencimento" type="date" />
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
        <CardComponent titleCard="Lista de compras">
            <template #search>
                <SearchComponent @update-search="handleSearch" :value="params.search" />
            </template>

            <template #button>
                <ButtonComponent buttonClass="btn-secondary" text="Adicionar" icon="plus" light @click="showModal = true" v-if="hasPermissionTo('Create purchase')" />
            </template>        
            <TableComponent
                :items="purchasesData" 
                :actions="actions"
            />
        
            <PaginationComponent
                :items="purchasesData" 
                :pagination="purchases" 
                @page-change="handlePageChange"
                @per-page-change="handlePerPageChange"
            />
        </CardComponent>
    </ContainerComponent>
</template>
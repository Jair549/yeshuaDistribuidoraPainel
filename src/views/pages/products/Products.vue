<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useProductStore } from '@/stores/product.store';
import { useStockStore } from '@/stores/stock.store';
import { useBrandStore } from '@/stores/brand.store';
import { useAcl } from '@/utils/acl';
import { RequestParams } from '@/interfaces/request-params.interface';
import { Pagination } from '@/interfaces/pagination/pagination.interface';
import { Product } from '@/interfaces/products.interface';
import type { Action } from '@/interfaces/actions.interface';
import { ButtonComponent,
    CardComponent,
    ContainerComponent,
    FormGroupComponent,
    InputComponent,
    LoadingComponent,
    ModalComponent,
    PaginationComponent,
    SearchComponent,
    SelectComponent,
    TableComponent,
    ConfirmDeleteModalComponent
} from '@/utils/components';

const productStore = useProductStore();
const stockStore = useStockStore();
const brandStore = useBrandStore();
const stocks = ref({});
const brand = ref({});
const showModal = ref(false);
const showDeleteModal = ref(false);
const showStockModal = ref(false);
const currentItem = ref(null);
const isLoading = ref(false);

const { hasPermissionTo } = useAcl();

const formData = (data: any = {}) => {
    return {
        slug: data.slug || '',
        name: data.name || '',
        brand_id: data.brand_id || '',
        unit_price: data.unit_price || '',
        description: data.description || '',
        quantity: data.quantity || '',
    }
}

const handleCloseModal = () => {
    showModal.value = false;
    showStockModal.value = false;
};

const handleModalTitle = () => {
    return form.value.slug ? 'Editar Produto' : 'Adicionar Produto';
}

const form = ref(formData());
const selectBrand = ref({});
const formStock = ref({ quantity: '' });

const products = ref<Pagination>({
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

const productsData = ref([]);

onMounted(async () => {
    isLoading.value = true;
    await loadProducts();
    isLoading.value = false;
    await loadBrands();
})

const loadProducts = async () => {
    await productStore.index(params.value);
    products.value = productStore.getProducts;
    productsData.value = products.value.data;
    prepareDataToTable();
}

const prepareDataToTable = () => {
    productsData.value = products.value.data.map((product) => {
        return {
            id: product.id,
            slug: product.slug,
            Nome: product.name,
            Marca: product.brand.name,
            'Em Estoque': product.stocks[0].quantity,
            'Preço Único': product.unit_price,
            Descrição: product.description,
        }
    })
}

const getItemById = (id: number) => products.value.data.find((item) => item.id === id);

const loadBrands = async () => {
    await brandStore.index({without_pagination: 1})
    brand.value = brandStore.getBrands;

    selectBrand.value = brand.value.map(brand => ({ value: brand.id, text: brand.name }))
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
    await productStore.destroy(currentItem.value)
    await loadProducts();
    isLoading.value = false;
}

const actions: Action[] = [
    {
        name: 'edit',
        hasPermission: hasPermissionTo('Update product'),
        action: (item) => {
            currentItem.value = getItemById(item.id);
            form.value = currentItem.value;
            form.value.quantity = currentItem.value.stocks[0].quantity;
            showModal.value = true;
        },
        icon: 'edit',
        class: 'light blue',
    },
    {
        name: 'delete',
        hasPermission: hasPermissionTo('Delete product'),
        action: (item) => {
            currentItem.value = item.slug;
            showDeleteModal.value = true;
        },
        icon: 'trash',
        class: 'light red',
    },
    {
        name: 'stock',
        hasPermission: hasPermissionTo('Update product'),
        action: (item) => {
            currentItem.value = getItemById(item.id);
            formStock.value.quantity = currentItem.value.stocks.length > 0 ? currentItem.value.stocks[0].quantity : 0;
            showStockModal.value = true;
        },
        icon: 'stock',
        class: 'light green',
    },
]

const handleSearch = (searchTerm: string) => {
    params.value.search = searchTerm;
    loadProducts();
};

const handlePageChange = async (pageUrl: string) => {
    if (pageUrl) {
        isLoading.value = true;

        const urlParams = new URL(pageUrl);
        const page = parseInt(urlParams.searchParams.get('page') || '1', 10);

        params.value.page = page;

        await loadProducts();
        isLoading.value = false;

    }
};

const handlePerPageChange = (newPerPage) => {
    params.value.per_page = newPerPage;
    params.value.page = 1;
    loadProducts();
};

const handleSubmit = async() => {
    isLoading.value = true;
    if(form.value.slug) {
        await productStore.update(form.value.slug, form.value);
    }else{
        await productStore.store(form.value);
    }
    await loadProducts();
    isLoading.value = false;
    clearForm();
}

const handleStockSubmit = async () => {
    isLoading.value = true;
    if(currentItem.value.stocks.length > 0)
    {
        //update
        await stockStore.update(currentItem.value.slug, currentItem.value.stocks[0].id, formStock.value);
    }else{
        //store
        await stockStore.store(currentItem.value.slug, formStock.value);
    }
    await loadProducts();
    isLoading.value = false;
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
            <!-- <InputComponent v-model="form.brand_id" placeholder="Marca" type="text" /> -->
             <SelectComponent :options="selectBrand" v-model="form.brand_id"  placeholder="Marca" />
        </FormGroupComponent>
        <FormGroupComponent>
            <InputComponent v-model="form.unit_price" placeholder="Preço unitário" type="text" />
        </FormGroupComponent>
        <FormGroupComponent>
            <InputComponent v-model="form.description" placeholder="Descrição" type="text" />
        </FormGroupComponent>
        <FormGroupComponent>
            <InputComponent v-model="form.quantity" placeholder="Quantidade" type="text" />
        </FormGroupComponent>
    </ModalComponent>
    
    <ModalComponent :show="showStockModal" titleHeader="Stock" @closeModal="handleCloseModal" @submit="handleStockSubmit()">
        <FormGroupComponent>
            <InputComponent v-model="formStock.quantity" placeholder="Quantidade" type="text" />
        </FormGroupComponent>
    </ModalComponent>

    <ContainerComponent>
        <CardComponent titleCard="Lista de produtos">
            <template #search>
                <SearchComponent @update-search="handleSearch" :value="params.search" />
            </template>

            <template #button>
                <ButtonComponent buttonClass="btn-secondary" text="Adicionar" icon="plus" light @click="showModal = true" v-if=" hasPermissionTo('Create product')"/>
            </template>        
            <TableComponent
                :items="productsData" 
                :actions="actions"
            />
        
            <PaginationComponent
                :items="productsData" 
                :pagination="products" 
                @page-change="handlePageChange"
                @per-page-change="handlePerPageChange"
            />
        </CardComponent>
    </ContainerComponent>
</template>
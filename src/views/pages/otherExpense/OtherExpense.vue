<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useOtherExpenseStore } from '@/stores/otherExpense.store';
import type { Pagination } from '@/interfaces/pagination/pagination.interface';
import type { OtherExpense } from '@/interfaces/otherExpense.interface';
import { useAcl } from '@/utils/acl';
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

const otherExpenseStore = useOtherExpenseStore();
const showModal = ref(false);
const showDeleteModal = ref(false);
const currentItem = ref(null);
const isLoading = ref(false);

const { hasPermissionTo } = useAcl();

const formData = (data: any = {}) => {
    return {
        id: data.id || '',
        description: data.description || '',
        price: data.price || '',
    }
}

const handleCloseModal = () => {
  showModal.value = false;
  clearForm();
};

const handleModalTitle = () => {
    return form.value.id ? 'Editar Despesa' : 'Adicionar Despesa';
}

const form = ref(formData());

const otherExpenses = ref<Pagination>({
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

const otherExpensesData = ref<OtherExpense[]>([]);

onMounted(async () => {
    isLoading.value = true
    await loadOtherExpense();
    isLoading.value = false
})

const loadOtherExpense = async () => {
    await otherExpenseStore.index(params.value);
    otherExpenses.value = otherExpenseStore.getOtherExpenses;
    otherExpensesData.value = otherExpenses.value.data;
    prepareDataToTable();
}

const prepareDataToTable = () => {
    otherExpensesData.value = otherExpenses.value.data.map((otherExpense) => {
        return {
            id: otherExpense.id,
            Preço: `R$ ${otherExpense.price}`,
            Descrição: otherExpense.description,
        }
    })
}

const getItemById = (id: number) => otherExpenses.value.data.find((item) => item.id === id);

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
    await otherExpenseStore.destroy(currentItem.value)
    await loadOtherExpense();
    isLoading.value = false;
}

const actions: Action[] = [
    {
        name: 'edit',
        hasPermission: hasPermissionTo('Update other expense'),
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
        hasPermission: hasPermissionTo('Delete other expense'),
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
    loadOtherExpense();
};

const handlePageChange = async (pageUrl: string) => {
    if (pageUrl) {
        isLoading.value = true;

        const urlParams = new URL(pageUrl);
        const page = parseInt(urlParams.searchParams.get('page') || '1', 10);

        params.value.page = page;

        await loadOtherExpense();
        isLoading.value = false;

    }
};

const handlePerPageChange = (newPerPage) => {
    params.value.per_page = newPerPage;
    params.value.page = 1;
    loadOtherExpense();
};

const handleSubmit = async() => {
    isLoading.value = true;
    if(form.value.id) {
        await otherExpenseStore.update(form.value.id, form.value);
    }else{
        await otherExpenseStore.store(form.value);
    }
    await loadOtherExpense();
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
            <InputComponent v-model="form.price" placeholder="Preço" type="text" />
        </FormGroupComponent>
        <FormGroupComponent>
            <InputComponent v-model="form.description" placeholder="Descrição" type="text" />
        </FormGroupComponent>
    </ModalComponent>

    <ContainerComponent>
        <CardComponent titleCard="Lista de vendas">
            <template #search>
                <SearchComponent @update-search="handleSearch" :value="params.search" />
            </template>

            <template #button>
                <ButtonComponent buttonClass="btn-secondary" text="Adicionar" icon="plus" light @click="showModal = true" v-if="hasPermissionTo('Create other expense')" />
            </template>        
            <TableComponent
                :items="otherExpensesData" 
                :actions="actions"
            />
        
            <PaginationComponent
                :items="otherExpensesData" 
                :pagination="otherExpenses" 
                @page-change="handlePageChange"
                @per-page-change="handlePerPageChange"
            />
        </CardComponent>
    </ContainerComponent>
</template>
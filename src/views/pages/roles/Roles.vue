<script setup lang="ts">
import type { RequestParams } from '@/interfaces/request-params.interface';
import type { Pagination } from '@/interfaces/pagination/pagination.interface'
import { onMounted, ref } from 'vue'
import { useRoleStore } from '@/stores/roles.store';
import { usePermissionStore } from '@/stores/permissions.store';
import { useAcl } from '@/utils/acl';
import type { Action } from '@/interfaces/actions.interface';
import type { Permission } from '@/interfaces/permissions.interface';
import { 
    TableComponent,
    ModalComponent,
    ButtonComponent,
    CardTitleComponent,
    ContainerComponent,
    CardComponent,
    FormGroupComponent,
    InputComponent,
    MultipleSelectComponent,
    LoadingComponent,
    SearchComponent,
    ConfirmDeleteModalComponent,
    PaginationComponent
} from '@/utils/components';

// 
const isLoading = ref(false);
const showModal = ref(false);
const showDeleteModal = ref(false);
const roleStore = useRoleStore();
const permissionStore = usePermissionStore();
const currentItem = ref(null);

const { hasPermissionTo } = useAcl();

const formData = (data: any = {}) => {
    return {
        slug: data.slug || '',
        name: data.name || '',
        permissions: data.permissions || []
    }
}

const form = ref(formData());

const params = ref<RequestParams>({
    without_pagination: 0,
    search: '',
});

const roles = ref<Pagination>({
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
const permissions = ref<Permission[]>([]);

onMounted(async () => {
    isLoading.value = true;
    await loadRoles();
    isLoading.value = false;
    await loadPermissions();
});

const loadRoles = async () => {
    await roleStore.index(params.value);
    roles.value = roleStore.getRoles
};

const handlePageChange = async (pageUrl: string) => {
    if (pageUrl) {
        isLoading.value = true;

        const urlParams = new URL(pageUrl);
        const page = parseInt(urlParams.searchParams.get('page') || '1', 10);

        params.value.page = page;

        await loadRoles();
        isLoading.value = false;

    }
};

const handleSearch = (searchTerm: string) => {
    params.value.search = searchTerm;
    loadRoles();
};

const handlePerPageChange = (newPerPage) => {
    params.value.per_page = newPerPage;
    params.value.page = 1;
    loadRoles();
};

const permissionsSelectData = ref({});

const loadPermissions = async () => {
    await permissionStore.index({ without_pagination: 1 });
    permissions.value = permissionStore.getPermissions;
    permissionsSelectData.value = permissions.value.map((permission) => {
        return {
            value: permission.id,
            text: permission.name
        }
    });
}

const actions: Action[] = [
    {
        name: 'edit',
        hasPermission: hasPermissionTo('Update role'),
        action: (item) => {
            form.value = formData(item);
            form.value.permissions = item.permissions.map((permission) => permission.id);
            showModal.value = true;
        },
        icon: 'edit',
        class: 'light blue',
    },
    {
        name: 'delete',
        hasPermission: hasPermissionTo('Delete role'),
        action: (item) => {
            currentItem.value = item.slug;
            showDeleteModal.value = true;
        },
        icon: 'trash',
        class: 'light red',
    },
]

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
    await roleStore.destroy(currentItem.value)
    await loadRoles();
    isLoading.value = false;
}

const handleModalTitle = () => {
    return form.value.slug ? 'Editar Cargo' : 'Adicionar Cargo';
}

const handleCloseModal = () => {
  showModal.value = false;
};

const handleSubmit = async() => {
    isLoading.value = true;
    if(form.value.slug) {
        await roleStore.update(form.value.slug, form.value);
    }else{
        await roleStore.store(form.value);
    }
    await loadRoles();
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
            <MultipleSelectComponent v-model="form.permissions" :options="permissionsSelectData" />
        </FormGroupComponent>
    </ModalComponent>

    <ContainerComponent>
        <CardComponent titleCard="Cargos">
            <template #search>
                <SearchComponent @update-search="handleSearch" :value="params.search" />
            </template>
            <template #button>
                <ButtonComponent buttonClass="btn-secondary" text="Adicionar" icon="plus" light @click="showModal = true" v-if="hasPermissionTo('Create role')" />
            </template>        
            <TableComponent 
                :items="roles.data" 
                :actions="actions"
            />
        
            <PaginationComponent
                :items="roles.data" 
                :pagination="roles" 
                @page-change="handlePageChange"
                @per-page-change="handlePerPageChange"
            />
        </CardComponent>
    </ContainerComponent>

</template>
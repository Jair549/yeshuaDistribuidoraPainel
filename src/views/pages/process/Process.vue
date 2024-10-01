<script setup lang="ts">
import { 
  TableComponent, 
  ModalComponent, 
  ButtonComponent, 
  CardTitleComponent, 
  ContainerComponent, 
  CardComponent, 
  FormGroupComponent, 
  InputComponent, 
  SelectComponent, 
  LoadingComponent,
  LabelComponent,
  SearchComponent
} from '@/utils/components';
import { onMounted, ref, computed } from 'vue';
import type { Pagination } from '@/interfaces/pagination/pagination.interface';
import type { Process } from '@/interfaces/process.interface';
import type { Action } from '@/types/ActionType';
import { useProcessStore } from '@/stores/process.store';
import { useServiceStore } from '@/stores/service.store';
import type { RequestParams } from '@/interfaces/request-params.interface';
import type { Service } from '@/interfaces/service.interface';
import { useClientStore } from '@/stores/client.store';
import { useExportStore } from '@/stores/export.store';
import { useImportStore } from '@/stores/import.store';
import { useSellerStore } from '@/stores/seller.store';
import { useStatusStore } from '@/stores/status.store';
import ConfirmDeleteModalComponent from '@/components/ConfirmDeleteModalComponent.vue';
import ConfirmRefreshModal from '@/components/ConfirmRefreshModal.vue';
import { useAcl } from '@/utils/acl';

const params = ref<RequestParams>({
    without_pagination: 0,
    page: 1,
});

const { hasPermissionTo } = useAcl();
const isLoading = ref(false);

const formData = (data: any = {}) => {
    return {
        user_id: data.user_id || '',
        client_id: data.client_id || '',
        status_id: '',
        seller_id: data.seller_id || '',
        service_id: data.service_id || '',
        plate: data.plate || '',
        chassis: data.chassis || '',
        renavam: data.renavam || '',
        state_plate: data.state_plate || '',
        infraction_code: data.infraction_code || '',
        agency: data.agency || '',
        ait: data.ait || '',
        seller: data.seller || '',
        process_value: data.process_value || '',
        payment_method: data.payment_method || '',
        observation: data.observation || '',
        process_number: data.process_number || '',
        deadline_date: data.deadline_date || '',
        updateDeadLine: false,
        slug: data.slug || '',
    }
}

const form = ref(formData());

const processes = ref<Pagination>({
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

const processesData = ref<Process[]>([]);

const processStore = useProcessStore();
const serviceStore = useServiceStore();
const clientStore = useClientStore();
const sellerStore = useSellerStore();
const statusStore = useStatusStore();

const exportStore = useExportStore();
const importStore = useImportStore();

const serviceSelectData = ref([]);
const clientSelectData = ref([]);
const statusSelectData = ref([]);

const sellerSelectData = ref([]);

onMounted(async () => {
    isLoading.value = true;
    await loadProcesses();
    isLoading.value = false;
    await handleServiceData();
    await handleClientData();
    await handleSellerData();
    await handleStatus();
})

const loadProcesses = async () => {
    await processStore.index(params.value);
    processes.value = processStore.getProcesses;
    processesData.value = processes.value.data;
};

const handlePageChange = async (pageUrl: string) => {
    if (pageUrl) {
        isLoading.value = true;

        const urlParams = new URL(pageUrl);
        const page = parseInt(urlParams.searchParams.get('page') || '1', 10);

        params.value.page = page;

        await loadProcesses();
        isLoading.value = false;
    }
};

const handlePerPageChange = (newPerPage) => {
    params.value.per_page = newPerPage;
    params.value.page = 1;
    loadProcesses();
};

const handleSearch = (searchTerm: string) => {
    params.value.search = searchTerm;
    loadProcesses();
};

const handleServiceData = async () => {
    if(hasPermissionTo('Read service'))
        await serviceStore.index({ without_pagination: 1 });
    
    const services = serviceStore.getServices;
    allServices.value = services;
    serviceSelectData.value = prepareSelectData(services);
};

const handleClientData = async () => {
    await clientStore.index({ without_pagination: 1 });
    const clients = clientStore.getClients;
    clientSelectData.value = prepareSelectData(clients);
};

const handleStatus = async () => {
    await statusStore.index({ without_pagination: 1 });
    const status = statusStore.getstatus;
    statusSelectData.value = prepareSelectDataStatus(status);
};

const handleSellerData = async () => {
    await sellerStore.index({ without_pagination: 1 });
    const sellers = sellerStore.getSellers;
    sellerSelectData.value = prepareSelectData(sellers);
};

const prepareSelectData = (data: any) => {
    return data.map((item: any) => {
        return {
            value: item.id,
            text: item.name
        }
    });
}

const prepareSelectDataStatus = (data: any) => {
    return data.map((item: any) => {
        return {
            value: item.id,
            text: item.title
        }
    });
}

const actions: Action[] = [
    {
        name: 'edit',
        hasPermission: hasPermissionTo('Update process'),
        action: (item) => {
            form.value = formData(item);
            showModal.value = true;
        },
        icon: 'edit',
        class: 'light blue',
    },
    {
        name: 'delete',
        hasPermission: hasPermissionTo('Delete process'),
        action: (item) => {
            currentItem.value = item;
            showDeleteModal.value = true;
        },
        icon: 'trash',
        class: 'light red',
    },
    {
        name: 'show',
        action: (item) => {
            currentItem.value = item;
            showViewModal.value = true;
        },
        icon: 'eye',
        class: 'light btn-outline-primary',
    },
    {
        name: 'refresh',
        hasPermission: hasPermissionTo('Refresh process date'),
        action: (item) => {
            currentItem.value = item;
            showRefreshModal.value = true;
        },
        icon: 'refresh',
        class: 'light dark-blue',
    },
]

const showModal = ref(false);

const handleCloseModal = () => {
  showModal.value = false;
  processFields.value = [];
  form.value = formData();
};

const handleModalTitle = () => {
    return form.value.plate != '' ? 'Editar Processo' : 'Adicionar Processo';
}

const handleSubmit = async() => {
    isLoading.value = true;
    if(form.value.slug) {
        await processStore.update(form.value.slug, form.value);
    }else{
        await processStore.store(form.value);
    }
    await loadProcesses();
    isLoading.value = false;
    form.value = formData();
    processFields.value = [];
}

const handleSubmitStatus = async() => {
    if(currentItem.value.slug) {
        await processStore.update(`update-status/${currentItem.value.slug}`, form.value);
    }

    await loadProcesses();
}

const handleDelete = async () => {
    isLoading.value = true;
    await processStore.destroy(currentItem.value.slug);
    await loadProcesses();
    isLoading.value = false;
}

const handleRefresh = async () => {
    isLoading.value = true;
    await processStore.refresh(`refresh-date/${currentItem.value.slug}`, form.value);
    await loadProcesses();
    form.value.updateDeadLine = false;
    isLoading.value = false;
}


const handleExport = async () => {
    isLoading.value = true;
    await exportStore.fetchExport(params.value);
    isLoading.value = false;
}

const showModalImportFile = ref(false);
const importFile = ref<File | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

const resetFileInput = () => {
  importFile.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const handleCloseModaImportFile = () => {
  showModalImportFile.value = false;
  resetFileInput();
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    importFile.value = target.files[0];
  }
};

const formatLabel = (label: string) => {
    return label
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
};

const handleCloseModaView = () => {
    showViewModal.value = false;
    currentItem.value = null;
};

const handleUpdateStatusModal = () => {
    showUpdateStatusModal.value = false;
    currentItem.value = null;
    form.value.status_id = '';
    form.value.updateDeadLine = false;
};

const getFilledFields = (item: any) => {
    const fields = [];
    for (const key in item) {
        if (item[key]) {
            fields.push({ label: key, value: item[key] });
        }
    }
    return fields;
};

const submitImportFile = async () => {
  if (!importFile.value) return;

  isLoading.value = true;

  const formData = new FormData();
  formData.append('file', importFile.value);
  
  await importStore.fetchImport(formData);
  resetFileInput();
  await loadProcesses();
  isLoading.value = false;
};

const processFields = ref([]);
const filteredProcessFields = computed(() => {
    return processFields.value.filter(field => !['ait', 'deadline_date'].includes(field.name));
});

const handleProcessList = () => {
    processFields.value = getProcessFieldsByServiceId();
}

const allServices = ref([]);
const getProcessFieldsByServiceId = () => allServices.value.filter((service: Service) => service.id == form.value.service_id)[0].process_fields;

const showDeleteModal = ref(false);
const showRefreshModal = ref(false);
const showViewModal = ref(false);
const showUpdateStatusModal = ref(false);
const currentItem = ref(null);

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


const closeRefreshModal = () => {
    showRefreshModal.value = false;
    currentItem.value = null;
};

const confirmRefresh = () => {
    if (currentItem.value) {
        form.value.updateDeadLine = true
        handleRefresh();
    }
    closeRefreshModal();
};

const handleRowClick = (item) => {
    const activeStatus = item.status?.find(status => status.pivot?.is_active === 1);
    currentItem.value = item;
    form.value.updateDeadLine = true;

    if (activeStatus) {
        form.value.status_id = activeStatus.id;
    }
    showUpdateStatusModal.value = true;
};

</script>
<template>

    <LoadingComponent :show="isLoading" />

    <ConfirmDeleteModalComponent 
        :show="showDeleteModal" 
        @closeModal="closeDeleteModal" 
        @confirmDelete="confirmDelete"
    />

    <ConfirmRefreshModal
        :show="showRefreshModal" 
        @closeModal="closeRefreshModal" 
        @confirmRefresh="confirmRefresh"
    />

    <!-- modal de cadastro -->
    <ModalComponent :show="showModal" @closeModal="handleCloseModal" :titleHeader="handleModalTitle()" @submit="handleSubmit()">
        <FormGroupComponent>
            <LabelComponent text="Cliente" />
            <SelectComponent v-model="form.client_id" :options="clientSelectData" />
        </FormGroupComponent>
        <FormGroupComponent>
            <LabelComponent text="Vendedor" />
            <SelectComponent v-model="form.seller_id" :options="sellerSelectData" />
        </FormGroupComponent>

        <FormGroupComponent>
            <LabelComponent text="Data limite" />
            <InputComponent v-model="form.deadline_date" type="date" />
        </FormGroupComponent>

        <FormGroupComponent>
            <LabelComponent text="AIT" />
            <InputComponent v-model="form.ait" type="text" />
        </FormGroupComponent>
    
        <FormGroupComponent>
            <LabelComponent text="Serviços" />
            <SelectComponent v-model="form.service_id" :options="serviceSelectData" @change="handleProcessList()" />
        </FormGroupComponent>

        <template v-if="filteredProcessFields.length > 0">
            <FormGroupComponent v-for="(field, index) in filteredProcessFields" :key="index">
                <InputComponent v-model="form[field.name]" :placeholder="field.label" :type="field.type" />
            </FormGroupComponent>
        </template>

        <FormGroupComponent v-else>
            <LabelComponent text="Nenhum campo disponível para este serviço" />
        </FormGroupComponent>
 
    </ModalComponent>

    <!-- modal para importar processos -->
    <ModalComponent v-if="hasPermissionTo('Import data')" :show="showModalImportFile" @closeModal="handleCloseModaImportFile" titleHeader="Importar Processos" @submit="submitImportFile()">
        <FormGroupComponent>
            <InputComponent ref="fileInput" placeholder="Selecione o arquivo" @change="handleFileChange($event)" type="file" accept=".xls,.xlsx" />
        </FormGroupComponent>
    </ModalComponent>

    <!-- modal para ver processos -->
    <ModalComponent 
        :show="showViewModal"
        cancelText="Fechar"
        @closeModal="handleCloseModaView"
        :showSubmitBtn="false"
        titleHeader="Visualizar Processo"
    >
        <div v-if="currentItem">
            <div v-for="(field, index) in getFilledFields(currentItem)" :key="index">
                <p><strong>{{ formatLabel(field.label) }}:</strong> {{ field.value }}</p>
            </div>
        </div>
    </ModalComponent>

            
    <CardTitleComponent title="Processos" />

    <ContainerComponent>
        <CardComponent titleCard="Lista de processos">

            <template #search>
                <SearchComponent @update-search="handleSearch" />
            </template>

            <template #button>
                <div class="button-group">
                    <ButtonComponent buttonClass="btn-secondary btn-import" text="Importar" icon="file-upload" light @click="showModalImportFile = true" v-if="hasPermissionTo('Import data')" />
                    <ButtonComponent buttonClass="btn-secondary btn-export" text="Exportar" icon="file-download" light @click="handleExport()" v-if="hasPermissionTo('Export data')" />
                    <ButtonComponent buttonClass="btn-secondary" text="Adicionar" icon="plus" light @click="showModal = true" v-if="hasPermissionTo('Create process')" />
                </div>
            </template>        
            <TableComponent 
                :items="processesData" 
                :actions="actions" 
                @row-click="handleRowClick" 
                @page-change="handlePageChange" 
                :pagination="processes"
                @per-page-change="handlePerPageChange"
            />
        </CardComponent>
    </ContainerComponent>

    <!-- modal status do processo -->
    <ModalComponent 
        sizeClass="modal-small"
        :show="showUpdateStatusModal"
        cancelText="Fechar"
        @closeModal="handleUpdateStatusModal"
        @submit="handleSubmitStatus()"
        titleHeader="Atualizar Status"
    >
        <div>
            <FormGroupComponent>
                <LabelComponent text="Status" />
                <SelectComponent v-model="form.status_id" :options="statusSelectData" />
            </FormGroupComponent>
        </div>
    </ModalComponent>

</template>
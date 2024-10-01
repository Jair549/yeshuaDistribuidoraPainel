<script setup lang="ts">
import { 
    ContainerComponent,
    CardComponent,
    LoadingComponent
} from '@/utils/components';
import type { RequestParams } from '@/interfaces/request-params.interface';
import { useRouter } from 'vue-router';
import type { Pagination } from '@/interfaces/pagination/pagination.interface'
import CardTitleComponent from '@/components/CardTitleComponent.vue';
import { useSearchStore } from '@/stores/search.store';
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const isLoading = ref(false);

const searchStore = useSearchStore();
const route = useRoute();

const params = ref<RequestParams>({
    without_pagination: 0,
    search: ''
});

const dataResults = ref([]);

onMounted(async () => {
  await loadData();
  dataResults.value = searchStore.getSearchResults;
});

const users = ref<Pagination>({
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

const searchResult = computed(() => searchStore.result);
const router = useRouter();

const navigateToResult = (category: string, result: string) => {
  searchStore.search(result);

  let route = '';
  switch (category) {
    case 'process':
      route = '/painel/process';
      break;
    case 'status':
      route = '/painel/process/status';
      break;
    case 'clients':
      route = '/painel/clients';
      break;
    case 'services':
      route = '/painel/services';
      break;
    case 'roles':
      route = '/painel/roles';
      break;
    case 'users':
      route = '/painel/users';
      break;
    default:
      return;
  }
  router.push(route);
};

const loadData = () => {
  params.value.search = route.query.q as string || '';
  if (params.value.search != '') {
    searchStore.search(params.value);
  }
}

</script>

<template>
    <LoadingComponent :show="isLoading" />
  
    <CardTitleComponent :title="'Resultados de: ' + params.search" />
  
    <ContainerComponent>
        <section class="results" v-for="(data, index) in dataResults.data" :key="index">
            <h3>{{ data.title }}</h3>
            <template v-if="data.title == 'Clientes'">
                <CardComponent :showHeader="false" v-for="client in data.data" :key="client.id">
                    <span class="name">{{  client.name }}</span>
                    <span class="name">{{  client.cpf }}</span>
                    <span class="name">{{  client.phone }}</span>
                </CardComponent>
            </template>
        </section>
      
    </ContainerComponent>
</template>
<script setup lang="ts">
import { inject } from 'vue';
import IconChevronRight from '../icons/IconChevronRight.vue';
import IconDashboard from '../icons/IconDashboard.vue';
import IconComponent from '../IconComponent.vue';
import { useAcl } from '@/utils/acl';

const logoSrc = new URL('@/assets/img/logo-light.png', import.meta.url).href;

const isOpen = inject('isOpen');

const { hasPermissionTo } = useAcl();

</script>

<template>
    <div class="sidebar" :class="{'closedSide' : !isOpen}">
      <div class="header-sidebar">
        <a class="logo-header" href="#">
          <img :src="logoSrc" v-if="isOpen" alt="logo-lg">
          <img src='@/assets/img/logo-sm.png' v-else alt="logo-sm">
        </a>
      </div>
      <div class="body-sidebar">
        <h2 class="title-sibebar">
            <span class="desck-visible">MENU</span>
            <span class="mob-visible">...</span>
        </h2>

        <!-- <div class="accordion accordion-flush accordion-sidebar" id="accordionSidebarProcess">
            <div class="accordion-item">
                <h2 class="accordion-header" id="flush-headingTwo">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                        data-bs-target="#flush-collapseTwo" aria-expanded="false" aria-controls="flush-collapseTwo">
                        <IconComponent name="process" />
                        <span class="title-link">Processos</span>
                        <IconChevronRight class="arrow-chevron" />
                    </button>
                </h2>
                <div id="flush-collapseTwo" class="accordion-collapse collapse" aria-labelledby="flush-headingTwo" data-bs-parent="#accordionSidebarProcess">
                    <div class="accordion-body">

                        <div id="sub-menu-one-2" aria-labelledby="flush-headingSubTwo" data-bs-parent="#sub-nav-2">
                            <div class="accordion-body">
                                <ul class="sub-nav-dropdown">
                                    <li v-if="hasPermissionTo('Read process')">
                                        <router-link to="/painel/process">Todos</router-link>
                                    </li>
                                    <li v-if="hasPermissionTo('Read status')">
                                        <router-link to="/painel/process/status">Status</router-link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div> -->

        <router-link to="/painel/brands" class="nav-link" v-if="hasPermissionTo('Read brand')" title="Marcas">
            <IconComponent name="brands" />
            <span class="title-link">Marcas</span>
        </router-link>

        <router-link to="/painel/clients" class="nav-link" v-if="hasPermissionTo('Read client')">
            <IconComponent name="clients" />
            <span class="title-link">Clientes</span>
        </router-link>

        <router-link to="/painel/suppliers" class="nav-link" v-if="hasPermissionTo('Read supplier')">
            <IconComponent name="suppliers" />
            <span class="title-link">Fornecedores</span>
        </router-link>

        <router-link to="/painel/products" class="nav-link" v-if="hasPermissionTo('Read product')">
            <IconComponent name="products" />
            <span class="title-link">Produtos</span>
        </router-link>

        <router-link to="/painel/purchase" class="nav-link" v-if="hasPermissionTo('Read purchase')">
            <IconComponent name="purchase" />
            <span class="title-link">Compras</span>
        </router-link>

        <router-link to="/painel/sales" class="nav-link" v-if="hasPermissionTo('Read sale')">
            <IconComponent name="sales" />
            <span class="title-link">Vendas</span>
        </router-link>

        <router-link to="/painel/other-expense" class="nav-link" v-if="hasPermissionTo('Read other expense')">
            <IconComponent name="otherExpense" />
            <span class="title-link">Outras despesas</span>
        </router-link>

        <router-link to="/painel/roles" class="nav-link" v-if="hasPermissionTo('Read role')">
            <IconComponent name="userGear" />
            <span class="title-link">Cargos</span>
        </router-link>
        
        <router-link to="/painel/users" class="nav-link" v-if="hasPermissionTo('Read user')">
            <IconComponent name="users" />
            <span class="title-link">Usuários</span>
        </router-link>

        <!-- Logout -->
        <router-link to="/logout" class="nav-link logout">
            <IconComponent name="power" />
            <span class="title-link">Sair</span>
        </router-link>

      </div>
    </div>
</template>
  
import { createRouter, createWebHistory } from 'vue-router'
import DashboardLayout from '../views/DashboardLayout.vue'
import { jwtDecode } from "jwt-decode";

import { useCache } from '@/utils/cache'

const cache = useCache()

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/pages/auth/Login.vue')
    },
    {
      path: '/logout',
      name: 'logout',
      component: () => import('@/views/pages/auth/Logout.vue')
    },
    {
      path: '/',
      name: 'home',
      component: DashboardLayout
    },
    {
      path: '/painel',
      name: 'painel',
      component: () => import('@/views/DashboardLayout.vue'),
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/views/pages/Dashboard.vue')
        },
        {
          path: 'clients',
          name: 'clients',
          component: () => import('@/views/pages/clients/Clients.vue'),
          meta: { permission: 'Read client' }
        },
        {
          path: 'brands',
          name: 'brands',
          component: () => import('@/views/pages/brands/Brands.vue'),
          meta: { permission: 'Read brand' }
        },
        {
          path: 'suppliers',
          name: 'suppliers',
          component: () => import('@/views/pages/suppliers/Suppliers.vue'),
          meta: { permission: 'Read supplier' }
        },
        {
          path: 'products',
          name: 'products',
          component: () => import('@/views/pages/products/Products.vue'),
          meta: { permission: 'Read product' }
        },
        {
          path: 'purchase',
          name: 'purchase',
          component: () => import('@/views/pages/purchase/Purchase.vue'),
          meta: { permission: 'Read purchase' }
        },
        {
          path: 'sales',
          name: 'sales',
          component: () => import('@/views/pages/sales/Sale.vue'),
          meta: { permission: 'Read sale' }
        },
        {
          path: 'other-expense',
          name: 'otherExpense',
          component: () => import('@/views/pages/otherExpense/OtherExpense.vue'),
          meta: { permission: 'Read other expense' }
        },
        {
          path: 'roles',
          name: 'roles',
          component: () => import('@/views/pages/roles/Roles.vue'),
          meta: { permission: 'Read role' }
        },
        {
          path: 'users',
          name: 'users',
          component: () => import('@/views/pages/users/Users.vue'),
          meta: { permission: 'Read role' }
        },
        {
          path: '/:catchAll(.*)',
          name: 'not-found',
          component: () => import('@/views/pages/not-found/NotFound.vue')
        }
      ]
    },
  ]
})

router.beforeEach((to, from, next) => {
  const token = cache.getToken();

  if (!token) {
    if (to.name !== 'login') {
      return next({ name: 'login' });
    } else {
      return next();
    }
  }

  try {

  // Check if token is valid
  // const decodedToken = jwtDecode(token);
  // const currentTime = Date.now() / 1000;

  // if (decodedToken.exp < currentTime) {
  //   // Token has expired
  //   cache.clearStorage();
  //   return next({ name: 'login' });
  // }
  //end check token

  // Check if user has permission to access the route
  const requiredPermission = to.meta?.permission;

  const getAuth = cache.getUser();
  const user = JSON.parse(getAuth);
  const roles = user?.roles || [];
  let hasPermission = null;

  if(requiredPermission) {
    hasPermission = roles.some((role: any) => {
      return role.permissions.some((permission: {name: string}) => permission.name === requiredPermission)
    });

    if(!hasPermission) {
      return next('/404');
    }
  }

  //enc check permission
  } catch (error) {

    return next({ name: 'login' });
  }

  next();
});

export default router
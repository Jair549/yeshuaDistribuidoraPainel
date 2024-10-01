<script setup lang="ts">
    import { useLogoutStore } from '@/stores/logout.store';
    import { useRouter } from 'vue-router';
    import { onMounted, ref } from 'vue';
    import { LoadingComponent } from '@/utils/components';

    const logoutStore = useLogoutStore();
    const isLoading = ref(false);
    const router = useRouter();

    onMounted(async() => {
        isLoading.value = true;
        await logoutStore.logout();
        isLoading.value = false;
        router.push({ name: 'login' })
    });

</script>

<template>
    <LoadingComponent :show="isLoading" />
</template>
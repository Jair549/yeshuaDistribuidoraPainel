<script setup lang="ts">
import { ModalComponent } from '@/utils/components';
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
    showModal: Boolean,
});

const emits = defineEmits(['closeModal', 'confirmDelete', 'cancelDelete']);

const handleCloseModal = () => {
    emits('closeModal');
};

const handleCancel = () => {
    emits('cancelDelete');
    handleCloseModal();
};

const handleConfirm = () => {
    emits('confirmDelete');
    handleCloseModal();
};
</script>

<template>
    <ModalComponent
        sizeClass="modal-m"
        submitText="Confirmar"
        cancelText="Cancelar"
        submitBtnClass="btn-danger" 
        :show="showModal"
        @closeModal="handleCloseModal()"
        @submit="handleConfirm"
    >

        <div class="modal-body">
            <svg width="80px" height="80px" viewBox="0 0 24.00 24.00" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#f85454" transform="matrix(1, 0, 0, 1, 0, 0)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M3 9.22843V14.7716C3 15.302 3.21071 15.8107 3.58579 16.1858L7.81421 20.4142C8.18929 20.7893 8.69799 21 9.22843 21H14.7716C15.302 21 15.8107 20.7893 16.1858 20.4142L20.4142 16.1858C20.7893 15.8107 21 15.302 21 14.7716V9.22843C21 8.69799 20.7893 8.18929 20.4142 7.81421L16.1858 3.58579C15.8107 3.21071 15.302 3 14.7716 3H9.22843C8.69799 3 8.18929 3.21071 7.81421 3.58579L3.58579 7.81421C3.21071 8.18929 3 8.69799 3 9.22843Z" stroke="#ee2b2b" stroke-width="0.9600000000000002" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M12 8V13" stroke="#ee2b2b" stroke-width="0.9600000000000002" stroke-linecap="round"></path> <path d="M12 16V15.9888" stroke="#ee2b2b" stroke-width="0.9600000000000002" stroke-linecap="round"></path> </g></svg>
            <div class="mt-2 text-alert-delete">
                <span>Tem certeza que deseja excluir este item?</span>
                <span>Essa ação não poderá ser desfeita.</span>
            </div>
        </div>
    </ModalComponent>
</template>
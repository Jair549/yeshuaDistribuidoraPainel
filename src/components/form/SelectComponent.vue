<template>
    <select class="form-control" @change="updateValue(($event.target as HTMLSelectElement)?.value)">
        <option disabled :selected="modelValue == ''" value="">{{ placeholder }}</option>
        <option v-for="(option, index) in options" :selected="modelValue == option.value" :key="index" :value="option.value">
            {{ option.text }}
        </option>
    </select>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue';

interface Option {
    value: string;
    text: string;
}

const props = defineProps({
    modelValue: String,
    placeholder: String,
    options: {
        type: Array as () => Option[],
        required: true,
    },
});

const emit = defineEmits(['update:modelValue']);

const updateValue = (value: string) => {
    emit('update:modelValue', value);
};

</script>
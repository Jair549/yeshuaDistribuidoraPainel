import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { vMaska } from 'maska/vue';
import App from './App.vue';
import router from './router';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import './assets/main.css';
import './assets/scss/styles.scss';
import './assets/scss/main.scss';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(Toast);

app.directive('maska', vMaska);

app.mount('#app');

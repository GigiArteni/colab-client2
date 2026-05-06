import { config } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';

const i18n = createI18n({ locale: 'en-US', messages: { 'en-US': {} } });

config.global.plugins = [i18n];

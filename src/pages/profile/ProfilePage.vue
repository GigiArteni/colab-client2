<template>
  <q-page padding>
    <div class="text-h5 q-mb-md">{{ $t('profile.title') }}</div>

    <!-- Loading -->
    <div v-if="!profileStore.isLoaded" class="flex flex-center q-pa-xl">
      <q-spinner-dots size="50px" color="primary" />
    </div>

    <!-- Profile -->
    <template v-else>
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-6">
          <!-- User Info -->
          <q-card class="q-mb-md">
            <q-card-section>
              <div class="row items-center q-gutter-md">
                <q-avatar size="80px" color="primary" text-color="white">
                  {{ profileStore.initials }}
                </q-avatar>
                <div>
                  <div class="text-h6">{{ profileStore.displayName }}</div>
                  <div class="text-caption text-grey">{{ $t('profile.customer') }}</div>
                </div>
              </div>
            </q-card-section>

            <q-separator />

            <q-list>
              <q-item v-if="profileStore.email">
                <q-item-section avatar>
                  <q-icon name="las la-envelope" />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>{{ $t('profile.email') }}</q-item-label>
                  <q-item-label>{{ profileStore.email }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-if="profileStore.phone">
                <q-item-section avatar>
                  <q-icon name="las la-phone" />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>{{ $t('profile.phone') }}</q-item-label>
                  <q-item-label>{{ profileStore.phone }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>

          <!-- Actions -->
          <q-card>
            <q-list>
              <q-item clickable v-ripple @click="changePassword">
                <q-item-section avatar>
                  <q-icon name="las la-key" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ $t('profile.changePassword') }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="las la-angle-right" />
                </q-item-section>
              </q-item>

              <q-separator />

              <q-item clickable v-ripple @click="handleLogout" class="text-negative">
                <q-item-section avatar>
                  <q-icon name="las la-sign-out-alt" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ $t('auth.logout') }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </div>

        <div class="col-12 col-md-6">
          <!-- Entities -->
          <q-card>
            <q-card-section>
              <div class="text-subtitle1">{{ $t('profile.mySuppliers') }}</div>
            </q-card-section>

            <q-separator />

            <q-list>
              <q-item
                v-for="entity in entityStore.entities"
                :key="entity.id"
                clickable
                v-ripple
                :active="entity.id === entityStore.selectedEntityId"
                @click="entityStore.selectEntity(entity.id)"
              >
                <q-item-section avatar>
                  <q-avatar v-if="entity.logo?.url" size="40px">
                    <img :src="entity.logo.url" />
                  </q-avatar>
                  <q-avatar v-else size="40px" color="primary" text-color="white">
                    {{ entity.name.charAt(0) }}
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ entity.name }}</q-item-label>
                </q-item-section>
                <q-item-section side v-if="entity.id === entityStore.selectedEntityId">
                  <q-icon name="las la-check" color="primary" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </div>
      </div>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from 'src/stores/auth';
import { useProfileStore } from 'src/stores/profile';
import { useEntityStore } from 'src/stores/entity';
import { clearAppData } from 'src/boot/appInit';

const { t } = useI18n();
const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();
const profileStore = useProfileStore();
const entityStore = useEntityStore();

function changePassword(): void {
  $q.notify({
    type: 'info',
    message: t('profile.changePasswordNotImplemented'),
  });
}

function handleLogout(): void {
  $q.dialog({
    title: t('auth.logoutConfirm'),
    message: t('auth.logoutConfirmMessage'),
    cancel: true,
    persistent: true,
  }).onOk(() => {
    authStore.logout()
      .then(() => {
        clearAppData();
        void router.push('/auth/login');
      })
      .catch((err) => {
        console.error('Logout failed:', err);
      });
  });
}
</script>

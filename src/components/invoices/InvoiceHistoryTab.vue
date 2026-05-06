<template>
  <div>
    <div v-if="isLoadingHistory" class="flex flex-center q-pa-lg">
      <q-spinner-dots size="40px" color="primary" />
    </div>

    <template v-else>
      <!-- Status Timeline -->
      <div class="q-mb-lg">
        <div class="text-subtitle2 text-weight-medium q-mb-sm">
          {{ $t('invoices.history.statusTimeline') }}
        </div>

        <div v-if="statusLogs.length === 0" class="text-grey text-center q-pa-md">
          {{ $t('invoices.history.noStatusLogs') }}
        </div>

        <q-timeline v-else color="primary" layout="loose">
          <q-timeline-entry
            v-for="log in statusLogs"
            :key="log.id"
            :subtitle="formatDateTime(log.created_at)"
            :color="getStatusColor(log.to_status)"
            :icon="getStatusIcon(log.to_status)"
          >
            <template #title>
              <span class="text-weight-medium">
                {{ $t(`invoices.status.${log.to_status}`) }}
              </span>
              <span v-if="log.from_status" class="text-caption text-grey q-ml-sm">
                {{ $t('invoices.history.from') }} {{ $t(`invoices.status.${log.from_status}`) }}
              </span>
            </template>
            <div v-if="log.causer" class="text-caption text-grey">
              {{ $t('common.by') }} {{ log.causer.name }}
            </div>
            <div v-if="log.notes" class="text-body2 text-grey-8 q-mt-xs">{{ log.notes }}</div>
          </q-timeline-entry>
        </q-timeline>
      </div>

      <q-separator class="q-mb-lg" />

      <!-- Linked Corrections -->
      <div class="q-mb-lg">
        <div class="text-subtitle2 text-weight-medium q-mb-sm">
          {{ $t('invoices.history.corrections') }}
        </div>

        <div v-if="corrections.length === 0" class="text-grey text-center q-pa-md">
          {{ $t('invoices.history.noCorrections') }}
        </div>

        <q-list v-else bordered separator rounded>
          <q-item
            v-for="correction in corrections"
            :key="correction.id"
            clickable
            @click="$emit('go-to-invoice', correction.id)"
          >
            <q-item-section avatar>
              <q-icon name="las la-file-invoice" color="warning" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">
                {{ $t('invoices.invoice') }} #{{ correction.number }}
              </q-item-label>
              <q-item-label caption>
                {{ formatDate(correction.invoice_at) }}
                <span v-if="correction.correction_reason"> · {{ correction.correction_reason }}</span>
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-chip
                :color="getStatusColor(correction.status)"
                text-color="white"
                size="sm"
                :label="$t(`invoices.status.${correction.status}`)"
              />
            </q-item-section>
            <q-item-section side>
              <q-item-label class="text-weight-medium">
                {{ formatCurrency(Number(correction.total_payable), correction.currency) }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <q-separator class="q-mb-lg" />

      <!-- Activities Feed -->
      <div>
        <div class="text-subtitle2 text-weight-medium q-mb-sm">
          {{ $t('invoices.history.activities') }}
        </div>

        <div v-if="activities.length === 0" class="text-grey text-center q-pa-md">
          {{ $t('invoices.history.noActivities') }}
        </div>

        <q-timeline v-else color="grey">
          <q-timeline-entry
            v-for="activity in activities"
            :key="activity.id"
            :subtitle="formatDateTime(activity.created_at)"
            icon="las la-history"
          >
            <template #title>
              <span class="text-weight-medium">{{ activity.type_label }}</span>
              <span v-if="activity.causer" class="text-caption text-grey q-ml-sm">
                {{ $t('common.by') }} {{ activity.causer.name }}
              </span>
            </template>
            <div v-if="activity.content" class="text-body2 text-grey-8">
              {{ activity.content }}
            </div>
          </q-timeline-entry>
        </q-timeline>

        <!-- Load More Activities -->
        <div
          v-if="activitiesPagination.page < activitiesPagination.lastPage"
          class="flex flex-center q-mt-md"
        >
          <q-btn
            flat
            color="primary"
            :label="$t('common.loadMore')"
            @click="$emit('load-more-activities')"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { InvoiceCorrection, InvoiceStatusLog, InvoiceActivity } from 'src/types';

defineProps<{
  corrections: InvoiceCorrection[];
  statusLogs: InvoiceStatusLog[];
  activities: InvoiceActivity[];
  activitiesPagination: { page: number; lastPage: number; total: number };
  isLoadingHistory: boolean;
  currency?: string;
}>();

defineEmits<{
  'go-to-invoice': [id: string];
  'load-more-activities': [];
}>();

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'grey',
    pending: 'warning',
    validated: 'info',
    sent: 'primary',
    partially_paid: 'orange',
    paid: 'positive',
    overdue: 'negative',
    cancelled: 'grey',
    refunded: 'purple',
    corrected: 'deep-orange',
  };
  return colors[status] ?? 'grey';
}

function getStatusIcon(status: string): string {
  const icons: Record<string, string> = {
    draft: 'las la-file',
    pending: 'las la-clock',
    validated: 'las la-check',
    sent: 'las la-paper-plane',
    partially_paid: 'las la-adjust',
    paid: 'las la-check-circle',
    overdue: 'las la-exclamation-triangle',
    cancelled: 'las la-times-circle',
    refunded: 'las la-undo',
    corrected: 'las la-edit',
  };
  return icons[status] ?? 'las la-circle';
}

function formatDate(date: string): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('ro-RO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(date: string): string {
  if (!date) return '-';
  return new Date(date).toLocaleString('ro-RO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCurrency(amount: number, currency = 'RON'): string {
  return new Intl.NumberFormat('ro-RO', { style: 'currency', currency }).format(amount);
}
</script>

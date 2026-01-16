<template>
  <q-page padding>
    <!-- Back Button -->
    <q-btn flat color="grey" icon="las la-arrow-left" :label="$t('common.back')" @click="router.back()" class="q-mb-md" />

    <!-- Context Alerts -->
    <AlertBanner
      v-if="!isLoading && invoice && contextAlerts.alerts.value.length > 0"
      :alerts="contextAlerts.alerts.value"
      :dismissible="true"
      :actionable="true"
      action-label="Vezi detalii"
      @dismiss="contextAlerts.dismissAlert"
      class="q-mb-md"
    />

    <!-- Loading -->
    <div v-if="isLoading" class="flex flex-center q-pa-xl">
      <q-spinner-dots size="50px" color="primary" />
    </div>

    <!-- Content -->
    <template v-else-if="invoice">
      <!-- Header -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="row items-center q-gutter-md">
            <q-icon
              :name="getUtilityIcon(invoice.group)"
              :color="getUtilityColor(invoice.group)"
              size="48px"
            />
            <div class="col">
              <div class="text-h5">{{ $t('invoices.invoice') }} #{{ invoice.number }}</div>
              <div class="text-caption text-grey">
                {{ invoice.subscription?.contract_no }}
              </div>
            </div>
            <q-chip
              :color="getStatusColor(invoice.status)"
              text-color="white"
              :label="$t(`invoices.status.${invoice.status}`)"
            />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-6 col-md-3">
              <div class="text-caption text-grey">{{ $t('invoices.issueDate') }}</div>
              <div class="text-body1">{{ formatDate(invoice.invoice_at) }}</div>
            </div>
            <div class="col-6 col-md-3">
              <div class="text-caption text-grey">{{ $t('invoices.dueDate') }}</div>
              <div class="text-body1" :class="{ 'text-negative': isOverdue }">
                {{ formatDate(invoice.due_date) }}
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="text-caption text-grey">{{ $t('invoices.total') }}</div>
              <div class="text-h6 text-primary">{{ formatCurrency(Number(invoice.total)) }}</div>
            </div>
            <div class="col-6 col-md-3">
              <div class="text-caption text-grey">{{ $t('invoices.balanceDue') }}</div>
              <div class="text-h6" :class="balanceDue > 0 ? 'text-negative' : 'text-positive'">
                {{ formatCurrency(balanceDue) }}
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Consumption Period -->
      <q-card v-if="invoice.from_date && invoice.to_date" class="q-mb-md">
        <q-card-section>
          <div class="text-subtitle1 text-weight-medium q-mb-sm">
            {{ $t('invoices.consumptionPeriod') }}
          </div>
          <div class="text-body1">
            {{ formatDate(invoice.from_date) }} - {{ formatDate(invoice.to_date) }}
          </div>
        </q-card-section>
      </q-card>

      <!-- Invoice Items -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-subtitle1 text-weight-medium q-mb-md">
            {{ $t('invoices.details') }}
          </div>

          <q-list separator>
            <q-item v-for="item in invoice.items" :key="item.id">
              <q-item-section>
                <q-item-label>{{ item.description || item.item_name }}</q-item-label>
                <q-item-label caption v-if="item.quantity && item.unit">
                  {{ item.quantity }} {{ item.unit }} x {{ formatCurrency(Number(item.unit_price)) }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label class="text-weight-medium">
                  {{ formatCurrency(Number(item.amount || item.line_total || 0)) }}
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label class="text-weight-medium">{{ $t('invoices.subtotal') }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label class="text-weight-medium">
                  {{ formatCurrency(Number(invoice.subtotal)) }}
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item v-if="invoice.tax_amount">
              <q-item-section>
                <q-item-label>{{ $t('invoices.tax') }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label>{{ formatCurrency(Number(invoice.tax_amount)) }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item class="bg-grey-2">
              <q-item-section>
                <q-item-label class="text-h6">{{ $t('invoices.total') }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label class="text-h6 text-primary">
                  {{ formatCurrency(Number(invoice.total)) }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <!-- Payment History -->
      <q-card v-if="invoice.receipts && invoice.receipts.length > 0" class="q-mb-md">
        <q-card-section>
          <div class="text-subtitle1 text-weight-medium q-mb-md">
            {{ $t('invoices.paymentHistory') }}
          </div>

          <q-list separator>
            <q-item v-for="receipt in invoice.receipts" :key="receipt.id">
              <q-item-section avatar>
                <q-icon name="las la-check-circle" color="positive" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ formatCurrency(Number(receipt.amount)) }}</q-item-label>
                <q-item-label caption v-if="receipt.paid_at">{{ formatDate(receipt.paid_at) }}</q-item-label>
              </q-item-section>
              <q-item-section side v-if="receipt.payment_method">
                <q-chip size="sm" :label="$t(`payment.method.${receipt.payment_method}`)" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <!-- Actions -->
      <div class="row q-gutter-sm">
        <q-btn
          outline
          color="primary"
          icon="las la-file-pdf"
          :label="$t('invoices.downloadPdf')"
          @click="downloadPdf"
        />
        <q-btn
          v-if="balanceDue > 0"
          color="primary"
          icon="las la-credit-card"
          :label="$t('invoices.pay')"
          @click="goToPayment"
        />
      </div>
    </template>

    <!-- Not Found -->
    <q-card v-else flat bordered>
      <q-card-section class="text-center text-grey q-pa-xl">
        <q-icon name="las la-exclamation-circle" size="64px" class="q-mb-md" />
        <div class="text-h6">{{ $t('invoices.notFound') }}</div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useEntityStore } from 'src/stores/entity';
import { invoiceService } from 'src/services/invoice.service';
import { useContextAlerts } from 'src/composables/useContextAlerts';
import AlertBanner from 'src/components/AlertBanner.vue';
import type { Invoice } from 'src/types';

const route = useRoute();
const router = useRouter();
const entityStore = useEntityStore();

// Context alerts for this invoice
const contextAlerts = useContextAlerts({
  resourceType: 'invoices',
  resourceId: () => route.params.id as string,
  unreadOnly: true,
  autoLoad: false, // Load manually after invoice loads
});

const isLoading = ref(true);
const invoice = ref<Invoice | null>(null);

// Calculate balance due from total minus paid receipts
const balanceDue = computed(() => {
  if (!invoice.value) return 0;
  const total = Number(invoice.value.total) || 0;
  const paidAmount = invoice.value.receipts?.reduce((sum, r) => sum + Number(r.amount), 0) || 0;
  return Math.max(0, total - paidAmount);
});

const isOverdue = computed(() => {
  if (!invoice.value) return false;
  return invoice.value.status === 'overdue' ||
    (balanceDue.value > 0 && new Date(invoice.value.due_date) < new Date());
});

async function loadInvoice(): Promise<void> {
  if (!entityStore.selectedEntityId) return;

  const invoiceId = route.params.id as string;
  if (!invoiceId) return;

  isLoading.value = true;

  try {
    invoice.value = await invoiceService.getInvoice(entityStore.selectedEntityId, invoiceId);

    // Load context alerts for this invoice
    await contextAlerts.loadAlerts();
  } catch (error) {
    console.error('Failed to load invoice:', error);
    invoice.value = null;
  } finally {
    isLoading.value = false;
  }
}

function getUtilityIcon(type?: string): string {
  const icons: Record<string, string> = {
    'electricity': 'las la-bolt',
    'natural-gas': 'las la-fire',
    'water': 'las la-tint',
    'sewage': 'las la-water',
  };
  return icons[type || ''] || 'las la-file-invoice';
}

function getUtilityColor(type?: string): string {
  const colors: Record<string, string> = {
    'electricity': 'amber',
    'natural-gas': 'orange',
    'water': 'blue',
    'sewage': 'teal',
  };
  return colors[type || ''] || 'grey';
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'warning',
    paid: 'positive',
    overdue: 'negative',
    partial: 'info',
    cancelled: 'grey',
  };
  return colors[status] || 'grey';
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ro-RO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: invoice.value?.currency || 'RON',
  }).format(amount);
}

async function downloadPdf(): Promise<void> {
  if (!entityStore.selectedEntityId || !invoice.value) return;

  try {
    const blob = await invoiceService.downloadPdf(entityStore.selectedEntityId, invoice.value.id);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `factura-${invoice.value.number}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download PDF:', error);
  }
}

function goToPayment(): void {
  if (!invoice.value) return;
  void router.push(`/invoices/${invoice.value.id}/pay`);
}

onMounted(() => {
  void loadInvoice();
});
</script>

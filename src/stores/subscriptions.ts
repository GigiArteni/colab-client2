/**
 * Subscriptions Store - Manages contracts/subscriptions state
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { subscriptionService } from 'src/services/subscription.service';
import type {
  Subscription,
  SubscriptionSummary,
  SubscriptionGroup,
  SubscriptionStatus,
  PaginationMeta,
} from 'src/types';

export const useSubscriptionsStore = defineStore('subscriptions', () => {
  // State
  const subscriptions = ref<Subscription[]>([]);
  const currentSubscription = ref<Subscription | null>(null);
  const summary = ref<SubscriptionSummary | null>(null);
  const pagination = ref<PaginationMeta | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Filters
  const statusFilter = ref<SubscriptionStatus | null>(null);
  const groupFilter = ref<SubscriptionGroup | null>(null);

  // Computed
  const activeSubscriptions = computed(() =>
    subscriptions.value.filter((s) => s.status === 'active' || s.is_active)
  );

  const suspendedSubscriptions = computed(() =>
    subscriptions.value.filter((s) => s.status === 'suspended')
  );

  const subscriptionsByGroup = computed(() => {
    const grouped: Record<SubscriptionGroup, Subscription[]> = {
      natural_gas: [],
      water: [],
      electricity: [],
    };

    subscriptions.value.forEach((sub) => {
      // UtilityGroup uses 'natural-gas'; SubscriptionGroup uses 'natural_gas'
      const key = sub.group === 'natural-gas' ? 'natural_gas' : sub.group as SubscriptionGroup;
      if (key in grouped) {
        grouped[key].push(sub);
      }
    });

    return grouped;
  });

  const filteredSubscriptions = computed(() => {
    let result = subscriptions.value;

    if (statusFilter.value) {
      result = result.filter((s) => s.status === statusFilter.value);
    }

    if (groupFilter.value) {
      result = result.filter((s) => {
        const key = s.group === 'natural-gas' ? 'natural_gas' : s.group;
        return key === groupFilter.value;
      });
    }

    return result;
  });

  const totalActive = computed(() => summary.value?.active || activeSubscriptions.value.length);

  // Actions
  async function fetchSubscriptions(entityId: string): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      const params: Record<string, string> = {};

      if (statusFilter.value) {
        params['filter[status]'] = statusFilter.value;
      }
      if (groupFilter.value) {
        params['filter[group]'] = groupFilter.value;
      }

      const result = await subscriptionService.getSubscriptions(entityId, params);

      subscriptions.value = result || [];
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Eroare la încărcarea contractelor';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchSubscription(
    entityId: string,
    subscriptionId: string
  ): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      currentSubscription.value = await subscriptionService.getSubscription(
        entityId,
        subscriptionId
      );
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Eroare la încărcarea contractului';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  function fetchSummary(entityId: string): void {
    try {
      // No dedicated summary endpoint; derive from loaded subscriptions
      void entityId;
      summary.value = {
        total: subscriptions.value.length,
        active: activeSubscriptions.value.length,
        suspended: suspendedSubscriptions.value.length,
        by_group: {
          natural_gas: subscriptionsByGroup.value.natural_gas.length,
          water: subscriptionsByGroup.value.water.length,
          electricity: subscriptionsByGroup.value.electricity.length,
        },
      };
    } catch (err) {
      console.error('Failed to fetch subscription summary:', err);
      // Set default summary
      summary.value = {
        total: subscriptions.value.length,
        active: activeSubscriptions.value.length,
        suspended: suspendedSubscriptions.value.length,
        by_group: {
          natural_gas: subscriptionsByGroup.value.natural_gas.length,
          water: subscriptionsByGroup.value.water.length,
          electricity: subscriptionsByGroup.value.electricity.length,
        },
      };
    }
  }

  function setStatusFilter(status: SubscriptionStatus | null): void {
    statusFilter.value = status;
  }

  function setGroupFilter(group: SubscriptionGroup | null): void {
    groupFilter.value = group;
  }

  function clearFilters(): void {
    statusFilter.value = null;
    groupFilter.value = null;
  }

  function clearCurrentSubscription(): void {
    currentSubscription.value = null;
  }

  function reset(): void {
    subscriptions.value = [];
    currentSubscription.value = null;
    summary.value = null;
    pagination.value = null;
    statusFilter.value = null;
    groupFilter.value = null;
    error.value = null;
  }

  return {
    // State
    subscriptions,
    currentSubscription,
    summary,
    pagination,
    isLoading,
    error,
    statusFilter,
    groupFilter,

    // Computed
    activeSubscriptions,
    suspendedSubscriptions,
    subscriptionsByGroup,
    filteredSubscriptions,
    totalActive,

    // Actions
    fetchSubscriptions,
    fetchSubscription,
    fetchSummary,
    setStatusFilter,
    setGroupFilter,
    clearFilters,
    clearCurrentSubscription,
    reset,
  };
});

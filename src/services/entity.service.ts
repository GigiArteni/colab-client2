/**
 * Entity Service
 * Customer's utility companies/suppliers
 */

import { api } from 'src/boot/axios';
import type { Entity, PaginatedResponse } from 'src/types';

export const entityService = {
  /**
   * Get customer's entities (auto-filtered by authenticated user)
   */
  async getEntities(): Promise<Entity[]> {
    const response = await api.get<PaginatedResponse<Entity>>('/entities');
    return response.data.data;
  },

  /**
   * Get single entity
   */
  async getEntity(entityId: number): Promise<Entity> {
    const response = await api.get<{ data: Entity }>(`/entities/${entityId}`);
    return response.data.data;
  },
};

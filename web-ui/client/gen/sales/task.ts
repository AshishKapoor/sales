/**
 * Generated by orval v7.10.0 🍺
 * Do not edit manually.
 * Sales Cookbook API
 * Sales Cookbook API Documentation - A comprehensive sales management system
 * OpenAPI spec version: 1.0.0
 */
import type { TaskTypeEnum } from './taskTypeEnum';
import type { TaskStatusEnum } from './taskStatusEnum';

export interface Task {
  readonly id: number;
  /** @maxLength 255 */
  title: string;
  type: TaskTypeEnum;
  due_date: string;
  status?: TaskStatusEnum;
  /** @nullable */
  related_lead?: number | null;
  readonly related_lead_name: string;
  /** @nullable */
  related_opportunity?: number | null;
  readonly related_opportunity_name: string;
  owner: number;
  readonly owner_name: string;
  notes?: string;
}

/**
 * Generated by orval v7.10.0 🍺
 * Do not edit manually.
 * Sales Cookbook API
 * Sales Cookbook API Documentation - A comprehensive sales management system
 * OpenAPI spec version: 1.0.0
 */
import type { QuoteLineItem } from './quoteLineItem';

export interface PaginatedQuoteLineItemList {
  count: number;
  /** @nullable */
  next?: string | null;
  /** @nullable */
  previous?: string | null;
  results: QuoteLineItem[];
}

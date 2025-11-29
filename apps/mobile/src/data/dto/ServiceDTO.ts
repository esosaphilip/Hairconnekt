/**
 * Service DTO (Data Transfer Object)
 * Data layer - matches API response structure (snake_case)
 */

export type ServiceCategoryDTO = {
  id: string;
  name_de: string;
  name_en: string;
};

export type ServiceDTO = {
  id: string;
  name: string;
  description: string | null;
  category: ServiceCategoryDTO | null;
  price_cents: number;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};


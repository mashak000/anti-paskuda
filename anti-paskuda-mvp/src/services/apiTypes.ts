import type { Database } from '../lib/database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Plan = Database['public']['Tables']['monthly_plans']['Row'];
export type CreateProfileInput =
  Database['public']['Tables']['profiles']['Insert'] & {
    id: string;
  };
export type CreatePlanInput =
  Database['public']['Tables']['monthly_plans']['Insert'] & {
    owner_id: string;
  };

export type ApiError = {
  message: string;
  code?: string;
};

import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase } from '../lib/supabaseCLient';
import type { ApiError, Profile, CreateProfileInput } from './apiTypes';

export const paskudaApi = createApi({
  reducerPath: 'paskudaApi',
  baseQuery: fakeBaseQuery<ApiError>(),
  tagTypes: ['Profile'],
  endpoints: (builder) => ({
    getProfileById: builder.query<Profile | null, string>({
      async queryFn(id, { signal }) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .abortSignal(signal)
            .maybeSingle();
          if (error) {
            return {
              error: {
                message: error.message,
                code: error.code,
              },
            };
          }
          return { data };
        } catch (error) {
          return {
            error: {
              message:
                error instanceof Error
                  ? error.message
                  : 'Could not load profile',
            },
          };
        }
      },
      providesTags: (_result, _error, id) => [{ type: 'Profile', id }],
    }),
    hasPlanByProfile: builder.query<boolean, string>({
      async queryFn(id, { signal }) {
        try {
          const { data, error } = await supabase
            .from('monthly_plans')
            .select('id')
            .eq('owner_id', id)
            .limit(1)
            .abortSignal(signal);
          if (error) {
            return {
              error: {
                message: error.message,
                code: error.code,
              },
            };
          }
          return { data: data.length > 0 };
        } catch (error) {
          return {
            error: {
              message:
                error instanceof Error
                  ? error.message
                  : 'Could not load any plan',
            },
          };
        }
      },
    }),
    createProfile: builder.mutation<boolean, CreateProfileInput>({
      async queryFn(profile, { signal }) {
        try {
          const { error } = await supabase
            .from('profiles')
            .insert(profile)
            .abortSignal(signal);

          if (error) {
            return {
              error: {
                message: error.message,
                code: error.code,
              },
            };
          }
          return { data: true };
        } catch (error) {
          return {
            error: {
              message:
                error instanceof Error
                  ? error.message
                  : 'Could not create profile',
            },
          };
        }
      },
      invalidatesTags: (_result, error, profile) =>
        error ? [] : [{ type: 'Profile', id: profile.id }],
    }),
  }),
});

export const {
  useGetProfileByIdQuery,
  useHasPlanByProfileQuery,
  useCreateProfileMutation,
} = paskudaApi;

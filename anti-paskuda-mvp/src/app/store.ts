import { configureStore } from '@reduxjs/toolkit';
import { paskudaApi } from '../services/api';

export const store = configureStore({
  reducer: {
    [paskudaApi.reducerPath]: paskudaApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(paskudaApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;

import { AppRouter } from '@/trpc/routers/_app';
import { inferRouterOutputs } from '@trpc/server';

export type VideoGetOneOutputType =
	inferRouterOutputs<AppRouter>['videos']['getOne'];

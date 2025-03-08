import { AppRouter } from '@/trpc/routers/_app';
import { inferRouterOutputs } from '@trpc/server';

export type CommentsGetManyOutputType =
	inferRouterOutputs<AppRouter>['comments']['getMany'];

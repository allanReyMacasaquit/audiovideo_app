import { relations } from 'drizzle-orm';
import {
	integer,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uniqueIndex,
	uuid,
} from 'drizzle-orm/pg-core';

import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from 'drizzle-zod';

export const users = pgTable(
	'users',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		clerkId: text('clerk_id').unique().notNull(),
		name: text('name').notNull(),
		// TODO: add banner fields
		imageUrl: text('image_url').notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull(),
	},
	(t) => [uniqueIndex('clerk_id_idx').on(t.clerkId)]
);

export const categories = pgTable(
	'categories',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		name: text('name').notNull().unique(),
		description: text('description'),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull(),
	},
	(t) => [uniqueIndex('name_idx').on(t.name)]
);

export const videoVisibility = pgEnum('video_visibility', [
	'private',
	'public',
]);

export const videos = pgTable('videos', {
	id: uuid('id').primaryKey().defaultRandom(),
	title: text('title').notNull(),
	description: text('description'),
	userId: uuid('user_id')
		.references(() => users.id, {
			onDelete: 'cascade',
		})
		.notNull(),
	categoryId: uuid('category_id').references(() => categories.id, {
		onDelete: 'set null',
	}),

	muxStatus: text('mux_status'),
	muxAssetId: text('mux_asset_id').unique(),
	muxUploadId: text('mux_upload_id').unique(),
	muxPlaybackId: text('mux_playback_id').unique(),
	muxTrackId: text('mux_track_id').unique(),
	muxTrackStatus: text('mux_track_status'),

	thumbnailUrl: text('thumbnail_url'),
	previewUrl: text('preview_url'),

	thumbnailUrlkey: text('thumbnail_url_key'),
	previewUrlkey: text('preview_url_key'),

	duration: integer('duration').default(0),

	visibility: videoVisibility('visibility').default('private').notNull(),

	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const videoViews = pgTable(
	'video_views',
	{
		userId: uuid('user_id')
			.references(() => users.id, { onDelete: 'cascade' })
			.notNull(),
		videoId: uuid('video_id')
			.references(() => videos.id, { onDelete: 'cascade' })
			.notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull(),
	},
	(t) => [
		primaryKey({
			name: 'video_views_pk',
			columns: [t.userId, t.videoId],
		}),
	]
);

export const userRelations = relations(users, ({ many }) => ({
	videos: many(videos),
	videoViews: many(videoViews),
}));

export const categoryRelations = relations(categories, ({ many }) => ({
	videos: many(videos),
}));
export const videoRelations = relations(videos, ({ one, many }) => ({
	user: one(users, {
		fields: [videos.userId],
		references: [users.id],
	}),
	category: one(categories, {
		fields: [videos.categoryId],
		references: [categories.id],
	}),
	views: many(videoViews),
}));

export const videoViewRelations = relations(videoViews, ({ one }) => ({
	users: one(users, {
		fields: [videoViews.userId],
		references: [users.id],
	}),
	videos: one(videos, {
		fields: [videoViews.videoId],
		references: [videos.id],
	}),
}));

// drizzle zod

export const videoInsertSchema = createInsertSchema(videos);
export const videoUpdateSchema = createUpdateSchema(videos);
export const videoSelectSchema = createSelectSchema(videos);

export const videoViewsInsertSchema = createInsertSchema(videoViews);
export const videoViewsUpdateSchema = createUpdateSchema(videoViews);
export const videoViewsSelectSchema = createSelectSchema(videoViews);

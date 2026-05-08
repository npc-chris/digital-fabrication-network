import { relations } from "drizzle-orm/relations";
import { groupBuyingCampaigns, groupBuyingParticipants, users, mentorshipRequests, messages, notifications, communityPosts, postReplies, profiles, projects, projectBoms, components, projectLikes, reviews, verificationDocuments, wishlists, services, carts, cartItems, affiliateStores, orders, quotes, machineCapabilities, transactions, orderTracking, bookings, componentSubcategories, componentApplications, componentCategories, buildPipelines, pipelineExecutions, projectAssets, projectCompletions, componentComparisons, forumThreads, forumCategories, forumReplies } from "./schema";

export const groupBuyingParticipantsRelations = relations(groupBuyingParticipants, ({one}) => ({
	groupBuyingCampaign: one(groupBuyingCampaigns, {
		fields: [groupBuyingParticipants.campaignId],
		references: [groupBuyingCampaigns.id]
	}),
	user: one(users, {
		fields: [groupBuyingParticipants.userId],
		references: [users.id]
	}),
}));

export const groupBuyingCampaignsRelations = relations(groupBuyingCampaigns, ({one, many}) => ({
	groupBuyingParticipants: many(groupBuyingParticipants),
	cartItems: many(cartItems),
	user: one(users, {
		fields: [groupBuyingCampaigns.organizerId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	groupBuyingParticipants: many(groupBuyingParticipants),
	mentorshipRequests_menteeId: many(mentorshipRequests, {
		relationName: "mentorshipRequests_menteeId_users_id"
	}),
	mentorshipRequests_mentorId: many(mentorshipRequests, {
		relationName: "mentorshipRequests_mentorId_users_id"
	}),
	messages_senderId: many(messages, {
		relationName: "messages_senderId_users_id"
	}),
	messages_receiverId: many(messages, {
		relationName: "messages_receiverId_users_id"
	}),
	notifications: many(notifications),
	postReplies: many(postReplies),
	profiles: many(profiles),
	projects: many(projects),
	projectLikes: many(projectLikes),
	reviews: many(reviews),
	verificationDocuments_userId: many(verificationDocuments, {
		relationName: "verificationDocuments_userId_users_id"
	}),
	verificationDocuments_reviewedBy: many(verificationDocuments, {
		relationName: "verificationDocuments_reviewedBy_users_id"
	}),
	wishlists: many(wishlists),
	groupBuyingCampaigns: many(groupBuyingCampaigns),
	orders_explorerId: many(orders, {
		relationName: "orders_explorerId_users_id"
	}),
	orders_providerId: many(orders, {
		relationName: "orders_providerId_users_id"
	}),
	machineCapabilities: many(machineCapabilities),
	transactions: many(transactions),
	quotes_userId: many(quotes, {
		relationName: "quotes_userId_users_id"
	}),
	quotes_providerId: many(quotes, {
		relationName: "quotes_providerId_users_id"
	}),
	affiliateStores: many(affiliateStores),
	services: many(services),
	bookings_userId: many(bookings, {
		relationName: "bookings_userId_users_id"
	}),
	bookings_providerId: many(bookings, {
		relationName: "bookings_providerId_users_id"
	}),
	carts: many(carts),
	components: many(components),
	communityPosts: many(communityPosts),
	pipelineExecutions: many(pipelineExecutions),
	projectCompletions: many(projectCompletions),
	componentComparisons: many(componentComparisons),
	forumThreads: many(forumThreads),
	forumReplies: many(forumReplies),
}));

export const mentorshipRequestsRelations = relations(mentorshipRequests, ({one}) => ({
	user_menteeId: one(users, {
		fields: [mentorshipRequests.menteeId],
		references: [users.id],
		relationName: "mentorshipRequests_menteeId_users_id"
	}),
	user_mentorId: one(users, {
		fields: [mentorshipRequests.mentorId],
		references: [users.id],
		relationName: "mentorshipRequests_mentorId_users_id"
	}),
}));

export const messagesRelations = relations(messages, ({one}) => ({
	user_senderId: one(users, {
		fields: [messages.senderId],
		references: [users.id],
		relationName: "messages_senderId_users_id"
	}),
	user_receiverId: one(users, {
		fields: [messages.receiverId],
		references: [users.id],
		relationName: "messages_receiverId_users_id"
	}),
}));

export const notificationsRelations = relations(notifications, ({one}) => ({
	user: one(users, {
		fields: [notifications.userId],
		references: [users.id]
	}),
}));

export const postRepliesRelations = relations(postReplies, ({one}) => ({
	communityPost: one(communityPosts, {
		fields: [postReplies.postId],
		references: [communityPosts.id]
	}),
	user: one(users, {
		fields: [postReplies.userId],
		references: [users.id]
	}),
}));

export const communityPostsRelations = relations(communityPosts, ({one, many}) => ({
	postReplies: many(postReplies),
	user: one(users, {
		fields: [communityPosts.authorId],
		references: [users.id]
	}),
}));

export const profilesRelations = relations(profiles, ({one}) => ({
	user: one(users, {
		fields: [profiles.userId],
		references: [users.id]
	}),
}));

export const projectsRelations = relations(projects, ({one, many}) => ({
	user: one(users, {
		fields: [projects.authorId],
		references: [users.id]
	}),
	projectBoms: many(projectBoms),
	projectLikes: many(projectLikes),
	buildPipelines: many(buildPipelines),
	projectAssets: many(projectAssets),
	projectCompletions: many(projectCompletions),
}));

export const projectBomsRelations = relations(projectBoms, ({one}) => ({
	project: one(projects, {
		fields: [projectBoms.projectId],
		references: [projects.id]
	}),
	component: one(components, {
		fields: [projectBoms.componentId],
		references: [components.id]
	}),
}));

export const componentsRelations = relations(components, ({one, many}) => ({
	projectBoms: many(projectBoms),
	wishlists: many(wishlists),
	cartItems: many(cartItems),
	orders: many(orders),
	user: one(users, {
		fields: [components.providerId],
		references: [users.id]
	}),
	componentSubcategory: one(componentSubcategories, {
		fields: [components.subcategoryId],
		references: [componentSubcategories.id]
	}),
	componentApplication: one(componentApplications, {
		fields: [components.applicationId],
		references: [componentApplications.id]
	}),
}));

export const projectLikesRelations = relations(projectLikes, ({one}) => ({
	project: one(projects, {
		fields: [projectLikes.projectId],
		references: [projects.id]
	}),
	user: one(users, {
		fields: [projectLikes.userId],
		references: [users.id]
	}),
}));

export const reviewsRelations = relations(reviews, ({one}) => ({
	user: one(users, {
		fields: [reviews.reviewerId],
		references: [users.id]
	}),
}));

export const verificationDocumentsRelations = relations(verificationDocuments, ({one}) => ({
	user_userId: one(users, {
		fields: [verificationDocuments.userId],
		references: [users.id],
		relationName: "verificationDocuments_userId_users_id"
	}),
	user_reviewedBy: one(users, {
		fields: [verificationDocuments.reviewedBy],
		references: [users.id],
		relationName: "verificationDocuments_reviewedBy_users_id"
	}),
}));

export const wishlistsRelations = relations(wishlists, ({one}) => ({
	user: one(users, {
		fields: [wishlists.userId],
		references: [users.id]
	}),
	component: one(components, {
		fields: [wishlists.componentId],
		references: [components.id]
	}),
	service: one(services, {
		fields: [wishlists.serviceId],
		references: [services.id]
	}),
}));

export const servicesRelations = relations(services, ({one, many}) => ({
	wishlists: many(wishlists),
	orders: many(orders),
	machineCapabilities: many(machineCapabilities),
	quotes: many(quotes),
	user: one(users, {
		fields: [services.providerId],
		references: [users.id]
	}),
	bookings: many(bookings),
}));

export const cartItemsRelations = relations(cartItems, ({one}) => ({
	cart: one(carts, {
		fields: [cartItems.cartId],
		references: [carts.id]
	}),
	component: one(components, {
		fields: [cartItems.componentId],
		references: [components.id]
	}),
	affiliateStore: one(affiliateStores, {
		fields: [cartItems.affiliateStoreId],
		references: [affiliateStores.id]
	}),
	groupBuyingCampaign: one(groupBuyingCampaigns, {
		fields: [cartItems.campaignId],
		references: [groupBuyingCampaigns.id]
	}),
}));

export const cartsRelations = relations(carts, ({one, many}) => ({
	cartItems: many(cartItems),
	user: one(users, {
		fields: [carts.userId],
		references: [users.id]
	}),
}));

export const affiliateStoresRelations = relations(affiliateStores, ({one, many}) => ({
	cartItems: many(cartItems),
	user: one(users, {
		fields: [affiliateStores.userId],
		references: [users.id]
	}),
}));

export const ordersRelations = relations(orders, ({one, many}) => ({
	user_explorerId: one(users, {
		fields: [orders.explorerId],
		references: [users.id],
		relationName: "orders_explorerId_users_id"
	}),
	user_providerId: one(users, {
		fields: [orders.providerId],
		references: [users.id],
		relationName: "orders_providerId_users_id"
	}),
	component: one(components, {
		fields: [orders.componentId],
		references: [components.id]
	}),
	service: one(services, {
		fields: [orders.serviceId],
		references: [services.id]
	}),
	quote: one(quotes, {
		fields: [orders.quoteId],
		references: [quotes.id]
	}),
	transactions: many(transactions),
	orderTrackings: many(orderTracking),
}));

export const quotesRelations = relations(quotes, ({one, many}) => ({
	orders: many(orders),
	transactions: many(transactions),
	service: one(services, {
		fields: [quotes.serviceId],
		references: [services.id]
	}),
	user_userId: one(users, {
		fields: [quotes.userId],
		references: [users.id],
		relationName: "quotes_userId_users_id"
	}),
	user_providerId: one(users, {
		fields: [quotes.providerId],
		references: [users.id],
		relationName: "quotes_providerId_users_id"
	}),
}));

export const machineCapabilitiesRelations = relations(machineCapabilities, ({one}) => ({
	user: one(users, {
		fields: [machineCapabilities.providerId],
		references: [users.id]
	}),
	service: one(services, {
		fields: [machineCapabilities.serviceId],
		references: [services.id]
	}),
}));

export const transactionsRelations = relations(transactions, ({one}) => ({
	user: one(users, {
		fields: [transactions.userId],
		references: [users.id]
	}),
	order: one(orders, {
		fields: [transactions.orderId],
		references: [orders.id]
	}),
	quote: one(quotes, {
		fields: [transactions.quoteId],
		references: [quotes.id]
	}),
}));

export const orderTrackingRelations = relations(orderTracking, ({one}) => ({
	order: one(orders, {
		fields: [orderTracking.orderId],
		references: [orders.id]
	}),
}));

export const bookingsRelations = relations(bookings, ({one}) => ({
	service: one(services, {
		fields: [bookings.serviceId],
		references: [services.id]
	}),
	user_userId: one(users, {
		fields: [bookings.userId],
		references: [users.id],
		relationName: "bookings_userId_users_id"
	}),
	user_providerId: one(users, {
		fields: [bookings.providerId],
		references: [users.id],
		relationName: "bookings_providerId_users_id"
	}),
}));

export const componentSubcategoriesRelations = relations(componentSubcategories, ({one, many}) => ({
	components: many(components),
	componentCategory: one(componentCategories, {
		fields: [componentSubcategories.categoryId],
		references: [componentCategories.id]
	}),
	componentApplications: many(componentApplications),
}));

export const componentApplicationsRelations = relations(componentApplications, ({one, many}) => ({
	components: many(components),
	componentSubcategory: one(componentSubcategories, {
		fields: [componentApplications.subcategoryId],
		references: [componentSubcategories.id]
	}),
}));

export const componentCategoriesRelations = relations(componentCategories, ({many}) => ({
	componentSubcategories: many(componentSubcategories),
}));

export const buildPipelinesRelations = relations(buildPipelines, ({one, many}) => ({
	project: one(projects, {
		fields: [buildPipelines.projectId],
		references: [projects.id]
	}),
	pipelineExecutions: many(pipelineExecutions),
}));

export const pipelineExecutionsRelations = relations(pipelineExecutions, ({one}) => ({
	buildPipeline: one(buildPipelines, {
		fields: [pipelineExecutions.pipelineId],
		references: [buildPipelines.id]
	}),
	projectAsset: one(projectAssets, {
		fields: [pipelineExecutions.assetId],
		references: [projectAssets.id]
	}),
	user: one(users, {
		fields: [pipelineExecutions.triggerUserId],
		references: [users.id]
	}),
}));

export const projectAssetsRelations = relations(projectAssets, ({one, many}) => ({
	pipelineExecutions: many(pipelineExecutions),
	project: one(projects, {
		fields: [projectAssets.projectId],
		references: [projects.id]
	}),
}));

export const projectCompletionsRelations = relations(projectCompletions, ({one}) => ({
	project: one(projects, {
		fields: [projectCompletions.projectId],
		references: [projects.id]
	}),
	user: one(users, {
		fields: [projectCompletions.userId],
		references: [users.id]
	}),
}));

export const componentComparisonsRelations = relations(componentComparisons, ({one}) => ({
	user: one(users, {
		fields: [componentComparisons.userId],
		references: [users.id]
	}),
}));

export const forumThreadsRelations = relations(forumThreads, ({one, many}) => ({
	user: one(users, {
		fields: [forumThreads.authorId],
		references: [users.id]
	}),
	forumCategory: one(forumCategories, {
		fields: [forumThreads.categoryId],
		references: [forumCategories.id]
	}),
	forumReplies: many(forumReplies),
}));

export const forumCategoriesRelations = relations(forumCategories, ({many}) => ({
	forumThreads: many(forumThreads),
}));

export const forumRepliesRelations = relations(forumReplies, ({one}) => ({
	forumThread: one(forumThreads, {
		fields: [forumReplies.threadId],
		references: [forumThreads.id]
	}),
	user: one(users, {
		fields: [forumReplies.authorId],
		references: [users.id]
	}),
}));
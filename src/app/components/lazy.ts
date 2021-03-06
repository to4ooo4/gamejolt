export async function ChatClientLazy() {
	return (await import(/* webpackChunkName: "chat" */ '../components/chat/client')).ChatClient;
}

export async function AppAuthJoinLazy() {
	return (await import(/* webpackChunkName: "authJoin" */ './../../lib/gj-lib-client/components/auth/join/join'))
		.AppAuthJoin;
}

export async function AppCommentWidgetLazy() {
	return (await import(/* webpackChunkName: "commentWidget" */ '../../lib/gj-lib-client/components/comment/widget/widget'))
		.AppCommentWidget;
}

export async function AppCommentWidgetAddLazy() {
	return (await import(/* webpackChunkName: "commentWidget" */ '../../lib/gj-lib-client/components/comment/widget/add/add'))
		.AppCommentWidgetAdd;
}

export async function AppActivityFeedLazy() {
	return (await import(/* webpackChunkName: "activityFeed" */ './activity/feed/feed'))
		.AppActivityFeed;
}

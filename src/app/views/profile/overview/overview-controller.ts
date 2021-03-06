import { App } from '../../../app-service';
import { Injectable, Inject } from 'ng-metadata/core';
import { CommentVideo } from '../../../../lib/gj-lib-client/components/comment/video/video-model';
import { YoutubeChannel } from '../../../../lib/gj-lib-client/components/youtube/channel/channel-model';
import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';

@Injectable()
export class OverviewCtrl {
	developerGames: any[];
	youtubeChannels: YoutubeChannel[];
	videos: CommentVideo[];

	constructor(
		@Inject('$scope') $scope: any,
		@Inject('App') app: App,
		@Inject('payload') payload: any
	) {
		let title = `${$scope.profileCtrl.user.display_name} (@${$scope.profileCtrl.user.username}) - `;

		if ($scope.profileCtrl.user.is_gamer) {
			title += 'An indie gamer';
		} else if ($scope.profileCtrl.user.is_developer) {
			title += 'An indie game developer';
		}

		app.title = title;

		Meta.description = payload.metaDescription;
		Meta.fb = payload.fb || {};
		Meta.fb.title = app.title;
		Meta.twitter = payload.twitter || {};
		Meta.twitter.title = app.title;

		this.developerGames = Game.populate(payload.developerGamesTeaser);
		this.youtubeChannels = YoutubeChannel.populate(payload.youtubeChannels);
		this.videos = CommentVideo.populate(payload.videos);
	}
}

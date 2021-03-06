import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./view.html';

import { FiresidePost } from '../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { AppTimeAgo } from '../../../../../lib/gj-lib-client/components/time/ago/ago';
import { AppWidgetCompiler } from '../../../../../lib/gj-lib-client/components/widget-compiler/widget-compiler';
import { AppResponsiveDimensions } from '../../../../../lib/gj-lib-client/components/responsive-dimensions/responsive-dimensions';
import { AppImgResponsive } from '../../../../../lib/gj-lib-client/components/img/responsive/responsive';
import { AppVideo } from '../../../../../lib/gj-lib-client/components/video/video';
import { AppVideoEmbed } from '../../../../../lib/gj-lib-client/components/video/embed/embed';
import { AppSketchfabEmbed } from '../../../../../lib/gj-lib-client/components/sketchfab/embed/embed';
import { AppActivityFeedDevlogPostControls } from '../../../activity/feed/devlog-post/controls/controls';

@View
@Component({
	components: {
		AppTimeAgo,
		AppWidgetCompiler,
		AppResponsiveDimensions,
		AppImgResponsive,
		AppVideo,
		AppVideoEmbed,
		AppSketchfabEmbed,
		AppActivityFeedDevlogPostControls,
	},
})
export class AppDevlogPostView extends Vue {
	@Prop(FiresidePost) post: FiresidePost;
	@Prop(Boolean) showGameInfo?: boolean;
	@Prop(Boolean) inModal?: boolean;
}

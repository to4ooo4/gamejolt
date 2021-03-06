import { Component } from 'vue-property-decorator';
import * as View from '!view!./retrieve-login.html';

import {
	BaseForm,
	FormOnSubmit,
} from '../../../../lib/gj-lib-client/components/form-vue/form.service';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { Connection } from '../../../../lib/gj-lib-client/components/connection/connection-service';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';

@View
@Component({
	components: {
		AppJolticon,
	},
})
export class FormRetrieveLogin extends BaseForm<any> implements FormOnSubmit {
	warnOnDiscard = false;

	Connection = makeObservableService(Connection);

	onChanged() {
		this.setState('invalidEmail', false);
	}

	async onSubmit() {
		const response = await Api.sendRequest('/web/auth/retrieve', this.formModel);

		if (response.success === false) {
			if (response.reason && response.reason === 'invalid-email') {
				this.setState('invalidEmail', true);
			}
		}

		return response;
	}
}

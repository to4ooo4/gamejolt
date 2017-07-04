import Vue from 'vue';
import VueRouter from 'vue-router';
import { Environment } from '../../../../lib/gj-lib-client/components/environment/environment.service';
import { Device } from '../../../../lib/gj-lib-client/components/device/device.service';
import { forEach } from '../../../../lib/gj-lib-client/utils/collection';
import { Scroll } from '../../../../lib/gj-lib-client/components/scroll/scroll.service';
import { objectEquals } from '../../../../lib/gj-lib-client/utils/object';
import { router } from '../../../bootstrap';
import { Translate } from '../../../../lib/gj-lib-client/components/translate/translate.service';

const STORAGE_KEY = 'game-filtering:filters';

interface GameFilteringContainerDefinition {
	label: string;
	type: 'radio' | 'array' | 'string';
	options?: { [k: string]: string };
}

type Params = { [k: string]: string };
type Filters = { [k: string]: any };

export class GameFilteringContainer {
	static readonly definitions: {
		[k: string]: GameFilteringContainerDefinition;
	} = {
		price: {
			label: Translate.$gettext('Price'),
			type: 'radio',
			options: {
				free: Translate.$gettext('Free / Name Your Price'),
				sale: Translate.$gettext('On Sale'),
				paid: Translate.$gettext('Paid'),
				'5-less': Translate.$gettext('$5 or less'),
				'15-less': Translate.$gettext('$15 or less'),
				'30-less': Translate.$gettext('$30 or less'),
			},
		},
		os: {
			label: Translate.$gettext('games.filtering.os'),
			type: 'array',
			options: {
				windows: Translate.$gettext('games.filtering.os_windows'),
				mac: Translate.$gettext('games.filtering.os_mac'),
				linux: Translate.$gettext('games.filtering.os_linux'),
				other: Translate.$gettext('games.filtering.os_other'),
				rom: Translate.$gettext('ROM'),
			},
		},
		browser: {
			label: Translate.$gettext('games.filtering.browser'),
			type: 'array',
			options: {
				html: Translate.$gettext('games.filtering.browser_html'),
				flash: Translate.$gettext('games.filtering.browser_flash'),
				unity: Translate.$gettext('games.filtering.browser_unity'),
				applet: Translate.$gettext('games.filtering.browser_applet'),
				silverlight: Translate.$gettext('games.filtering.browser_silverlight'),
			},
		},
		maturity: {
			label: Translate.$gettext('games.filtering.maturity'),
			type: 'array',
			options: {
				everyone: Translate.$gettext('games.filtering.maturity_everyone'),
				teen: Translate.$gettext('games.filtering.maturity_teen'),
				adult: Translate.$gettext('games.filtering.maturity_adult'),
			},
		},
		status: {
			label: Translate.$gettext('games.filtering.status'),
			type: 'array',
			options: {
				complete: Translate.$gettext('Complete/Stable'),
				wip: Translate.$gettext('Early Access'),
			},
		},
		partners: {
			label: Translate.$gettext('Partners'),
			type: 'array',
			options: {
				partners: Translate.$gettext('Show Partner Games'),
			},
		},
		query: {
			label: Translate.$gettext('Filter'),
			type: 'string',
		},
	};

	filters: Filters = {};

	/**
	 * Whether or not we should store these filters in the browser.
	 */
	isPersistent = false;

	/**
	 * This is whether or not the filters are empty that we need for tags. It
	 * doesn't include the query filter.
	 */
	get areTagFiltersEmpty() {
		return this.isEmpty(this.filters, { skipQuery: true });
	}

	constructor() {
		// Default all filters to empty values.
		forEach(GameFilteringContainer.definitions, (definition, key) => {
			if (definition.type === 'array') {
				this.filters[key] = [];
			} else if (definition.type === 'string') {
				this.filters[key] = '';
			} else if (definition.type === 'radio') {
				this.filters[key] = null;
			}
		});
	}

	init(route: VueRouter.Route, options: { shouldDetect?: boolean } = {}) {
		const params = route.query;

		/**
		 * We return false if we have changed the URL.
		 * This prevents any API calls from going out twice.
		 * We do resolve when we're just pulling the filters from the URL or if there
		 * are no filters to set.
		 */

		let paramFiltersFound = false;
		forEach(params, (value, param) => {
			if (GameFilteringContainer.definitions[param] && value) {
				paramFiltersFound = true;
			}
		});

		if (paramFiltersFound) {
			console.log('from url');

			// We don't save the filters if we pull from the URL.
			// We only save when they explicitly set/change them.
			// This ensures that they can view a shared URL with them without overwriting their filters.
			forEach(GameFilteringContainer.definitions, (definition, filter) => {
				if (params[filter]) {
					if (definition.type === 'array') {
						this.filters[filter] = params[filter].split(',');
					} else if (definition.type === 'string') {
						this.filters[filter] = params[filter];
					} else if (definition.type === 'radio') {
						this.filters[filter] = params[filter];
					}
				} else {
					if (definition.type === 'array') {
						this.filters[filter] = [];
					} else if (definition.type === 'string') {
						this.filters[filter] = '';
					} else if (definition.type === 'radio') {
						this.filters[filter] = null;
					}
				}
			});
		} else if (
			!GJ_IS_SSR &&
			options.shouldDetect &&
			this.isPersistent &&
			window.localStorage[STORAGE_KEY]
		) {
			// Only if this is a persistent filtering container.
			console.log('from storage');

			let filters = JSON.parse(window.localStorage[STORAGE_KEY]);
			if (filters && !this.isEmpty(filters)) {
				// Never resolve so we don't switch routes.
				const _filters = this.getRouteData(filters);
				return !this.updateUrl(route, _filters);
			}
		} else if (!GJ_IS_SSR && options.shouldDetect && !Environment.isPrerender) {
			console.log('from device');

			const os = Device.os();

			let filters: { [k: string]: object } | undefined;
			if (os === 'windows') {
				filters = { os: ['windows'] };
			} else if (os === 'mac') {
				filters = { os: ['mac'] };
			} else if (os === 'linux') {
				filters = { os: ['linux'] };
			}

			if (filters) {
				// Always add in all browser types if we auto-detected.
				// TODO: Would be nice to not have to manually add every single one in, but rather just a single filter for all browser types.
				if (!GJ_IS_CLIENT) {
					filters.browser = Object.keys(
						GameFilteringContainer.definitions.browser.options
					);
				} else {
					// On client we only do HTML for now.
					filters.browser = ['html'];
				}

				const _filters = this.getRouteData(filters);
				return !this.updateUrl(route, _filters);
			}
		}

		return true;
	}

	toggleFilterOption(filter: string, option: any) {
		if (
			!GameFilteringContainer.definitions[filter] ||
			GameFilteringContainer.definitions[filter].type === 'string'
		) {
			return;
		}

		// If a radio type, we want to unset any previously set ones.
		if (GameFilteringContainer.definitions[filter].type === 'radio') {
			if (this.filters[filter] === option) {
				this.unsetFilter(filter, option);
			} else {
				this.setFilter(filter, option);
			}
			return;
		}

		if (this.filters[filter].indexOf(option) !== -1) {
			this.unsetFilter(filter, option);
		} else {
			this.setFilter(filter, option);
		}
	}

	setFilter(filter: string, value: any) {
		if (!GameFilteringContainer.definitions[filter]) {
			return;
		}

		const definition = GameFilteringContainer.definitions[filter];

		if (definition.type === 'array') {
			this.filters[filter].push(value);
		} else if (definition.type === 'string' || definition.type === 'radio') {
			Vue.set(this.filters, filter, value);
		}

		this.saveFilters();
	}

	unsetFilter(filter: string, option?: any) {
		if (!GameFilteringContainer.definitions[filter]) {
			return;
		}

		const definition = GameFilteringContainer.definitions[filter];

		if (definition.type === 'array') {
			const index = this.filters[filter].findIndex(
				(item: any) => item === option
			);
			if (index !== -1) {
				this.filters[filter].splice(index, 1);
			}
		} else if (definition.type === 'string') {
			Vue.set(this.filters, filter, '');
		} else if (definition.type === 'radio') {
			Vue.set(this.filters, filter, null);
		}

		this.saveFilters();
	}

	isFilterOptionSet(filter: string, option: any) {
		if (
			!GameFilteringContainer.definitions[filter] ||
			GameFilteringContainer.definitions[filter].type === 'string'
		) {
			return null;
		}

		if (GameFilteringContainer.definitions[filter].type === 'radio') {
			return this.filters[filter] === option;
		}

		return this.filters[filter].indexOf(option) !== -1;
	}

	getQueryString(route: VueRouter.Route) {
		let queryPieces: string[] = [];

		if (route.params.section) {
			queryPieces.push('section=' + route.params.section);
		} else {
			queryPieces.push('section=hot');
		}

		if (route.query.sort) {
			queryPieces.push('sort=' + route.query.sort);
		}

		if (route.params.category) {
			queryPieces.push('category=' + route.params.category);
		}

		if (route.params.date) {
			queryPieces.push('date=' + route.params.date);
		}

		if (route.query.page && parseInt(route.query.page, 10) > 1) {
			queryPieces.push('page=' + route.query.page);
		}

		forEach(GameFilteringContainer.definitions, (definition, filter) => {
			if (!this.filters[filter]) {
				return;
			}

			const value = this.filters[filter];

			if (definition.type === 'array' && Array.isArray(value)) {
				if (!value.length) {
					return;
				}

				const filterParam = 'f_' + filter + '[]';
				value.forEach((option: string[]) => {
					queryPieces.push(filterParam + '=' + option);
				});
			} else if (definition.type === 'string' && typeof value === 'string') {
				if (!value || !value.trim()) {
					return;
				}

				queryPieces.push(filter + '=' + value);
			} else if (definition.type === 'radio') {
				if (!value) {
					return;
				}

				queryPieces.push('f_' + filter + '=' + value);
			}
		});

		return queryPieces.join('&');
	}

	getRouteData(filters: Filters = this.filters) {
		let params: Params = {};
		forEach(GameFilteringContainer.definitions, (definition, filter) => {
			if (!filters[filter]) {
				return;
			}

			const value = filters[filter];

			if (definition.type === 'array' && Array.isArray(value)) {
				if (!value.length) {
					return;
				}

				// Make comma delimited lists of values.
				// Sort so the URL is always the same.
				params[filter] = value.sort().join(',');
			} else if (definition.type === 'string' && typeof value === 'string') {
				if (!value.trim()) {
					return;
				}

				params[filter] = value;
			} else if (definition.type === 'radio') {
				if (!value) {
					return;
				}

				params[filter] = value;
			}
		});

		return params;
	}

	/**
	 * When the filters change in any widget.
	 * We want to refresh the page with the new filtering params.
	 */
	onChanged() {
		Scroll.shouldAutoScroll = false;

		console.log('pass');

		const query = this.getRouteData();
		this.updateUrl(router.currentRoute, query);

		// router.replace( {
		// 	name: router.currentRoute.name,
		// 	query,
		// } );
	}

	private saveFilters() {
		// Early out if this isn't a persisent filtering container.
		if (!this.isPersistent && !GJ_IS_SSR && !Environment.isPrerender) {
			return;
		}

		// We allow them to save/set blank filters as well.
		// This is so they can specifically say not to do our detected OS filters.
		window.localStorage[STORAGE_KEY] = JSON.stringify(this.filters);
	}

	private isEmpty(filters: Filters, options: any = {}) {
		let isEmpty = true;
		forEach(filters, (value, key) => {
			if (!GameFilteringContainer.definitions[key]) {
				return;
			}

			const definition = GameFilteringContainer.definitions[key];

			if (definition.type === 'array' && value.length) {
				isEmpty = false;
			} else if (definition.type === 'radio' && value) {
				isEmpty = false;
			} else if (
				!options.skipQuery &&
				definition.type === 'string' &&
				value.trim()
			) {
				isEmpty = false;
			}
		});

		return isEmpty;
	}

	/**
	 * Updates the URL only if filters are different than URL.
	 * Will return true if URL was changed and false otherwise.
	 */
	private updateUrl(route: VueRouter.Route, filters: Filters) {
		const query = Object.assign({}, filters);

		if (!objectEquals(query, route.query)) {
			router.replace({ name: route.name, params: route.params, query });
			return true;
		}

		console.log('should pass');

		return false;
	}
}
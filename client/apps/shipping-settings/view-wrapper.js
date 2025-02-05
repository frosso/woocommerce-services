/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
// from calypso
import Button from 'components/button';
import GlobalNotices from 'components/global-notices';
import LabelSettings from '../../extensions/woocommerce/woocommerce-services/views/label-settings';
import notices from 'notices';
import Packages from '../../extensions/woocommerce/woocommerce-services/views/packages';
import CarrierAccounts from '../../extensions/woocommerce/woocommerce-services/views/carrier-accounts';
import LiveRatesCarriersList from '../../extensions/woocommerce/woocommerce-services/views/live-rates-carriers-list';
import SubscriptionsUsage from '../../extensions/woocommerce/woocommerce-services/views/subscriptions-usage';
import UpsSettingsForm from '../../extensions/woocommerce/woocommerce-services/views/carrier-accounts/ups-settings-form';
import DynamicCarrierAccountSettings from '../../extensions/woocommerce/woocommerce-services/views/carrier-accounts/dynamic-settings';
import { ProtectFormGuard } from 'lib/protect-form';
import { successNotice, errorNotice } from 'state/notices/actions';
import { createWcsShippingSaveActionList } from '../../extensions/woocommerce/woocommerce-services/state/actions';
import {
	getLabelSettingsFormMeta,
	getSelectedPaymentMethodId,
} from 'woocommerce/woocommerce-services/state/label-settings/selectors';
import { getPackagesForm } from '../../extensions/woocommerce/woocommerce-services/state/packages/selectors';

class LabelSettingsWrapper extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			pristine: true,
		};
	}

	onChange = () => {
		this.setState( { pristine: false } );
	};

	onSaveSuccess = () => {
		const { translate, orderId, orderHref, paymentMethodSelected } = this.props;
		const options =
			orderHref && paymentMethodSelected
				? { button: translate( 'Return to Order #%(orderId)s', { args: { orderId } } ), href: orderHref }
				: { duration: 5000 };

		this.setState( { pristine: true } );
		return this.props.successNotice( translate( 'Your shipping settings have been saved.' ), options );
	};

	onSaveFailure = () => {
		const { translate } = this.props;
		return this.props.errorNotice( translate( 'Unable to save your shipping settings. Please try again.' ) );
	};

	onSaveChanges = () => {
		this.props.createWcsShippingSaveActionList( this.onSaveSuccess, this.onSaveFailure );
	};

	render() {
		const { carrier, carrierAccounts, liveRatesTypes, subscriptions, isSaving, translate } = this.props;

		if ( ! carrier ) {
			return (
				<div>
					<GlobalNotices id="notices" notices={ notices.list } />
					<LabelSettings onChange={ this.onChange } />
					<Packages onChange={ this.onChange } />
					<LiveRatesCarriersList carrierIds={ liveRatesTypes } />
					<CarrierAccounts accounts={ carrierAccounts } />
					<SubscriptionsUsage subscriptions={ subscriptions } />
					<Button primary onClick={ this.onSaveChanges } busy={ isSaving } disabled={ isSaving }>
						{ translate( 'Save changes' ) }
					</Button>
					<ProtectFormGuard isChanged={ ! this.state.pristine } />
				</div>
			);
		}

		if ( carrier === 'UpsAccount' ) {
			return (
				<div>
					<GlobalNotices id="notices" notices={ notices.list } />
					<UpsSettingsForm />
				</div>
			);
		}

		// Dynamically create registration form
		return (
			<div>
				<GlobalNotices id="notices" notices={ notices.list } />
				<DynamicCarrierAccountSettings carrier={ carrier } />
			</div>
		);
	}
}

export default connect(
	( state ) => {
		const labelsFormMeta = getLabelSettingsFormMeta( state );
		const packagesForm = getPackagesForm( state );

		return {
			isSaving: labelsFormMeta.isSaving || packagesForm.isSaving,
			paymentMethodSelected: Boolean( getSelectedPaymentMethodId( state ) ),
		};
	},
	( dispatch ) =>
		bindActionCreators(
			{
				createWcsShippingSaveActionList,
				errorNotice,
				successNotice,
			},
			dispatch
		)
)( localize( LabelSettingsWrapper ) );

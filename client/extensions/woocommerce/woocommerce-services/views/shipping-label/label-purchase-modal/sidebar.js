/** @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';
import { CheckboxControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { getPaperSizes } from 'woocommerce/woocommerce-services/lib/pdf-label-utils';
import Dropdown from 'woocommerce/woocommerce-services/components/dropdown';
import PriceSummary from './price-summary';
import ShippingSummary from './shipping-summary';
import PurchaseSection from './purchase-section';
import {
	setEmailDetailsOption,
	setFulfillOrderOption,
	updatePaperSize,
} from 'woocommerce/woocommerce-services/state/shipping-label/actions';
import {
	getShippingLabel,
	isLoaded,
	getFormErrors,
	shouldFulfillOrder,
	shouldEmailDetails,
} from 'woocommerce/woocommerce-services/state/shipping-label/selectors';
import { getOrderWithEdits, isCurrentlyEditingOrder } from 'woocommerce/state/ui/orders/selectors';
import { getOrder } from "woocommerce/state/sites/orders/selectors";
import { isOrderFinished } from 'woocommerce/lib/order-status';

const Sidebar = props => {
	const {
		orderId,
		siteId,
		form,
		errors,
		paperSize,
		translate,
		fulfillOrder,
		emailDetails,
		order,
	} = props;

	const onFulfillAndEmailOrderChange = (value) => {
		// Don't change order status if already finished.
		props.setFulfillOrderOption( orderId, siteId, value && ! isOrderFinished( order.status ) );
		// Email only if order is already complete.
		props.setEmailDetailsOption( orderId, siteId, value && isOrderFinished( order.status ) );
	};
	const onPaperSizeChange = value => props.updatePaperSize( orderId, siteId, value );

	return (
		<div className="label-purchase-modal__sidebar">
			<ShippingSummary siteId={ siteId } orderId={ orderId } />
			<PriceSummary siteId={ siteId } orderId={ orderId } />
			<hr />
			<div className="label-purchase-modal__purchase-container">
				<Dropdown
					id={ 'paper_size' }
					valuesMap={ getPaperSizes( form.origin.values.country ) }
					title={ translate( 'Paper size' ) }
					value={ paperSize }
					updateValue={ onPaperSizeChange }
					error={ errors.paperSize }
				/>
				<PurchaseSection siteId={ siteId } orderId={ orderId } />
			</div>
			<CheckboxControl
				className="label-purchase-modal__option-mark-order-fulfilled"
				label={ isOrderFinished( order.status ) ?
					translate( 'Notify the customer with shipment details' ) :
					translate( 'Mark this order as complete and notify the customer' )
				}
				checked={ fulfillOrder || emailDetails }
				onChange={ onFulfillAndEmailOrderChange }
			/>
		</div>
	);
};

Sidebar.propTypes = {
	siteId: PropTypes.number.isRequired,
	orderId: PropTypes.number.isRequired,
	paperSize: PropTypes.string.isRequired,
	errors: PropTypes.object.isRequired,
	form: PropTypes.object.isRequired,
	updatePaperSize: PropTypes.func.isRequired,
};

const mapStateToProps = ( state, { orderId, siteId } ) => {
	const loaded = isLoaded( state, orderId, siteId );
	const shippingLabel = getShippingLabel( state, orderId, siteId );
	const isEditing = isCurrentlyEditingOrder( state );
	const order = isEditing ? getOrderWithEdits( state ) : getOrder( state, orderId );
	return {
		order,
		paperSize: shippingLabel.paperSize,
		form: shippingLabel.form,
		errors: loaded && getFormErrors( state, orderId, siteId ).sidebar,
		fulfillOrder: loaded && shouldFulfillOrder( state, orderId, siteId ),
		emailDetails: loaded && shouldEmailDetails( state, orderId, siteId ),
	};
};

const mapDispatchToProps = dispatch => {
	return bindActionCreators(
		{
			setEmailDetailsOption,
			setFulfillOrderOption,
			updatePaperSize,
		},
		dispatch
	);
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( localize( Sidebar ) );

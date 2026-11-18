<?php
/**
 * Reptilia · Checkout: email and cell number first, cell required (STAGING FIRST, red lane).
 * Why: abandoned-checkout capture only works once the email is typed, and today email is the LAST field.
 * Pair with Cart Abandonment Recovery and MailPoet's checkout opt-in. WPCode: PHP snippet, Run Everywhere.
 * Note: the "Reptilia Checkout Shipping" plugin re-renders shipping choices in the order summary; test both together.
 */
add_filter( 'woocommerce_checkout_fields', function ( $fields ) {
	if ( isset( $fields['billing']['billing_email'] ) ) {
		$fields['billing']['billing_email']['priority'] = 4;
		$fields['billing']['billing_email']['label']    = 'Email (for your receipt and order updates)';
	}
	if ( isset( $fields['billing']['billing_phone'] ) ) {
		$fields['billing']['billing_phone']['priority'] = 6;
		$fields['billing']['billing_phone']['required'] = true;
		$fields['billing']['billing_phone']['label']    = 'Cell number (we WhatsApp you when it is ready)';
	}
	return $fields;
}, 20 );

add_filter( 'woocommerce_default_address_fields', function ( $f ) {
	if ( isset( $f['first_name'] ) ) {
		$f['first_name']['priority'] = 8;
	}
	if ( isset( $f['last_name'] ) ) {
		$f['last_name']['priority'] = 9;
	}
	return $f;
}, 20 );

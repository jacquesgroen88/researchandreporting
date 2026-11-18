<?php
/**
 * Reptilia · Live animals are collect-only at checkout (STAGING FIRST, red lane).
 * WPCode: PHP snippet, Run Everywhere. Deactivate the snippet to roll back.
 *
 * Why: the store offers "Flat rate R160" parcel courier for a live snake to Cape Town,
 * which the shipping policy does not allow. If the cart holds any product in the Live Animals tree,
 * only Local pickup is offered, with a note explaining Vaal delivery and pet couriers.
 */
if ( ! function_exists( 'jce_reptilia_livestock_term_ids' ) ) {
	function jce_reptilia_livestock_term_ids() {
		$roots = array( 17, 1146 ); // Live Animals & Livestock, legacy "Reptile Livestock"
		$ids   = $roots;
		foreach ( $roots as $root ) {
			$children = get_term_children( $root, 'product_cat' );
			if ( ! is_wp_error( $children ) ) {
				$ids = array_merge( $ids, $children );
			}
		}
		return array_map( 'intval', array_unique( $ids ) );
	}
}

if ( ! function_exists( 'jce_reptilia_cart_has_livestock' ) ) {
	function jce_reptilia_cart_has_livestock() {
		if ( ! function_exists( 'WC' ) || ! WC()->cart ) {
			return false;
		}
		$ids = jce_reptilia_livestock_term_ids();
		foreach ( WC()->cart->get_cart() as $item ) {
			if ( has_term( $ids, 'product_cat', $item['product_id'] ) ) {
				return true;
			}
		}
		return false;
	}
}

add_filter( 'woocommerce_package_rates', function ( $rates ) {
	if ( ! jce_reptilia_cart_has_livestock() ) {
		return $rates;
	}
	$pickup = array();
	foreach ( $rates as $key => $rate ) {
		if ( in_array( $rate->get_method_id(), array( 'local_pickup', 'pickup_location' ), true ) ) {
			$pickup[ $key ] = $rate;
		}
	}
	return $pickup ? $pickup : $rates; // fail open: never leave the customer with no method at all
}, 100 );

add_action( 'woocommerce_review_order_before_shipping', function () {
	if ( jce_reptilia_cart_has_livestock() ) {
		echo '<tr class="jce-livestock-note"><td colspan="2" style="font-size:13px;line-height:1.45;background:#f4f6f0;padding:10px">'
			. '<strong>Your order includes a live animal.</strong> Live animals are collected from the shop at 107 Piet Retief Blvd, Vanderbijlpark. '
			. 'We deliver in Vereeniging, Sasolburg and Vanderbijlpark by arrangement, and outside the Vaal you can send a specialist pet courier to collect. '
			. 'WhatsApp us after ordering and we will arrange it.</td></tr>';
	}
} );

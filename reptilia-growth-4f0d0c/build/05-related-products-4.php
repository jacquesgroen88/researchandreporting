<?php
/**
 * Reptilia · Show 4 related products, not 30 (STAGING FIRST).
 * Today an animal page is about 13,500px tall on a phone because of a 30-product related grid.
 * If the 10Web "Related products" widget ignores this filter, set its products-per-page to 4 in the product template instead.
 */
add_filter( 'woocommerce_output_related_products_args', function ( $args ) {
	$args['posts_per_page'] = 4;
	$args['columns']        = 2;
	return $args;
}, 20 );

<?php
/**
 * Reptilia · Product structured data (green lane). Google sees no Product markup on any product page today.
 * WPCode: PHP snippet, Run Everywhere. After activating, check 3 products in Google's Rich Results Test.
 * If WooCommerce's own Product JSON-LD ever starts printing (e.g. a template change), deactivate this to avoid duplicates.
 */
add_action( 'wp_footer', function () {
	if ( ! function_exists( 'is_product' ) || ! is_product() ) {
		return;
	}
	$product = wc_get_product( get_the_ID() );
	if ( ! $product || ! $product->is_visible() ) {
		return;
	}
	$avail = $product->is_in_stock() ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';
	$desc  = wp_strip_all_tags( $product->get_short_description() ? $product->get_short_description() : ( $product->get_description() ? $product->get_description() : $product->get_name() ) );
	$data  = array(
		'@context'    => 'https://schema.org/',
		'@type'       => 'Product',
		'name'        => $product->get_name(),
		'description' => mb_substr( $desc, 0, 500 ),
		'url'         => get_permalink( $product->get_id() ),
	);
	$img = wp_get_attachment_image_url( $product->get_image_id(), 'large' );
	if ( $img ) {
		$data['image'] = $img;
	}
	if ( $product->get_sku() ) {
		$data['sku'] = $product->get_sku();
	}
	$seller = array( '@type' => 'Organization', 'name' => 'Reptilia' );
	if ( $product->is_type( 'variable' ) ) {
		$low  = $product->get_variation_price( 'min', true );
		$high = $product->get_variation_price( 'max', true );
		if ( '' === $low || (float) $low <= 0 ) {
			return;
		}
		$data['offers'] = array(
			'@type'         => 'AggregateOffer',
			'priceCurrency' => 'ZAR',
			'lowPrice'      => wc_format_decimal( $low, 2 ),
			'highPrice'     => wc_format_decimal( $high, 2 ),
			'offerCount'    => count( $product->get_children() ),
			'availability'  => $avail,
			'seller'        => $seller,
		);
	} else {
		$price = wc_get_price_to_display( $product );
		if ( '' === $price || (float) $price <= 0 ) {
			return; // never publish R0 products
		}
		$data['offers'] = array(
			'@type'         => 'Offer',
			'priceCurrency' => 'ZAR',
			'price'         => wc_format_decimal( $price, 2 ),
			'availability'  => $avail,
			'url'           => get_permalink( $product->get_id() ),
			'itemCondition' => 'https://schema.org/NewCondition',
			'seller'        => $seller,
		);
	}
	echo "\n" . '<script type="application/ld+json" class="jce-product-schema">' . wp_json_encode( $data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) . '</script>' . "\n";
}, 20 );

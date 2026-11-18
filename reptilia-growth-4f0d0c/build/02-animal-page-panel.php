<?php
/**
 * Reptilia · Animal page panel: delivery facts, WhatsApp button, enquiry form.
 * Green lane (no cart or checkout code), but test on staging because the 10Web product template may not run Woo hooks.
 * WPCode: PHP snippet, Run Everywhere. Needs the CF7 form "Animal enquiry" (cf7-animal-enquiry-form.txt) and Flamingo active.
 * If the template skips woocommerce_single_product_summary, place the shortcode [reptilia_animal_panel] in the 10Web product template instead.
 * Set the two constants before activating.
 */
if ( ! defined( 'JCE_REPTILIA_WA_NUMBER' ) ) {
	define( 'JCE_REPTILIA_WA_NUMBER', '27XXXXXXXXX' ); // shop WhatsApp number, international format, no plus. WILLEM TO SUPPLY.
}
if ( ! defined( 'JCE_REPTILIA_ENQ_FORM' ) ) {
	define( 'JCE_REPTILIA_ENQ_FORM', 0 ); // Contact Form 7 form ID of "Animal enquiry". Set after creating the form.
}

if ( ! function_exists( 'jce_reptilia_is_animal' ) ) {
	function jce_reptilia_is_animal( $product_id ) {
		$ids = array( 17, 1146 );
		foreach ( array( 17, 1146 ) as $r ) {
			$c = get_term_children( $r, 'product_cat' );
			if ( ! is_wp_error( $c ) ) {
				$ids = array_merge( $ids, $c );
			}
		}
		return has_term( $ids, 'product_cat', $product_id );
	}
}

if ( ! function_exists( 'jce_reptilia_animal_panel' ) ) {
	function jce_reptilia_animal_panel() {
		if ( ! is_product() ) {
			return;
		}
		$product = wc_get_product( get_the_ID() );
		if ( ! $product || ! jce_reptilia_is_animal( $product->get_id() ) ) {
			return;
		}
		$name  = $product->get_name();
		$price = 'R' . number_format( (float) $product->get_price(), 0, '.', ',' );
		$msg   = $product->is_in_stock()
			? sprintf( "Hi Reptilia, I'm interested in the %s (%s) on your website. Is it still available?", $name, $price )
			: sprintf( 'Hi Reptilia, I saw the %s is sold out. When are you expecting more?', $name );
		$wa = 'https://wa.me/' . JCE_REPTILIA_WA_NUMBER . '?text=' . rawurlencode( $msg );
		echo '<div class="jce-animal-panel" style="margin:18px 0;font-size:15px;line-height:1.5">';
		echo '<a href="' . esc_url( $wa ) . '" target="_blank" rel="noopener" style="display:block;text-align:center;border:2px solid #1E6B23;color:#1E6B23;border-radius:10px;padding:11px;font-weight:700;text-decoration:none;margin-bottom:12px">Ask about this animal on WhatsApp</a>';
		echo '<div style="background:#f4f6f0;border-radius:12px;padding:14px 16px;margin-bottom:12px"><strong style="color:#14200E">How you get it home</strong><ul style="margin:6px 0 0;padding-left:18px">'
			. '<li><strong>Collect free</strong> at 107 Piet Retief Blvd, Vanderbijlpark. Mon–Fri 8:00–17:30, Sat 8:00–14:00, Sun 8:30–13:00.</li>'
			. '<li><strong>We deliver</strong> in Vereeniging, Sasolburg and Vanderbijlpark by arrangement.</li>'
			. "<li><strong>Further away?</strong> Live animals can't go by parcel courier. Ask us and we'll help you arrange a specialist pet courier.</li>"
			. '</ul></div>';
		if ( JCE_REPTILIA_ENQ_FORM ) {
			echo '<div style="border:1px solid #e3e1d9;border-radius:12px;padding:14px 16px"><strong style="color:#14200E">Got a question first?</strong>';
			echo do_shortcode( '[contact-form-7 id="' . (int) JCE_REPTILIA_ENQ_FORM . '" animal-name="' . esc_attr( $name ) . '"]' );
			echo '</div>';
		}
		echo '</div>';
	}
}

add_action( 'woocommerce_single_product_summary', 'jce_reptilia_animal_panel', 35 );
add_shortcode( 'reptilia_animal_panel', function () {
	ob_start();
	jce_reptilia_animal_panel();
	return ob_get_clean();
} );

// Lets the CF7 form read the animal name passed in the shortcode (form tag: [hidden animal-name default:shortcode_attr]).
add_filter( 'shortcode_atts_wpcf7', function ( $out, $pairs, $atts ) {
	if ( isset( $atts['animal-name'] ) ) {
		$out['animal-name'] = $atts['animal-name'];
	}
	return $out;
}, 10, 3 );

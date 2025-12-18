<?php
/**
 * Plugin Name: AI Curator
 * Plugin URI: https://github.com/Snook/ai-curator
 * Description: Adds a sidebar to fetch URL content and parse it via AI Services, and insert it into the editor.
 * Version: 1.0.0
 * Requires at least: 6.0
 * Requires PHP: 7.2
 * Author: Ryan Snook
 * Author URI: https://github.com/snook
 * License: GPLv2 or later
 * License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * Requires Plugins: ai-services
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action(
	'enqueue_block_editor_assets',
	static function () {
		if ( ! function_exists( 'ai_services' ) ) {
			return;
		}

		wp_enqueue_script(
			'ai-curator',
			plugin_dir_url( __FILE__ ) . 'index.js',
			array(
				'wp-commands',
				'wp-components',
				'wp-data',
				'wp-element',
				'wp-block-editor',
				'wp-editor',
				'ais-ai',
				'wp-blocks',
				'wp-plugins',
				'wp-i18n',
			),
			'1.0.0',
			array( 'strategy' => 'defer' )
		);
	}
);
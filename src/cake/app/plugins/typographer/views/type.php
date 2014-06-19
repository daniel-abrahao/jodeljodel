<?php

/**
 *
 * Copyright 2010-2013, Preface Design LTDA (http://www.preface.com.br)
 *
 * Licensed under The MIT License
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright 2010-2013, Preface Design LTDA (http://www.preface.com.br)
 * @license       MIT License (http://www.opensource.org/licenses/mit-license.php)
 * @link          https://github.com/prefacedesign/jodeljodel Jodel Jodel public repository
 */

/**
 * Class TypeView
 *
 * Deals with the asterisk in the helpers name and also with aliasing helpers
 * when the parameters has the property 'name'.
 *
 * In addition, this View class adds the plugin 'backstage' to the list of paths
 * where the CakePHP core will look for layout files.
 *
 * And, finally, it deals with the $type variable on recursive calls of elements.
 */
class TypeView extends View {

	/**
	 * Overwrites the default loading process to deal with asterisks
	 *
	 * @param array  $loaded
	 * @param array  $helpers
	 * @param string $parent
	 *
	 * @return array
	 */
	function &_loadHelpers (&$loaded, $helpers, $parent = null) {
		$layout_scheme = $this->getVar('layout_scheme');
		if (empty($layout_scheme)) {
			trigger_error('TypeView::_loadHelpers() - `layout_scheme` was not send to view by controller.');

			return parent::_loadHelpers($loaded, $helpers, $parent);
		}

		$c_layout_scheme = Inflector::camelize($layout_scheme);

		$new_helpers_list = array();
		foreach ($helpers as $helper => $params) {
			if (is_string($helper) && strpos($helper, '*') !== false) {
				$helperName = str_replace('*', $c_layout_scheme, $helper);
				$new_helpers_list[$helperName] = $params;
			}
			else {
				$new_helpers_list[$helper] = $params;
			}
		}
		$helpers = $new_helpers_list;

		$loaded_helpers =& parent::_loadHelpers($loaded, $helpers, $parent);

		// identify those whom have alias and sets the name on the view object
		foreach ($helpers as $helper_name => $helper) {
			if (isset($helper['name'])) {
				if (strpos($helper_name, '.') !== false) {
					list($plugin, $helper_name) = explode('.', $helper_name);
				}
				if (isset($loaded_helpers[$helper_name])) {
					$loaded_helpers[$helper['name']] =& $loaded_helpers[$helper_name];
					if (isset($loaded[$parent])) {
						$loaded[$parent]->{$helper['name']} =& $loaded_helpers[$helper_name];
					}
				}
			}
		}

		return $loaded_helpers;
	}

	/**
	 * Overwrites the View::element() function so we can deal with the $type parameter
	 *
	 * @access public
	 *
	 * @param string $name
	 * @param array  $params
	 * @param bool   $loadHelpers
	 *
	 * @return string The result of View::element()
	 */
	function element ($name, $params = array(), $loadHelpers = false) {
		$typeBkp = $this->getVar('type');;
		if (isset($params['type'])) {
			$this->viewVars['type'] = $params['type'];
		}

		$out = parent::element($name, $params, $loadHelpers);

		$this->viewVars['type'] = $typeBkp;

		return $out;
	}

	/**
	 * This method overwrites the View::_paths() method so it can include the dashboard plugin path as candidate
	 *
	 * @access public
	 *
	 * @param string $plugin
	 * @param bool   $cached
	 *
	 * @return array Array of possible paths from View::_paths() merged with dashboard plugin path
	 */
	function _paths ($plugin = null, $cached = true) {
		$paths = parent::_paths($plugin, $cached);
		array_push($paths, App::pluginPath('backstage') . 'views' . DS);

		return $paths;
	}
}

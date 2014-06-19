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
 * Class TypeLayoutSchemePickerComponent
 */
class TypeLayoutSchemePickerComponent extends Object {
	/**
	 * Holds a reference to the current controller
	 * @var AppController
	 */
	protected $Controller;

	/**
	 * Receives the controller reference and stores it on a class property
	 *
	 * @param AppController $Controller
	 */
	function initialize (&$Controller) {
		$this->Controller =& $Controller;
	}

	/* Por esta função se escolhe o modelo de layout que o controller quer
	   usar para renderizar uma certa view, e também a partir da variável
	   do controller $helpers_estilista, nós sabemos quais os helpers se
	   quer carregar e qual nome se quer dar para eles quando chegarem na view, 
	   o asterisco representa o nome do modelo. 
	  
	   $helpers_estilista = array('Estilista.Pintor' => 'pintor', 'Estilista.*Pedreiro' => 'h','Estilista.*Fabriquinha' => 'fabriquinha')
	   
	   $produzir_classes_automaticas = true; //se isto está setado e é true, as classes automáticas não serão registradas e serão
											 //passadas para a view como uma variável ambiental, se não estiver, as classes automáticas
											 //serão registradas (pela própria Fabriquinha no callback) como já utilizadas.
	*/

	/**
	 * This function
	 * @param string $layout_scheme
	 */
	function pick ($layout_scheme) {
		App::import('Config', 'Typographer.' . $layout_scheme . '_config');
		$c_layout_scheme = Inflector::camelize($layout_scheme);

		//carrega os instrumentos e as configurações deste layout específico/
		$tools                  = Configure::read('Typographer.' . $c_layout_scheme . '.tools');
		$used_automatic_classes = Configure::read('Typographer.' . $c_layout_scheme . '.used_automatic_classes');

		foreach ($this->Controller->helpers as &$params) {
			if (is_array($params)) {
				if (isset($params['receive_tools'])) {
					$params['tools'] = &$tools;
					unset($params['receive_tools']);
				}

				if (isset($params['receive_automatic_classes'])) {
					$params['used_automatic_classes'] = &$used_automatic_classes;
					unset($params['used_automatic_classes']);
				}
			}
		}

		if (!isset($this->Controller->view) || $this->Controller->view == 'View') {
			$this->Controller->view = 'Typographer.Type';
		}

		$this->Controller->set('used_automatic_classes', $used_automatic_classes);
		$this->Controller->set($tools);
		$this->Controller->set('layout_scheme', $layout_scheme);
	}
}
<?php

class BurocrataUserAppController extends AppController
{
	var $components = array('Typographer.TypeLayoutSchemePicker');
	var $helpers = array(
		'Typographer.TypeDecorator' => array(
			'name' => 'decorator',
			'compact' => false,
			'receive_tools' => true
		),
		'Typographer.*TypeStyleFactory' => array(
			'name' => 'styleFactory', 
			'receive_automatic_classes' => true, 
			'receive_tools' => true,
			'generate_automatic_classes' => false //significa que eu que vou produzir as classes automaticas
		),
		'Typographer.*TypeBricklayer' => array(
			'name' => 'Bl',
			'receive_tools' => true,
		),
		'Burocrata.*BuroBurocrata' => array(
			'name' => 'Buro'
		)
	);
	
	function beforeFilter()
	{
		parent::beforeFilter();
		$this->Auth->allow('*');
	}
	
	function beforeRender()
	{
		$this->TypeLayoutSchemePicker->pick('dinafon'); //aten��o que isto sobre-escreve a view escolhida
	}
}

?>
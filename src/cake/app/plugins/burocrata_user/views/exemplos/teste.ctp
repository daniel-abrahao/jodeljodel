<?php
	// $popups = array('success', 'error', 'notice', 'form');
	
	// $content = array_flip($popups);
	
	// foreach ($popups as $popup_type)
	// {
		// echo $this->Popup->popup($popup_type, array(
			// 'type' => $popup_type,
			// 'content' => $content[$popup_type],
			// 'title' => 'Titulo do '.$popup_type
		// ));
		// echo $this->Bl->a(array('href' => '', 'onclick' => "showPopup('$popup_type'); return false;"), array(), $popup_type);
		// echo $this->Bl->br();
		// echo $this->Bl->br();
	// }

	
	// echo $this->Buro->insertForm('BurocrataUser.Galery', 'teste');	

	echo $this->Buro->sform(array('class' => 'azul'), // Parâmetros HTML
		array(
			'model' => 'BurocrataUser.Galery', // Somente o Model pai, assim como no FormHelper::create
			'callbacks' => array(
				'onStart'	=> array('lockForm'),
				'onComplete'=> array('unlockForm'),
				'onSuccess' => array('contentUpdate' => 'replace'),
				'onSave'    => array('popup' => 'Salvou a gabaça'),
				'onError'   => array('js' => "if(code == E_NOT_JSON) alert('Não é json! Não é json!'); else alert(error);"),
				'onFailure'	=> array('popup' => 'Erro de comunicação com o servidor!')
			)
		)
	);
		
		echo $this->Buro->input(array(),
			array(
				'label' => 'Galery id',
				'fieldName' => 'Galery.id',
				'type' => 'hidden'
			)
		);
		
		echo $this->Buro->input(array(),
			array(
				'label' => 'Galery title',
				'fieldName' => 'Galery.title'
			)
		);
		
		
		/*
		echo $this->Buro->input(array(), 
			array(
				'type' => 'relational',
				'label' => 'Owner',
				'options' => array(
					'type' => 'unitary_autocomplete', // Former belongsTo, that now is also hasOne
					'model' => 'BurocrataUser.Person'
				)
			)
		);
		*/
		
		echo $this->Buro->input(array(), 
			array(
				'type' => 'relational',
				'label' => 'Owner',
				'instructions' => 'Selecione um apenas',
				'fieldName' => 'Person',
				'options' => array(
					'type' => 'list', // Former belongsTo, that now is also hasOne
					'multiple' => false,
					'model' => 'Person',
				)
			)
		);
		
		echo $this->Buro->input(array(), 
			array(
				'type' => 'relational',
				'label' => 'Owner',
				'instructions' => 'Selecione um apenas',
				'fieldName' => 'Person',
				'options' => array(
					'type' => 'combo', // Former belongsTo, that now is also hasOne
					'model' => 'Person',
					'filter_options' => array('Person.id' => 1)
				)
			)
		);
		
		
		echo $this->Buro->input(array(), 
			array(
				'type' => 'relational',
				'label' => 'Owner',
				'instructions' => 'Selecione um',
				'fieldName' => 'person_id',
				'options' => array(
					'type' => 'radio', // Former belongsTo, that now is also hasOne
					'model' => 'BurocrataUser.Person',
				)
			)
		);		
		
		echo $this->Buro->input(array(),
			array(
				'label' => 'Something about this galery',
				'fieldName' => 'Galery.about',
				'type' => 'textile',
				'options' => array(
					'enabled_buttons' => array('bold', 'italic')
				)
			)
		);
		
		
		echo $this->Buro->submit();
	
	echo $this->Buro->eform();

	
/* 	
	Exemple of a textile input
	
	echo $this->Buro->input(array('id' => 'meu_textile'),
		array(
			'type' => 'textile',
			'label' => 'Um input de textile',
			'fieldName' => 'about'
		)
	);
	 */

/* 
	Two examples of upload input
	
	echo $this->Buro->input(array(), 
		array(
			'type' => 'image',
			'label' => 'Faça seu upload de imagem',
			'error' => array(
				'size' => 'Arquivo muito grande!',
				'pixels' => 'Foto muito grande!',
				'mimeType' => 'Aceitamos somente imagens, ok?'
			),
			'options' => array(
				'fieldName' => 'img_id',
				'version' => 'backstage_preview',
				'callbacks' => array(
					'onStart' => array('popup' => 'Começando o upload...')
				),
				'change_file_text' => 'Mudar esse arquivo'
			)
		)
	);

	echo $this->Buro->input(array(), 
		array(
			'type' => 'upload',
			'label' => 'Arquivo',
			'options' => array(
				'fieldName' => 'file_id',
				'callbacks' => array(
					'onStart' => array('popup' => 'Começando o upload...')
				),
				'change_file_text' => 'Mudar esse arquivo'
			)
		)
	);
 */


/* 
	An autocomplete input
	
	echo $this->Buro->input(array(),
		array(
			'type' => 'autocomplete',
			'label' => 'User',
			'options' => array(
				'model' => 'BurocrataUser.User',
				'fieldName' => 'User.name',
				'callbacks' => array(
					'onSelect' => array('js' => "input.value = ''; alert(pair.value);"),
					'onSuccess' => array('popup' => 'Ahá!')
				)
			)
		)
	);

 */




/* 
	An auto-form that prints all that is needed.
	
	echo $this->Buro->form(
		array(),
		array(
			'model' => 'BurocrataUser.Local',
			'writeForm' => true,
			'callbacks' => array(
				'onStart' => array('lockForm'),
				'onComplete' => array('unlockForm'),
				'onSave'     => array('popup' => 'Salvou!'),
				'onRejected' => array('popup' => 'Não salvou!'),
				'onFailure'	 => array('popup' => 'Não foi possível conectar-se ao servidor!')
			)
		)
	);
*/
	
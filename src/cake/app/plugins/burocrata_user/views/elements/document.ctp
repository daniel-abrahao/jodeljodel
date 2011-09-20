<?php
switch ($type[0])
{
	case 'buro':
		switch ($type[1])
		{
			case 'form':
				echo $this->Buro->sform(array('class' => 'azul'), // Par�metros HTML
					array(
						'model' => 'BurocrataUser.Document', // Somente o Model pai, assim como no FormHelper::create
						'callbacks' => array(
							'onStart'	=> array('lockForm', 'js' => 'form.setLoading()'),
							'onComplete'=> array('unlockForm', 'js' => 'form.unsetLoading()'),
							'onSave'    => array('popup' => 'Salvou a gaba�a'),
							'onError'   => array('js' => "if(code == E_NOT_JSON) alert('N�o � json! N�o � json!'); else if(code == E_JSON) alert(error); else if(code == E_NOT_AUTH) alert('Voc� n�o tem autoriza��o para isso.');"),
							'onFailure'	=> array('popup' => 'Erro de comunica��o com o servidor!'),
						)
					)
				);
					echo $this->Buro->input(
						array(),
						array('type' => 'hidden', 'fieldName' => 'id')
					);
					
					echo $this->Buro->input(
						array(),
						array(
							'type' => 'text',
							'fieldName' => 'name',
							'label' => __d('buro_user', 'Document title', true)
						)
					);
					
					echo $this->Buro->input(
						array(),
						array(
							'type' => 'content_stream',
							'instructions' => __d('buro_user', 'Instructions for content_stream', true),
							'label' => __d('buro_user', 'Document body (content stream)', true),
							'options' => array(
								'foreignKey' => 'content_stream_id'
							)
						)
					);
					
					echo $this->Buro->submit();
				
				echo $this->Buro->eform();

			break;
		}
	break;
}
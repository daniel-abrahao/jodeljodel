<?php
/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

class AguaPessoaBehavior extends ModelBehavior {

    function afterFind(&$Model,$results, $primary)
    {
        //TODO: verificar se precisa colocar if $primary
        foreach ($results as $key => $val)
        {
            $results[$key]['AguaProfessor']['nome'] = $results[$key]['AguaProfessor']['nome'] . " Pessoa";
        }
        return $results;
    }

    function afterFindCascata(&$Model, $results)
    {
        //TODO: verificar se precisa de mais parametros no afterFindCascata
        foreach ($results as $key => $val)
        {
            $results[$key]['AguaProfessor']['nome'] = $results[$key]['AguaProfessor']['nome'] . " Pessoa";
        }
        return $results;
    }

}

?>
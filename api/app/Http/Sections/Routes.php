<?php

namespace App\Http\Sections;

use AdminColumn;
use AdminColumnFilter;
use AdminDisplay;
use AdminForm;
use AdminFormElement;
use Illuminate\Database\Eloquent\Model;
use SleepingOwl\Admin\Contracts\Display\DisplayInterface;
use SleepingOwl\Admin\Contracts\Form\FormInterface;
use SleepingOwl\Admin\Contracts\Initializable;
use SleepingOwl\Admin\Form\Buttons\Cancel;
use SleepingOwl\Admin\Form\Buttons\Save;
use SleepingOwl\Admin\Form\Buttons\SaveAndClose;
use SleepingOwl\Admin\Form\Buttons\SaveAndCreate;
use SleepingOwl\Admin\Section;

/**
 * Class Routes
 *
 * @property \App\Models\Routes $model
 *
 * @see https://sleepingowladmin.ru/#/ru/model_configuration_section
 */
class Routes extends Section implements Initializable
{
    /**
     * @var bool
     */
    protected $checkAccess = false;

    /**
     * @var string
     */
    protected $title;

    /**
     * @var string
     */
    protected $alias;

    /**
     * Initialize class.
     */
    public function initialize()
    {
        $this->addToNavigation()->setPriority(100)->setIcon('fa fa-lightbulb-o');
    }

    /**
     * @param array $payload
     *
     * @return DisplayInterface
     */
    public function onDisplay($payload = [])
    {
        $columns = [
            AdminColumn::text('id', '#')->setWidth('50px')->setHtmlAttribute('class', 'text-center'),
            AdminColumn::link('name', 'Название маршрута', 'created_at')
                ->setSearchCallback(function ($column, $query, $search) {
                    return $query
                        ->orWhere('name', 'like', '%' . $search . '%')
                        ->orWhere('created_at', 'like', '%' . $search . '%');
                })
                ->setOrderable(function ($query, $direction) {
                    $query->orderBy('created_at', $direction);
                })
            ,
//            AdminColumn::text('data', 'json'),
            AdminColumn::custom('кол-во точек', function (\App\Models\Routes $routes) {
                $d = json_decode($routes->data, true);
                if (isset($d['points'])) {
                    $html = "";
                    foreach ($d['points'] as $row) {
//                        "latitude": 0.11, "longitude"
//                        $html .= $row['coords']['latitude'] . "," . $row['coords']['longitude'];
                        $html.=json_encode($row)."<br>";
                    }
//                    return json_encode($d['points']);
                    return $html;
                }

                return 0;

            }),
            AdminColumn::text('created_at', 'Created / updated', 'updated_at')
                ->setWidth('160px')
                ->setOrderable(function ($query, $direction) {
                    $query->orderBy('updated_at', $direction);
                })
                ->setSearchable(false)
            ,
        ];

        $display = AdminDisplay::datatables()
            ->setName('firstdatatables')
            ->setOrder([[0, 'asc']])
            ->setDisplaySearch(true)
            ->paginate(25)
            ->setColumns($columns)
            ->setHtmlAttribute('class', 'table-primary table-hover th-center');

        $display->setColumnFilters([
            AdminColumnFilter::select()
                ->setModelForOptions(\App\Models\Routes::class, 'name')
                ->setLoadOptionsQueryPreparer(function ($element, $query) {
                    return $query;
                })
                ->setDisplay('name')
                ->setColumnName('name')
                ->setPlaceholder('All names')
            ,
        ]);
        $display->getColumnFilters()->setPlacement('card.heading');

        return $display;
    }

    /**
     * @param int|null $id
     * @param array $payload
     *
     * @return FormInterface
     */
    public function onEdit($id = null, $payload = [])
    {
        $form = AdminForm::card()->addBody([
            AdminFormElement::columns()->addColumn([
                AdminFormElement::text('name', 'Name')
                    ->required()
                ,
                AdminFormElement::text('id', 'ID')->setReadonly(true),
                AdminFormElement::html('<hr>'),
                AdminFormElement::textarea('data', 'json')
            ], 'col-xs-12 col-sm-12 col-md-12 col-lg-12'),
        ]);

        $form->getButtons()->setButtons([
            'save' => new Save(),
            'save_and_close' => new SaveAndClose(),
            'save_and_create' => new SaveAndCreate(),
            'cancel' => (new Cancel()),
        ]);

        return $form;
    }

    /**
     * @return FormInterface
     */
    public function onCreate($payload = [])
    {
        return $this->onEdit(null, $payload);
    }

    /**
     * @return bool
     */
    public function isDeletable(Model $model)
    {
        return true;
    }

    /**
     * @return void
     */
    public function onRestore($id)
    {
        // remove if unused
    }
}

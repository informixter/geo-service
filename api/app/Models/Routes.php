<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * App\Models\Routes
 *
 * @property int $id
 * @property string|null $name
 * @property mixed $data
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|Routes newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Routes newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Routes query()
 * @method static \Illuminate\Database\Eloquent\Builder|Routes whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Routes whereData($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Routes whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Routes whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Routes whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class Routes extends Model
{
    use HasFactory;
}

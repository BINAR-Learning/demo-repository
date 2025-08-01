<?php

namespace App\Filament\Resources;

use App\Filament\Resources\JobPositionResource\Pages;
use App\Filament\Resources\JobPositionResource\RelationManagers;
use App\Models\JobPosition;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use pxlrbt\FilamentExcel\Actions\Tables\ExportBulkAction;
use pxlrbt\FilamentExcel\Exports\ExcelExport;

class JobPositionResource extends Resource
{
    protected static ?string $model = JobPosition::class;

    protected static ?string $navigationIcon = 'heroicon-o-briefcase';
    
    protected static ?string $navigationGroup = 'Organization';

    protected static ?int $navigationSort = 3;

    public static function getNavigationLabel(): string
    {
        return 'Job Position';
    }

    public static function shouldRegisterNavigation(): bool
    {
        return auth()->user()->can('view_any_job::position');
    }

    // public static function getNavigationBadge(): ?string
    // {
    //     return static::getModel()::count();
    // }

    public static function getNavigationBadgeColor(): string|array|null
    {
        return 'success';
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('working_unit_id')
                    ->relationship('workingUnit', 'name')
                    ->required()
                    ->searchable()
                    ->preload(),
                Forms\Components\TextInput::make('name')
                    ->required()
                    ->maxLength(255),
                Forms\Components\TextInput::make('code')
                    ->required()
                    ->maxLength(255)
                    ->unique(ignoreRecord: true),
                Forms\Components\Textarea::make('description')
                    ->maxLength(65535)
                    ->columnSpanFull(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable(),
                Tables\Columns\TextColumn::make('code')
                    ->searchable(),
                Tables\Columns\TextColumn::make('workingUnit.name')
                    ->label('Working Unit')
                    ->sortable(),
                Tables\Columns\TextColumn::make('workingUnit.company.name')
                    ->label('Company')
                    ->sortable(),
                Tables\Columns\TextColumn::make('users_count')
                    ->label('Users')
                    ->counts('users')
                    ->badge()
                    ->color('success'),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('company')
                    ->relationship('workingUnit.company', 'name')
                    ->searchable()
                    ->preload(),
                Tables\Filters\SelectFilter::make('working_unit')
                    ->relationship('workingUnit', 'name')
                    ->searchable()
                    ->preload(),
            ])
            ->groups([
                Tables\Grouping\Group::make('workingUnit.name')
                    ->label('Working Unit')
                    ->collapsible(),
            ])
            ->actions([
                Tables\Actions\EditAction::make()
                    ->visible(fn () => auth()->user()->can('update_job::position')),
                Tables\Actions\DeleteAction::make()
                    ->visible(fn () => auth()->user()->can('delete_job::position')),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make()
                        ->visible(fn () => auth()->user()->can('delete_any_job::position')),
                    ExportBulkAction::make()
                        ->visible(fn () => auth()->user()->can('view_any_job::position'))
                        ->exports([
                            ExcelExport::make()
                                ->fromTable()
                                ->withFilename(fn () => 'job-positions-' . date('Y-m-d') . '-export')
                                ->withWriterType(\Maatwebsite\Excel\Excel::XLSX),
                        ]),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListJobPositions::route('/'),
            'create' => Pages\CreateJobPosition::route('/create'),
            'edit' => Pages\EditJobPosition::route('/{record}/edit'),
        ];
    }
}

<?php

namespace App\Filament\Resources;

use App\Filament\Resources\SettingResource\Pages;
use App\Filament\Resources\SettingResource\RelationManagers;
use App\Models\Setting;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use pxlrbt\FilamentExcel\Actions\Tables\ExportBulkAction;
use pxlrbt\FilamentExcel\Exports\ExcelExport;

class SettingResource extends Resource
{
    protected static ?string $model = Setting::class;

    protected static ?string $navigationIcon = 'heroicon-o-cog-6-tooth';

    protected static ?string $navigationLabel = 'Site Settings';

    protected static ?string $modelLabel = 'Site Setting';

    protected static ?string $pluralModelLabel = 'Site Settings';

    protected static ?int $navigationSort = 100;

    public static function shouldRegisterNavigation(): bool
    {
        return auth()->user()->can('view_any_setting');
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('General Settings')
                    ->schema([
                        Forms\Components\TextInput::make('site_name')
                            ->required()
                            ->columnSpanFull()
                            ->maxLength(255),
                        Forms\Components\FileUpload::make('site_logo')
                            ->image()
                            ->directory('settings')
                            ->visibility('public')
                            ->preserveFilenames()
                            ->disk('ftp')
                            ->imageResizeMode('cover')
                            ->imageCropAspectRatio('1:1')
                            ->imageResizeTargetWidth('100')
                            ->imageResizeTargetHeight('100')
                            ->columnSpanFull(),
                    ])->columns(2),

                Forms\Components\Section::make('Theme Settings')
                    ->schema([
                        Forms\Components\ColorPicker::make('button_colors.success')
                            ->label('Success Color')
                            ->default('#22c55e'),
                        Forms\Components\ColorPicker::make('button_colors.warning')
                            ->label('Warning Color')
                            ->default('#f59e0b'),
                        Forms\Components\ColorPicker::make('button_colors.danger')
                            ->label('Danger Color')
                            ->default('#ef4444'),
                        Forms\Components\ColorPicker::make('button_colors.info')
                            ->label('Info Color')
                            ->default('#3b82f6'),
                    ])->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('site_name')
                    ->searchable(),
                Tables\Columns\ImageColumn::make('site_logo')
                    ->disk('ftp')
                    ->circular()
                    ->url(fn ($record) => $record ? 'https://view-sop.taspen.co.id/' . $record->site_logo : null),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\EditAction::make()
                    ->visible(fn () => auth()->user()->can('update_setting')),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make()
                        ->visible(fn () => auth()->user()->can('delete_any_setting')),
                    ExportBulkAction::make()
                        ->visible(fn () => auth()->user()->can('view_any_setting'))
                        ->exports([
                            ExcelExport::make()
                                ->fromTable()
                                ->withFilename(fn () => 'settings-' . date('Y-m-d') . '-export')
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
            'index' => Pages\ListSettings::route('/'),
            'create' => Pages\CreateSetting::route('/create'),
            'edit' => Pages\EditSetting::route('/{record}/edit'),
        ];
    }
}

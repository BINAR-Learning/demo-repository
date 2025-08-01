<?php

namespace App\Filament\Resources;

use App\Filament\Resources\UserResource\Pages;
use App\Filament\Resources\UserResource\RelationManagers;
use App\Filament\Resources\UserResource\Actions\SyncUserData;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Illuminate\Support\Facades\Hash;
use Filament\Actions\Action;
use pxlrbt\FilamentExcel\Actions\Tables\ExportBulkAction;
use pxlrbt\FilamentExcel\Exports\ExcelExport;
use STS\FilamentImpersonate\Tables\Actions\Impersonate;

class UserResource extends Resource
{
    protected static ?string $model = User::class;

    protected static ?string $navigationIcon = 'heroicon-o-users';

    // protected static ?string $navigationGroup = 'User Management';

    protected static ?int $navigationSort = 1;

    public static function shouldRegisterNavigation(): bool
    {
        return auth()->user()->can('view_any_user');
    }

    public static function getHeaderActions(): array
    {
        return [
            SyncUserData::make()
        ];
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
                Forms\Components\TextInput::make('name')
                    ->required()
                    ->maxLength(255),
                Forms\Components\TextInput::make('username')
                    ->required()
                    ->maxLength(255)
                    ->unique(ignoreRecord: true),
                Forms\Components\TextInput::make('email')
                    ->email()
                    ->required()
                    ->maxLength(255),
                Forms\Components\Textarea::make('address')
                    ->maxLength(65535)
                    ->columnSpanFull(),
                Forms\Components\TextInput::make('password')
                    ->password()
                    ->dehydrateStateUsing(fn (string $state): string => Hash::make($state))
                    ->dehydrated(fn (?string $state): bool => filled($state))
                    ->required(fn (string $operation): bool => $operation === 'create'),
                Forms\Components\Select::make('company_id')
                    ->relationship('company', 'name')
                    ->afterStateUpdated(function ($state, Forms\Set $set) {
                        $set('working_unit_id', null);
                        $set('job_position_id', null);
                    })
                    ->required()
                    ->searchable()
                    ->preload()
                    ->live(),
                Forms\Components\Select::make('working_unit_id')
                    ->options(function (Forms\Get $get, ?User $record) {
                        if (!$get('company_id')) {
                            if ($record) {
                                return \App\Models\WorkingUnit::where('company_id', $record->workingUnit?->company_id)
                                    ->pluck('name', 'id');
                            }
                            return [];
                        }
                        
                        return \App\Models\WorkingUnit::where('company_id', $get('company_id'))
                            ->pluck('name', 'id');
                    })
                    ->afterStateUpdated(fn ($state, Forms\Set $set) => $set('job_position_id', null))
                    ->required()
                    ->searchable()
                    ->preload()
                    ->live(),
                Forms\Components\Select::make('job_position_id')
                    ->options(function (Forms\Get $get, ?User $record) {
                        if (!$get('working_unit_id')) {
                            if ($record) {
                                return \App\Models\JobPosition::where('working_unit_id', $record->working_unit_id)
                                    ->pluck('name', 'id');
                            }
                            return [];
                        }
                        
                        return \App\Models\JobPosition::where('working_unit_id', $get('working_unit_id'))
                            ->pluck('name', 'id');
                    })
                    ->required()
                    ->searchable()
                    ->preload(),
                Forms\Components\CheckboxList::make('roles')
                    ->relationship('roles', 'name')
                    ->searchable(),
                Forms\Components\TextInput::make('employee_id')
                    ->label('Employee ID (NIK)')
                    ->maxLength(255),
                Forms\Components\TextInput::make('position_name')
                    ->maxLength(255),
                Forms\Components\TextInput::make('business_area')
                    ->maxLength(255),
                Forms\Components\Toggle::make('is_admin')
                    ->required(),
                Forms\Components\FileUpload::make('avatar')
                    ->image()
                    ->directory('avatars')
                    ->visibility('public')
                    ->preserveFilenames()
                    ->disk('ftp')
                    ->imageResizeMode('cover')
                    ->imageCropAspectRatio('1:1')
                    ->imageResizeTargetWidth('100')
                    ->imageResizeTargetHeight('100')
                    ->columnSpanFull(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('avatar')
                    ->disk('ftp')
                    ->circular(),
                Tables\Columns\TextColumn::make('name')
                    ->searchable(),
                Tables\Columns\TextColumn::make('username')
                    ->searchable(),
                Tables\Columns\TextColumn::make('email')
                    ->searchable(),
                Tables\Columns\TextColumn::make('workingUnit.name')
                    ->label('Working Unit')
                    ->sortable(),
                Tables\Columns\TextColumn::make('workingUnit.company.name')
                    ->label('Company')
                    ->sortable(),
                Tables\Columns\TextColumn::make('jobPosition.name')
                    ->label('Job Position')
                    ->sortable(),
                Tables\Columns\TextColumn::make('roles.name')
                    ->label('Roles')
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
                Tables\Filters\SelectFilter::make('roles')
                    ->relationship('roles', 'name')
                    ->multiple()
                    ->preload(),
            ])
            ->groups([
                Tables\Grouping\Group::make('workingUnit.name')
                    ->label('Working Unit')
                    ->collapsible(),
                Tables\Grouping\Group::make('roles.name')
                    ->label('Roles')
                    ->collapsible(),
            ])
            ->actions([
                Tables\Actions\EditAction::make()
                    ->visible(fn () => auth()->user()->can('update_user')),
                Tables\Actions\DeleteAction::make()
                    ->visible(fn () => auth()->user()->can('delete_user')),
                Impersonate::make()
                    ->redirectTo(fn () => route('filament.admin.pages.custom-dashboard')),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make()
                        ->visible(fn () => auth()->user()->can('delete_any_user')),
                    ExportBulkAction::make()
                        ->visible(fn () => auth()->user()->can('view_any_user'))
                        ->exports([
                            ExcelExport::make()
                                ->fromTable()
                                ->withFilename(fn () => 'users-' . date('Y-m-d') . '-export')
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
            'index' => Pages\ListUsers::route('/'),
            'create' => Pages\CreateUser::route('/create'),
            'edit' => Pages\EditUser::route('/{record}/edit'),
        ];
    }
}

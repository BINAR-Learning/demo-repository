<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProjectTeamsMappingResource\Pages;
use App\Models\TeamsIntegrationSetting;
use App\Models\Project;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Columns\TextColumn\TextColumnSize;
use Illuminate\Support\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

class ProjectTeamsMappingResource extends Resource
{
    protected static ?string $model = TeamsIntegrationSetting::class;

    protected static ?string $navigationIcon = 'heroicon-o-arrow-path-rounded-square';

    protected static ?string $navigationLabel = 'Webhook';

    protected static ?int $navigationSort = 2;

    public static function shouldRegisterNavigation(): bool
    {
        $user = Auth::user();
        return $user && ($user->hasRole('super_admin') || $user->is_admin);
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Select::make('project_id')
                    ->label('Project')
                    ->options(Project::pluck('name', 'id'))
                    ->searchable()
                    ->required()
                    ->unique(ignoreRecord: true)
                    ->helperText('Select the project to map to a Teams channel'),

                TextInput::make('workflow_webhook_url')
                    ->label('Teams Workflow Webhook URL')
                    ->url()
                    ->required()
                    ->helperText('The Power Automate workflow webhook URL for this project\'s channel')
                    ->placeholder('https://prod-xxx.region.logic.azure.com:443/workflows/...'),

                TextInput::make('channel_name')
                    ->label('Teams Channel Name')
                    ->helperText('Optional: The name of the Teams channel (for reference only)')
                    ->placeholder('e.g., IT APPS TEAM'),

                Toggle::make('is_active')
                    ->label('Active')
                    ->default(true)
                    ->helperText('Enable or disable Teams notifications for this project'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('project.name')
                    ->label('Project')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('workflow_webhook_url')
                    ->label('Webhook URL')
                    ->size(TextColumnSize::Small)
                    ->limit(50)
                    ->tooltip(function (TextColumn $column): ?string {
                        return $column->getState();
                    }),

                TextColumn::make('channel_name')
                    ->label('Channel')
                    ->placeholder('Not specified'),

                ToggleColumn::make('is_active')
                    ->label('Active')
                    ->sortable(),

                TextColumn::make('created_at')
                    ->label('Created')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('updated_at')
                    ->label('Updated')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('project')
                    ->relationship('project', 'name')
                    ->searchable()
                    ->preload(),

                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Active Status'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
                Tables\Actions\Action::make('test')
                    ->label('Test Webhook')
                    ->icon('heroicon-o-play')
                    ->color('success')
                    ->action(function (TeamsIntegrationSetting $record) {
                        // Test the webhook for this project
                        $teamsService = new \App\Services\TeamsWorkflowService();
                        
                        $testCard = [
                            'type' => 'AdaptiveCard',
                            'version' => '1.3',
                            'body' => [
                                [
                                    'type' => 'TextBlock',
                                    'text' => '🧪 Project Teams Integration Test',
                                    'weight' => 'Bolder',
                                    'size' => 'Medium',
                                    'color' => 'Good',
                                ],
                                [
                                    'type' => 'TextBlock',
                                    'text' => "Testing Teams integration for project: {$record->project->name}",
                                    'wrap' => true,
                                ],
                                [
                                    'type' => 'FactSet',
                                    'facts' => [
                                        [
                                            'title' => 'Project',
                                            'value' => $record->project->name,
                                        ],
                                        [
                                            'title' => 'Channel',
                                            'value' => $record->channel_name ?: 'Default',
                                        ],
                                        [
                                            'title' => 'Test Time',
                                            'value' => Carbon::now()->format('Y-m-d H:i:s'),
                                        ],
                                    ],
                                ],
                            ],
                        ];

                        $success = $teamsService->sendAdaptiveCard($record->workflow_webhook_url, $testCard);
                        
                        if ($success) {
                            \Filament\Notifications\Notification::make()
                                ->title('Test Successful')
                                ->body('Test adaptive card sent successfully to Teams!')
                                ->success()
                                ->send();
                        } else {
                            \Filament\Notifications\Notification::make()
                                ->title('Test Failed')
                                ->body('Failed to send test adaptive card to Teams.')
                                ->danger()
                                ->send();
                        }
                    }),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
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
            'index' => Pages\ListProjectTeamsMappings::route('/'),
            'create' => Pages\CreateProjectTeamsMapping::route('/create'),
            'edit' => Pages\EditProjectTeamsMapping::route('/{record}/edit'),
        ];
    }
} 
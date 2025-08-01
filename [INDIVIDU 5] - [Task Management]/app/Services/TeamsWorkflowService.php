<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\TeamsNotificationLog;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;

class TeamsWorkflowService
{
    protected int $retryAttempts;
    protected int $timeout;
    protected array $rateLimit;
    protected string $middlewareUrl;

    public function __construct()
    {
        $this->retryAttempts = Config::get('teams.retry_attempts', 3);
        $this->timeout = Config::get('teams.timeout', 30);
        $this->rateLimit = Config::get('teams.rate_limit', ['max_requests' => 100, 'per_minutes' => 1]);
        $this->middlewareUrl = Config::get('teams.middleware_url', 'https://api-tcds.taspen.co.id/api/teams/send_message');
    }

    /**
     * Send adaptive card message ONLY (no text message support)
     */
    public function sendAdaptiveCard(string $webhookUrl, array $card, ?int $taskId = null, ?int $userId = null): bool
    {
        // Check if this webhook expects the old structure (with body wrapper)
        $expectsBodyWrapper = $this->expectsBodyWrapper($webhookUrl);
        
        if ($expectsBodyWrapper) {
            // For workflows that expect @triggerBody()?['body']?['attachments']
            $payload = [
                'body' => [
                    'attachments' => [
                        [
                            'contentType' => 'application/vnd.microsoft.card.adaptive',
                            'content' => $card
                        ]
                    ]
                ]
            ];
        } else {
            // For workflows that expect @triggerBody()?['attachments']
            $payload = [
                'attachments' => [
                    [
                        'contentType' => 'application/vnd.microsoft.card.adaptive',
                        'content' => $card
                    ]
                ]
            ];
        }

        return $this->sendNotification($webhookUrl, $payload, $taskId, $userId);
    }

    /**
     * Remove text message support
     */
    public function sendTextMessage(string $webhookUrl, string $message, ?int $taskId = null, ?int $userId = null): bool
    {
        // No-op: text messages are not supported anymore
        return false;
    }

    /**
     * Send notification to Teams workflow via middleware
     */
    public function sendNotification(string $webhookUrl, array $payload, ?int $taskId = null, ?int $userId = null): bool
    {
        // Check rate limiting
        if (!$this->checkRateLimit($webhookUrl)) {
            Log::warning('Teams notification rate limit exceeded', ['webhook_url' => $webhookUrl]);
            return false;
        }

        // Create notification log
        $log = TeamsNotificationLog::create([
            'task_id' => $taskId,
            'user_id' => $userId,
            'notification_type' => $payload['type'] ?? 'adaptive_card',
            'status' => 'pending',
            'payload' => $payload,
        ]);

        try {
            // Prepare middleware payload
            $middlewarePayload = [
                'webhook_url' => $webhookUrl,
                'payload' => $payload
            ];
            
            // Debug logging for payload structure
            Log::info('Sending Teams notification via middleware', [
                'webhook_url' => $webhookUrl,
                'middleware_url' => $this->middlewareUrl,
                'expects_body_wrapper' => $this->expectsBodyWrapper($webhookUrl),
                'payload_structure' => [
                    'has_body' => isset($payload['body']),
                    'has_attachments' => isset($payload['attachments']) || isset($payload['body']['attachments']),
                    'attachments_count' => isset($payload['attachments']) ? count($payload['attachments']) : (isset($payload['body']['attachments']) ? count($payload['body']['attachments']) : 0),
                    'payload_keys' => array_keys($payload),
                ],
                'full_payload' => $payload,
                'middleware_payload' => $middlewarePayload,
            ]);
            
            $response = Http::timeout($this->timeout)
                ->retry($this->retryAttempts, 1000)
                ->post($this->middlewareUrl, $middlewarePayload);

            if ($response->successful()) {
                $log->update([
                    'status' => 'sent',
                    'workflow_run_id' => $this->extractWorkflowRunId($response),
                ]);

                Log::info('Teams notification sent successfully via middleware', [
                    'webhook_url' => $webhookUrl,
                    'middleware_url' => $this->middlewareUrl,
                    'log_id' => $log->id,
                    'response_status' => $response->status(),
                    'response_body' => $response->body(),
                ]);

                return true;

            } else {
                $log->update([
                    'status' => 'failed',
                    'error_message' => "HTTP {$response->status()}: {$response->body()}",
                ]);

                Log::error('Teams notification failed via middleware', [
                    'webhook_url' => $webhookUrl,
                    'middleware_url' => $this->middlewareUrl,
                    'log_id' => $log->id,
                    'status' => $response->status(),
                    'response' => $response->body(),
                ]);

                return false;
            }

        } catch (\Exception $e) {
            $log->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            Log::error('Teams notification exception via middleware', [
                'webhook_url' => $webhookUrl,
                'middleware_url' => $this->middlewareUrl,
                'log_id' => $log->id,
                'exception' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Check rate limiting for webhook URL
     */
    protected function checkRateLimit(string $webhookUrl): bool
    {
        $key = 'teams_rate_limit:' . md5($webhookUrl);
        $currentCount = Cache::get($key, 0);

        if ($currentCount >= $this->rateLimit['max_requests']) {
            return false;
        }

        Cache::put($key, $currentCount + 1, $this->rateLimit['per_minutes'] * 60);
        return true;
    }

    /**
     * Extract workflow run ID from response
     */
    protected function extractWorkflowRunId($response): ?string
    {
        try {
            $body = $response->json();
            return $body['run_id'] ?? $body['id'] ?? null;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Debug method to test payload structure without sending
     */
    public function debugPayloadStructure(array $card): array
    {
        $webhookUrl = 'test-webhook-url';
        $expectsBodyWrapper = $this->expectsBodyWrapper($webhookUrl);
        
        if ($expectsBodyWrapper) {
            $payload = [
                'body' => [
                    'attachments' => [
                        [
                            'contentType' => 'application/vnd.microsoft.card.adaptive',
                            'content' => $card
                        ]
                    ]
                ]
            ];
        } else {
            $payload = [
                'attachments' => [
                    [
                        'contentType' => 'application/vnd.microsoft.card.adaptive',
                        'content' => $card
                    ]
                ]
            ];
        }

        $middlewarePayload = [
            'webhook_url' => $webhookUrl,
            'payload' => $payload
        ];

        Log::info('Debug payload structure', [
            'original_card' => $card,
            'expects_body_wrapper' => $expectsBodyWrapper,
            'final_payload' => $payload,
            'middleware_payload' => $middlewarePayload,
            'json_payload' => json_encode($payload, JSON_PRETTY_PRINT),
            'json_middleware_payload' => json_encode($middlewarePayload, JSON_PRETTY_PRINT),
        ]);

        return [
            'payload' => $payload,
            'middleware_payload' => $middlewarePayload,
            'json_payload' => json_encode($payload, JSON_PRETTY_PRINT),
            'expects_body_wrapper' => $expectsBodyWrapper,
        ];
    }

    /**
     * Test payload structure for Teams workflow compatibility
     */
    public function testPayloadStructure(array $card): array
    {
        $webhookUrl = 'test-webhook-url';
        $expectsBodyWrapper = $this->expectsBodyWrapper($webhookUrl);
        
        if ($expectsBodyWrapper) {
            $payload = [
                'body' => [
                    'attachments' => [
                        [
                            'contentType' => 'application/vnd.microsoft.card.adaptive',
                            'content' => $card
                        ]
                    ]
                ]
            ];
        } else {
            $payload = [
                'attachments' => [
                    [
                        'contentType' => 'application/vnd.microsoft.card.adaptive',
                        'content' => $card
                    ]
                ]
            ];
        }

        Log::info('Testing payload structure for Teams workflow', [
            'expects_body_wrapper' => $expectsBodyWrapper,
            'payload' => $payload,
            'structure_check' => [
                'has_body' => isset($payload['body']),
                'has_attachments' => isset($payload['attachments']) || isset($payload['body']['attachments']),
                'attachments_is_array' => is_array($payload['attachments'] ?? $payload['body']['attachments'] ?? []),
                'attachments_count' => count($payload['attachments'] ?? $payload['body']['attachments'] ?? []),
                'first_attachment_has_content_type' => isset(($payload['attachments'] ?? $payload['body']['attachments'] ?? [])[0]['contentType']),
                'first_attachment_has_content' => isset(($payload['attachments'] ?? $payload['body']['attachments'] ?? [])[0]['content']),
            ]
        ]);

        return $payload;
    }

    /**
     * Check if the webhook expects the old payload structure with body wrapper
     */
    protected function expectsBodyWrapper(string $webhookUrl): bool
    {
        // Check if this is a specific webhook that we know expects the old structure
        // You can add more webhook URLs here as needed
        $oldStructureWebhooks = [
            'prod-84.southeastasia.logic.azure.com', // Add the webhook that's failing
        ];
        
        foreach ($oldStructureWebhooks as $oldWebhook) {
            if (str_contains($webhookUrl, $oldWebhook)) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Get notification statistics
     */
    public function getNotificationStats(): array
    {
        return [
            'total' => TeamsNotificationLog::count(),
            'sent' => TeamsNotificationLog::where('status', 'sent')->count(),
            'failed' => TeamsNotificationLog::where('status', 'failed')->count(),
            'pending' => TeamsNotificationLog::where('status', 'pending')->count(),
        ];
    }
} 
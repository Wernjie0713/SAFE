<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'vertex_ai' => [
        'endpoint' => env('VERTEX_AI_ENDPOINT'),
        'api_key' => env('VERTEX_AI_API_KEY'),
        'project_id' => env('VERTEX_AI_PROJECT_ID'),
        'model_id' => env('VERTEX_AI_MODEL_ID'),
        'location' => env('VERTEX_AI_LOCATION', 'us-central1'),
        'history_window' => env('VERTEX_AI_HISTORY_WINDOW', 10), // Number of historical readings to consider
    ],

    'openai' => [
        'api_key' => env('OPENAI_API_KEY'),
        'model' => env('OPENAI_MODEL', 'gpt-4o-mini'), // Default to GPT-4 if not specified
        'temperature' => env('OPENAI_TEMPERATURE', 0.7),
        'max_tokens' => env('OPENAI_MAX_TOKENS', 500),
    ],

];

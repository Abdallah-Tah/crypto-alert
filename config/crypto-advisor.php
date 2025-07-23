<?php

return [
    /*
    |--------------------------------------------------------------------------
    | OpenAI Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for OpenAI API integration
    |
    */
    'openai' => [
        'api_key' => env('OPENAI_API_KEY'),
        'model' => env('OPENAI_MODEL', 'gpt-4'),
        'max_tokens' => env('OPENAI_MAX_TOKENS', 300),
        'temperature' => env('OPENAI_TEMPERATURE', 0.7),
    ],

    /*
    |--------------------------------------------------------------------------
    | CCXT Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for cryptocurrency exchange integration
    |
    */
    'ccxt' => [
        'default_exchange' => env('CCXT_DEFAULT_EXCHANGE', 'binance'),
        'sandbox_mode' => env('CCXT_SANDBOX_MODE', true),
        'rate_limit' => env('CCXT_RATE_LIMIT', 1000), // milliseconds
        'exchanges' => [
            'binance' => [
                'api_key' => env('BINANCE_API_KEY'),
                'secret' => env('BINANCE_SECRET'),
                'sandbox' => env('BINANCE_SANDBOX', true),
            ],
            'coinbase' => [
                'api_key' => env('COINBASE_API_KEY'),
                'secret' => env('COINBASE_SECRET'),
                'sandbox' => env('COINBASE_SANDBOX', true),
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Alert Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for price alerts and notifications
    |
    */
    'alerts' => [
        'price_check_interval' => env('ALERT_PRICE_CHECK_INTERVAL', 60), // seconds
        'notification_enabled' => env('ALERT_NOTIFICATIONS_ENABLED', true),
        'max_alerts_per_user' => env('ALERT_MAX_PER_USER', 50),
        'notification_sound' => env('ALERT_NOTIFICATION_SOUND', true),
    ],

    /*
    |--------------------------------------------------------------------------
    | AI Advisor Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for AI-powered investment advice
    |
    */
    'ai_advisor' => [
        'cache_suggestions' => env('AI_CACHE_SUGGESTIONS', true),
        'cache_duration' => env('AI_CACHE_DURATION', 3600), // seconds
        'max_suggestions_per_day' => env('AI_MAX_SUGGESTIONS_PER_DAY', 10),
        'risk_levels' => ['low', 'moderate', 'high'],
        'time_horizons' => ['short', 'medium', 'long'],
    ],

    /*
    |--------------------------------------------------------------------------
    | Watchlist Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for user watchlists
    |
    */
    'watchlist' => [
        'max_coins_per_user' => env('WATCHLIST_MAX_COINS', 20),
        'default_symbols' => ['BTC/USDT', 'ETH/USDT', 'ADA/USDT'],
        'auto_add_trending' => env('WATCHLIST_AUTO_ADD_TRENDING', false),
    ],
];

/// Configuration options for Tenlixor SDK
class TenlixorConfig {
  /// Your Tenlixor API token
  final String token;

  /// Your tenant slug/identifier
  final String tenantSlug;

  /// Default language code (e.g., 'en', 'tr')
  final String language;

  /// Custom API endpoint URL (optional)
  final String? apiUrl;

  /// Enable persistent storage with SharedPreferences
  final bool persistentStorage;

  /// SharedPreferences key prefix
  final String storageKey;

  /// Cache time-to-live in milliseconds
  final int cacheTTL;

  /// Fallback language when translation is missing
  final String? fallbackLanguage;

  const TenlixorConfig({
    required this.token,
    required this.tenantSlug,
    this.language = 'en',
    this.apiUrl,
    this.persistentStorage = true,
    this.storageKey = 'tenlixor',
    this.cacheTTL = 300000, // 5 minutes
    this.fallbackLanguage,
  });

  TenlixorConfig copyWith({
    String? token,
    String? tenantSlug,
    String? language,
    String? apiUrl,
    bool? persistentStorage,
    String? storageKey,
    int? cacheTTL,
    String? fallbackLanguage,
  }) {
    return TenlixorConfig(
      token: token ?? this.token,
      tenantSlug: tenantSlug ?? this.tenantSlug,
      language: language ?? this.language,
      apiUrl: apiUrl ?? this.apiUrl,
      persistentStorage: persistentStorage ?? this.persistentStorage,
      storageKey: storageKey ?? this.storageKey,
      cacheTTL: cacheTTL ?? this.cacheTTL,
      fallbackLanguage: fallbackLanguage ?? this.fallbackLanguage,
    );
  }
}

/// Translation resource data
class TenlixorResource {
  final String key;
  final String value;
  final String languageCode;

  const TenlixorResource({
    required this.key,
    required this.value,
    required this.languageCode,
  });

  factory TenlixorResource.fromJson(Map<String, dynamic> json) {
    return TenlixorResource(
      key: json['key'] as String,
      value: json['value'] as String,
      languageCode: json['language_code'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'key': key,
      'value': value,
      'language_code': languageCode,
    };
  }
}

/// API response structure
class TenlixorResponse {
  final bool success;
  final List<TenlixorResource> resources;
  final String? error;

  const TenlixorResponse({
    required this.success,
    required this.resources,
    this.error,
  });

  factory TenlixorResponse.fromJson(Map<String, dynamic> json) {
    return TenlixorResponse(
      success: json['success'] as bool? ?? false,
      resources: (json['resources'] as List<dynamic>?)
              ?.map((item) => TenlixorResource.fromJson(item as Map<String, dynamic>))
              .toList() ??
          [],
      error: json['error'] as String?,
    );
  }
}

/// Event types
enum TenlixorEventType {
  loaded,
  languageChanged,
  error,
}

/// Event data
class TenlixorEvent {
  final TenlixorEventType type;
  final dynamic data;

  const TenlixorEvent({
    required this.type,
    this.data,
  });
}

/// Error codes
enum TenlixorErrorCode {
  networkError,
  invalidToken,
  invalidResponse,
  storageError,
  invalidLanguage,
}

/// Error class
class TenlixorError implements Exception {
  final TenlixorErrorCode code;
  final String message;
  final dynamic details;

  const TenlixorError({
    required this.code,
    required this.message,
    this.details,
  });

  @override
  String toString() => 'TenlixorError(${code.name}): $message';
}

/// Storage adapter interface
abstract class IStorageAdapter {
  Future<void> setItem(String key, String value);
  Future<String?> getItem(String key);
  Future<void> removeItem(String key);
  Future<void> clear();
  Future<List<String>> getKeys(String prefix);
  Future<void> removeKeys(String prefix);
}

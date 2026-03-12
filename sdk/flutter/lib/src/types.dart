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
  final String id;
  final String key;
  final String value;
  final String description;
  final String? createdBy;
  final String? updatedBy;
  final String createdAt;
  final String updatedAt;

  const TenlixorResource({
    required this.id,
    required this.key,
    required this.value,
    required this.description,
    this.createdBy,
    this.updatedBy,
    required this.createdAt,
    required this.updatedAt,
  });

  factory TenlixorResource.fromJson(Map<String, dynamic> json) {
    return TenlixorResource(
      id: json['id'] as String,
      key: json['key'] as String,
      value: json['value'] as String,
      description: json['description'] as String? ?? '',
      createdBy: json['created_by'] as String?,
      updatedBy: json['updated_by'] as String?,
      createdAt: json['created_at'] as String,
      updatedAt: json['updated_at'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'key': key,
      'value': value,
      'description': description,
      'created_by': createdBy,
      'updated_by': updatedBy,
      'created_at': createdAt,
      'updated_at': updatedAt,
    };
  }
}

/// Language data with resources
class TenlixorLanguage {
  final String code;
  final List<TenlixorResource> resources;

  const TenlixorLanguage({
    required this.code,
    required this.resources,
  });

  factory TenlixorLanguage.fromJson(Map<String, dynamic> json) {
    return TenlixorLanguage(
      code: json['code'] as String,
      resources: (json['resources'] as List<dynamic>?)
              ?.map((item) => TenlixorResource.fromJson(item as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'code': code,
      'resources': resources.map((r) => r.toJson()).toList(),
    };
  }
}

/// API response data structure
class TenlixorResponseData {
  final String tenantId;
  final List<TenlixorLanguage> languages;

  const TenlixorResponseData({
    required this.tenantId,
    required this.languages,
  });

  factory TenlixorResponseData.fromJson(Map<String, dynamic> json) {
    return TenlixorResponseData(
      tenantId: json['tenant_id'] as String,
      languages: (json['languages'] as List<dynamic>?)
              ?.map((item) => TenlixorLanguage.fromJson(item as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'tenant_id': tenantId,
      'languages': languages.map((l) => l.toJson()).toList(),
    };
  }
}

/// API response metadata
class TenlixorResponseMeta {
  final int page;
  final int limit;
  final int total;

  const TenlixorResponseMeta({
    required this.page,
    required this.limit,
    required this.total,
  });

  factory TenlixorResponseMeta.fromJson(Map<String, dynamic> json) {
    return TenlixorResponseMeta(
      page: json['page'] as int,
      limit: json['limit'] as int,
      total: json['total'] as int,
    );
  }
}

/// Complete API response structure
class TenlixorResponse {
  final bool success;
  final TenlixorResponseData data;
  final TenlixorResponseMeta meta;
  final String requestId;

  const TenlixorResponse({
    required this.success,
    required this.data,
    required this.meta,
    required this.requestId,
  });

  factory TenlixorResponse.fromJson(Map<String, dynamic> json) {
    return TenlixorResponse(
      success: json['success'] as bool? ?? false,
      data: TenlixorResponseData.fromJson(json['data'] as Map<String, dynamic>),
      meta: TenlixorResponseMeta.fromJson(json['meta'] as Map<String, dynamic>),
      requestId: json['request_id'] as String,
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

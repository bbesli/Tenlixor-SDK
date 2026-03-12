import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'types.dart';
import 'storage_adapter.dart';

/// Main Tenlixor SDK client with ChangeNotifier for state management
class Tenlixor extends ChangeNotifier {
  final TenlixorConfig config;
  final IStorageAdapter storage;

  bool _isReady = false;
  bool _isLoading = false;
  String _currentLanguage;
  List<String> _availableLanguages = [];
  Map<String, Map<String, String>> _translations = {};
  Map<String, int> _cacheTimestamps = {};

  final StreamController<TenlixorEvent> _eventController =
      StreamController<TenlixorEvent>.broadcast();

  Tenlixor({
    required this.config,
    IStorageAdapter? storage,
  })  : storage = storage ?? defaultStorageAdapter,
        _currentLanguage = config.language;

  /// Stream of events (loaded, languageChanged, error)
  Stream<TenlixorEvent> get events => _eventController.stream;

  /// Check if SDK is ready
  bool get isReady => _isReady;

  /// Check if SDK is loading
  bool get isLoading => _isLoading;

  /// Get current language
  String get language => _currentLanguage;

  /// Get available languages
  List<String> get availableLanguages => List.unmodifiable(_availableLanguages);

  /// Initialize the SDK
  Future<void> init() async {
    if (_isReady) return;

    _isLoading = true;
    notifyListeners();

    try {
      // Try to load from storage first
      if (config.persistentStorage) {
        final loaded = await _loadFromStorage(_currentLanguage);
        if (loaded) {
          _isReady = true;
          _isLoading = false;
          notifyListeners();
          _emitEvent(TenlixorEventType.loaded, {
            'language': _currentLanguage,
            'fromStorage': true,
          });
          
          // Fetch fresh data in background
          _fetchStrings(_currentLanguage, background: true);
          return;
        }
      }

      // Fetch from API
      await _fetchStrings(_currentLanguage);
      _isReady = true;
    } catch (e) {
      _emitEvent(TenlixorEventType.error, {
        'code': TenlixorErrorCode.networkError.name,
        'message': 'Failed to initialize SDK',
        'details': e.toString(),
      });
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Translate a key to its value
  String t(String key, [String? languageCode]) {
    final lang = languageCode ?? _currentLanguage;
    final value = _translations[lang]?[key];

    if (value != null) return value;

    // Try fallback language
    if (config.fallbackLanguage != null && lang != config.fallbackLanguage) {
      final fallbackValue = _translations[config.fallbackLanguage]?[key];
      if (fallbackValue != null) return fallbackValue;
    }

    // Return key as fallback
    return key;
  }

  /// Change language
  Future<void> setLanguage(String languageCode) async {
    if (languageCode == _currentLanguage) return;

    final previousLanguage = _currentLanguage;
    _currentLanguage = languageCode;
    _isLoading = true;
    notifyListeners();

    try {
      // Check if already loaded and not expired
      if (_translations.containsKey(languageCode) &&
          !_isCacheExpired(languageCode)) {
        _isLoading = false;
        notifyListeners();
        _emitEvent(TenlixorEventType.languageChanged, {
          'from': previousLanguage,
          'to': languageCode,
        });
        return;
      }

      // Try to load from storage first
      if (config.persistentStorage) {
        final loaded = await _loadFromStorage(languageCode);
        if (loaded) {
          _isLoading = false;
          notifyListeners();
          _emitEvent(TenlixorEventType.languageChanged, {
            'from': previousLanguage,
            'to': languageCode,
            'fromStorage': true,
          });
          
          // Fetch fresh data in background
          _fetchStrings(languageCode, background: true);
          return;
        }
      }

      // Fetch from API
      await _fetchStrings(languageCode);
      _emitEvent(TenlixorEventType.languageChanged, {
        'from': previousLanguage,
        'to': languageCode,
      });
    } catch (e) {
      _currentLanguage = previousLanguage;
      _emitEvent(TenlixorEventType.error, {
        'code': TenlixorErrorCode.networkError.name,
        'message': 'Failed to change language',
        'details': e.toString(),
      });
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Reload current language translations
  Future<void> reload() async {
    _isLoading = true;
    notifyListeners();

    try {
      await _fetchStrings(_currentLanguage, force: true);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Clear all cached translations from storage
  Future<void> clearStorage() async {
    try {
      if (config.persistentStorage) {
        await storage.removeKeys('${config.storageKey}_cache');
        _cacheTimestamps.clear();
      }
    } catch (e) {
      _emitEvent(TenlixorEventType.error, {
        'code': TenlixorErrorCode.storageError.name,
        'message': 'Failed to clear storage',
        'details': e.toString(),
      });
    }
  }

  /// Fetch translations from API
  Future<void> _fetchStrings(String languageCode,
      {bool force = false, bool background = false}) async {
    // Check cache expiry
    if (!force && !_isCacheExpired(languageCode)) {
      return;
    }

    try {
      final baseUrl = config.apiUrl ?? 'https://api.tenlixor.verbytes.com/api/v1';
      final url = Uri.parse('$baseUrl/strings/resources');
      
      final response = await http.get(
        url,
        headers: {
          'Authorization': 'Bearer ${config.token}',
          'Content-Type': 'application/json',
          'X-Tenant-Slug': config.tenantSlug,
          'X-Language-Code': languageCode,
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body) as Map<String, dynamic>;
        final apiResponse = TenlixorResponse.fromJson(data);

        if (apiResponse.success) {
          _mergeData(languageCode, apiResponse.resources);
          _cacheTimestamps[languageCode] = DateTime.now().millisecondsSinceEpoch;

          // Save to storage
          if (config.persistentStorage) {
            await _saveToStorage(languageCode);
          }

          if (!background) {
            _emitEvent(TenlixorEventType.loaded, {
              'language': languageCode,
              'count': apiResponse.resources.length,
            });
          }
        } else {
          throw TenlixorError(
            code: TenlixorErrorCode.invalidResponse,
            message: apiResponse.error ?? 'Invalid response from API',
          );
        }
      } else if (response.statusCode == 401) {
        throw const TenlixorError(
          code: TenlixorErrorCode.invalidToken,
          message: 'Invalid API token',
        );
      } else {
        throw TenlixorError(
          code: TenlixorErrorCode.networkError,
          message: 'HTTP ${response.statusCode}: ${response.reasonPhrase}',
        );
      }
    } catch (e) {
      if (!background) {
        rethrow;
      }
    }
  }

  /// Merge translation data
  void _mergeData(String languageCode, List<TenlixorResource> resources) {
    _translations[languageCode] ??= {};
    
    for (final resource in resources) {
      _translations[languageCode]![resource.key] = resource.value;
    }

    // Update available languages
    if (!_availableLanguages.contains(languageCode)) {
      _availableLanguages.add(languageCode);
    }
  }

  /// Check if cache is expired
  bool _isCacheExpired(String languageCode) {
    final timestamp = _cacheTimestamps[languageCode];
    if (timestamp == null) return true;
    
    final now = DateTime.now().millisecondsSinceEpoch;
    return now - timestamp > config.cacheTTL;
  }

  /// Load translations from storage
  Future<bool> _loadFromStorage(String languageCode) async {
    try {
      final cacheKey = '${config.storageKey}_cache_$languageCode';
      final timestampKey = '${config.storageKey}_timestamp_$languageCode';

      final cachedData = await storage.getItem(cacheKey);
      final cachedTimestamp = await storage.getItem(timestampKey);

      if (cachedData != null && cachedTimestamp != null) {
        final timestamp = int.parse(cachedTimestamp);
        final now = DateTime.now().millisecondsSinceEpoch;

        // Check if cache is still valid
        if (now - timestamp <= config.cacheTTL) {
          final data = json.decode(cachedData) as Map<String, dynamic>;
          _translations[languageCode] = Map<String, String>.from(data);
          _cacheTimestamps[languageCode] = timestamp;
          
          if (!_availableLanguages.contains(languageCode)) {
            _availableLanguages.add(languageCode);
          }
          
          return true;
        }
      }
    } catch (e) {
      debugPrint('Failed to load from storage: $e');
    }
    return false;
  }

  /// Save translations to storage
  Future<void> _saveToStorage(String languageCode) async {
    try {
      final cacheKey = '${config.storageKey}_cache_$languageCode';
      final timestampKey = '${config.storageKey}_timestamp_$languageCode';

      final data = _translations[languageCode];
      if (data != null) {
        await storage.setItem(cacheKey, json.encode(data));
        await storage.setItem(
          timestampKey,
          _cacheTimestamps[languageCode].toString(),
        );
      }
    } catch (e) {
      debugPrint('Failed to save to storage: $e');
    }
  }

  /// Emit an event
  void _emitEvent(TenlixorEventType type, dynamic data) {
    _eventController.add(TenlixorEvent(type: type, data: data));
  }

  @override
  void dispose() {
    _eventController.close();
    super.dispose();
  }
}

import 'package:shared_preferences/shared_preferences.dart';
import 'types.dart';

/// SharedPreferences implementation of storage adapter
class SharedPreferencesAdapter implements IStorageAdapter {
  final String prefix;
  SharedPreferences? _prefs;

  SharedPreferencesAdapter({this.prefix = 'tenlixor'});

  /// Initialize SharedPreferences
  Future<void> _ensureInitialized() async {
    _prefs ??= await SharedPreferences.getInstance();
  }

  String _getKey(String key) => '${prefix}_$key';

  @override
  Future<void> setItem(String key, String value) async {
    try {
      await _ensureInitialized();
      await _prefs!.setString(_getKey(key), value);
    } catch (e) {
      throw TenlixorError(
        code: TenlixorErrorCode.storageError,
        message: 'Failed to save data to storage',
        details: e,
      );
    }
  }

  @override
  Future<String?> getItem(String key) async {
    try {
      await _ensureInitialized();
      return _prefs!.getString(_getKey(key));
    } catch (e) {
      throw TenlixorError(
        code: TenlixorErrorCode.storageError,
        message: 'Failed to read data from storage',
        details: e,
      );
    }
  }

  @override
  Future<void> removeItem(String key) async {
    try {
      await _ensureInitialized();
      await _prefs!.remove(_getKey(key));
    } catch (e) {
      throw TenlixorError(
        code: TenlixorErrorCode.storageError,
        message: 'Failed to remove data from storage',
        details: e,
      );
    }
  }

  @override
  Future<void> clear() async {
    try {
      await _ensureInitialized();
      final keys = await getKeys(prefix);
      for (final key in keys) {
        await _prefs!.remove(key);
      }
    } catch (e) {
      throw TenlixorError(
        code: TenlixorErrorCode.storageError,
        message: 'Failed to clear storage',
        details: e,
      );
    }
  }

  @override
  Future<List<String>> getKeys(String keyPrefix) async {
    try {
      await _ensureInitialized();
      final allKeys = _prefs!.getKeys();
      final fullPrefix = _getKey(keyPrefix);
      return allKeys.where((key) => key.startsWith(fullPrefix)).toList();
    } catch (e) {
      throw TenlixorError(
        code: TenlixorErrorCode.storageError,
        message: 'Failed to get keys from storage',
        details: e,
      );
    }
  }

  @override
  Future<void> removeKeys(String keyPrefix) async {
    try {
      await _ensureInitialized();
      final keys = await getKeys(keyPrefix);
      for (final key in keys) {
        await _prefs!.remove(key);
      }
    } catch (e) {
      throw TenlixorError(
        code: TenlixorErrorCode.storageError,
        message: 'Failed to remove keys from storage',
        details: e,
      );
    }
  }
}

/// Default storage adapter instance
final defaultStorageAdapter = SharedPreferencesAdapter();

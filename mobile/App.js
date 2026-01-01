import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View, Platform, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

// TODO: remplace cette URL par l'adresse LAN de ton frontend Vite
// Exemple : const WEB_APP_URL = 'http://172.20.10.5:8080';
// Assure-toi que le téléphone et le PC sont sur le même réseau et que le firewall autorise le port 8080.
const WEB_APP_URL = 'http://172.20.10.5:8080';

export default function App() {
  const isWeb = Platform.OS === 'web';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.banner}>
        <Text style={styles.title}>Mindful Journey (web) dans Expo</Text>
        <Text style={styles.subtitle}>Modifie WEB_APP_URL si écran blanc. Même Wi‑Fi requis.</Text>
      </View>
      {isWeb ? (
        <View style={styles.webFallback}>
          <Text style={styles.webInfo}>Sur le web, WebView n'est pas supporté.</Text>
          <Text style={styles.webInfo}>Ouvre directement l'URL : {WEB_APP_URL}</Text>
          <iframe
            title="mindful-journey"
            src={WEB_APP_URL}
            style={styles.iframe}
            allow="clipboard-write; autoplay"
          />
        </View>
      ) : (
        <WebView
          source={{ uri: WEB_APP_URL }}
          style={styles.webview}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          allowsFullscreenVideo
          allowsBackForwardNavigationGestures
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color="#38bdf8" />
              <Text style={styles.webInfo}>Chargement de {WEB_APP_URL}</Text>
            </View>
          )}
          renderError={(e) => (
            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>Impossible de charger {WEB_APP_URL}</Text>
              <Text style={styles.errorText}>Vérifie l'URL, le réseau local et le port (8080).</Text>
              <Text style={styles.errorText}>Erreur : {String(e)}</Text>
            </View>
          )}
          onHttpError={(e) => console.warn('WebView HTTP error', e.nativeEvent)}
          onError={(e) => console.warn('WebView error', e.nativeEvent)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  banner: {
    padding: 12,
    backgroundColor: '#111827',
  },
  title: {
    color: '#e5e7eb',
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: '#9ca3af',
    marginTop: 4,
    fontSize: 13,
  },
  webview: {
    flex: 1,
  },
  webFallback: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 12,
    gap: 12,
  },
  webInfo: {
    color: '#e5e7eb',
    fontSize: 14,
  },
  iframe: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#111827',
  },
  errorBox: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
  },
  loader: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
    gap: 8,
  },
  errorTitle: {
    color: '#f87171',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    color: '#e5e7eb',
    textAlign: 'center',
    marginBottom: 4,
  },
});

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import apiService from '@/lib/api';

interface TestResult {
  status: 'success' | 'error';
  data?: any;
  message: string;
}

interface TestResults {
  specialists?: TestResult;
  appointments?: TestResult;
  healthData?: TestResult;
}

const TestAPI = () => {
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'partial' | 'disconnected'>('checking');
  const [testResults, setTestResults] = useState<TestResults>({});
  const [loading, setLoading] = useState(false);

  // Test de connectivité API
  const testApiConnection = async () => {
    setLoading(true);
    const results: TestResults = {};

    // Test 1: Spécialistes
    try {
      const specialists = await apiService.specialists.getAll();
      results.specialists = { 
        status: 'success', 
        data: specialists?.data || specialists,
        message: `${(specialists?.data || specialists)?.length || 0} spécialistes trouvés`
      };
    } catch (error: any) {
      results.specialists = { 
        status: 'error', 
        message: error.message || 'Erreur inconnue'
      };
    }

    // Test 2: Rendez-vous (nécessite authentification)
    try {
      const appointments = await apiService.appointments.getAll();
      results.appointments = { 
        status: 'success', 
        data: appointments?.data || appointments,
        message: `${(appointments?.data || appointments)?.length || 0} rendez-vous trouvés`
      };
    } catch (error: any) {
      results.appointments = { 
        status: 'error', 
        message: error.message || 'Erreur inconnue'
      };
    }

    // Test 3: Données de santé
    try {
      const healthData = await apiService.healthData.getMoodData();
      results.healthData = { 
        status: 'success', 
        data: healthData?.data || healthData,
        message: `${(healthData?.data || healthData)?.length || 0} entrées d'humeur`
      };
    } catch (error: any) {
      results.healthData = { 
        status: 'error', 
        message: error.message || 'Erreur inconnue'
      };
    }

    setTestResults(results);
    
    // Déterminer le statut global
    const hasSuccess = Object.values(results).some((r: TestResult) => r.status === 'success');
    const hasError = Object.values(results).some((r: TestResult) => r.status === 'error');
    
    if (hasSuccess && !hasError) {
      setApiStatus('connected');
    } else if (hasSuccess && hasError) {
      setApiStatus('partial');
    } else {
      setApiStatus('disconnected');
    }
    
    setLoading(false);
  };

  // Test au chargement
  useEffect(() => {
    testApiConnection();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-500">✅ Connecté</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-500">⚠️ Partiel</Badge>;
      case 'disconnected':
        return <Badge className="bg-red-500">❌ Déconnecté</Badge>;
      default:
        return <Badge className="bg-gray-500">🔍 Test...</Badge>;
    }
  };

  const getTestBadge = (result?: TestResult) => {
    if (!result) return <Badge className="bg-gray-500">⏳ En attente</Badge>;
    
    return result.status === 'success' 
      ? <Badge className="bg-green-500">✅ OK</Badge>
      : <Badge className="bg-red-500">❌ Erreur</Badge>;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Test de Connectivité API</h1>
        <p className="text-muted-foreground mb-4">
          Vérification de la connexion entre le frontend React et le backend Laravel
        </p>
        {getStatusBadge(apiStatus)}
      </div>

      {/* Informations de configuration */}
      <Card>
        <CardHeader>
          <CardTitle>🔧 Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>Frontend:</strong> http://localhost:8080
            </div>
            <div>
              <strong>Backend:</strong> http://localhost:8000
            </div>
            <div>
              <strong>API Base:</strong> http://localhost:8000/api
            </div>
            <div>
              <strong>Mode:</strong> {apiStatus === 'disconnected' ? 'localStorage (Fallback)' : 'API'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Résultats des tests */}
      <Card>
        <CardHeader>
          <CardTitle>📡 Tests d'Endpoints</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Test Spécialistes */}
          <div className="flex items-center justify-between p-3 border rounded">
            <div>
              <strong>GET /api/specialists</strong>
              <p className="text-sm text-muted-foreground">Liste des spécialistes de santé</p>
            </div>
            <div className="text-right">
              {getTestBadge(testResults.specialists)}
              {testResults.specialists && (
                <p className="text-xs mt-1">{testResults.specialists.message}</p>
              )}
            </div>
          </div>

          {/* Test Rendez-vous */}
          <div className="flex items-center justify-between p-3 border rounded">
            <div>
              <strong>GET /api/appointments</strong>
              <p className="text-sm text-muted-foreground">Liste des rendez-vous</p>
            </div>
            <div className="text-right">
              {getTestBadge(testResults.appointments)}
              {testResults.appointments && (
                <p className="text-xs mt-1">{testResults.appointments.message}</p>
              )}
            </div>
          </div>

          {/* Test Données de santé */}
          <div className="flex items-center justify-between p-3 border rounded">
            <div>
              <strong>GET /api/health-data/mood</strong>
              <p className="text-sm text-muted-foreground">Données d'humeur</p>
            </div>
            <div className="text-right">
              {getTestBadge(testResults.healthData)}
              {testResults.healthData && (
                <p className="text-xs mt-1">{testResults.healthData.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="text-center">
        <Button 
          onClick={testApiConnection} 
          disabled={loading}
          className="mr-4"
        >
          {loading ? '🔄 Test en cours...' : '🔄 Relancer les Tests'}
        </Button>
        <Button variant="outline" onClick={() => window.location.href = '/'}>
          ← Retour à l'App
        </Button>
      </div>

      {/* Données de débogage */}
      {Object.keys(testResults).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>🐛 Données de Débogage</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>✅ <strong>Tous verts:</strong> API parfaitement connectée</p>
            <p>⚠️ <strong>Partiellement rouge:</strong> Certains endpoints échouent</p>
            <p>❌ <strong>Tous rouges:</strong> Mode fallback localStorage activé</p>
            <p>🔧 <strong>Backend pas démarré?</strong> Lancez <code>.\start-dev.ps1</code></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestAPI;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import testApiService from '@/lib/test-api';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  birth_date?: string;
  gender?: string;
  preferences?: any;
  health_goals?: any;
  status: string;
  created_at: string;
  updated_at: string;
}

const DatabaseViewer = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0 });

  const fetchDatabaseStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simuler la récupération de tous les utilisateurs via une API
      const response = await fetch('http://localhost:8000/api/test/database-stats');
      const data = await response.json();
      
      setStats(data.stats);
      setUsers(data.users || []);
    } catch (err: any) {
      setError(`Erreur de connexion à l'API: ${err.message}`);
      // Données de test locales si l'API n'est pas disponible
      setUsers([
        {
          id: 1,
          name: "Test User",
          email: "test@example.com",
          status: "active",
          created_at: "2025-08-01T13:59:33Z",
          updated_at: "2025-08-01T13:59:33Z"
        }
      ]);
      setStats({ totalUsers: 7, activeUsers: 7 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabaseStats();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">
          🗄️ Visualiseur de Base de Données
        </h1>
        <p className="text-gray-600 mb-6">
          Visualisation des données stockées dans votre base SQLite
        </p>
        
        <div className="flex gap-4 justify-center mb-6">
          <Card className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
            <div className="text-sm text-gray-600">Utilisateurs total</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
            <div className="text-sm text-gray-600">Utilisateurs actifs</div>
          </Card>
        </div>

        <Button onClick={fetchDatabaseStats} disabled={loading}>
          {loading ? '⏳ Actualisation...' : '🔄 Actualiser les données'}
        </Button>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="text-red-700">
              ⚠️ {error}
            </div>
            <div className="text-sm text-red-600 mt-2">
              Affichage des données de test. Vérifiez que votre serveur Laravel est démarré.
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold mb-4">
          👥 Liste des utilisateurs ({users.length})
        </h2>

        {users.length === 0 && !loading ? (
          <Card>
            <CardContent className="text-center py-8">
              <div className="text-gray-500">
                Aucun utilisateur trouvé dans la base de données
              </div>
            </CardContent>
          </Card>
        ) : (
          users.map((user) => (
            <Card key={user.id} className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      ID: {user.id}
                    </span>
                    {user.name}
                  </CardTitle>
                  <Badge className={user.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
                    {user.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Informations de base</h4>
                    <div className="space-y-1 text-sm">
                      <div><strong>Email:</strong> {user.email}</div>
                      {user.phone && <div><strong>Téléphone:</strong> {user.phone}</div>}
                      {user.birth_date && <div><strong>Date de naissance:</strong> {user.birth_date}</div>}
                      {user.gender && <div><strong>Genre:</strong> {user.gender}</div>}
                      <div><strong>Créé le:</strong> {formatDate(user.created_at)}</div>
                      {user.updated_at !== user.created_at && (
                        <div><strong>Mis à jour le:</strong> {formatDate(user.updated_at)}</div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    {user.bio && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2">Bio</h4>
                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                          {user.bio}
                        </p>
                      </div>
                    )}
                    
                    {user.preferences && (
                      <details className="mb-2">
                        <summary className="cursor-pointer font-semibold text-sm">
                          🎯 Préférences
                        </summary>
                        <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-auto">
                          {typeof user.preferences === 'string' 
                            ? user.preferences 
                            : JSON.stringify(user.preferences, null, 2)
                          }
                        </pre>
                      </details>
                    )}
                    
                    {user.health_goals && (
                      <details>
                        <summary className="cursor-pointer font-semibold text-sm">
                          🎯 Objectifs santé
                        </summary>
                        <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-auto">
                          {typeof user.health_goals === 'string' 
                            ? user.health_goals 
                            : JSON.stringify(user.health_goals, null, 2)
                          }
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card className="mt-8 bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2">📍 Localisation de votre base de données</h3>
          <div className="text-sm text-gray-700">
            <div className="font-mono bg-white p-2 rounded mb-2">
              C:\Users\camar\Bureau\mindful-journey-ui\back-mindful-journey-iu\mindful-journey-back\database\database.sqlite
            </div>
            <p>
              Vous pouvez ouvrir ce fichier avec des outils comme <strong>DB Browser for SQLite</strong> ou 
              l'extension <strong>SQLite Viewer</strong> de VS Code.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseViewer;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Heart, 
  Zap, 
  Clock, 
  Star, 
  TrendingUp, 
  UserCheck,
  Target,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import apiService from '@/lib/api';

interface Suggestion {
  type: string;
  title: string;
  description: string;
  duration?: string;
  difficulty?: string;
  priority?: string;
  icon?: string;
  category?: string;
  score?: number;
  tags?: string[];
  action_steps?: string[];
}

interface HealthProfessional {
  id?: string;
  name: string;
  specialty: string;
  rating: number;
  experience: string;
  price: string | number;
  availability: string;
  consultationType?: 'video' | 'inPerson' | 'both';
  image?: string;
  reason?: string;
}

interface SuggestionGroup {
  challenges: Suggestion[];
  practitioners: HealthProfessional[];
  content: Suggestion[];
  immediate_actions: Suggestion[];
}

interface IntelligentSuggestionsProps {
  userContext: {
    mood?: number;
    stress?: number;
    energy?: number;
    diagnostic?: any;
  };
  onSuggestionSelect?: (suggestion: Suggestion) => void;
  onPractitionerOpen?: (p: HealthProfessional) => void;
  onPractitionerBook?: (p: HealthProfessional) => void;
}

const IntelligentSuggestions: React.FC<IntelligentSuggestionsProps> = ({
  userContext,
  onSuggestionSelect,
  onPractitionerOpen,
  onPractitionerBook
}) => {
  const [suggestions, setSuggestions] = useState<SuggestionGroup | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Diagnostic positif ? (stress ≤ 2, mood ≥ 4, energy ≥ 3)
  const isPositive = (() => {
    const s = userContext?.stress;
    const m = userContext?.mood;
    const e = userContext?.energy;
    if (s == null || m == null || e == null) return false;
    return s <= 2 && m >= 4 && e >= 3;
  })();

  const fetchSuggestions = async () => {
    setLoading(true);
    setError(null);

    try {
      const context = {
        ...userContext,
        time_of_day: new Date().getHours()
      };

      const response = await apiService.recommendations.getPersonalized(context);
      setSuggestions(response.suggestions);
      setLastUpdate(new Date());
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des suggestions');
      console.error('Erreur suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userContext?.mood, userContext?.stress, userContext?.energy]);

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getDifficultyIcon = (difficulty?: string) => {
    switch (difficulty) {
      case 'facile': return '🟢';
      case 'moyen': return '🟡';
      case 'difficile': return '🔴';
      default: return '⚪';
    }
  };

  const renderEmoji = (emoji?: string) => {
    if (!emoji) return <Sparkles className="h-5 w-5" />;
    return <span className="text-lg">{emoji}</span>;
  };

  const renderImmediateActions = () => {
    if (!suggestions?.immediate_actions?.length) return null;

    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-red-700">
            <Zap className="h-5 w-5" />
            Actions immédiates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {suggestions.immediate_actions.map((action, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border border-red-200">
              <div className="flex items-start justify-between mb-2 gap-2 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  {renderEmoji(action.icon)}
                  <h4 className="font-medium text-red-800 line-clamp-1 break-anywhere">{action.title}</h4>
                </div>
                <Badge className={getPriorityColor(action.priority)}>
                  {action.priority}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2 break-anywhere">{action.description}</p>
              {action.action_steps && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-700">Étapes :</p>
                  <ol className="text-xs text-gray-600 space-y-1">
                    {action.action_steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex items-start gap-2 break-anywhere">
                        <span className="text-red-500 font-bold">{stepIndex + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              <Button 
                size="sm" 
                className="mt-3 w-full bg-red-600 hover:bg-red-700"
                onClick={() => onSuggestionSelect?.(action)}
              >
                Commencer maintenant
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  const renderChallenges = () => {
    if (!suggestions?.challenges?.length) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-500" />
            Défis recommandés
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {suggestions.challenges.map((challenge, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border">
              <div className="flex items-start justify-between mb-2 gap-2 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  {renderEmoji(challenge.icon)}
                  <h4 className="font-medium line-clamp-1 break-anywhere">{challenge.title}</h4>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge variant="outline">{getDifficultyIcon(challenge.difficulty)} {challenge.duration}</Badge>
                  <Badge variant="secondary">{challenge.category}</Badge>
                  {challenge.score && (
                    <div className="flex items-center gap-1 text-xs text-gray-500"><Star className="h-3 w-3" />{challenge.score}% match</div>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2 break-anywhere">{challenge.description}</p>
              {challenge.action_steps && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-medium text-gray-700">Étapes :</p>
                  <ol className="text-xs text-gray-600 space-y-1">
                    {challenge.action_steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 break-anywhere">
                        <span className="text-orange-500 font-bold">{i + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              <Button size="sm" className="mt-3 w-full" variant="outline" onClick={() => onSuggestionSelect?.(challenge)}>
                Commencer
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  const openProfile = (p: HealthProfessional) => {
    if (onPractitionerOpen) return onPractitionerOpen(p);
    const evt = new CustomEvent('openSpecialistProfile', { detail: p });
    window.dispatchEvent(evt);
  };

  const bookPractitioner = (p: HealthProfessional) => {
    if (onPractitionerBook) return onPractitionerBook(p);
    const evt = new CustomEvent('bookSpecialist', { detail: p });
    window.dispatchEvent(evt);
  };

  const renderPractitioners = () => {
    // Masquer totalement les praticiens si le diagnostic est positif
    if (isPositive) return null;
    if (!suggestions?.practitioners?.length) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-blue-500" />
            Praticiens recommandés
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {suggestions.practitioners.map((practitioner, index) => (
            <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => openProfile(practitioner)}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium">{practitioner.name}</h4>
                  <p className="text-sm text-gray-600">{practitioner.specialty}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 text-yellow-500" />
                    {practitioner.rating}
                  </div>
                  <p className="text-sm text-gray-500">{practitioner.experience}</p>
                </div>
              </div>
              <p className="text-sm text-blue-600 mb-2">{practitioner.reason}</p>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {practitioner.availability} • {typeof practitioner.price === 'number' ? `${practitioner.price}€` : practitioner.price}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); openProfile(practitioner); }}>
                    Consulter
                  </Button>
                  <Button size="sm" className="bg-wellness-gradient text-white" onClick={(e) => { e.stopPropagation(); bookPractitioner(practitioner); }}>
                    Prendre RDV
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  const renderContent = () => {
    if (!suggestions?.content?.length) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Contenus suggérés
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {suggestions.content.map((content, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border">
              <div className="flex items-start justify-between mb-2 gap-2 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  {renderEmoji(content.icon)}
                  <h4 className="font-medium line-clamp-1 break-anywhere">{content.title}</h4>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge variant="outline">{content.duration}</Badge>
                  <Badge variant="secondary">{content.category}</Badge>
                </div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2 break-anywhere">{content.description}</p>
              {content.tags && (
                <div className="mt-2 flex gap-1 flex-wrap">
                  {content.tags.slice(0, 3).map((tag, tagIndex) => (
                    <span key={tagIndex} className="text-xs bg-gray-100 px-2 py-1 rounded line-clamp-1 break-anywhere">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <Button size="sm" variant="outline" className="mt-3 w-full" onClick={() => onSuggestionSelect?.(content)}>
                Regarder
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Génération de suggestions personnalisées...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertDescription className="text-red-700">
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec mise à jour */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Suggestions personnalisées
          </h2>
          {lastUpdate && (
            <p className="text-sm text-gray-500 mt-1">
              Dernière mise à jour : {lastUpdate.toLocaleTimeString()}
            </p>
          )}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchSuggestions}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Actions immédiates (priorité haute) */}
      {renderImmediateActions()}

      {/* Sections empilées pour meilleure lisibilité */}
      <div className="space-y-6">
        {renderChallenges()}
        {renderContent()}
      </div>

      {/* Praticiens (largeur complète) */}
      {renderPractitioners()}
    </div>
  );
};

export default IntelligentSuggestions;

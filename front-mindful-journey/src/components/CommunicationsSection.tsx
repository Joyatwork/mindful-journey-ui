import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import testApiService from '@/lib/test-api';
import {
    Megaphone,
    Calendar,
    Eye,
    Heart,
    ArrowRight,
    AlertCircle,
    Loader2
} from 'lucide-react';

interface Communication {
    id: number;
    title: string;
    content: string;
    image_url?: string;
    type: 'annonce' | 'campagne' | 'evenement' | 'barometre' | 'bilan' | 'conseil' | 'autre';
    objective: 'prevention' | 'engagement' | 'info';
    status: 'draft' | 'published' | 'archived';
    published_at: string;
    start_date?: string;
    end_date?: string;
    progress?: number;
    cta_label?: string;
    cta_target?: string;
    cta_clicks: number;
    view_count: number;
    interested_count: number;
    reminder_count: number;
}

const typeLabels: Record<string, string> = {
    'annonce': '📢 Annonce',
    'campagne': '📋 Campagne',
    'evenement': '🎉 Événement',
    'barometre': '📊 Baromètre',
    'bilan': '📈 Bilan',
    'conseil': '💡 Conseil',
    'autre': '📌 Autre'
};

const objectiveLabels: Record<string, string> = {
    'prevention': 'Prévention',
    'engagement': 'Engagement',
    'info': 'Information'
};

const objectiveColors: Record<string, string> = {
    'prevention': 'bg-orange-100 text-orange-800 border-orange-200',
    'engagement': 'bg-blue-100 text-blue-800 border-blue-200',
    'info': 'bg-green-100 text-green-800 border-green-200'
};

export const CommunicationsSection: React.FC = () => {
    const { toast } = useToast();
    const [communications, setCommunications] = useState<Communication[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
    const [interestIds, setInterestIds] = useState<Set<number>>(new Set());

    // Charger les communications
    useEffect(() => {
        loadCommunications();
    }, []);

    const loadCommunications = async () => {
        setLoading(true);
        try {
            const data = await testApiService.communications.list();
            setCommunications(data || []);
        } catch (error) {
            toast({
                title: 'Erreur',
                description: 'Impossible de charger les annonces',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInterest = async (commId: number) => {
        try {
            await testApiService.communications.recordInterest(commId);
            setInterestIds(new Set([...interestIds, commId]));
            toast({
                title: '❤️ Intérêt enregistré!',
                description: 'Nous avons noté votre intérêt pour cette annonce.',
            });
        } catch (error) {
            toast({
                title: 'Erreur',
                description: 'Impossible d\'enregistrer votre intérêt',
                variant: 'destructive',
            });
        }
    };

    const handleCtaClick = async (commId: number, url?: string) => {
        try {
            await testApiService.communications.recordCtaClick(commId);
            if (url) {
                window.open(url, '_blank');
            }
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement du clic:', error);
        }
    };

    const filteredCommunications = selectedFilter
        ? communications.filter(c => c.type === selectedFilter)
        : communications;

    const types = Array.from(new Set(communications.map(c => c.type)));

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (communications.length === 0) {
        return (
            <Card className="p-8 text-center">
                <Megaphone className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Aucune annonce pour le moment</p>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Megaphone className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold">Annonces & Communications</h2>
                </div>
                <Badge variant="outline" className="bg-blue-50">
                    {filteredCommunications.length} annonce{filteredCommunications.length > 1 ? 's' : ''}
                </Badge>
            </div>

            {/* Filtres */}
            {types.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                    <Button
                        onClick={() => setSelectedFilter(null)}
                        variant={selectedFilter === null ? 'default' : 'outline'}
                        className="whitespace-nowrap"
                    >
                        Tous
                    </Button>
                    {types.map(type => (
                        <Button
                            key={type}
                            onClick={() => setSelectedFilter(type)}
                            variant={selectedFilter === type ? 'default' : 'outline'}
                            className="whitespace-nowrap"
                        >
                            {typeLabels[type] || type}
                        </Button>
                    ))}
                </div>
            )}

            {/* Liste des communications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCommunications.map(comm => (
                    <Card
                        key={comm.id}
                        className="p-6 hover:shadow-lg transition-shadow border border-gray-200"
                    >
                        {/* Image */}
                        {comm.image_url && (
                            <img
                                src={comm.image_url}
                                alt={comm.title}
                                className="w-full h-40 object-cover rounded-lg mb-4"
                            />
                        )}

                        {/* Badges */}
                        <div className="flex gap-2 mb-3 flex-wrap">
                            <Badge variant="outline" className="bg-gray-50">
                                {typeLabels[comm.type] || comm.type}
                            </Badge>
                            <Badge
                                variant="outline"
                                className={objectiveColors[comm.objective] || 'bg-gray-100 text-gray-800 border-gray-200'}
                            >
                                {objectiveLabels[comm.objective]}
                            </Badge>
                            {comm.progress !== undefined && (
                                <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200">
                                    {comm.progress}% complété
                                </Badge>
                            )}
                        </div>

                        {/* Titre */}
                        <h3 className="text-lg font-semibold mb-2 line-clamp-2">{comm.title}</h3>

                        {/* Contenu */}
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">{comm.content}</p>

                        {/* Dates */}
                        {(comm.start_date || comm.published_at) && (
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                                <Calendar className="h-4 w-4" />
                                <span>
                                    {comm.start_date
                                        ? new Date(comm.start_date).toLocaleDateString('fr-FR')
                                        : new Date(comm.published_at).toLocaleDateString('fr-FR')}
                                </span>
                            </div>
                        )}

                        {/* Statistiques */}
                        <div className="flex gap-4 mb-4 text-xs text-gray-500 border-t pt-4">
                            <div className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                {comm.view_count} vue{comm.view_count > 1 ? 's' : ''}
                            </div>
                            <div className="flex items-center gap-1">
                                <Heart className="h-4 w-4" />
                                {comm.interested_count} intéressé{comm.interested_count > 1 ? 's' : ''}
                            </div>
                        </div>

                        {/* Boutons d'action */}
                        <div className="flex gap-2">
                            <Button
                                onClick={() => handleInterest(comm.id)}
                                disabled={interestIds.has(comm.id)}
                                variant="outline"
                                className="flex-1"
                            >
                                <Heart
                                    className={`h-4 w-4 mr-2 ${interestIds.has(comm.id) ? 'fill-red-500 text-red-500' : ''
                                        }`}
                                />
                                {interestIds.has(comm.id) ? 'Intéressé' : 'S\'intéresser'}
                            </Button>

                            {comm.cta_label && comm.cta_target && (
                                <Button
                                    onClick={() => handleCtaClick(comm.id, comm.cta_target)}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    {comm.cta_label}
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default CommunicationsSection;

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
    Loader2,
    Menu,
    ChevronDown,
    UserPlus,
    UserMinus,
    CheckCircle,
    BookOpen,
    BookCheck
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
    // Participation aux campagnes
    is_participant?: boolean;
    participation_status?: 'invited' | 'joined' | 'completed' | 'withdrawn' | null;
    participation_progress?: number | null;
    // Lecture
    is_real_campaign?: boolean;
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
    const [menuOpen, setMenuOpen] = useState(false);
    const [joiningCampaign, setJoiningCampaign] = useState<number | null>(null);
    const [readIds, setReadIds] = useState<Set<number>>(new Set());
    const [markingRead, setMarkingRead] = useState<number | null>(null);

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

    const handleJoinCampaign = async (commId: number) => {
        setJoiningCampaign(commId);
        try {
            await testApiService.communications.joinCampaign(commId);
            // Mettre à jour l'état local
            setCommunications(prev => prev.map(c =>
                c.id === commId
                    ? { ...c, is_participant: true, participation_status: 'joined' as const }
                    : c
            ));
            toast({
                title: '✅ Inscription réussie!',
                description: 'Vous êtes inscrit à cette campagne.',
            });
        } catch (error) {
            toast({
                title: 'Erreur',
                description: 'Impossible de vous inscrire à la campagne',
                variant: 'destructive',
            });
        } finally {
            setJoiningCampaign(null);
        }
    };

    const handleLeaveCampaign = async (commId: number) => {
        setJoiningCampaign(commId);
        try {
            await testApiService.communications.leaveCampaign(commId);
            setCommunications(prev => prev.map(c =>
                c.id === commId
                    ? { ...c, is_participant: false, participation_status: 'withdrawn' as const }
                    : c
            ));
            toast({
                title: 'Désinscription effectuée',
                description: 'Vous n\'êtes plus inscrit à cette campagne.',
            });
        } catch (error) {
            toast({
                title: 'Erreur',
                description: 'Impossible de vous désinscrire',
                variant: 'destructive',
            });
        } finally {
            setJoiningCampaign(null);
        }
    };

    const handleMarkAsRead = async (commId: number) => {
        setMarkingRead(commId);
        try {
            await testApiService.communications.markAsRead(commId);
            setReadIds(new Set([...readIds, commId]));
            toast({
                title: '📖 Annonce lue',
                description: 'Les RH ont été notifiés de votre lecture.',
            });
        } catch (error) {
            toast({
                title: 'Erreur',
                description: 'Impossible de marquer comme lu',
                variant: 'destructive',
            });
        } finally {
            setMarkingRead(null);
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
        <div className="space-y-4 px-1">
            {/* En-tête */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                    <Megaphone className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <h2 className="text-xl font-bold truncate">Annonces</h2>
                </div>
                <Badge variant="outline" className="bg-blue-50 flex-shrink-0">
                    {filteredCommunications.length} annonce{filteredCommunications.length > 1 ? 's' : ''}
                </Badge>
            </div>

            {/* Menu burger filtres */}
            {types.length > 0 && (
                <div className="relative">
                    <Button
                        onClick={() => setMenuOpen(!menuOpen)}
                        variant="outline"
                        size="sm"
                        className="w-full justify-between"
                    >
                        <span className="flex items-center gap-2">
                            <Menu className="h-4 w-4" />
                            {selectedFilter ? typeLabels[selectedFilter] : 'Toutes les annonces'}
                        </span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                    </Button>

                    {menuOpen && (
                        <>
                            {/* Overlay pour fermer */}
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setMenuOpen(false)}
                            />
                            {/* Menu dropdown */}
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-20 overflow-hidden">
                                <button
                                    onClick={() => { setSelectedFilter(null); setMenuOpen(false); }}
                                    className={`w-full px-4 py-3 text-left text-sm flex items-center justify-between hover:bg-gray-50 ${selectedFilter === null ? 'bg-blue-50 text-blue-700 font-medium' : ''
                                        }`}
                                >
                                    Toutes les annonces
                                    {selectedFilter === null && <span className="text-blue-600">✓</span>}
                                </button>
                                {types.map(type => (
                                    <button
                                        key={type}
                                        onClick={() => { setSelectedFilter(type); setMenuOpen(false); }}
                                        className={`w-full px-4 py-3 text-left text-sm flex items-center justify-between hover:bg-gray-50 border-t ${selectedFilter === type ? 'bg-blue-50 text-blue-700 font-medium' : ''
                                            }`}
                                    >
                                        {typeLabels[type] || type}
                                        {selectedFilter === type && <span className="text-blue-600">✓</span>}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Liste des communications */}
            <div className="space-y-4">
                {filteredCommunications.map((comm, index) => (
                    <Card
                        key={`${comm.type}-${comm.id}-${index}`}
                        className="p-4 hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden"
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
                        <div className="flex gap-1.5 mb-3 flex-wrap">
                            <Badge variant="outline" className="bg-gray-50 text-xs">
                                {typeLabels[comm.type] || comm.type}
                            </Badge>
                            <Badge
                                variant="outline"
                                className={`text-xs ${objectiveColors[comm.objective] || 'bg-gray-100 text-gray-800 border-gray-200'}`}
                            >
                                {objectiveLabels[comm.objective]}
                            </Badge>
                            {comm.progress !== undefined && (
                                <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200 text-xs">
                                    {comm.progress}%
                                </Badge>
                            )}
                        </div>

                        {/* Titre */}
                        <h3 className="text-base font-semibold mb-2 line-clamp-2 break-words">{comm.title}</h3>

                        {/* Contenu */}
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2 break-words">{comm.content}</p>

                        {/* Dates */}
                        {(comm.start_date || comm.published_at) && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                                <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                                <span>
                                    {comm.start_date
                                        ? new Date(comm.start_date).toLocaleDateString('fr-FR')
                                        : new Date(comm.published_at).toLocaleDateString('fr-FR')}
                                </span>
                            </div>
                        )}

                        {/* Statistiques */}
                        <div className="flex gap-3 mb-3 text-xs text-gray-500 border-t pt-3">
                            <div className="flex items-center gap-1">
                                <Eye className="h-3.5 w-3.5" />
                                <span>{comm.view_count}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Heart className="h-3.5 w-3.5" />
                                <span>{comm.interested_count}</span>
                            </div>
                        </div>

                        {/* Boutons d'action */}
                        <div className="flex gap-2 flex-wrap">
                            {/* Bouton inscription campagne */}
                            {comm.type === 'campagne' && (
                                comm.is_participant ? (
                                    <Button
                                        onClick={() => handleLeaveCampaign(comm.id)}
                                        disabled={joiningCampaign === comm.id}
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 min-w-0 border-green-500 text-green-700 hover:bg-red-50 hover:border-red-500 hover:text-red-700 group"
                                    >
                                        {joiningCampaign === comm.id ? (
                                            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                                        ) : (
                                            <>
                                                <CheckCircle className="h-4 w-4 mr-1.5 flex-shrink-0 text-green-600 group-hover:hidden" />
                                                <UserMinus className="h-4 w-4 mr-1.5 flex-shrink-0 text-red-600 hidden group-hover:block" />
                                            </>
                                        )}
                                        <span className="truncate group-hover:hidden">Inscrit</span>
                                        <span className="truncate hidden group-hover:block">Se désinscrire</span>
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => handleJoinCampaign(comm.id)}
                                        disabled={joiningCampaign === comm.id}
                                        size="sm"
                                        className="flex-1 min-w-0 bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        {joiningCampaign === comm.id ? (
                                            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                                        ) : (
                                            <UserPlus className="h-4 w-4 mr-1.5 flex-shrink-0" />
                                        )}
                                        <span className="truncate">S'inscrire</span>
                                    </Button>
                                )
                            )}

                            {/* Bouton Marquer comme lu - pour les annonces (pas les campagnes) */}
                            {!comm.is_real_campaign && (
                                <Button
                                    onClick={() => handleMarkAsRead(comm.id)}
                                    disabled={readIds.has(comm.id) || markingRead === comm.id}
                                    variant="outline"
                                    size="sm"
                                    className={`flex-1 min-w-0 ${readIds.has(comm.id) ? 'border-emerald-500 text-emerald-700 bg-emerald-50' : ''}`}
                                >
                                    {markingRead === comm.id ? (
                                        <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                                    ) : readIds.has(comm.id) ? (
                                        <BookCheck className="h-4 w-4 mr-1.5 flex-shrink-0 text-emerald-600" />
                                    ) : (
                                        <BookOpen className="h-4 w-4 mr-1.5 flex-shrink-0" />
                                    )}
                                    <span className="truncate">{readIds.has(comm.id) ? 'Lu' : 'Marquer lu'}</span>
                                </Button>
                            )}

                            <Button
                                onClick={() => handleInterest(comm.id)}
                                disabled={interestIds.has(comm.id)}
                                variant="outline"
                                size="sm"
                                className="flex-1 min-w-0"
                            >
                                <Heart
                                    className={`h-4 w-4 mr-1.5 flex-shrink-0 ${interestIds.has(comm.id) ? 'fill-red-500 text-red-500' : ''
                                        }`}
                                />
                                <span className="truncate">{interestIds.has(comm.id) ? 'Intéressé' : 'Intéressé'}</span>
                            </Button>

                            {comm.cta_label && comm.cta_target && (
                                <Button
                                    onClick={() => handleCtaClick(comm.id, comm.cta_target)}
                                    size="sm"
                                    className="flex-1 min-w-0 bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <span className="truncate">{comm.cta_label}</span>
                                    <ArrowRight className="h-4 w-4 ml-1.5 flex-shrink-0" />
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

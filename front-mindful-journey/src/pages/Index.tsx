import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import testApiService from '@/lib/test-api';
import apiService from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
// import MoodSelector from '@/components/MoodSelector'; // Ancien sélecteur d'humeur déplacé vers la page mood-check
import WellnessCard from '@/components/WellnessCard';
import ProgressChart from '@/components/ProgressChart';
import ProgressPage from '@/components/ProgressPage';
import ChallengeFilter from '@/components/ChallengeFilter';
import DiagnosticStep from '@/components/DiagnosticStep';
import ProfilePage from '@/components/ProfilePage';
import HealthSpecialistSuggestions from '@/components/HealthSpecialistSuggestions';
import SpecialistProfile from '@/components/SpecialistProfile';
import BookingPage from '@/components/BookingPage';
import HealthProfessionalsList from '@/components/HealthProfessionalsList';
import MeditationContent from '@/components/MeditationContent';
import BreathingContent from '@/components/BreathingContent';
import SleepRoutineContent from '@/components/SleepRoutineContent';
import IntelligentSuggestions from '@/components/IntelligentSuggestions';
import AppointmentManagement from '@/components/AppointmentManagement';
import { useToast } from "@/hooks/use-toast";
import { useAppointments } from '@/hooks/useApi';
import { 
  Heart, 
  Brain, 
  Moon, 
  Zap, 
  Target, 
  TrendingUp, 
  Calendar,
  Star,
  Award,
  Bell,
  User,
  Settings,
  UserCheck,
  LogOut,
  ArrowLeft,
  Sparkles,
  Check
} from 'lucide-react';
import AnnualBackground from '@/components/AnnualBackground';
import AnnualOptionList from '@/components/AnnualOptionList';

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { appointments, isLoading: apptsLoading } = useAppointments();
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedMood, setSelectedMood] = useState<number>(); // Conservé pour suggestions
  const [challengeFilters, setChallengeFilters] = useState<string[]>([]);
  const [diagnosticStep, setDiagnosticStep] = useState(1);
  const [diagnosticAnswers, setDiagnosticAnswers] = useState<Record<string, any>>({});
  const [showPostDiagnosticSuggestions, setShowPostDiagnosticSuggestions] = useState(false);
  // Etat spécifique au parcours annuel (intro -> futur questionnaire personnalisé)
  const [annualStarted, setAnnualStarted] = useState(false);
  const [annualStep, setAnnualStep] = useState(1);
  const [annualAnswers, setAnnualAnswers] = useState<Record<string, any>>({});
  const [annualFinished, setAnnualFinished] = useState(false);
  const [annualGeneral, setAnnualGeneral] = useState(false); // écran question générale post-fin
  const [annualGeneralAnswer, setAnnualGeneralAnswer] = useState<string>(''); // réponse menu déroulant final
  const [annualFeelings, setAnnualFeelings] = useState(false); // écran des ressentis après la question générale
  const [annualFeelingsAnswer, setAnnualFeelingsAnswer] = useState<string[]>([]); // multi-sélection
  const [annualExplain, setAnnualExplain] = useState(false); // écran d'explication finale
  const [annualExplainText, setAnnualExplainText] = useState('');
  const [annualLikert, setAnnualLikert] = useState(false); // écran likert
  const [annualLikertAnswer, setAnnualLikertAnswer] = useState<string>('');
  const [annualLikertWork, setAnnualLikertWork] = useState(false); // deuxième écran likert (travail)
  const [annualLikertWorkAnswer, setAnnualLikertWorkAnswer] = useState<string>('');
  const [annualSatisfaction, setAnnualSatisfaction] = useState(false); // écran satisfaction 0..10
  const [annualSatisfactionAnswer, setAnnualSatisfactionAnswer] = useState<number | null>(null);
  const [annualExplainWhy, setAnnualExplainWhy] = useState(false); // nouvel écran explication après satisfaction
  const [annualExplainWhyText, setAnnualExplainWhyText] = useState('');
  const [annualMotivation, setAnnualMotivation] = useState(false); // écran motivation final transition
  const [annualWorkSchedule, setAnnualWorkSchedule] = useState(false); // nouvel écran horaires de travail
  const [annualWorkScheduleAnswer, setAnnualWorkScheduleAnswer] = useState('');
  const [annualWorkload, setAnnualWorkload] = useState(false); // écran charge de travail
  const [annualWorkloadAnswer, setAnnualWorkloadAnswer] = useState<number | null>(null);
  const [annualTaskDifficulty, setAnnualTaskDifficulty] = useState(false); // écran difficulté tâches
  const [annualTaskDifficultyAnswer, setAnnualTaskDifficultyAnswer] = useState<number | null>(null);
  const [annualPhysicalFatigue, setAnnualPhysicalFatigue] = useState(false); // écran fatigue physique
  const [annualPhysicalFatigueAnswer, setAnnualPhysicalFatigueAnswer] = useState<number | null>(null);
  const [annualMentalFatigue, setAnnualMentalFatigue] = useState(false); // écran fatigue mentale
  const [annualMentalFatigueAnswer, setAnnualMentalFatigueAnswer] = useState<number | null>(null);
  const [annualMentalFatigueExplain, setAnnualMentalFatigueExplain] = useState(false); // écran explication fatigue mentale
  const [annualMentalFatigueExplainText, setAnnualMentalFatigueExplainText] = useState('');
  const [annualReassure, setAnnualReassure] = useState(false); // écran réassurance final
  const [annualPain, setAnnualPain] = useState(false); // écran niveau douleur
  const [annualPainAnswer, setAnnualPainAnswer] = useState<number | null>(null);
  const [annualPainLocation, setAnnualPainLocation] = useState(false); // écran localisation douleur
  const [annualPainLocationText, setAnnualPainLocationText] = useState('');
  const [annualAnxiety, setAnnualAnxiety] = useState(false); // écran anxiété
  const [annualAnxietyAnswer, setAnnualAnxietyAnswer] = useState<number | null>(null);
  const [annualAnxietyExplain, setAnnualAnxietyExplain] = useState(false); // écran explication anxiété (étape 22)
  const [annualAnxietyExplainText, setAnnualAnxietyExplainText] = useState('');
  const [annualSleepQuality, setAnnualSleepQuality] = useState(false); // écran qualité sommeil (étape 23)
  const [annualSleepQualityAnswer, setAnnualSleepQualityAnswer] = useState<number | null>(null);
  const [annualSleepQualityExplain, setAnnualSleepQualityExplain] = useState(false); // écran explication sommeil (étape 24)
  const [annualSleepQualityExplainText, setAnnualSleepQualityExplainText] = useState('');
  const [annualSleepDuration, setAnnualSleepDuration] = useState(false); // écran durée sommeil (étape 25)
  const [annualSleepDurationAnswer, setAnnualSleepDurationAnswer] = useState<string>('');
  const [annualCareMessage, setAnnualCareMessage] = useState(false); // écran message rassurant (étape 26)
  const [annualNutrition, setAnnualNutrition] = useState(false); // écran alimentation saine (étape 27)
  const [annualNutritionAnswer, setAnnualNutritionAnswer] = useState<number | null>(null);
  const [annualNutritionExplain, setAnnualNutritionExplain] = useState(false); // écran explication alimentation (étape 28)
  const [annualNutritionExplainText, setAnnualNutritionExplainText] = useState('');
  const [annualPhysicalActivity, setAnnualPhysicalActivity] = useState(false); // écran activité physique (étape 29)
  const [annualPhysicalActivityAnswer, setAnnualPhysicalActivityAnswer] = useState<string>('');
  const [annualPhysicalActivityOpen, setAnnualPhysicalActivityOpen] = useState(false); // ouverture menu activité physique
  const [annualPhysicalActivityDetail, setAnnualPhysicalActivityDetail] = useState(false); // écran détail activité (étape 30)
  const [annualPhysicalActivityDetailText, setAnnualPhysicalActivityDetailText] = useState('');
  const [annualPhysicalActivityNoExplain, setAnnualPhysicalActivityNoExplain] = useState(false); // écran explication si NON (étape 31)
  const [annualPhysicalActivityNoExplainText, setAnnualPhysicalActivityNoExplainText] = useState('');
  const [annualAlmostThere, setAnnualAlmostThere] = useState(false); // écran transition "On y est presque" (étape 32)
  const [annualSymptoms, setAnnualSymptoms] = useState(false); // étape 33 symptômes
  const [annualSymptomsSelected, setAnnualSymptomsSelected] = useState<string[]>(['Picotement']);
  const [annualWorkstation, setAnnualWorkstation] = useState(false); // étape 34 aménagement poste
  const [annualWorkstationText, setAnnualWorkstationText] = useState('');
  const [annualPractitionerNote, setAnnualPractitionerNote] = useState(false); // étape 35 note praticien
  const [annualPractitionerNoteText, setAnnualPractitionerNoteText] = useState('');
  const [annualConclusion, setAnnualConclusion] = useState(false); // étape 36 conclusion finale
  const annualStoragePrefix = React.useMemo(() => (user?.id ? `annual:${user.id}:` : 'annual:guest:'), [user?.id]);

  // --------------------------------------------------
  // Progression unifiée du parcours annuel
  // Étapes (7): 1=gender,2=age,3=department,4=general,5=feelings,6=explain,7=likert
  const ANNUAL_TOTAL_STEPS = 36;
  const getAnnualProgressStep = () => {
    if (!annualStarted) return 0;
    if (!annualFinished) return annualStep; // 1..3
    // après les 3 premières questions de base
    if (annualFinished && !annualGeneral) return 3; // écran transition
    if (annualFinished && annualGeneral && !annualFeelings) return 4; // écran général ou juste après
    if (annualFinished && annualGeneral && annualFeelings && !annualExplain) return 5;
    if (annualFinished && annualGeneral && annualFeelings && annualExplain && !annualLikert) return 6;
  if (annualFinished && annualGeneral && annualFeelings && annualExplain && annualLikert && !annualLikertWork) return 7;
  if (annualFinished && annualGeneral && annualFeelings && annualExplain && annualLikert && annualLikertWork && !annualSatisfaction) return 8;
  if (annualFinished && annualGeneral && annualFeelings && annualExplain && annualLikert && annualLikertWork && annualSatisfaction && !annualExplainWhy) return 9;
  if (annualFinished && annualGeneral && annualFeelings && annualExplain && annualLikert && annualLikertWork && annualSatisfaction && annualExplainWhy && !annualMotivation) return 10;
  if (annualFinished && annualGeneral && annualFeelings && annualExplain && annualLikert && annualLikertWork && annualSatisfaction && annualExplainWhy && annualMotivation && !annualWorkSchedule) return 11;
  if (annualFinished && annualGeneral && annualFeelings && annualExplain && annualLikert && annualLikertWork && annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && !annualWorkload) return 12;
  if (annualFinished && annualGeneral && annualFeelings && annualExplain && annualLikert && annualLikertWork && annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && annualWorkload && !annualTaskDifficulty) return 13;
  if (annualFinished && annualGeneral && annualFeelings && annualExplain && annualLikert && annualLikertWork && annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && annualWorkload && annualTaskDifficulty && !annualPhysicalFatigue) return 14; // difficulté tâches
  if (annualFinished && annualGeneral && annualFeelings && annualExplain && annualLikert && annualLikertWork && annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && annualWorkload && annualTaskDifficulty && annualPhysicalFatigue && !annualMentalFatigue) return 15; // fatigue physique
  if (annualFinished && annualGeneral && annualFeelings && annualExplain && annualLikert && annualLikertWork && annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && annualWorkload && annualTaskDifficulty && annualPhysicalFatigue && annualMentalFatigue && !annualMentalFatigueExplain) return 16; // fatigue mentale
  if (annualFinished && annualGeneral && annualFeelings && annualExplain && annualLikert && annualLikertWork && annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && annualWorkload && annualTaskDifficulty && annualPhysicalFatigue && annualMentalFatigue && annualMentalFatigueExplain && !annualReassure) return 17; // explication fatigue mentale
  if (annualFinished && annualGeneral && annualFeelings && annualExplain && annualLikert && annualLikertWork && annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && annualWorkload && annualTaskDifficulty && annualPhysicalFatigue && annualMentalFatigue && annualMentalFatigueExplain && annualReassure && !annualPain) return 18; // réassurance
  if (annualFinished && annualGeneral && annualFeelings && annualExplain && annualLikert && annualLikertWork && annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && annualWorkload && annualTaskDifficulty && annualPhysicalFatigue && annualMentalFatigue && annualMentalFatigueExplain && annualReassure && annualPain && !annualPainLocation) return 19; // douleur intensité
  if (annualFinished && annualGeneral && annualFeelings && annualExplain && annualLikert && annualLikertWork && annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && annualWorkload && annualTaskDifficulty && annualPhysicalFatigue && annualMentalFatigue && annualMentalFatigueExplain && annualReassure && annualPain && annualPainLocation && !annualAnxiety) return 20; // localisation douleur
  if (annualFinished && annualGeneral && annualFeelings && annualExplain && annualLikert && annualLikertWork && annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && annualWorkload && annualTaskDifficulty && annualPhysicalFatigue && annualMentalFatigue && annualMentalFatigueExplain && annualReassure && annualPain && annualPainLocation && annualAnxiety && !annualAnxietyExplain) return 21; // anxiété
  if (annualFinished && annualGeneral && annualFeelings && annualExplain && annualLikert && annualLikertWork && annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && annualWorkload && annualTaskDifficulty && annualPhysicalFatigue && annualMentalFatigue && annualMentalFatigueExplain && annualReassure && annualPain && annualPainLocation && annualAnxiety && annualAnxietyExplain && !annualSleepQuality) return 22; // explication anxiété
  if (annualFinished && annualGeneral && annualFeelings && annualExplain && annualLikert && annualLikertWork && annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && annualWorkload && annualTaskDifficulty && annualPhysicalFatigue && annualMentalFatigue && annualMentalFatigueExplain && annualReassure && annualPain && annualPainLocation && annualAnxiety && annualAnxietyExplain && annualSleepQuality && !annualSleepQualityExplain) return 23; // qualité sommeil
  if (annualFinished && annualGeneral && annualFeelings && annualExplain && annualLikert && annualLikertWork && annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && annualWorkload && annualTaskDifficulty && annualPhysicalFatigue && annualMentalFatigue && annualMentalFatigueExplain && annualReassure && annualPain && annualPainLocation && annualAnxiety && annualAnxietyExplain && annualSleepQuality && annualSleepQualityExplain && !annualSleepDuration) return 24; // explication sommeil
  if (annualFinished && annualGeneral && annualFeelings && annualExplain && annualLikert && annualLikertWork && annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && annualWorkload && annualTaskDifficulty && annualPhysicalFatigue && annualMentalFatigue && annualMentalFatigueExplain && annualReassure && annualPain && annualPainLocation && annualAnxiety && annualAnxietyExplain && annualSleepQuality && annualSleepQualityExplain && annualSleepDuration && !annualCareMessage) return 25; // durée sommeil
  if (annualFinished && annualGeneral && annualFeelings && annualExplain && annualLikert && annualLikertWork && annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && annualWorkload && annualTaskDifficulty && annualPhysicalFatigue && annualMentalFatigue && annualMentalFatigueExplain && annualReassure && annualPain && annualPainLocation && annualAnxiety && annualAnxietyExplain && annualSleepQuality && annualSleepQualityExplain && annualSleepDuration && annualCareMessage && !annualNutrition) return 26; // message rassurant
  if (annualFinished && annualGeneral && annualFeelings && annualExplain && annualLikert && annualLikertWork && annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && annualWorkload && annualTaskDifficulty && annualPhysicalFatigue && annualMentalFatigue && annualMentalFatigueExplain && annualReassure && annualPain && annualPainLocation && annualAnxiety && annualAnxietyExplain && annualSleepQuality && annualSleepQualityExplain && annualSleepDuration && annualCareMessage && annualNutrition && !annualNutritionExplain) return 27; // alimentation saine
  if (annualFinished && annualGeneral && annualFeelings && annualExplain && annualLikert && annualLikertWork && annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && annualWorkload && annualTaskDifficulty && annualPhysicalFatigue && annualMentalFatigue && annualMentalFatigueExplain && annualReassure && annualPain && annualPainLocation && annualAnxiety && annualAnxietyExplain && annualSleepQuality && annualSleepQualityExplain && annualSleepDuration && annualCareMessage && annualNutrition && annualNutritionExplain && !annualPhysicalActivity) return 28; // explication alimentation
  if (annualFinished && annualGeneral && annualFeelings && annualExplain && annualLikert && annualLikertWork && annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && annualWorkload && annualTaskDifficulty && annualPhysicalFatigue && annualMentalFatigue && annualMentalFatigueExplain && annualReassure && annualPain && annualPainLocation && annualAnxiety && annualAnxietyExplain && annualSleepQuality && annualSleepQualityExplain && annualSleepDuration && annualCareMessage && annualNutrition && annualNutritionExplain && annualPhysicalActivity && !annualPhysicalActivityDetail && !annualPhysicalActivityNoExplain && !annualAlmostThere) return 29; // activité physique
  if (annualFinished && annualGeneral && annualFeelings && annualExplain && annualLikert && annualLikertWork && annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && annualWorkload && annualTaskDifficulty && annualPhysicalFatigue && annualMentalFatigue && annualMentalFatigueExplain && annualReassure && annualPain && annualPainLocation && annualAnxiety && annualAnxietyExplain && annualSleepQuality && annualSleepQualityExplain && annualSleepDuration && annualCareMessage && annualNutrition && annualNutritionExplain && annualPhysicalActivity && annualPhysicalActivityDetail && !annualAlmostThere) return 30; // détail activité physique
  if (annualFinished && annualGeneral && annualFeelings && annualExplain && annualLikert && annualLikertWork && annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && annualWorkload && annualTaskDifficulty && annualPhysicalFatigue && annualMentalFatigue && annualMentalFatigueExplain && annualReassure && annualPain && annualPainLocation && annualAnxiety && annualAnxietyExplain && annualSleepQuality && annualSleepQualityExplain && annualSleepDuration && annualCareMessage && annualNutrition && annualNutritionExplain && annualPhysicalActivity && annualPhysicalActivityNoExplain && !annualPhysicalActivityDetail && !annualAlmostThere) return 31; // explication non activité
  if (annualFinished && annualGeneral && annualFeelings && annualExplain && annualLikert && annualLikertWork && annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && annualWorkload && annualTaskDifficulty && annualPhysicalFatigue && annualMentalFatigue && annualMentalFatigueExplain && annualReassure && annualPain && annualPainLocation && annualAnxiety && annualAnxietyExplain && annualSleepQuality && annualSleepQualityExplain && annualSleepDuration && annualCareMessage && annualNutrition && annualNutritionExplain && annualPhysicalActivity && (annualPhysicalActivityDetail || annualPhysicalActivityNoExplain) && annualAlmostThere && !annualSymptoms) return 32; // transition presque fini
  if (annualFinished && annualGeneral && annualFeelings && annualExplain && annualLikert && annualLikertWork && annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && annualWorkload && annualTaskDifficulty && annualPhysicalFatigue && annualMentalFatigue && annualMentalFatigueExplain && annualReassure && annualPain && annualPainLocation && annualAnxiety && annualAnxietyExplain && annualSleepQuality && annualSleepQualityExplain && annualSleepDuration && annualCareMessage && annualNutrition && annualNutritionExplain && annualPhysicalActivity && (annualPhysicalActivityDetail || annualPhysicalActivityNoExplain) && annualAlmostThere && annualSymptoms && !annualWorkstation) return 33; // symptômes
  if (annualFinished && annualGeneral && annualFeelings && annualExplain && annualLikert && annualLikertWork && annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && annualWorkload && annualTaskDifficulty && annualPhysicalFatigue && annualMentalFatigue && annualMentalFatigueExplain && annualReassure && annualPain && annualPainLocation && annualAnxiety && annualAnxietyExplain && annualSleepQuality && annualSleepQualityExplain && annualSleepDuration && annualCareMessage && annualNutrition && annualNutritionExplain && annualPhysicalActivity && (annualPhysicalActivityDetail || annualPhysicalActivityNoExplain) && annualAlmostThere && annualSymptoms && annualWorkstation && !annualPractitionerNote) return 34; // aménagement poste de travail
  if (annualFinished && annualGeneral && annualFeelings && annualExplain && annualLikert && annualLikertWork && annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && annualWorkload && annualTaskDifficulty && annualPhysicalFatigue && annualMentalFatigue && annualMentalFatigueExplain && annualReassure && annualPain && annualPainLocation && annualAnxiety && annualAnxietyExplain && annualSleepQuality && annualSleepQualityExplain && annualSleepDuration && annualCareMessage && annualNutrition && annualNutritionExplain && annualPhysicalActivity && (annualPhysicalActivityDetail || annualPhysicalActivityNoExplain) && annualAlmostThere && annualSymptoms && annualWorkstation && annualPractitionerNote && !annualConclusion) return 35; // note praticien
  if (annualFinished && annualGeneral && annualFeelings && annualExplain && annualLikert && annualLikertWork && annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && annualWorkload && annualTaskDifficulty && annualPhysicalFatigue && annualMentalFatigue && annualMentalFatigueExplain && annualReassure && annualPain && annualPainLocation && annualAnxiety && annualAnxietyExplain && annualSleepQuality && annualSleepQualityExplain && annualSleepDuration && annualCareMessage && annualNutrition && annualNutritionExplain && annualPhysicalActivity && (annualPhysicalActivityDetail || annualPhysicalActivityNoExplain) && annualAlmostThere && annualSymptoms && annualWorkstation && annualPractitionerNote && annualConclusion) return 36; // conclusion finale
    return 0;
  };
  const annualProgressStep = getAnnualProgressStep();
  const AnnualProgressBar: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={"mb-6 " + className} aria-label={`Progression ${annualProgressStep} sur ${ANNUAL_TOTAL_STEPS}`}>
      <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all" style={{ width: `${(annualProgressStep / ANNUAL_TOTAL_STEPS) * 100}%` }} />
      </div>
      <div className="flex justify-between mt-2 text-xs text-white/70">
        <span>Étape {annualProgressStep}</span>
        <span>{ANNUAL_TOTAL_STEPS} étapes</span>
      </div>
    </div>
  );

  // Questions du parcours annuel (personnalisable progressivement)
  const annualQuestions: Array<{id:string; question:string; type:'choice' | 'text'; options?:string[]; description?:string}> = [
    {
      id: 'gender',
  question: 'Tu es*',
      type: 'choice',
      options: ['Une femme','Un homme']
    },
    {
      id: 'age',
  question: 'Quel âge as-tu?*',
      description: 'Pour des conseils adaptés à ton suivi.',
      type: 'choice',
      options: [
        'Moins de 30 ans',
        '30 ans +',
        '40 ans +',
        '50 ans +',
        '60 ans +'
      ]
    },
    {
      id: 'department',
  question: 'Dans quel service/département\ntravailles-tu?*',
      description: 'Pour mieux sensibiliser ton responsable d\'équipe, à la prise en compte du bien-être dans le relationnel et la cohésion d\'équipe.',
      type: 'text'
    }
  ];

  // Charger automatiquement les réponses sauvegardées (auto-save) au démarrage du parcours annuel
  useEffect(() => {
    if (!annualStarted) return; // charge seulement une fois lancé
    try {
      const restored: Record<string, any> = {};
      for (const q of annualQuestions) {
        const k = annualStoragePrefix + q.id;
        const v = localStorage.getItem(k);
        if (v !== null) {
          try { restored[q.id] = JSON.parse(v); } catch { restored[q.id] = v; }
        }
      }
      if (Object.keys(restored).length) {
        setAnnualAnswers(prev => ({ ...restored, ...prev }));
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annualStarted, annualStoragePrefix]);
  const { toast } = useToast();
  type NotificationItem = {
    id: string;
    title: string;
    description?: string;
    createdAt: string; // ISO string
    read?: boolean;
  };
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const notifStorageKey = React.useMemo(() => (user?.id ? `notifications:${user.id}` : null), [user?.id]);
  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (n: Omit<NotificationItem, 'id' | 'createdAt'>) => {
    const item: NotificationItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      read: false,
      ...n,
    };
    setNotifications(prev => [item, ...prev]);
  };

  const markAllAsRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const clearNotifications = () => setNotifications([]);

  // Écouter les notifications envoyées depuis d'autres composants (ex: annulation/modification)
  useEffect(() => {
    const onBellNotify = (e: Event) => {
      const anyEvt = e as CustomEvent;
      const d = anyEvt?.detail as Partial<NotificationItem> | undefined;
      if (d && d.title) {
        addNotification({ title: d.title, description: d.description });
      }
    };
    window.addEventListener('bellNotification', onBellNotify as EventListener);
    return () => window.removeEventListener('bellNotification', onBellNotify as EventListener);
  }, []);

  // Charger les notifications persistées à la connexion / changement d'utilisateur
  useEffect(() => {
    if (!notifStorageKey) return;
    try {
      const raw = localStorage.getItem(notifStorageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as NotificationItem[];
        if (Array.isArray(parsed)) setNotifications(parsed);
      }
    } catch {}
  }, [notifStorageKey]);

  // Sauvegarder à chaque modification
  useEffect(() => {
    if (!notifStorageKey) return;
    try {
      localStorage.setItem(notifStorageKey, JSON.stringify(notifications));
    } catch {}
  }, [notifications, notifStorageKey]);
  const [savedDiagnostic, setSavedDiagnostic] = useState<any>(null); // legacy generic
  const [savedQuickDiagnostic, setSavedQuickDiagnostic] = useState<any>(null);
  const [savedAnnualDiagnostic, setSavedAnnualDiagnostic] = useState<any>(null);
  const [selectedSpecialist, setSelectedSpecialist] = useState<any>(null);

  const handleLogout = async () => {
    try {
      await logout();
  toast({ title: "Déconnexion réussie" });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const initialProgressData = [
    { date: 'Lun', mood: 3, stress: 4, energy: 3, sleep: 4 },
    { date: 'Mar', mood: 4, stress: 3, energy: 4, sleep: 3 },
    { date: 'Mer', mood: 3, stress: 5, energy: 2, sleep: 4 },
    { date: 'Jeu', mood: 4, stress: 2, energy: 4, sleep: 5 },
    { date: 'Ven', mood: 5, stress: 2, energy: 5, sleep: 4 },
    { date: 'Sam', mood: 4, stress: 3, energy: 4, sleep: 5 },
    { date: 'Dim', mood: 4, stress: 2, energy: 4, sleep: 4 },
  ];
  const [progressData, setProgressData] = useState(initialProgressData);

  // Helpers: transformer le diagnostic en scores (1..5)
  const clamp = (n:number, min:number, max:number) => Math.max(min, Math.min(max, n));
  const toFiveScale = (val:number) => clamp(Math.round(val / 2), 1, 5);
  const sleepQualityToScore = (txt?: string) => {
    if (!txt) return 3;
    const t = txt.toLowerCase();
    if (t.includes('excellent')) return 5;
    if (t.includes('bon')) return 4;
    if (t.includes('moyen')) return 3;
    if (t.includes('difficile')) return 2;
    if (t.includes('très mauvais') || t.includes('tres mauvais') || t.includes('insomnie')) return 1;
    return 3;
  };
  const moodEmojiToScore = (emoji?: string) => {
    if (!emoji) return undefined;
    // Mapping simple
    const map: Record<string, number> = {
      '😞': 1, '☹️': 2, '😐': 3, '🙂': 4, '😊': 4, '😄': 5, '😁': 5, '😀': 5
    };
    return map[emoji] ?? undefined;
  };

  // Quand un diagnostic est sauvegardé, injecter un point "Aujourd'hui" dans les graphiques
  useEffect(() => {
    if (!savedDiagnostic) return;
    const stress = Number(savedDiagnostic.stress_level) || 5;
    const energy = Number(savedDiagnostic.energy_level) || 5;
    const energyScore = toFiveScale(energy);
    let moodScore = moodEmojiToScore(savedDiagnostic.answers?.mood_emoji);
    if (moodScore === undefined) {
      // approx: plus le stress est élevé, plus la note d'humeur est basse
      moodScore = clamp(6 - toFiveScale(stress), 1, 5);
    }
    const sleepScore = sleepQualityToScore(savedDiagnostic.answers?.sleep_quality);

    const todayPoint = {
      date: "Aujourd'hui",
      mood: moodScore,
      stress: toFiveScale(stress),
      energy: energyScore,
      sleep: sleepScore,
    };
    setProgressData(prev => {
      const filtered = prev.filter(p => p.date !== "Aujourd'hui");
      return [...filtered, todayPoint];
    });
  }, [savedDiagnostic]);

  const wellnessCards = [
    {
      title: "Méditation guidée",
      description: "Séance de relaxation pour réduire le stress et améliorer la concentration",
      duration: "10 min",
      difficulty: "Facile" as const,
      category: "Mindfulness",
      icon: <Brain className="h-5 w-5 text-wellness-lavender" />,
      gradient: "bg-gradient-to-r from-purple-400 to-pink-400",
      contentType: "meditation"
    },
    {
      title: "Exercices de respiration",
      description: "Techniques de respiration pour gérer l'anxiété au quotidien",
      duration: "5 min",
      difficulty: "Facile" as const,
      category: "Gestion du stress",
      icon: <Heart className="h-5 w-5 text-red-400" />,
      gradient: "bg-wellness-gradient",
      contentType: "breathing"
    },
    {
      title: "Routine sommeil",
      description: "Améliorez la qualité de votre sommeil avec ces conseils personnalisés",
      duration: "15 min",
      difficulty: "Moyen" as const,
      category: "Sommeil",
      icon: <Moon className="h-5 w-5 text-purple-400" />,
      gradient: "bg-gradient-to-r from-purple-500 to-blue-500",
      contentType: "sleep"
    }
  ];

  // Lancer une action depuis les suggestions personnalisées
  const handleSuggestionAction = async (s: any) => {
    const rawType = (s?.type || s?.category || '').toString().toLowerCase();
    const title = (s?.title || '').toString();
    const titleLc = title.toLowerCase();

    // Navigation vers contenus dédiés
    if (rawType.includes('breath') || titleLc.includes('respir')) {
      setCurrentView('breathing');
      toast({ title: 'Exercice de respiration démarré' });
      return;
    }
    if (rawType.includes('medit') || titleLc.includes('méditation') || titleLc.includes('meditation') || rawType.includes('mindfulness')) {
      setCurrentView('meditation');
      toast({ title: 'Méditation démarrée' });
      return;
    }
    if (rawType.includes('sleep') || titleLc.includes('sommeil')) {
      setCurrentView('sleep-routine');
      toast({ title: 'Routine sommeil ouverte' });
      return;
    }

    // Micro-mouvements / étirements rapides → enregistrer une petite activité
    if (
      rawType.includes('move') || rawType.includes('mouvement') ||
      titleLc.includes('micro') || titleLc.includes('mouvement') || titleLc.includes('étirement') || titleLc.includes('etirement')
    ) {
      try {
        await apiService.wellness.logActivity({
          activity_id: 999, // identifiant générique pour action rapide
          duration: 2,      // minutes
          completion_rate: 100,
          notes: `Action immédiate: ${title}`,
        });
        toast({ title: 'Activité enregistrée', description: title || 'Micro‑mouvement' });
        window.dispatchEvent(new CustomEvent('bellNotification', { detail: { title: 'Activité complétée', description: title || 'Micro‑mouvement' } }));
      } catch (_) {
        toast({ title: 'Action lancée', description: title || 'Micro‑mouvement' });
      }
      return;
    }

    // Par défaut: simple confirmation
    toast({ title: 'Action lancée', description: title || 'Suggestion' });
  };

  // Consommer une suggestion passée via navigation state (depuis MoodEncouragementPage)
  useEffect(() => {
    const state: any = location.state;
    if (state?.autoSuggestion) {
      const suggestion = state.autoSuggestion;
      // Exécuter la logique existante
      handleSuggestionAction(suggestion);
      // Nettoyer l'état pour éviter répétition en back bouton
      navigate('.', { replace: true, state: {} });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  // Questions auto-diagnostic (hebdomadaire / rapide)
  const diagnosticQuestions = [
    {
      id: 'stress_level',
      question: 'Sur une échelle de 1 à 10, comment évaluez-vous votre niveau de stress actuel ?',
      type: 'slider' as const,
      min: 1,
      max: 10,
      labels: { min: 'Très détendu', max: 'Très stressé' }
    },
    {
      id: 'mood_emoji',
      question: 'Comment décririez-vous votre humeur générale cette semaine ?',
      type: 'emoji' as const
    },
    {
      id: 'sleep_quality',
      question: 'Comment qualifiez-vous votre sommeil ces derniers temps ?',
      type: 'choice' as const,
      options: [
        'Excellent, je me réveille reposé(e)',
        'Bon, quelques réveils nocturnes',
        'Moyen, j\'ai du mal à m\'endormir',
        'Difficile, je me réveille fatigué(e)',
        'Très mauvais, insomnies fréquentes'
      ]
    },
    {
      id: 'energy_level',
      question: 'Quel est votre niveau d\'énergie habituel pendant la journée ?',
      type: 'slider' as const,
      min: 1,
      max: 10,
      labels: { min: 'Très fatigué', max: 'Très énergique' }
    },
    {
      id: 'work_pressure',
      question: 'Ressentez-vous une pression importante dans votre travail ?',
      type: 'choice' as const,
      options: [
        'Jamais, mon travail est équilibré',
        'Rarement, seulement en période chargée',
        'Parfois, certaines semaines sont difficiles',
        'Souvent, je ressens une pression constante',
        'Toujours, je suis débordé(e) en permanence'
      ]
    }
  ];

  // Auto-diagnostic annuel: parcours personnalisé à venir (placeholder uniquement pour l'instant)

  // Vue active: diagnostic court ou annuel
  const isAnnual = currentView === 'diagnostic-annual';

  
  useEffect(() => {
    if (user) {
      toast({ title: `Bienvenue ${user.name} !`, description: "Comment vas-tu aujourd'hui ?" });
    }
  }, [user]);

  // Charger le diagnostic sauvegardé pour le réutiliser dans les suggestions
  useEffect(() => {
    const loadSavedDiagnostic = async () => {
      if (!user) return;
      try {
        const res = await apiService.diagnostic.get();
        const data = res?.data ?? null;
        if (data && (data.quick || data.annual)) {
          setSavedQuickDiagnostic(data.quick || null);
          setSavedAnnualDiagnostic(data.annual || null);
          setSavedDiagnostic(data.quick || data.annual || null); // compat
        } else {
          setSavedDiagnostic(data);
        }
      } catch (_) {
        // pas de diagnostic sauvegardé ou non disponible
      }
    };
    loadSavedDiagnostic();
  }, [user]);

  // Ecoute des événements en provenance de IntelligentSuggestions (ouvrir profil / réserver)
  useEffect(() => {
    const onOpenProfile = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) handleViewProfile(detail);
    };
    const onBook = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) handleBookAppointment(detail);
    };
    window.addEventListener('openSpecialistProfile', onOpenProfile as EventListener);
    window.addEventListener('bookSpecialist', onBook as EventListener);
    return () => {
      window.removeEventListener('openSpecialistProfile', onOpenProfile as EventListener);
      window.removeEventListener('bookSpecialist', onBook as EventListener);
    };
  }, []);

  const handleBookAppointment = (specialist: any) => {
    setSelectedSpecialist(specialist);
    setCurrentView('booking');
  };

  const handleViewProfile = (specialist: any) => {
    setSelectedSpecialist(specialist);
    setCurrentView('specialist-profile');
  };

  const [currentChallengeId, setCurrentChallengeId] = useState<number | null>(null);
  const [challengeList, setChallengeList] = useState<Array<{id:number; title:string; description?:string; status:string; completed_at?:string|null}>>([]);

  const loadChallenges = async () => {
    try {
      const res = await testApiService.challenges.list();
      const items = res?.data || [];
      setChallengeList(items);
    } catch (e) {
      console.warn('Impossible de charger les défis:', e);
    }
  };

  const pickChallengeId = async (contentType?: string) => {
    try {
  const res = await testApiService.challenges.list();
  const items = res?.data || [];
      // Mapper chaque carte vers un titre précis de défi
      const titleByType: Record<string, string> = {
        meditation: 'Défi Quotidien: Méditation 5 min',
        breathing: 'Défi Quotidien: Respiration 4-7-8',
        sleep: 'Défi Hebdo: Routine de sommeil',
      };
      let id: number | null = null;
      if (contentType && titleByType[contentType]) {
        const found = items.find((c:any) => c.title === titleByType[contentType]);
        id = found?.id ?? null;
      } else {
        id = items.length > 0 ? items[0].id : null;
      }
      if (!id) throw new Error('Aucun défi disponible');
      setCurrentChallengeId(id);
      return id;
    } catch (e) {
      console.error('Impossible de récupérer un défi:', e);
  toast({ title: "Aucun défi disponible", variant: "destructive" });
      return null;
    }
  };

  const handleWellnessCardAction = async (contentType: string) => {
    switch (contentType) {
      case 'meditation':
        {
          const id = await pickChallengeId('meditation');
          if (!id) return;
          try {
            const r = await testApiService.challenges.start(id);
            toast({ title: 'Défi démarré' });
            await loadChallenges();
          } catch (e:any) {
            // si déjà démarré, continuer silencieusement
            console.log('Start défi:', e?.message || e);
            try { await loadChallenges(); } catch {}
          }
        }
        setCurrentView('meditation');
        break;
      case 'breathing':
        {
          const id = await pickChallengeId('breathing');
          if (!id) return;
          try {
            const r = await testApiService.challenges.start(id);
            toast({ title: 'Défi démarré' });
            await loadChallenges();
          } catch (e:any) {
            console.log('Start défi:', e?.message || e);
            try { await loadChallenges(); } catch {}
          }
        }
        setCurrentView('breathing');
        break;
      case 'sleep':
        {
          const id = await pickChallengeId('sleep');
          if (!id) return;
          try {
            const r = await testApiService.challenges.start(id);
            toast({ title: 'Défi démarré' });
            await loadChallenges();
          } catch (e:any) {
            console.log('Start défi:', e?.message || e);
            try { await loadChallenges(); } catch {}
          }
        }
        setCurrentView('sleep-routine');
        break;
      default:
        console.log(`Starting ${contentType}`);
    }
  };

  const handleChallengeComplete = async (contentType?: string) => {
    console.log('Challenge completed!');
  const challengeId = await pickChallengeId(contentType);
  if (!challengeId) return;
    try {
      await testApiService.challenges.finish(challengeId);
  toast({ title: 'Défi enregistré dans la base' });
      // Recharger la liste des défis pour mettre à jour les statuts
      try {
  await loadChallenges();
      } catch (e) {
        console.warn('Impossible de recharger la liste des défis:', e);
      }
    } catch (err: any) {
      const msg = err?.message || "Erreur lors de l'enregistrement du défi";
  toast({ title: msg, variant: 'destructive' });
      console.error(err);
    }
  };

  const renderSuggestions = () => {
    // Construire le contexte à partir du dernier diagnostic sauvegardé
    const computedStress = savedDiagnostic ? toFiveScale(Number(savedDiagnostic.stress_level) || 3) : undefined;
    const computedEnergy = savedDiagnostic ? toFiveScale(Number(savedDiagnostic.energy_level) || 3) : undefined;
    let computedMood = savedDiagnostic ? moodEmojiToScore(savedDiagnostic.answers?.mood_emoji) : undefined;
    if (computedMood === undefined && computedStress !== undefined) {
      computedMood = clamp(6 - computedStress, 1, 5);
    }

    return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentView('dashboard')}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Suggestions Personnalisées</h1>
      </div>

      <IntelligentSuggestions
        userContext={{
          mood: selectedMood ?? computedMood,
          stress: computedStress ?? 3,
          energy: computedEnergy ?? 3,
          diagnostic: savedDiagnostic
        }}
        onSuggestionSelect={handleSuggestionAction}
        onPractitionerOpen={(p) => handleViewProfile(p)}
        onPractitionerBook={(p) => handleBookAppointment(p)}
      />
    </div>
    );
  }; // fin renderSuggestions

  const renderDashboard = () => {
    return (
    <div className="space-y-6 animate-fadeIn pt-4">
      {(() => {
        // Contexte pour les suggestions basées sur le dernier diagnostic
        const computedStress = savedDiagnostic ? toFiveScale(Number(savedDiagnostic.stress_level) || 3) : undefined;
        const computedEnergy = savedDiagnostic ? toFiveScale(Number(savedDiagnostic.energy_level) || 3) : undefined;
        let computedMood = savedDiagnostic ? moodEmojiToScore(savedDiagnostic.answers?.mood_emoji) : undefined;
        if (computedMood === undefined && computedStress !== undefined) {
          computedMood = clamp(6 - computedStress, 1, 5);
        }

        return (
          showPostDiagnosticSuggestions && (
            <div className="rounded-2xl border bg-white/80 p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">Actions recommandées pour vous</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowPostDiagnosticSuggestions(false)}>Masquer</Button>
              </div>
              <IntelligentSuggestions
                userContext={{
                  mood: selectedMood ?? computedMood,
                 
                  energy: computedEnergy ?? 3,
                  diagnostic: savedDiagnostic,
                }}
                onSuggestionSelect={handleSuggestionAction}
                onPractitionerOpen={(p) => handleViewProfile(p)}
                onPractitionerBook={(p) => handleBookAppointment(p)}
              />
            </div>
          )
        );
      })()}

      <div className="bg-wellness-gradient rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">Bonjour {user?.name || 'Utilisateur'} ! 👋</h1>
              <p className="text-white/90">Prenons un instant pour votre bien-être aujourd'hui.</p>
            </div>
            <div className="flex space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-4 h-4 flex items-center justify-center px-[3px] shadow">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.length === 0 ? (
                    <div className="p-3 text-sm text-gray-500">Aucune notification</div>
                  ) : (
                    notifications.map((n) => (
                      <DropdownMenuItem key={n.id} className="flex flex-col items-start whitespace-normal h-auto py-2">
                        <div className="flex w-full justify-between">
                          <span className={`font-medium ${n.read ? 'text-gray-600' : ''}`}>{n.title}</span>
                          <span className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {n.description && (
                          <span className="text-sm text-gray-600">{n.description}</span>
                        )}
                      </DropdownMenuItem>
                    ))
                  )}
                  <DropdownMenuSeparator />
                  <div className="flex justify-between px-2 py-1">
                    <Button variant="ghost" size="sm" onClick={markAllAsRead}>Tout marquer comme lu</Button>
                    <Button variant="ghost" size="sm" onClick={clearNotifications}>Vider</Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge className="bg-white/20 text-white border-white/20">
              Semaine 3
            </Badge>
            <Badge className="bg-white/20 text-white border-white/20">
              <Star className="h-3 w-3 mr-1" />
              420 points
            </Badge>
          </div>
        </div>
        
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-6 translate-x-6" />
        <div className="absolute bottom-0 right-8 w-20 h-20 bg-white/5 rounded-full" />
      </div>

      {/* Carte d'accueil onboarding (remplace l'ancien sélecteur d'humeur sur le dashboard) */}
      <Card className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-teal-50 border border-emerald-100 shadow-sm">
        <div className="flex flex-col gap-5">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold flex items-center gap-2 text-emerald-800">
              <Sparkles className="h-5 w-5 text-emerald-500" />
              Prenons un instant pour vous
            </h3>
            <p className="text-sm text-emerald-800/80 max-w-2xl leading-relaxed">
              Avant de continuer, dites-nous comment vous vous sentez aujourd'hui. Cela nous permettra d'adapter
              immédiatement votre expérience et vos recommandations de bien‑être.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              onClick={() => {
                sessionStorage.setItem('welcome_completed', '1');
                navigate('/mood-check');
              }}
            >
              Oui je commence
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              onClick={() => {
                sessionStorage.setItem('welcome_deferred', '1');
              }}
            >
              Rappelle-moi plus tard
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Button 
          onClick={() => setCurrentView('diagnostic')}
          className="h-16 bg-wellness-gradient hover:opacity-90 text-white rounded-2xl"
        >
          <div className="text-center">
            <Brain className="h-6 w-6 mx-auto mb-1" />
            <div className="text-sm font-medium">Auto-diagnostic</div>
          </div>
        </Button>

        <Button 
          onClick={() => { setAnnualStarted(false); setCurrentView('diagnostic-annual'); }}
          className="h-16 bg-gradient-to-br from-indigo-500 to-fuchsia-600 hover:opacity-90 text-white rounded-2xl"
        >
          <div className="text-center">
            <Brain className="h-6 w-6 mx-auto mb-1" />
            <div className="text-sm font-medium">Auto-diagnostic annuel</div>
          </div>
        </Button>
        
        <Button 
          onClick={() => setCurrentView('challenges')}
          className="h-16 bg-gradient-to-br from-orange-400 to-pink-400 hover:opacity-90 text-white rounded-2xl relative"
        >
          <div className="text-center">
            <Target className="h-6 w-6 mx-auto mb-1" />
            <div className="text-sm font-medium">Mes Défis</div>
          </div>
          {challengeList.length > 0 && (
            <span className="absolute top-2 right-2 bg-white text-pink-600 text-[10px] font-bold rounded-full px-2 py-0.5 shadow">
              {challengeList.length}
            </span>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Button 
          onClick={() => setCurrentView('suggestions')}
          className="h-16 bg-gradient-to-br from-purple-500 to-blue-500 hover:opacity-90 text-white rounded-2xl"
        >
          <div className="text-center">
            <Sparkles className="h-6 w-6 mx-auto mb-1" />
            <div className="text-sm font-medium">Suggestions Personnalisées</div>
          </div>
        </Button>
        <Button 
          onClick={() => setCurrentView('appointments')}
          className="h-16 bg-gradient-to-br from-green-500 to-emerald-600 hover:opacity-90 text-white rounded-2xl"
        >
          <div className="text-center">
            <Calendar className="h-6 w-6 mx-auto mb-1" />
            <div className="text-sm font-medium">Mes rendez-vous</div>
          </div>
        </Button>
  {/* Bouton Démo Méditation retiré */}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ProgressChart 
          data={progressData}
          title="Humeur"
          metric="mood"
        />
        <ProgressChart 
          data={progressData}
          title="Énergie"
          metric="energy"
        />
      </div>

      {/* Résumé du dernier auto-diagnostic */}
      {savedDiagnostic && (
        <Card className="p-4 bg-white/80">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Votre état (auto‑diagnostic)</h3>
            <Badge variant="secondary">{new Date(savedDiagnostic.completed_at ?? savedDiagnostic.updated_at ?? Date.now()).toLocaleString()}</Badge>
          </div>
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Stress</span>
              <span className="font-medium">{savedDiagnostic.stress_level}/10</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Énergie</span>
              <span className="font-medium">{savedDiagnostic.energy_level}/10</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Pression au travail</span>
              <span className="font-medium text-right">{savedDiagnostic.work_pressure}</span>
            </div>
            {savedDiagnostic.answers?.sleep_quality && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Sommeil</span>
                <span className="font-medium text-right">{savedDiagnostic.answers.sleep_quality}</span>
              </div>
            )}
            {savedDiagnostic.answers?.mood_emoji && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Humeur</span>
                <span className="font-medium text-right">{savedDiagnostic.answers.mood_emoji}</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {(() => {
  const hasAppointments = (appointments?.length ?? 0) > 0;
        // Déterminer si résultats positifs: stress bas (<=2/5), humeur haute (>=4/5), énergie ok (>=3/5)
        const computedStress = savedDiagnostic ? toFiveScale(Number(savedDiagnostic.stress_level) || 3) : undefined;
        const computedEnergy = savedDiagnostic ? toFiveScale(Number(savedDiagnostic.energy_level) || 3) : undefined;
        let computedMood = savedDiagnostic ? moodEmojiToScore(savedDiagnostic.answers?.mood_emoji) : undefined;
        if (computedMood === undefined && computedStress !== undefined) {
          computedMood = clamp(6 - computedStress, 1, 5);
        }
        // fallback à l'humeur choisie si pas de diagnostic sauvegardé
        if (computedMood === undefined && selectedMood !== undefined) computedMood = selectedMood;

        const isPositive = (computedStress !== undefined && computedEnergy !== undefined && computedMood !== undefined)
          ? (computedStress <= 2 && computedMood >= 4 && computedEnergy >= 3)
          : false; // si inconnu, on affiche par défaut
  // Masquer aussi les praticiens si l'utilisateur n'a aucun rendez-vous
  if (!hasAppointments) return null;
  if (isPositive) return null;

        return (
          <HealthSpecialistSuggestions
            selectedMood={selectedMood}
            diagnosticAnswers={diagnosticAnswers}
            onBookAppointment={handleBookAppointment}
            onViewProfile={handleViewProfile}
          />
        );
      })()}

      {(() => {
        // Masquer l'accès aux spécialistes si résultats positifs
        const computedStress = savedDiagnostic ? toFiveScale(Number(savedDiagnostic.stress_level) || 3) : undefined;
        const computedEnergy = savedDiagnostic ? toFiveScale(Number(savedDiagnostic.energy_level) || 3) : undefined;
        let computedMood = savedDiagnostic ? moodEmojiToScore(savedDiagnostic.answers?.mood_emoji) : undefined;
        if (computedMood === undefined && computedStress !== undefined) {
          computedMood = clamp(6 - computedStress, 1, 5);
        }
        if (computedMood === undefined && selectedMood !== undefined) computedMood = selectedMood;
        const isPositive = (computedStress !== undefined && computedEnergy !== undefined && computedMood !== undefined)
          ? (computedStress <= 2 && computedMood >= 4 && computedEnergy >= 3)
          : false;

        if (isPositive) return null;

        return (
          <div className="w-full">
            <Button 
              onClick={() => setCurrentView('professionals')}
              className="w-full h-16 bg-gradient-to-br from-teal-400 to-blue-500 hover:opacity-90 text-white rounded-2xl"
            >
              <div className="text-center">
                <UserCheck className="h-6 w-6 mx-auto mb-1" />
                <div className="text-sm font-medium">Tous les spécialistes</div>
              </div>
            </Button>
          </div>
        );
      })()}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Suggestions personnalisées</h2>
          <Button variant="ghost" size="sm">Voir tout</Button>
        </div>
        
        <div className="space-y-4">
          {wellnessCards.map((card, index) => (
            <WellnessCard
              key={index}
              {...card}
              onAction={() => handleWellnessCardAction(card.contentType)}
            />
          ))}
        </div>
      </div>
    </div>
    );
  };

  const renderAppointments = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentView('dashboard')}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Mes rendez-vous</h1>
      </div>
      <AppointmentManagement onClose={() => setCurrentView('dashboard')} />
    </div>
  );

  const renderDiagnostic = () => {
    if (isAnnual && !annualStarted) {
      return (
        <div className="relative min-h-screen w-full overflow-hidden animate-fadeIn">
          {/* Image de fond (peut être remplacée par /annual-bg.jpg si souhaité) */}
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1400&q=60')" }} />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative z-10 flex flex-col min-h-screen px-6 pt-12 pb-10">
            <div className="max-w-xl mx-auto w-full flex flex-col flex-1">
              <div className="mb-10">
                <Button variant="ghost" size="sm" className="p-2 mb-6 text-white/80 hover:bg-white/10" onClick={() => setCurrentView('dashboard')}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-4xl font-semibold text-white leading-tight mb-6 drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
                  Tu vas pouvoir t'épanouir !
                </h1>
                <div className="rounded-2xl border border-white/30 bg-white/10 backdrop-blur-md p-5 space-y-6 shadow-lg">
                  <p className="text-white/85 text-sm leading-relaxed">
                    JoyatWork t'accompagne chaque jour pour prendre soin de toi. Questionnaire conçu par des Experts Praticiens pour :
                  </p>
                  <ul className="space-y-4 text-left">
                    <li className="flex items-start gap-4 group">
                      <span className="h-8 w-8 flex items-center justify-center rounded-full bg-indigo-500/80 border border-white/30 text-white text-sm font-semibold shadow">1</span>
                      <span className="text-white/90 font-medium leading-snug group-hover:text-white">Être plus heureux(se)</span>
                    </li>
                    <li className="flex items-start gap-4 group">
                      <span className="h-8 w-8 flex items-center justify-center rounded-full bg-fuchsia-500/80 border border-white/30 text-white text-sm font-semibold shadow">2</span>
                      <span className="text-white/90 font-medium leading-snug group-hover:text-white">Devenir plus détendu(e)</span>
                    </li>
                    <li className="flex items-start gap-4 group">
                      <span className="h-8 w-8 flex items-center justify-center rounded-full bg-emerald-500/80 border border-white/30 text-white text-sm font-semibold shadow">3</span>
                      <span className="text-white/90 font-medium leading-snug group-hover:text-white">Être en meilleure forme jusqu'à la fin</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-auto space-y-4">
                <Button className="w-full h-14 text-base font-semibold bg-gradient-to-r from-indigo-500 to-fuchsia-600 hover:opacity-90 shadow-lg shadow-fuchsia-900/30" onClick={() => { setAnnualStarted(true); setAnnualFinished(false); setAnnualGeneral(false); setAnnualFeelings(false); setAnnualExplain(false); setAnnualLikert(false); setAnnualGeneralAnswer(''); setAnnualFeelingsAnswer([]); setAnnualExplainText(''); setAnnualLikertAnswer(''); setAnnualStep(1); }}>
                  Continuer
                </Button>
                <Button variant="outline" className="w-full h-12 border-white/40 text-white hover:bg-white/10 bg-white/5" onClick={() => setCurrentView('dashboard')}>Plus tard</Button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    // Écran explication (après feelings)
    if (isAnnual && annualStarted && annualFinished && annualGeneral && annualFeelings && annualExplain && annualLikert && annualLikertWork) {
      // Écran motivation final (après explication why)
      // Écran question horaires de travail (après motivation)
      if (annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && !annualWorkload) {
        const scheduleOptions = [
          { code: 'A', label: 'Fixes, clairs' },
          { code: 'B', label: 'Flexibles' },
          { code: 'C', label: 'Convenables' },
          { code: 'D', label: 'Sans limite' },
          { code: 'E', label: 'Décalés, de nuit' }
        ];
        return (
          <div className="relative min-h-screen w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524253482453-3fed8d2fe12b?auto=format&fit=crop&w=1400&q=60')" }} />
            <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />
            <div className="relative z-10 flex flex-col min-h-screen px-6 pt-16 pb-4">
              <div className="max-w-xl mx-auto w-full flex flex-col flex-1">
                <AnnualProgressBar className="mb-8" />
                <div className="mb-8 text-left">
                  <h1 className="text-3xl font-semibold text-white leading-snug mb-6">Mes horaires de travail sont*</h1>
                  <p className="text-white/70 text-sm mb-4">Sélectionne l'option qui correspond le mieux à ton rythme.</p>
                  <div className="space-y-4">
                    {scheduleOptions.map(opt => {
                      const selected = annualWorkScheduleAnswer === opt.code;
                      return (
                        <button
                          key={opt.code}
                          type="button"
                          onClick={() => { setAnnualWorkScheduleAnswer(opt.code); try { localStorage.setItem(annualStoragePrefix + 'work_schedule_type', JSON.stringify(opt.code)); } catch {} }}
                          onMouseDown={(e) => e.currentTarget.classList.add('pressing')}
                          onMouseUp={(e) => e.currentTarget.classList.remove('pressing')}
                          onMouseLeave={(e) => e.currentTarget.classList.remove('pressing')}
                          className={`w-full flex items-center gap-4 rounded-2xl border backdrop-blur-md px-5 py-4 text-left transition [transition-property:background,border,color,transform] duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/70 ${selected ? 'bg-white/25 border-white text-white shadow-lg animate-selectPop' : 'bg-white/10 border-white/50 text-white hover:bg-white/15'}`}
                          aria-pressed={selected}
                        >
                          <span className="flex items-center justify-center h-9 w-9 rounded-full bg-indigo-500 text-white text-sm font-bold border border-white/40 shadow">{opt.code}</span>
                          <span className="font-medium tracking-wide">{opt.label}</span>
                          {selected && <Check className="ml-auto h-6 w-6 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-auto">
                  <div className="rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-600 to-blue-700/90 backdrop-blur-md border border-white/20 rounded-2xl">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 font-medium w-16 flex items-center justify-center bg-white/10 border-white/40 text-white hover:bg-white/20"
                        onClick={() => { setAnnualWorkSchedule(false); }}
                        aria-label="Revenir"
                      >
                        &lt;
                      </Button>
                      <Button
                        className="flex-1 h-12 text-base font-semibold bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/30 disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={!annualWorkScheduleAnswer}
                        onClick={() => { if (annualWorkScheduleAnswer) { setAnnualWorkload(true); } }}
                      >
                        Ok
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
  if (annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && annualWorkload && !annualTaskDifficulty) {
        const numbers = Array.from({ length: 11 }, (_, i) => i);
        return (
          <div className="relative min-h-screen w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=1400&q=60')" }} />
            <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />
            <div className="relative z-10 flex flex-col min-h-screen px-6 pt-16 pb-4">
              <div className="max-w-xl mx-auto w-full flex flex-col flex-1">
                <AnnualProgressBar className="mb-8" />
                <div className="mb-8 text-left">
                  <h1 className="text-3xl font-semibold text-white leading-snug mb-4">Ma charge de travail (missions et tâches quotidiennes).<br />0 = Inexistante. 5 = Modéré(e). 10 = Excessive*</h1>
                  <p className="text-white/70 text-sm mb-6">Choisis un chiffre qui reflète ta perception actuelle.</p>
                  <div className="grid grid-cols-6 gap-3">
                    {numbers.slice(0,6).map(n => {
                      const selected = annualWorkloadAnswer === n;
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => { setAnnualWorkloadAnswer(n); try { localStorage.setItem(annualStoragePrefix + 'workload_level', JSON.stringify(n)); } catch {} }}
                          className={`aspect-square flex items-center justify-center rounded-xl border text-sm font-semibold backdrop-blur-md transition [transition-property:background,border,color,transform] duration-200 ${selected ? 'bg-white/30 border-white text-white shadow-lg animate-selectPop' : 'bg-white/10 border-white/40 text-white hover:bg-white/15'}`}
                          aria-pressed={selected}
                        >{n}</button>
                      );
                    })}
                    {numbers.slice(6).map(n => {
                      const selected = annualWorkloadAnswer === n;
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => { setAnnualWorkloadAnswer(n); try { localStorage.setItem(annualStoragePrefix + 'workload_level', JSON.stringify(n)); } catch {} }}
                          className={`aspect-square flex items-center justify-center rounded-xl border text-sm font-semibold backdrop-blur-md transition [transition-property:background,border,color,transform] duration-200 ${selected ? 'bg-white/30 border-white text-white shadow-lg animate-selectPop' : 'bg-white/10 border-white/40 text-white hover:bg-white/15'}`}
                          aria-pressed={selected}
                        >{n}</button>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-auto">
                  <div className="rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-600 to-blue-700/90 backdrop-blur-md border border-white/20 rounded-2xl">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 font-medium w-16 flex items-center justify-center bg-white/10 border-white/40 text-white hover:bg-white/20"
                        onClick={() => { setAnnualWorkload(false); }}
                        aria-label="Revenir"
                      >
                        &lt;
                      </Button>
                      <Button
                        className="flex-1 h-12 text-base font-semibold bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/30 disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={annualWorkloadAnswer === null}
                        onClick={() => { if (annualWorkloadAnswer !== null) { setAnnualTaskDifficulty(true); } }}
                      >
                        Ok
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
  if (annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && annualWorkload && annualTaskDifficulty && !annualPhysicalFatigue) {
        const numbers = Array.from({ length: 11 }, (_, i) => i);
        return (
          <div className="relative min-h-screen w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1400&q=60')" }} />
            <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />
            <div className="relative z-10 flex flex-col min-h-screen px-6 pt-16 pb-4">
              <div className="max-w-xl mx-auto w-full flex flex-col flex-1">
                <AnnualProgressBar className="mb-8" />
                <div className="mb-8 text-left">
                  <h1 className="text-3xl font-semibold text-white leading-snug mb-4">Mon niveau de difficulté dans les tâches quotidiennes.<br />Tâches répétitives, manuelles, pénibles...<br />0 = Pas du tout difficile. 5 = Assez difficile. 10 = Très difficile*</h1>
                  <p className="text-white/70 text-sm mb-6">Sélectionne un chiffre qui reflète ta perception actuelle.</p>
                  <div className="grid grid-cols-6 gap-3">
                    {numbers.slice(0,6).map(n => {
                      const selected = annualTaskDifficultyAnswer === n;
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => { setAnnualTaskDifficultyAnswer(n); try { localStorage.setItem(annualStoragePrefix + 'task_difficulty_level', JSON.stringify(n)); } catch {} }}
                          className={`aspect-square flex items-center justify-center rounded-xl border text-sm font-semibold backdrop-blur-md transition [transition-property:background,border,color,transform] duration-200 ${selected ? 'bg-white/30 border-white text-white shadow-lg animate-selectPop' : 'bg-white/10 border-white/40 text-white hover:bg-white/15'}`}
                          aria-pressed={selected}
                        >{n}</button>
                      );
                    })}
                    {numbers.slice(6).map(n => {
                      const selected = annualTaskDifficultyAnswer === n;
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => { setAnnualTaskDifficultyAnswer(n); try { localStorage.setItem(annualStoragePrefix + 'task_difficulty_level', JSON.stringify(n)); } catch {} }}
                          className={`aspect-square flex items-center justify-center rounded-xl border text-sm font-semibold backdrop-blur-md transition [transition-property:background,border,color,transform] duration-200 ${selected ? 'bg-white/30 border-white text-white shadow-lg animate-selectPop' : 'bg-white/10 border-white/40 text-white hover:bg-white/15'}`}
                          aria-pressed={selected}
                        >{n}</button>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-auto">
                  <div className="rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-600 to-blue-700/90 backdrop-blur-md border border-white/20 rounded-2xl">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 font-medium w-16 flex items-center justify-center bg-white/10 border-white/40 text-white hover:bg-white/20"
                        onClick={() => { setAnnualTaskDifficulty(false); }}
                        aria-label="Revenir"
                      >
                        &lt;
                      </Button>
                      <Button
                        className="flex-1 h-12 text-base font-semibold bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/30 disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={annualTaskDifficultyAnswer === null}
                        onClick={() => { if (annualTaskDifficultyAnswer !== null) { if (annualPhysicalFatigueAnswer === null) { setAnnualPhysicalFatigueAnswer(9); try { localStorage.setItem(annualStoragePrefix + 'physical_fatigue_level', JSON.stringify(9)); } catch {} } setAnnualPhysicalFatigue(true); } }}
                      >
                        Ok
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
  // Écran fatigue physique (étape 15)
  if (annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && annualWorkload && annualTaskDifficulty && annualPhysicalFatigue && !annualMentalFatigue) {
        const numbers = Array.from({ length: 11 }, (_, i) => i);
        return (
          <div className="relative min-h-screen w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1526403228293-28b7771c90f5?auto=format&fit=crop&w=1400&q=60')" }} />
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div className="relative z-10 flex flex-col min-h-screen px-6 pt-16 pb-4">
              <div className="max-w-xl mx-auto w-full flex flex-col flex-1">
                <AnnualProgressBar className="mb-8" />
                <div className="mb-8 text-left">
                  <h1 className="text-3xl font-semibold text-white leading-snug mb-4">Mon niveau de fatigue physique / mon état physique.<br />0 = Pas du tout fatigué(e). 5 = Assez fatigué(e). 10 = Très fatigué(e)*</h1>
                  <p className="text-white/70 text-sm mb-6">Sélectionne un chiffre qui reflète ta fatigue actuelle (9 est pré‑sélectionné, modifiable).</p>
                  <div className="grid grid-cols-6 gap-3">
                    {numbers.slice(0,6).map(n => {
                      const selected = annualPhysicalFatigueAnswer === n;
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => { setAnnualPhysicalFatigueAnswer(n); try { localStorage.setItem(annualStoragePrefix + 'physical_fatigue_level', JSON.stringify(n)); } catch {} }}
                          className={`aspect-square flex items-center justify-center rounded-xl border text-sm font-semibold backdrop-blur-md transition [transition-property:background,border,color,transform] duration-200 ${selected ? 'bg-white/30 border-white text-white shadow-lg animate-selectPop' : 'bg-white/10 border-white/40 text-white hover:bg-white/15'}`}
                          aria-pressed={selected}
                        >{n}</button>
                      );
                    })}
                    {numbers.slice(6).map(n => {
                      const selected = annualPhysicalFatigueAnswer === n;
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => { setAnnualPhysicalFatigueAnswer(n); try { localStorage.setItem(annualStoragePrefix + 'physical_fatigue_level', JSON.stringify(n)); } catch {} }}
                          className={`aspect-square flex items-center justify-center rounded-xl border text-sm font-semibold backdrop-blur-md transition [transition-property:background,border,color,transform] duration-200 ${selected ? 'bg-white/30 border-white text-white shadow-lg animate-selectPop' : 'bg-white/10 border-white/40 text-white hover:bg-white/15'}`}
                          aria-pressed={selected}
                        >{n}</button>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-auto">
                  <div className="rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-600 to-blue-700/90 backdrop-blur-md border border-white/20 rounded-2xl">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 font-medium w-16 flex items-center justify-center bg-white/10 border-white/40 text-white hover:bg-white/20"
                        onClick={() => { setAnnualPhysicalFatigue(false); }}
                        aria-label="Revenir"
                      >
                        &lt;
                      </Button>
                      <Button
                        className="flex-1 h-12 text-base font-semibold bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/30 disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={annualPhysicalFatigueAnswer === null}
                        onClick={() => { if (annualPhysicalFatigueAnswer !== null) { if (annualMentalFatigueAnswer === null) { setAnnualMentalFatigueAnswer(9); try { localStorage.setItem(annualStoragePrefix + 'mental_fatigue_level', JSON.stringify(9)); } catch {} } setAnnualMentalFatigue(true); } }}
                      >
                        Ok
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
  // Écran fatigue mentale (étape 16)
  if (annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && annualWorkload && annualTaskDifficulty && annualPhysicalFatigue && annualMentalFatigue && !annualMentalFatigueExplain) {
        const numbers = Array.from({ length: 11 }, (_, i) => i);
        return (
          <div className="relative min-h-screen w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=1400&q=60')" }} />
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div className="relative z-10 flex flex-col min-h-screen px-6 pt-16 pb-4">
              <div className="max-w-xl mx-auto w-full flex flex-col flex-1">
                <AnnualProgressBar className="mb-8" />
                <div className="mb-8 text-left">
                  <h1 className="text-3xl font-semibold text-white leading-snug mb-4">Mon niveau de fatigue mentale / mon état mental.<br />0 = Pas du tout épuisé(e). 5 = Assez épuisé(e). 10 = Extrêmement épuisé(e)*</h1>
                  <p className="text-white/70 text-sm mb-6">Sélectionne un chiffre qui reflète ta surcharge mentale actuelle (9 est pré‑sélectionné, modifiable).</p>
                  <div className="grid grid-cols-6 gap-3">
                    {numbers.slice(0,6).map(n => {
                      const selected = annualMentalFatigueAnswer === n;
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => { setAnnualMentalFatigueAnswer(n); try { localStorage.setItem(annualStoragePrefix + 'mental_fatigue_level', JSON.stringify(n)); } catch {} }}
                          className={`aspect-square flex items-center justify-center rounded-xl border text-sm font-semibold backdrop-blur-md transition [transition-property:background,border,color,transform] duration-200 ${selected ? 'bg-white/30 border-white text-white shadow-lg animate-selectPop' : 'bg-white/10 border-white/40 text-white hover:bg-white/15'}`}
                          aria-pressed={selected}
                        >{n}</button>
                      );
                    })}
                    {numbers.slice(6).map(n => {
                      const selected = annualMentalFatigueAnswer === n;
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => { setAnnualMentalFatigueAnswer(n); try { localStorage.setItem(annualStoragePrefix + 'mental_fatigue_level', JSON.stringify(n)); } catch {} }}
                          className={`aspect-square flex items-center justify-center rounded-xl border text-sm font-semibold backdrop-blur-md transition [transition-property:background,border,color,transform] duration-200 ${selected ? 'bg-white/30 border-white text-white shadow-lg animate-selectPop' : 'bg-white/10 border-white/40 text-white hover:bg-white/15'}`}
                          aria-pressed={selected}
                        >{n}</button>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-auto">
                  <div className="rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-600 to-blue-700/90 backdrop-blur-md border border-white/20 rounded-2xl">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 font-medium w-16 flex items-center justify-center bg-white/10 border-white/40 text-white hover:bg-white/20"
                        onClick={() => { setAnnualMentalFatigue(false); }}
                        aria-label="Revenir"
                      >
                        &lt;
                      </Button>
                      <Button
                        className="flex-1 h-12 text-base font-semibold bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/30 disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={annualMentalFatigueAnswer === null}
                        onClick={() => { if (annualMentalFatigueAnswer !== null) { setAnnualMentalFatigueExplain(true); } }}
                      >
                        Ok
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
  // Écran explication fatigue mentale (étape 17)
  if (annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && annualWorkload && annualTaskDifficulty && annualPhysicalFatigue && annualMentalFatigue && annualMentalFatigueExplain && !annualReassure) {
        return (
          <div className="relative min-h-screen w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=60')" }} />
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div className="relative z-10 flex flex-col min-h-screen px-6 pt-16 pb-4">
              <div className="max-w-2xl mx-auto w-full flex flex-col flex-1">
                <AnnualProgressBar className="mb-8" />
                <div className="mb-10 text-center">
                  <h1 className="text-3xl font-semibold text-white leading-snug mb-8">Peux-tu expliquer pourquoi ?*</h1>
                  <div className="max-w-xl mx-auto w-full">
                    <div className="relative group">
                      <input
                        type="text"
                        value={annualMentalFatigueExplainText}
                        onChange={e => { setAnnualMentalFatigueExplainText(e.target.value); try { localStorage.setItem(annualStoragePrefix + 'mental_fatigue_explain', e.target.value); } catch {} }}
                        placeholder="Répondez ici…"
                        className="w-full bg-transparent focus:outline-none text-white placeholder-blue-200 text-lg tracking-wide"
                        aria-label="Explication fatigue mentale"
                      />
                      <div className="h-px w-full bg-white/30 mt-2" />
                    </div>
                  </div>
                </div>
                <div className="mt-auto">
                  <div className="rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-600 to-blue-700/90 backdrop-blur-md border border-white/20 rounded-2xl">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 font-medium w-16 flex items-center justify-center bg-white/10 border-white/40 text-white hover:bg-white/20"
                        onClick={() => { setAnnualMentalFatigueExplain(false); }}
                        aria-label="Revenir"
                      >
                        &lt;
                      </Button>
                      <Button
                        className="flex-1 h-12 text-base font-semibold bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/30 disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={!annualMentalFatigueExplainText.trim()}
                        onClick={() => { if (annualMentalFatigueExplainText.trim()) { setAnnualReassure(true); } }}
                      >
                        Ok
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
    // Écran réassurance (étape 18)
  if (annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && annualWorkload && annualTaskDifficulty && annualPhysicalFatigue && annualMentalFatigue && annualMentalFatigueExplain && annualReassure && !annualPain) {
        return (
          <div className="relative min-h-screen w-full overflow-hidden">
    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=1400&q=60&sat=-50&blend=ff0000&blend-mode=multiply')" }} />
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div className="relative z-10 flex flex-col min-h-screen px-6 pt-16 pb-4">
              <div className="max-w-xl mx-auto w-full flex flex-col flex-1">
                <AnnualProgressBar className="mb-8" />
                <div className="flex-1 flex items-center">
                  <blockquote className="text-center w-full">
                    <p className="text-3xl font-semibold text-white leading-snug">
                      <span className="block">« Sois rassuré(e), quelque soit ta situation,</span>
                      <span className="block">JoyatWork va pouvoir t'aider à te sentir mieux. »</span>
                    </p>
                  </blockquote>
                </div>
                <div className="mt-auto">
                  <div className="rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-600 to-blue-700/90 backdrop-blur-md border border-white/20 rounded-2xl">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 font-medium w-16 flex items-center justify-center bg-white/10 border-white/40 text-white hover:bg-white/20"
                        onClick={() => { setAnnualReassure(false); }}
                        aria-label="Revenir"
                      >
                        &lt;
                      </Button>
                      <Button
                        className="flex-1 h-12 text-base font-semibold bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/30"
                        onClick={() => { if (annualPainAnswer === null) { setAnnualPainAnswer(9); try { localStorage.setItem(annualStoragePrefix + 'pain_level', JSON.stringify(9)); } catch {} } setAnnualPain(true); }}
                      >
                        Continuer
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
  // Écran douleur (étape 19)
  if (annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && annualWorkload && annualTaskDifficulty && annualPhysicalFatigue && annualMentalFatigue && annualMentalFatigueExplain && annualReassure && annualPain && !annualPainLocation) {
        const numbers = Array.from({ length: 11 }, (_, i) => i);
        return (
          <div className="relative min-h-screen w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1558327182-0f49a4b7a327?auto=format&fit=crop&w=1400&q=60')" }} />
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div className="relative z-10 flex flex-col min-h-screen px-6 pt-16 pb-4">
              <div className="max-w-xl mx-auto w-full flex flex-col flex-1">
                <AnnualProgressBar className="mb-8" />
                <div className="mb-8 text-left">
                  <h1 className="text-3xl font-semibold text-white leading-snug mb-4">L’évaluation de ton niveau de douleur.<br />0 = Faible. 5 = Modéré. 10 = Extrêmement intense*</h1>
                  <p className="text-white/70 text-sm mb-6">Sélectionne ton niveau de douleur (9 est pré‑sélectionné, modifiable).</p>
                  <div className="grid grid-cols-6 gap-3">
                    {numbers.slice(0,6).map(n => {
                      const selected = annualPainAnswer === n;
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => { setAnnualPainAnswer(n); try { localStorage.setItem(annualStoragePrefix + 'pain_level', JSON.stringify(n)); } catch {} }}
                          className={`aspect-square flex items-center justify-center rounded-xl border text-sm font-semibold backdrop-blur-md transition [transition-property:background,border,color,transform] duration-200 ${selected ? 'bg-white/30 border-white text-white shadow-lg animate-selectPop' : 'bg-white/10 border-white/40 text-white hover:bg-white/15'}`}
                          aria-pressed={selected}
                        >{n}</button>
                      );
                    })}
                    {numbers.slice(6).map(n => {
                      const selected = annualPainAnswer === n;
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => { setAnnualPainAnswer(n); try { localStorage.setItem(annualStoragePrefix + 'pain_level', JSON.stringify(n)); } catch {} }}
                          className={`aspect-square flex items-center justify-center rounded-xl border text-sm font-semibold backdrop-blur-md transition [transition-property:background,border,color,transform] duration-200 ${selected ? 'bg-white/30 border-white text-white shadow-lg animate-selectPop' : 'bg-white/10 border-white/40 text-white hover:bg-white/15'}`}
                          aria-pressed={selected}
                        >{n}</button>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-auto">
                  <div className="rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-600 to-blue-700/90 backdrop-blur-md border border-white/20 rounded-2xl">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 font-medium w-16 flex items-center justify-center bg-white/10 border-white/40 text-white hover:bg-white/20"
                        onClick={() => { setAnnualPain(false); }}
                        aria-label="Revenir"
                      >
                        &lt;
                      </Button>
                      <Button
                        className="flex-1 h-12 text-base font-semibold bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/30 disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={annualPainAnswer === null}
                        onClick={() => { if (annualPainAnswer !== null) { setAnnualPainLocation(true); } }}
                      >
                        Ok
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
      // Écran localisation douleur (étape 20)
  if (annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && annualWorkload && annualTaskDifficulty && annualPhysicalFatigue && annualMentalFatigue && annualMentalFatigueExplain && annualReassure && annualPain && annualPainLocation && !annualAnxiety) {
        return (
          <div className="relative min-h-screen w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=1400&q=60')" }} />
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div className="relative z-10 flex flex-col min-h-screen px-6 pt-16 pb-4">
              <div className="max-w-2xl mx-auto w-full flex flex-col flex-1">
                <AnnualProgressBar className="mb-8" />
                <div className="mb-10 text-left">
                  <h1 className="text-3xl font-semibold text-white leading-snug mb-3">À quel niveau se situe cette douleur*</h1>
                  <p className="text-white/60 italic text-sm mb-8">Si tu arrives à la localiser</p>
                  <div className="max-w-xl w-full">
                    <div className="relative group">
                      <input
                        type="text"
                        value={annualPainLocationText}
                        onChange={e => { setAnnualPainLocationText(e.target.value); try { localStorage.setItem(annualStoragePrefix + 'pain_location', e.target.value); } catch {} }}
                        placeholder="Répondez ici…"
                        className="w-full bg-transparent focus:outline-none text-white placeholder-blue-200 text-lg tracking-wide"
                        aria-label="Localisation douleur"
                      />
                      <div className="h-px w-full bg-white/30 mt-2" />
                    </div>
                  </div>
                </div>
                <div className="mt-auto">
                  <div className="rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-600 to-blue-700/90 backdrop-blur-md border border-white/20 rounded-2xl">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 font-medium w-16 flex items-center justify-center bg-white/10 border-white/40 text-white hover:bg-white/20"
                        onClick={() => { setAnnualPainLocation(false); }}
                        aria-label="Revenir"
                      >
                        &lt;
                      </Button>
                      <Button
                        className="flex-1 h-12 text-base font-semibold bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/30 disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={!annualPainLocationText.trim()}
                        onClick={() => { if (annualPainLocationText.trim()) { if (annualAnxietyAnswer === null) { setAnnualAnxietyAnswer(8); try { localStorage.setItem(annualStoragePrefix + 'anxiety_level', JSON.stringify(8)); } catch {} } setAnnualAnxiety(true); } }}
                      >
                        Ok
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
      // Écran anxiété (étape 21)
  if (annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && annualWorkload && annualTaskDifficulty && annualPhysicalFatigue && annualMentalFatigue && annualMentalFatigueExplain && annualReassure && annualPain && annualPainLocation && annualAnxiety && !annualAnxietyExplain) {
        const numbers = Array.from({ length: 11 }, (_, i) => i);
        return (
          <div className="relative min-h-screen w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1552196563-55cd4e45efb3?auto=format&fit=crop&w=1400&q=60')" }} />
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div className="relative z-10 flex flex-col min-h-screen px-6 pt-16 pb-4">
              <div className="max-w-xl mx-auto w-full flex flex-col flex-1">
                <AnnualProgressBar className="mb-8" />
                <div className="mb-8 text-left">
                  <h1 className="text-3xl font-semibold text-white leading-snug mb-4">Ressens-tu de l’anxiété, de l’angoisse ?<br />0 = Pas du tout. 5 = Parfois. 10 = Souvent*</h1>
                  <p className="text-white/70 text-sm mb-6">Sélectionne ton niveau actuel (8 est pré‑sélectionné, modifiable).</p>
                  <div className="grid grid-cols-6 gap-3">
                    {numbers.slice(0,6).map(n => {
                      const selected = annualAnxietyAnswer === n;
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => { setAnnualAnxietyAnswer(n); try { localStorage.setItem(annualStoragePrefix + 'anxiety_level', JSON.stringify(n)); } catch {} }}
                          className={`aspect-square flex items-center justify-center rounded-xl border text-sm font-semibold backdrop-blur-md transition [transition-property:background,border,color,transform] duration-200 ${selected ? 'bg-white/30 border-white text-white shadow-lg animate-selectPop' : 'bg-white/10 border-white/40 text-white hover:bg-white/15'}`}
                          aria-pressed={selected}
                        >{n}</button>
                      );
                    })}
                    {numbers.slice(6).map(n => {
                      const selected = annualAnxietyAnswer === n;
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => { setAnnualAnxietyAnswer(n); try { localStorage.setItem(annualStoragePrefix + 'anxiety_level', JSON.stringify(n)); } catch {} }}
                          className={`aspect-square flex items-center justify-center rounded-xl border text-sm font-semibold backdrop-blur-md transition [transition-property:background,border,color,transform] duration-200 ${selected ? 'bg-white/30 border-white text-white shadow-lg animate-selectPop' : 'bg-white/10 border-white/40 text-white hover:bg-white/15'}`}
                          aria-pressed={selected}
                        >{n}</button>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-auto">
                  <div className="rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-600 to-blue-700/90 backdrop-blur-md border border-white/20 rounded-2xl">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 font-medium w-16 flex items-center justify-center bg-white/10 border-white/40 text-white hover:bg-white/20"
                        onClick={() => { setAnnualAnxiety(false); }}
                        aria-label="Revenir"
                      >
                        &lt;
                      </Button>
                      <Button
                        className="flex-1 h-12 text-base font-semibold bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/30 disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={annualAnxietyAnswer === null}
                        onClick={() => { if (annualAnxietyAnswer !== null) { setAnnualAnxietyExplain(true); } }}
                      >
                        Ok
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
      // Écran explication anxiété (étape 22)
  if (annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && annualWorkload && annualTaskDifficulty && annualPhysicalFatigue && annualMentalFatigue && annualMentalFatigueExplain && annualReassure && annualPain && annualPainLocation && annualAnxiety && annualAnxietyExplain && !annualSleepQuality) {
        return (
          <div className="relative min-h-screen w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=60')" }} />
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div className="relative z-10 flex flex-col min-h-screen px-6 pt-16 pb-4">
              <div className="max-w-2xl mx-auto w-full flex flex-col flex-1">
                <AnnualProgressBar className="mb-8" />
                <div className="mb-10 text-center">
                  <h1 className="text-3xl font-semibold text-white leading-snug mb-8">Peux-tu en dire plus ?*</h1>
                  <div className="max-w-xl mx-auto w-full">
                    <div className="relative group">
                      <input
                        type="text"
                        value={annualAnxietyExplainText}
                        onChange={e => { setAnnualAnxietyExplainText(e.target.value); try { localStorage.setItem(annualStoragePrefix + 'anxiety_explain', e.target.value); } catch {} }}
                        placeholder="Répondez ici…"
                        className="w-full bg-transparent focus:outline-none text-white placeholder-blue-200 text-lg tracking-wide"
                        aria-label="Explication anxiété"
                      />
                      <div className="h-px w-full bg-white/30 mt-2" />
                    </div>
                  </div>
                </div>
                <div className="mt-auto">
                  <div className="rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-600 to-blue-700/90 backdrop-blur-md border border-white/20 rounded-2xl">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 font-medium w-16 flex items-center justify-center bg-white/10 border-white/40 text-white hover:bg-white/20"
                        onClick={() => { setAnnualAnxietyExplain(false); }}
                        aria-label="Revenir"
                      >
                        &lt;
                      </Button>
                      <Button
                        className="flex-1 h-12 text-base font-semibold bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/30 disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={!annualAnxietyExplainText.trim()}
                        onClick={() => { if (annualAnxietyExplainText.trim()) { if (annualSleepQualityAnswer === null) { setAnnualSleepQualityAnswer(3); try { localStorage.setItem(annualStoragePrefix + 'sleep_quality', JSON.stringify(3)); } catch {} } setAnnualSleepQuality(true); } }}
                      >
                        Ok
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
  // Écran qualité sommeil (étape 23)
  if (annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && annualWorkload && annualTaskDifficulty && annualPhysicalFatigue && annualMentalFatigue && annualMentalFatigueExplain && annualReassure && annualPain && annualPainLocation && annualAnxiety && annualAnxietyExplain && annualSleepQuality && !annualSleepQualityExplain) {
        const numbers = Array.from({ length: 11 }, (_, i) => i);
        return (
          <div className="relative min-h-screen w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1511295742362-92c96b1d3d1a?auto=format&fit=crop&w=1400&q=60')" }} />
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div className="relative z-10 flex flex-col min-h-screen px-6 pt-16 pb-4">
              <div className="max-w-xl mx-auto w-full flex flex-col flex-1">
                <AnnualProgressBar className="mb-8" />
                <div className="mb-8 text-left">
                  <h1 className="text-3xl font-semibold text-white leading-snug mb-4">Ma qualité de sommeil.<br />0 = Très mauvaise. 5 = Mauvaise. 10 = Très bonne*</h1>
                  <p className="text-white/70 text-sm mb-6">Sélectionne ton niveau actuel (3 est pré‑sélectionné, modifiable).</p>
                  <div className="grid grid-cols-6 gap-3">
                    {numbers.slice(0,6).map(n => {
                      const selected = annualSleepQualityAnswer === n;
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => { setAnnualSleepQualityAnswer(n); try { localStorage.setItem(annualStoragePrefix + 'sleep_quality', JSON.stringify(n)); } catch {} }}
                          className={`aspect-square flex items-center justify-center rounded-xl border text-sm font-semibold backdrop-blur-md transition [transition-property:background,border,color,transform] duration-200 ${selected ? 'bg-white/30 border-white text-white shadow-lg animate-selectPop' : 'bg-white/10 border-white/40 text-white hover:bg-white/15'}`}
                          aria-pressed={selected}
                        >{n}</button>
                      );
                    })}
                    {numbers.slice(6).map(n => {
                      const selected = annualSleepQualityAnswer === n;
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => { setAnnualSleepQualityAnswer(n); try { localStorage.setItem(annualStoragePrefix + 'sleep_quality', JSON.stringify(n)); } catch {} }}
                          className={`aspect-square flex items-center justify-center rounded-xl border text-sm font-semibold backdrop-blur-md transition [transition-property:background,border,color,transform] duration-200 ${selected ? 'bg-white/30 border-white text-white shadow-lg animate-selectPop' : 'bg-white/10 border-white/40 text-white hover:bg-white/15'}`}
                          aria-pressed={selected}
                        >{n}</button>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-auto">
                  <div className="rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-600 to-blue-700/90 backdrop-blur-md border border-white/20 rounded-2xl">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 font-medium w-16 flex items-center justify-center bg-white/10 border-white/40 text-white hover:bg-white/20"
                        onClick={() => { setAnnualSleepQuality(false); }}
                        aria-label="Revenir"
                      >
                        &lt;
                      </Button>
                      <Button
                        className="flex-1 h-12 text-base font-semibold bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/30 disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={annualSleepQualityAnswer === null}
                        onClick={() => { if (annualSleepQualityAnswer !== null) { setAnnualSleepQualityExplain(true); } }}
                      >
                        Ok
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
      // Écran explication sommeil (étape 24)
  if (annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && annualWorkload && annualTaskDifficulty && annualPhysicalFatigue && annualMentalFatigue && annualMentalFatigueExplain && annualReassure && annualPain && annualPainLocation && annualAnxiety && annualAnxietyExplain && annualSleepQuality && annualSleepQualityExplain && !annualSleepDuration) {
        return (
          <div className="relative min-h-screen w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1470259078422-826894b933aa?auto=format&fit=crop&w=1400&q=60')" }} />
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div className="relative z-10 flex flex-col min-h-screen px-6 pt-16 pb-4">
              <div className="max-w-2xl mx-auto w-full flex flex-col flex-1">
                <AnnualProgressBar className="mb-8" />
                <div className="mb-10 text-left">
                  <h1 className="text-3xl font-semibold text-white leading-snug mb-4">Peux-tu en dire plus ?*</h1>
                  <p className="text-white/60 text-sm mb-8">T’endors-tu facilement, difficilement / tout le temps, souvent, quelques fois, rarement.</p>
                  <div className="max-w-xl w-full">
                    <div className="relative group">
                      <input
                        type="text"
                        value={annualSleepQualityExplainText}
                        onChange={e => { setAnnualSleepQualityExplainText(e.target.value); try { localStorage.setItem(annualStoragePrefix + 'sleep_quality_explain', e.target.value); } catch {} }}
                        placeholder="Répondez ici…"
                        className="w-full bg-transparent focus:outline-none text-white placeholder-blue-200 text-lg tracking-wide"
                        aria-label="Explication qualité sommeil"
                      />
                      <div className="h-px w-full bg-white/30 mt-2" />
                    </div>
                  </div>
                </div>
                <div className="mt-auto">
                  <div className="rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-600 to-blue-700/90 backdrop-blur-md border border-white/20 rounded-2xl">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 font-medium w-16 flex items-center justify-center bg-white/10 border-white/40 text-white hover:bg-white/20"
                        onClick={() => { setAnnualSleepQualityExplain(false); }}
                        aria-label="Revenir"
                      >
                        &lt;
                      </Button>
                      <Button
                        className="flex-1 h-12 text-base font-semibold bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/30 disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={!annualSleepQualityExplainText.trim()}
                        onClick={() => { if (annualSleepQualityExplainText.trim()) { if (!annualSleepDurationAnswer) { const def='E'; setAnnualSleepDurationAnswer(def); try { localStorage.setItem(annualStoragePrefix + 'sleep_duration', JSON.stringify(def)); } catch {} } setAnnualSleepDuration(true); } }}
                      >
                        Ok
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
      // Écran durée sommeil (étape 25)
  if (annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && annualWorkload && annualTaskDifficulty && annualPhysicalFatigue && annualMentalFatigue && annualMentalFatigueExplain && annualReassure && annualPain && annualPainLocation && annualAnxiety && annualAnxietyExplain && annualSleepQuality && annualSleepQualityExplain && annualSleepDuration && !annualCareMessage) {
        const options = [
          { id: 'A', label: '- de 6 heures' },
          { id: 'B', label: '6 heures' },
          { id: 'C', label: '7 heures' },
          { id: 'D', label: '8 heures' },
          { id: 'E', label: '9 heures +' }
        ];
        const letterStyles = 'inline-flex items-center justify-center w-7 h-7 rounded-md text-sm font-bold bg-blue-500/20 text-blue-300 border border-blue-400/40 mr-3';
        return (
          <div className="relative min-h-screen w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1501975558162-0be7b8ca95ea?auto=format&fit=crop&w=1400&q=60')" }} />
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div className="relative z-10 flex flex-col min-h-screen px-6 pt-16 pb-4">
              <div className="max-w-xl mx-auto w-full flex flex-col flex-1">
                <AnnualProgressBar className="mb-8" />
                <div className="mb-8 text-left">
                  <h1 className="text-3xl font-semibold text-white leading-snug mb-6">Généralement je dors*</h1>
                  <div className="space-y-4">
                    {options.map(opt => {
                      const selected = annualSleepDurationAnswer === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => { setAnnualSleepDurationAnswer(opt.id); try { localStorage.setItem(annualStoragePrefix + 'sleep_duration', JSON.stringify(opt.id)); } catch {} }}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium backdrop-blur-md transition [transition-property:background,border,color,transform] duration-200 ${selected ? 'bg-white/25 border-white text-white shadow-lg' : 'bg-white/10 border-white/40 text-white hover:bg-white/15'}`}
                          aria-pressed={selected}
                        >
                          <span className="flex items-center"><span className={letterStyles}>{opt.id}</span>{opt.label}</span>
                          {selected && <span className="text-white font-semibold">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-auto">
                  <div className="rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-600 to-blue-700/90 backdrop-blur-md border border-white/20 rounded-2xl">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 font-medium w-16 flex items-center justify-center bg-white/10 border-white/40 text-white hover:bg-white/20"
                        onClick={() => { setAnnualSleepDuration(false); }}
                        aria-label="Revenir"
                      >
                        &lt;
                      </Button>
                      <Button
                        className="flex-1 h-12 text-base font-semibold bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/30 disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={!annualSleepDurationAnswer}
                        onClick={() => { if (annualSleepDurationAnswer) { setAnnualCareMessage(true); } }}
                      >
                        Ok
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
      // Écran message rassurant (étape 26)
  if (annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && annualWorkload && annualTaskDifficulty && annualPhysicalFatigue && annualMentalFatigue && annualMentalFatigueExplain && annualReassure && annualPain && annualPainLocation && annualAnxiety && annualAnxietyExplain && annualSleepQuality && annualSleepQualityExplain && annualSleepDuration && annualCareMessage && !annualNutrition) {
        return (
          <div className="relative min-h-screen w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1400&q=60')" }} />
            <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />
            <div className="relative z-10 flex flex-col min-h-screen px-6 pt-16 pb-4">
              <div className="max-w-2xl mx-auto w-full flex flex-col flex-1">
                <AnnualProgressBar className="mb-8" />
                <div className="flex-1 flex items-center">
                  <blockquote className="text-left w-full relative pl-6">
                    <span className="absolute left-0 top-0 text-5xl leading-none text-indigo-400 select-none">“</span>
                    <p className="text-3xl font-semibold text-white leading-snug">
                      <span className="block">Tout ira bien.</span>
                      <span className="block">Nous prenons soin de toi.</span>
                    </p>
                  </blockquote>
                </div>
                <div className="mt-auto">
                  <div className="rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-600 to-blue-700/90 backdrop-blur-md border border-white/20 rounded-2xl">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 font-medium w-16 flex items-center justify-center bg-white/10 border-white/40 text-white hover:bg-white/20"
                        onClick={() => { setAnnualCareMessage(false); }}
                        aria-label="Revenir"
                      >
                        &lt;
                      </Button>
                      <Button
                        className="flex-1 h-12 text-base font-semibold bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/30"
                        onClick={() => { if (annualNutritionAnswer === null) { setAnnualNutritionAnswer(8); try { localStorage.setItem(annualStoragePrefix + 'nutrition_level', JSON.stringify(8)); } catch {} } setAnnualNutrition(true); }}
                      >
                        Continuer
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
      // Écran alimentation saine (étape 27)
      if (annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && annualWorkload && annualTaskDifficulty && annualPhysicalFatigue && annualMentalFatigue && annualMentalFatigueExplain && annualReassure && annualPain && annualPainLocation && annualAnxiety && annualAnxietyExplain && annualSleepQuality && annualSleepQualityExplain && annualSleepDuration && annualCareMessage && annualNutrition && !annualNutritionExplain) {
        const numbers = Array.from({ length: 11 }, (_, i) => i);
        return (
          <div className="relative min-h-screen w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1510626176961-4b57d4fbad03?auto=format&fit=crop&w=1400&q=60')" }} />
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div className="relative z-10 flex flex-col min-h-screen px-6 pt-16 pb-4">
              <div className="max-w-xl mx-auto w-full flex flex-col flex-1">
                <AnnualProgressBar className="mb-8" />
                <div className="mb-8 text-left">
                  <h1 className="text-3xl font-semibold text-white leading-snug mb-4">Je considère avoir une alimentation saine & équilibrée.<br />0 = Pas du tout. 5 = Moyennement saine et équilibrée. 10 = Tout à fait saine et équilibrée*</h1>
                  <p className="text-white/70 text-sm mb-6">Sélectionne ton niveau actuel (8 est pré‑sélectionné, modifiable).</p>
                  <div className="grid grid-cols-6 gap-3">
                    {numbers.slice(0,6).map(n => {
                      const selected = annualNutritionAnswer === n;
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => { setAnnualNutritionAnswer(n); try { localStorage.setItem(annualStoragePrefix + 'nutrition_level', JSON.stringify(n)); } catch {} }}
                          className={`aspect-square flex items-center justify-center rounded-xl border text-sm font-semibold backdrop-blur-md transition [transition-property:background,border,color,transform] duration-200 ${selected ? 'bg-white/30 border-white text-white shadow-lg animate-selectPop' : 'bg-white/10 border-white/40 text-white hover:bg-white/15'}`}
                          aria-pressed={selected}
                        >{n}</button>
                      );
                    })}
                    {numbers.slice(6).map(n => {
                      const selected = annualNutritionAnswer === n;
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => { setAnnualNutritionAnswer(n); try { localStorage.setItem(annualStoragePrefix + 'nutrition_level', JSON.stringify(n)); } catch {} }}
                          className={`aspect-square flex items-center justify-center rounded-xl border text-sm font-semibold backdrop-blur-md transition [transition-property:background,border,color,transform] duration-200 ${selected ? 'bg-white/30 border-white text-white shadow-lg animate-selectPop' : 'bg-white/10 border-white/40 text-white hover:bg-white/15'}`}
                          aria-pressed={selected}
                        >{n}</button>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-auto">
                  <div className="rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-600 to-blue-700/90 backdrop-blur-md border border-white/20 rounded-2xl">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 font-medium w-16 flex items-center justify-center bg-white/10 border-white/40 text-white hover:bg-white/20"
                        onClick={() => { setAnnualNutrition(false); }}
                        aria-label="Revenir"
                      >
                        &lt;
                      </Button>
                      <Button
                        className="flex-1 h-12 text-base font-semibold bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/30 disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={annualNutritionAnswer === null}
                        onClick={() => { if (annualNutritionAnswer !== null) { setAnnualNutritionExplain(true); } }}
                      >
                        Ok
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
      // Écran explication alimentation (étape 28)
  if (annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && annualWorkload && annualTaskDifficulty && annualPhysicalFatigue && annualMentalFatigue && annualMentalFatigueExplain && annualReassure && annualPain && annualPainLocation && annualAnxiety && annualAnxietyExplain && annualSleepQuality && annualSleepQualityExplain && annualSleepDuration && annualCareMessage && annualNutrition && annualNutritionExplain && !annualPhysicalActivity) {
        return (
          <div className="relative min-h-screen w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1502743277-affbba0b4775?auto=format&fit=crop&w=1400&q=60')" }} />
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div className="relative z-10 flex flex-col min-h-screen px-6 pt-16 pb-4">
              <div className="max-w-2xl mx-auto w-full flex flex-col flex-1">
                <AnnualProgressBar className="mb-8" />
                <div className="mb-10 text-left">
                  <h1 className="text-3xl font-semibold text-white leading-snug mb-6">Peux-tu expliquer pourquoi ?*</h1>
                  <p className="text-white/60 italic text-sm mb-10">Si ton alimentation n’est pas équilibrée</p>
                  <div className="max-w-xl w-full">
                    <div className="relative group">
                      <input
                        type="text"
                        value={annualNutritionExplainText}
                        onChange={e => { setAnnualNutritionExplainText(e.target.value); try { localStorage.setItem(annualStoragePrefix + 'nutrition_explain', e.target.value); } catch {} }}
                        placeholder="Répondez ici…"
                        className="w-full bg-transparent focus:outline-none text-white placeholder-blue-200 text-lg tracking-wide"
                        aria-label="Explication alimentation"
                      />
                      <div className="h-px w-full bg-white/30 mt-2" />
                    </div>
                  </div>
                </div>
                <div className="mt-auto">
                  <div className="rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-600 to-blue-700/90 backdrop-blur-md border border-white/20 rounded-2xl">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 font-medium w-16 flex items-center justify-center bg-white/10 border-white/40 text-white hover:bg-white/20"
                        onClick={() => { setAnnualNutritionExplain(false); }}
                        aria-label="Revenir"
                      >
                        &lt;
                      </Button>
                      <Button
                        className="flex-1 h-12 text-base font-semibold bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/30 disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={!annualNutritionExplainText.trim()}
                        onClick={() => { if (annualNutritionExplainText.trim()) { if (!annualPhysicalActivityAnswer) { const def='Oui'; setAnnualPhysicalActivityAnswer(def); try { localStorage.setItem(annualStoragePrefix + 'physical_activity', JSON.stringify(def)); } catch {} } setAnnualPhysicalActivity(true); } }}
                      >
                        Ok
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
  // Écran activité physique (étape 29)
  if (annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && annualWorkload && annualTaskDifficulty && annualPhysicalFatigue && annualMentalFatigue && annualMentalFatigueExplain && annualReassure && annualPain && annualPainLocation && annualAnxiety && annualAnxietyExplain && annualSleepQuality && annualSleepQualityExplain && annualSleepDuration && annualCareMessage && annualNutrition && annualNutritionExplain && annualPhysicalActivity && !annualPhysicalActivityDetail && !annualPhysicalActivityNoExplain) {
  const options = ['Oui','Non','Parfois'];
        return (
          <div className="relative min-h-screen w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1599058917212-d750089bc07c?auto=format&fit=crop&w=1400&q=60')" }} />
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div className="relative z-10 flex flex-col min-h-screen px-6 pt-16 pb-4">
              <div className="max-w-xl mx-auto w-full flex flex-col flex-1">
                <AnnualProgressBar className="mb-8" />
                <div className="mb-10 text-left">
                  <h1 className="text-3xl font-semibold text-white leading-snug mb-4">Je pratique une activité physique régulière*</h1>
                  <p className="text-white/60 italic text-sm mb-10">pour lutter contre la sédentarité</p>
                  <div className="max-w-xl w-full">
                    <div className="relative">
                      <button type="button" onClick={() => setAnnualPhysicalActivityOpen(o=>!o)} className="w-full text-left flex items-center justify-between bg-transparent focus:outline-none text-white text-lg tracking-wide">
                        <span>{annualPhysicalActivityAnswer || 'Choisir...'}</span>
                        <span className="text-white/70 text-sm">▼</span>
                      </button>
                      <div className="h-px w-full bg-white/30 mt-2" />
                      {annualPhysicalActivityOpen && (
                        <div className="mt-2 bg-white/10 border border-white/30 rounded-lg backdrop-blur-md shadow-lg overflow-hidden">
                          {options.map(opt => {
                            const selected = annualPhysicalActivityAnswer === opt;
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => { setAnnualPhysicalActivityAnswer(opt); setAnnualPhysicalActivityOpen(false); try { localStorage.setItem(annualStoragePrefix + 'physical_activity', JSON.stringify(opt)); } catch {} }}
                                className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${selected ? 'bg-white/25 text-white' : 'text-white hover:bg-white/15'}`}
                              >{opt}</button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-auto">
                  <div className="rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-600 to-blue-700/90 backdrop-blur-md border border-white/20 rounded-2xl">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 font-medium w-16 flex items-center justify-center bg-white/10 border-white/40 text-white hover:bg-white/20"
                        onClick={() => { setAnnualPhysicalActivity(false); }}
                        aria-label="Revenir"
                      >
                        &lt;
                      </Button>
                      <Button
                        className="flex-1 h-12 text-base font-semibold bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/30 disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={!annualPhysicalActivityAnswer}
                        onClick={() => { if (annualPhysicalActivityAnswer) { if (annualPhysicalActivityAnswer === 'Non') { setAnnualPhysicalActivityNoExplain(true); } else { setAnnualPhysicalActivityDetail(true); } } }}
                      >
                        Ok
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
      // Écran détail activité physique (étape 30)
  if (annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && annualWorkload && annualTaskDifficulty && annualPhysicalFatigue && annualMentalFatigue && annualMentalFatigueExplain && annualReassure && annualPain && annualPainLocation && annualAnxiety && annualAnxietyExplain && annualSleepQuality && annualSleepQualityExplain && annualSleepDuration && annualCareMessage && annualNutrition && annualNutritionExplain && annualPhysicalActivity && annualPhysicalActivityDetail && !annualAlmostThere) {
        return (
          <div className="relative min-h-screen w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1400&q=60')" }} />
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div className="relative z-10 flex flex-col min-h-screen px-6 pt-16 pb-4">
              <div className="max-w-2xl mx-auto w-full flex flex-col flex-1">
                <AnnualProgressBar className="mb-8" />
                <div className="mb-10 text-left">
                  <h1 className="text-3xl font-semibold text-white leading-snug mb-8">Si oui, laquelle? À quelle fréquence ?*</h1>
                  <div className="max-w-xl w-full">
                    <div className="relative group">
                      <input
                        type="text"
                        value={annualPhysicalActivityDetailText}
                        onChange={e => { setAnnualPhysicalActivityDetailText(e.target.value); try { localStorage.setItem(annualStoragePrefix + 'physical_activity_detail', e.target.value); } catch {} }}
                        placeholder="Répondez ici…"
                        className="w-full bg-transparent focus:outline-none text-white placeholder-blue-200 text-lg tracking-wide"
                        aria-label="Détail activité physique"
                      />
                      <div className="h-px w-full bg-white/30 mt-2" />
                    </div>
                  </div>
                </div>
                <div className="mt-auto">
                  <div className="rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-600 to-blue-700/90 backdrop-blur-md border border-white/20 rounded-2xl">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 font-medium w-16 flex items-center justify-center bg-white/10 border-white/40 text-white hover:bg-white/20"
                        onClick={() => { setAnnualPhysicalActivityDetail(false); }}
                        aria-label="Revenir"
                      >
                        &lt;
                      </Button>
                      <Button
                        className="flex-1 h-12 text-base font-semibold bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/30 disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={!annualPhysicalActivityDetailText.trim()}
                        onClick={() => { if (annualPhysicalActivityDetailText.trim()) { setAnnualAlmostThere(true); } }}
                      >
                        Ok
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
      // Écran explication activité physique SI NON (étape 31)
  if (annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && annualWorkload && annualTaskDifficulty && annualPhysicalFatigue && annualMentalFatigue && annualMentalFatigueExplain && annualReassure && annualPain && annualPainLocation && annualAnxiety && annualAnxietyExplain && annualSleepQuality && annualSleepQualityExplain && annualSleepDuration && annualCareMessage && annualNutrition && annualNutritionExplain && annualPhysicalActivity && annualPhysicalActivityNoExplain && !annualPhysicalActivityDetail && !annualAlmostThere) {
        return (
          <div className="relative min-h-screen w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?auto=format&fit=crop&w=1400&q=60')" }} />
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div className="relative z-10 flex flex-col min-h-screen px-6 pt-16 pb-4">
              <div className="max-w-2xl mx-auto w-full flex flex-col flex-1">
                <AnnualProgressBar className="mb-8" />
                <div className="mb-10 text-left">
                  <h1 className="text-3xl font-semibold text-white leading-snug mb-8">Si non, peux-tu expliquer pourquoi ?*</h1>
                  <div className="max-w-xl w-full">
                    <div className="relative group">
                      <input
                        type="text"
                        value={annualPhysicalActivityNoExplainText}
                        onChange={e => { setAnnualPhysicalActivityNoExplainText(e.target.value); try { localStorage.setItem(annualStoragePrefix + 'physical_activity_no_explain', e.target.value); } catch {} }}
                        placeholder="Répondez ici…"
                        className="w-full bg-transparent focus:outline-none text-white placeholder-blue-200 text-lg tracking-wide"
                        aria-label="Explication non activité physique"
                      />
                      <div className="h-px w-full bg-white/30 mt-2" />
                    </div>
                  </div>
                </div>
                <div className="mt-auto">
                  <div className="rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-600 to-blue-700/90 backdrop-blur-md border border-white/20 rounded-2xl">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 font-medium w-16 flex items-center justify-center bg-white/10 border-white/40 text-white hover:bg-white/20"
                        onClick={() => { setAnnualPhysicalActivityNoExplain(false); }}
                        aria-label="Revenir"
                      >
                        &lt;
                      </Button>
                      <Button
                        className="flex-1 h-12 text-base font-semibold bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/30 disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={!annualPhysicalActivityNoExplainText.trim()}
                        onClick={() => { if (annualPhysicalActivityNoExplainText.trim()) { setAnnualAlmostThere(true); } }}>
                        Ok
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
      // Écran transition "On y est presque!" (étape 32)
  if (annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && annualWorkload && annualTaskDifficulty && annualPhysicalFatigue && annualMentalFatigue && annualMentalFatigueExplain && annualReassure && annualPain && annualPainLocation && annualAnxiety && annualAnxietyExplain && annualSleepQuality && annualSleepQualityExplain && annualSleepDuration && annualCareMessage && annualNutrition && annualNutritionExplain && annualPhysicalActivity && (annualPhysicalActivityDetail || annualPhysicalActivityNoExplain) && annualAlmostThere && !annualSymptoms) {
        return (
          <div className="relative min-h-screen w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=1400&q=60')" }} />
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className="relative z-10 flex flex-col min-h-screen px-6 pt-16 pb-4">
              <div className="max-w-2xl mx-auto w-full flex flex-col flex-1">
                <AnnualProgressBar className="mb-8" />
                <div className="flex-1 flex items-center justify-center">
                  <h1 className="text-4xl font-semibold text-white text-center leading-snug">On y est presque!</h1>
                </div>
                <div className="mt-auto">
                  <div className="rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-600 to-blue-700/90 backdrop-blur-md border border-white/20 rounded-2xl">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 font-medium w-16 flex items-center justify-center bg-white/10 border-white/40 text-white hover:bg-white/20"
                        onClick={() => { setAnnualAlmostThere(false); }}
                        aria-label="Revenir"
                      >
                        &lt;
                      </Button>
                      <Button
                        className="flex-1 h-12 text-base font-semibold bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/30"
                        onClick={() => { setAnnualSymptoms(true); }}
                      >
                        Continuer
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
      // Écran motivation
      // Écran symptômes (étape 33)
  if (annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && annualWorkload && annualTaskDifficulty && annualPhysicalFatigue && annualMentalFatigue && annualMentalFatigueExplain && annualReassure && annualPain && annualPainLocation && annualAnxiety && annualAnxietyExplain && annualSleepQuality && annualSleepQualityExplain && annualSleepDuration && annualCareMessage && annualNutrition && annualNutritionExplain && annualPhysicalActivity && (annualPhysicalActivityDetail || annualPhysicalActivityNoExplain) && annualAlmostThere && annualSymptoms && !annualWorkstation) {
        const symptomOptions = [
          'Engourdissement',
          'Étourdissement',
          'Malaise vagal',
          'Vertiges',
          'Essoufflement',
          'Étouffement',
          'Lourdeur',
          'Picotement',
          'Tremblement',
          'Transpiration abondante',
          'Troubles digestifs',
          'Troubles du sommeil',
          'Constamment tendu(e)',
          'Constamment nerveux(se)',
          'Constamment dans la peur',
          'Autre'
        ];
        const toggleSymptom = (s: string) => {
          setAnnualSymptomsSelected(prev => {
            const exists = prev.includes(s);
            const updated = exists ? prev.filter(x => x !== s) : [...prev, s];
            try { localStorage.setItem(annualStoragePrefix + 'symptoms_selected', JSON.stringify(updated)); } catch {}
            return updated;
          });
        };
        return (
          <div className="relative min-h-screen w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=60')" }} />
            <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />
            <div className="relative z-10 flex flex-col min-h-screen px-6 pt-16 pb-4">
              <div className="max-w-2xl mx-auto w-full flex flex-col flex-1">
                <AnnualProgressBar className="mb-8" />
                <div className="mb-8">
                  <h1 className="text-3xl font-semibold text-white leading-snug mb-4">Es-tu dans l’un des états suivants ?</h1>
                  <p className="text-white/80 text-sm">Sélectionne tout ce qui s'applique.</p>
                </div>
                <div className="flex-1 overflow-auto pr-1">
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {symptomOptions.map(opt => {
                      const active = annualSymptomsSelected.includes(opt);
                      return (
                        <li key={opt}>
                          <button
                            type="button"
                            onClick={() => toggleSymptom(opt)}
                            className={`w-full text-left px-4 py-3 rounded-xl border transition font-medium text-sm backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-300/60 ${active ? 'bg-blue-600/80 border-blue-400 text-white shadow-lg shadow-blue-800/30' : 'bg-white/10 hover:bg-white/15 border-white/25 text-white/90'}`}
                            aria-pressed={active}
                          >
                            {opt}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="mt-6">
                  <div className="rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-600 to-blue-700/90 backdrop-blur-md border border-white/20 rounded-2xl">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 font-medium w-16 flex items-center justify-center bg-white/10 border-white/40 text-white hover:bg-white/20"
                        onClick={() => { setAnnualSymptoms(false); }}
                        aria-label="Revenir"
                      >
                        &lt;
                      </Button>
                      <Button
                        className="flex-1 h-12 text-base font-semibold bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/30 disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={annualSymptomsSelected.length === 0}
                        onClick={() => { if (annualSymptomsSelected.length > 0) { setAnnualWorkstation(true); } }}>
                        Ok
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
      // Écran aménagement poste de travail (étape 34)
  if (annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && annualWorkload && annualTaskDifficulty && annualPhysicalFatigue && annualMentalFatigue && annualMentalFatigueExplain && annualReassure && annualPain && annualPainLocation && annualAnxiety && annualAnxietyExplain && annualSleepQuality && annualSleepQualityExplain && annualSleepDuration && annualCareMessage && annualNutrition && annualNutritionExplain && annualPhysicalActivity && (annualPhysicalActivityDetail || annualPhysicalActivityNoExplain) && annualAlmostThere && annualSymptoms && annualWorkstation && !annualPractitionerNote) {
        return (
          <div className="relative min-h-screen w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1593642532744-d377ab507dc8?auto=format&fit=crop&w=1400&q=60')" }} />
            <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />
            <div className="relative z-10 flex flex-col min-h-screen px-6 pt-16 pb-4">
              <div className="max-w-2xl mx-auto w-full flex flex-col flex-1">
                <AnnualProgressBar className="mb-8" />
                <div className="mb-10 text-left">
                  <h1 className="text-3xl font-semibold text-white leading-snug mb-8">Que penses-tu de l'aménagement de ton poste de travail en entreprise et à domicile ?*</h1>
                  <div className="max-w-xl w-full">
                    <div className="relative group">
                      <textarea
                        value={annualWorkstationText}
                        onChange={e => { setAnnualWorkstationText(e.target.value); try { localStorage.setItem(annualStoragePrefix + 'workstation_feedback', e.target.value); } catch {} }}
                        placeholder="Répondez ici…"
                        className="w-full bg-white/10 focus:bg-white/15 transition rounded-xl p-4 text-white placeholder-blue-200 text-base leading-relaxed resize-none h-40 focus:outline-none border border-white/20 focus:border-white/40"
                        aria-label="Avis aménagement poste de travail"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-auto">
                  <div className="rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-600 to-blue-700/90 backdrop-blur-md border border-white/20 rounded-2xl">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 font-medium w-16 flex items-center justify-center bg-white/10 border-white/40 text-white hover:bg-white/20"
                        onClick={() => { setAnnualWorkstation(false); }}
                        aria-label="Revenir"
                      >
                        &lt;
                      </Button>
                      <Button
                        className="flex-1 h-12 text-base font-semibold bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/30 disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={!annualWorkstationText.trim()}
                        onClick={() => { if (annualWorkstationText.trim()) { setAnnualPractitionerNote(true); } }}
                      >
                        Continuer
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
      // Écran note praticien (étape 35)
  if (annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && annualWorkload && annualTaskDifficulty && annualPhysicalFatigue && annualMentalFatigue && annualMentalFatigueExplain && annualReassure && annualPain && annualPainLocation && annualAnxiety && annualAnxietyExplain && annualSleepQuality && annualSleepQualityExplain && annualSleepDuration && annualCareMessage && annualNutrition && annualNutritionExplain && annualPhysicalActivity && (annualPhysicalActivityDetail || annualPhysicalActivityNoExplain) && annualAlmostThere && annualSymptoms && annualWorkstation && annualPractitionerNote && !annualConclusion) {
        return (
          <div className="relative min-h-screen w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1518976024611-28bf4b37a07a?auto=format&fit=crop&w=1400&q=60')" }} />
            <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />
            <div className="relative z-10 flex flex-col min-h-screen px-6 pt-16 pb-4">
              <div className="max-w-2xl mx-auto w-full flex flex-col flex-1">
                <AnnualProgressBar className="mb-8" />
                <div className="mb-8 text-left">
                  <h1 className="text-3xl font-semibold text-white leading-snug mb-6">Tu peux ajouter une information pour ton Praticien</h1>
                  <p className="text-white/70 text-sm mb-6">Optionnel – partage un détail qui pourrait aider ton suivi.</p>
                  <div className="max-w-xl w-full">
                    <textarea
                      value={annualPractitionerNoteText}
                      onChange={e => { setAnnualPractitionerNoteText(e.target.value); try { localStorage.setItem(annualStoragePrefix + 'practitioner_note', e.target.value); } catch {} }}
                      placeholder="Écris une note personnelle… (optionnel)"
                      className="w-full bg-white/10 focus:bg-white/15 transition rounded-xl p-4 text-white placeholder-blue-200 text-base leading-relaxed resize-none h-40 focus:outline-none border border-white/20 focus:border-white/40"
                      aria-label="Note pour le praticien"
                    />
                  </div>
                </div>
                <div className="mt-auto">
                  <div className="rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-600 to-blue-700/90 backdrop-blur-md border border-white/20 rounded-2xl">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 font-medium w-16 flex items-center justify-center bg-white/10 border-white/40 text-white hover:bg-white/20"
                        onClick={() => { setAnnualPractitionerNote(false); }}
                        aria-label="Revenir"
                      >
                        &lt;
                      </Button>
                      <Button
                        className="flex-1 h-12 text-base font-semibold bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/30"
                        onClick={() => { setAnnualConclusion(true); }}
                      >
                        Continuer
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
      // Écran conclusion finale (étape 36)
      if (annualSatisfaction && annualExplainWhy && annualMotivation && annualWorkSchedule && annualWorkload && annualTaskDifficulty && annualPhysicalFatigue && annualMentalFatigue && annualMentalFatigueExplain && annualReassure && annualPain && annualPainLocation && annualAnxiety && annualAnxietyExplain && annualSleepQuality && annualSleepQualityExplain && annualSleepDuration && annualCareMessage && annualNutrition && annualNutritionExplain && annualPhysicalActivity && (annualPhysicalActivityDetail || annualPhysicalActivityNoExplain) && annualAlmostThere && annualSymptoms && annualWorkstation && annualPractitionerNote && annualConclusion) {
        return (
          <div className="relative min-h-screen w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1400&q=60')" }} />
            <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />
            <div className="relative z-10 flex flex-col min-h-screen px-6 pt-16 pb-4">
              <div className="max-w-2xl mx-auto w-full flex flex-col flex-1">
                <AnnualProgressBar className="mb-8" />
                <div className="flex-1 flex items-center">
                  <div className="text-left text-white space-y-6">
                    <h1 className="text-3xl font-semibold leading-snug">Bravo, tu as terminé le questionnaire !</h1>
                    <p className="text-white/85 leading-relaxed">
                      Ton praticien va maintenant préparer un accompagnement personnalisé pour toi.
                    </p>
                    <p className="text-white/85 leading-relaxed">
                      Domaines pris en compte :<br />
                      <span className="font-medium">** Gestion du stress ** Respiration ** Posture ** Activité physique ** Alimentation ** Sommeil **</span>
                    </p>
                    <p className="text-white/85 leading-relaxed">
                      Chaque réponse va l’aider à comprendre ta situation globale et à prioriser les actions les plus utiles.
                    </p>
                    <p className="text-white/90 font-medium">A très vite pour la suite de ton accompagnement !</p>
                  </div>
                </div>
                <div className="mt-auto">
                  <div className="rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-600 to-blue-700/90 backdrop-blur-md border border-white/20 rounded-2xl">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 font-medium w-16 flex items-center justify-center bg-white/10 border-white/40 text-white hover:bg-white/20"
                        onClick={() => { setAnnualConclusion(false); }}
                        aria-label="Revenir"
                      >
                        &lt;
                      </Button>
                      <Button
                        className="flex-1 h-12 text-base font-semibold bg-emerald-500/80 hover:bg-emerald-500 text-white backdrop-blur-md border border-white/30"
                        onClick={() => {
                          // TODO: envoyer les données agrégées au backend
                          setCurrentView('dashboard');
                          setAnnualStarted(false);
                        }}
                      >
                        Envoyer
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
  }
      if (annualSatisfaction && annualExplainWhy && annualMotivation && !annualWorkSchedule) {
        return (
          <div className="relative min-h-screen w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1602192106373-52c8d08af2b5?auto=format&fit=crop&w=1400&q=60')" }} />
            <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />
            <div className="relative z-10 flex flex-col min-h-screen px-6 pt-16 pb-4">
              <div className="max-w-xl mx-auto w-full flex flex-col flex-1">
                <AnnualProgressBar className="mb-8" />
                <div className="flex-1 flex items-center">
                  <blockquote className="text-center w-full">
                    <p className="text-3xl font-semibold text-white leading-snug">
                      <span className="block">Nous sommes là pour toi.</span>
                      <span className="block">Notre priorité, te sentir en meilleure forme !</span>
                    </p>
                  </blockquote>
                </div>
                <div className="mt-auto">
                  <div className="rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-600 to-blue-700/90 backdrop-blur-md border border-white/20 rounded-2xl">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 font-medium w-16 flex items-center justify-center bg-white/10 border-white/40 text-white hover:bg-white/20"
                        onClick={() => { setAnnualMotivation(false); }}
                        aria-label="Revenir"
                      >
                        &lt;
                      </Button>
                      <Button
                        className="flex-1 h-12 text-base font-semibold bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/30"
                        onClick={() => { setAnnualWorkSchedule(true); }}
                      >
                        Continuer
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
      // Écran explication why (avant motivation)
      if (annualSatisfaction && annualExplainWhy && !annualMotivation) {
        const minLen = 4;
        const canSubmit = annualExplainWhyText.trim().length >= minLen;
        return (
          <div className="relative min-h-screen w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1400&q=60')" }} />
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className="relative z-10 flex flex-col min-h-screen px-6 pt-16 pb-4">
              <div className="max-w-xl mx-auto w-full flex flex-col flex-1">
                <AnnualProgressBar className="mb-8" />
                <div className="mb-8 text-left">
                  <h1 className="text-3xl font-semibold text-white leading-snug mb-6">Peux-tu expliquer pourquoi?*</h1>
                  <div className="mt-2">
                    <div className="relative">
                      <textarea
                        className="w-full min-h-[180px] bg-transparent focus:outline-none text-white text-sm leading-relaxed placeholder-blue-200/70 px-1 pb-2"
                        placeholder="Répondez ici…"
                        value={annualExplainWhyText}
                        onChange={(e) => { const v = e.target.value; setAnnualExplainWhyText(v); try { localStorage.setItem(annualStoragePrefix + 'explain_work_satisfaction', JSON.stringify(v)); } catch {} }}
                      />
                      <div className="pointer-events-none absolute left-0 right-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                    </div>
                    {!canSubmit && <p className="mt-2 text-xs text-white/70">Merci de saisir au moins {minLen} caractères.</p>}
                  </div>
                </div>
                <div className="mt-auto">
                  <div className="rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-600 to-blue-700/90 backdrop-blur-md border border-white/20 rounded-2xl">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 font-medium w-16 flex items-center justify-center bg-white/10 border-white/40 text-white hover:bg-white/20"
                        onClick={() => { setAnnualExplainWhy(false); }}
                        aria-label="Revenir"
                      >
                        &lt;
                      </Button>
                      <Button
                        className="flex-1 h-12 text-base font-semibold bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/30 disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={!canSubmit}
                        onClick={() => { if (canSubmit) { setAnnualMotivation(true); } }}
                      >
                        Ok
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
      if (annualSatisfaction) {
        const numbers = Array.from({ length: 11 }, (_, i) => i); // 0..10
        return (
          <div className="relative min-h-screen w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1525182008055-f88b95ff7980?auto=format&fit=crop&w=1400&q=60')" }} />
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className="relative z-10 flex flex-col min-h-screen px-6 pt-16 pb-4">
              <div className="max-w-xl mx-auto w-full flex flex-col flex-1">
                <AnnualProgressBar className="mb-8" />
                <div className="mb-8 text-left">
                  <h1 className="text-3xl font-semibold text-white leading-snug mb-4">Je suis satisfait de mon travail.</h1>
                  <p className="text-white/80 text-sm mb-6">0 = Pas du tout satisfait(e) · 7 = Satisfait(e) · 10 = Très satisfait(e)</p>
                  <div className="grid grid-cols-6 gap-3">
                    {numbers.slice(0,6).map(n => {
                      const selected = annualSatisfactionAnswer === n;
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => { setAnnualSatisfactionAnswer(n); try { localStorage.setItem(annualStoragePrefix + 'satisfaction_work', JSON.stringify(n)); } catch {} }}
                          className={`aspect-square flex items-center justify-center rounded-xl border text-sm font-semibold backdrop-blur-md transition [transition-property:background,border,color,transform] duration-200 ${selected ? 'bg-white/25 border-white text-white shadow-lg animate-selectPop' : 'bg-white/10 border-white/40 text-white hover:bg-white/15'}`}
                          aria-pressed={selected}
                        >{n}</button>
                      );
                    })}
                    {numbers.slice(6).map(n => {
                      const selected = annualSatisfactionAnswer === n;
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => { setAnnualSatisfactionAnswer(n); try { localStorage.setItem(annualStoragePrefix + 'satisfaction_work', JSON.stringify(n)); } catch {} }}
                          className={`aspect-square flex items-center justify-center rounded-xl border text-sm font-semibold backdrop-blur-md transition [transition-property:background,border,color,transform] duration-200 ${selected ? 'bg-white/25 border-white text-white shadow-lg animate-selectPop' : 'bg-white/10 border-white/40 text-white hover:bg-white/15'}`}
                          aria-pressed={selected}
                        >{n}</button>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-auto">
                  <div className="rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-600 to-blue-700/90 backdrop-blur-md border border-white/20 rounded-2xl">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 font-medium w-16 flex items-center justify-center bg-white/10 border-white/40 text-white hover:bg-white/20"
                        onClick={() => { setAnnualSatisfaction(false); }}
                        aria-label="Revenir"
                      >
                        &lt;
                      </Button>
                      <Button
                        className="flex-1 h-12 text-base font-semibold bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/30 disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={annualSatisfactionAnswer === null}
                        onClick={() => { if (annualSatisfactionAnswer !== null) { setAnnualExplainWhy(true); } }}
                      >
                        Ok
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
      // Fin après deuxième Likert travail
      const workLikertOptions = [
        { code: 'A', label: 'Tout à fait d\'accord' },
        { code: 'B', label: 'Plutôt d\'accord' },
        { code: 'C', label: 'Pas d\'accord' },
        { code: 'D', label: 'Pas du tout d\'accord' }
      ];
      return (
        <div className="relative min-h-screen w-full overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=60')" }} />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative z-10 flex flex-col min-h-screen px-6 pt-16 pb-4">
            <div className="max-w-xl mx-auto w-full flex flex-col flex-1">
              <AnnualProgressBar className="mb-8" />
              <div className="mb-8 text-left">
                <h1 className="text-3xl font-semibold text-white leading-snug mb-6">Je suis épanoui(e) et investi(e) dans mon travail</h1>
                <div className="space-y-4">
                  {workLikertOptions.map(opt => {
                    const selected = annualLikertWorkAnswer === opt.code;
                    return (
                      <button
                        key={opt.code}
                        type="button"
                        onClick={() => { setAnnualLikertWorkAnswer(opt.code); try { localStorage.setItem(annualStoragePrefix + 'likert_work_engagement', JSON.stringify(opt.code)); } catch {} }}
                        onMouseDown={(e) => e.currentTarget.classList.add('pressing')}
                        onMouseUp={(e) => e.currentTarget.classList.remove('pressing')}
                        onMouseLeave={(e) => e.currentTarget.classList.remove('pressing')}
                        className={`w-full flex items-center gap-4 rounded-2xl border backdrop-blur-md px-5 py-4 text-left transition [transition-property:background,border,color,transform] duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/70 ${selected ? 'bg-white/20 border-white text-white shadow-lg animate-selectPop' : 'bg-white/10 border-white/50 text-white hover:bg-white/15'}`}
                        aria-pressed={selected}
                      >
                        <span className="flex items-center justify-center h-9 w-9 rounded-full bg-indigo-500 text-white text-sm font-bold border border-white/40 shadow">{opt.code}</span>
                        <span className="font-medium tracking-wide">{opt.label}</span>
                        {selected && <Check className="ml-auto h-6 w-6 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="mt-auto">
                <div className="rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-600 to-blue-700/90 backdrop-blur-md border border-white/20 rounded-2xl">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-12 font-medium w-16 flex items-center justify-center bg-white/10 border-white/40 text-white hover:bg-white/20"
                      onClick={() => { setAnnualLikertWork(false); setAnnualLikert(true); }}
                      aria-label="Revenir"
                    >
                      &lt;
                    </Button>
                    <Button
                      className="flex-1 h-12 text-base font-semibold bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/30 disabled:opacity-40 disabled:cursor-not-allowed"
                      disabled={!annualLikertWorkAnswer}
                      onClick={() => { if (annualLikertWorkAnswer) { setAnnualSatisfaction(true); } }}
                    >
                      Ok
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    if (isAnnual && annualStarted && annualFinished && annualGeneral && annualFeelings && annualExplain && annualLikert && !annualLikertWork) {
      // Premier Likert (bonheur global) → enchaîne vers Likert travail
      const likertOptions = [
        { code: 'A', label: 'Tout à fait d\'accord' },
        { code: 'B', label: 'Plutôt d\'accord' },
        { code: 'C', label: 'Pas d\'accord' },
        { code: 'D', label: 'Pas du tout d\'accord' }
      ];
      return (
        <div className="relative min-h-screen w-full overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1400&q=60')" }} />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative z-10 flex flex-col min-h-screen px-6 pt-16 pb-4">
            <div className="max-w-xl mx-auto w-full flex flex-col flex-1">
              <AnnualProgressBar className="mb-8" />
              <div className="mb-8 text-left">
                <h1 className="text-3xl font-semibold text-white leading-snug mb-6">Je suis heureux(se) et comblé(e) dans ma vie</h1>
                <div className="space-y-4">
                  {likertOptions.map(opt => {
                    const selected = annualLikertAnswer === opt.code;
                    return (
                      <button
                        key={opt.code}
                        type="button"
                        onClick={() => { setAnnualLikertAnswer(opt.code); try { localStorage.setItem(annualStoragePrefix + 'likert_happiness', JSON.stringify(opt.code)); } catch {} }}
                        onMouseDown={(e) => e.currentTarget.classList.add('pressing')}
                        onMouseUp={(e) => e.currentTarget.classList.remove('pressing')}
                        onMouseLeave={(e) => e.currentTarget.classList.remove('pressing')}
                        className={`w-full flex items-center gap-4 rounded-2xl border backdrop-blur-md px-5 py-4 text-left transition [transition-property:background,border,color,transform] duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/70 ${selected ? 'bg-white/20 border-white text-white shadow-lg animate-selectPop' : 'bg-white/10 border-white/50 text-white hover:bg-white/15'}`}
                        aria-pressed={selected}
                      >
                        <span className="flex items-center justify-center h-9 w-9 rounded-full bg-indigo-500 text-white text-sm font-bold border border-white/40 shadow">{opt.code}</span>
                        <span className="font-medium tracking-wide">{opt.label}</span>
                        {selected && <Check className="ml-auto h-6 w-6 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="mt-auto">
                <div className="rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-600 to-blue-700/90 backdrop-blur-md border border-white/20 rounded-2xl">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-12 font-medium w-16 flex items-center justify-center bg-white/10 border-white/40 text-white hover:bg-white/20"
                      onClick={() => { setAnnualLikert(false); }}
                      aria-label="Revenir"
                    >
                      &lt;
                    </Button>
                    <Button
                      className="flex-1 h-12 text-base font-semibold bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/30 disabled:opacity-40 disabled:cursor-not-allowed"
                      disabled={!annualLikertAnswer}
                      onClick={() => { if (annualLikertAnswer) { setAnnualLikertWork(true); } }}
                    >
                      Ok
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    if (isAnnual && annualStarted && annualFinished && annualGeneral && annualFeelings && annualExplain) {
      const canFinish = annualExplainText.trim().length > 3; // au moins quelques caractères
      return (
        <AnnualBackground>
          <div className="max-w-xl mx-auto w-full flex flex-col flex-1">
              <AnnualProgressBar />
              <div className="mb-8 text-left">
                <h1 className="text-2xl font-bold leading-snug mb-4 whitespace-pre-line text-white">Et peux-tu expliquer pourquoi?*</h1>
                <p className="text-sm text-white/80 mb-4">Prends ton temps, nous voulons mieux te comprendre.</p>
                <div className="rounded-2xl border border-white/40 bg-white/10 backdrop-blur-md p-3">
                  <textarea
                    className="w-full min-h-[160px] rounded-xl border border-white/30 px-4 py-3 text-sm bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/80 focus:border-indigo-300 resize-vertical"
                    placeholder="Réponds ici..."
                    value={annualExplainText}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAnnualExplainText(val);
                      try { localStorage.setItem(annualStoragePrefix + 'feelings_explain', JSON.stringify(val)); } catch {}
                    }}
                  />
                </div>
                {!canFinish && (
                  <p className="mt-2 text-xs text-white/70">Merci d'écrire au moins quelques mots.</p>
                )}
              </div>
              <div className="mt-auto flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 font-medium w-16 flex items-center justify-center bg-white/10 border-white/40 text-white hover:bg-white/20"
                  onClick={() => { setAnnualExplain(false); }}
                  aria-label="Revenir"
                >
                  &lt;
                </Button>
                <Button
                  className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={!canFinish}
                  onClick={() => { if (canFinish) { setAnnualLikert(true); } }}
                >
                  Ok
                </Button>
              </div>
      </div>
    </AnnualBackground>
      );
    }
    // Écran feelings (après la question générale)
    if (isAnnual && annualStarted && annualFinished && annualGeneral && annualFeelings) {
      return (
        <AnnualBackground>
          <div className="max-w-xl mx-auto w-full flex flex-col flex-1">
              <AnnualProgressBar />
              <div className="text-left mb-8">
                <h1 className="text-2xl font-bold leading-snug mb-6 text-white">Te sens-tu?*</h1>
                <AnnualOptionList
                  multiple
                  options={[
                    'Agacé(e)','Anxieux(se)','Déçu(e)','Ennuyé(e)','Impatient(e)','Nerveux(se)','Fragile','Jugé(e)','Triste','Épuisé(e)','Stressé(e)','Perdu(e)','Dévalorisé(e)','Pas écouté(e)','Isolé(e)','En quête de sens','Autre'
                  ].map(v => ({ value: v }))}
                  value={annualFeelingsAnswer}
                  onChange={(val) => {
                    if (Array.isArray(val)) {
                      setAnnualFeelingsAnswer(val);
                      try { localStorage.setItem(annualStoragePrefix + 'feelings_state', JSON.stringify(val)); } catch {}
                    }
                  }}
                  className="mb-2"
                />
                {annualFeelingsAnswer.length === 0 && (
                  <p className="text-xs text-white/70 mt-2">Sélectionne au moins une option pour continuer.</p>
                )}
              </div>
              <div className="mt-auto flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 font-medium w-16 flex items-center justify-center bg-white/10 border-white/40 text-white hover:bg-white/20"
                  onClick={() => { setAnnualFeelings(false); }}
                  aria-label="Revenir"
                >
                  &lt;
                </Button>
                <Button
                  className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={annualFeelingsAnswer.length === 0}
                  onClick={() => { if (annualFeelingsAnswer.length) { setAnnualExplain(true); } }}
                >
                  Ok
                </Button>
              </div>
      </div>
    </AnnualBackground>
      );
    }
    // Écran question générale
    if (isAnnual && annualStarted && annualFinished && annualGeneral) {
      return (
        <AnnualBackground>
          <div className="max-w-xl mx-auto w-full flex flex-col flex-1">
              <AnnualProgressBar />
              <div className="text-left mb-8">
                <h1 className="text-2xl font-bold leading-snug mb-6 text-white">De façon générale, comment vas-tu?*</h1>
                <AnnualOptionList
                  options={[
                    { value: 'Super bien*', label: 'Super bien*', emoji: '😃' },
                    { value: 'Bien*', label: 'Bien*', emoji: '🙂' },
                    { value: 'Pas très bien*', label: 'Pas très bien*', emoji: '😕' },
                    { value: 'Mal*', label: 'Mal*', emoji: '😟' },
                    { value: 'je ne sais pas*', label: 'je ne sais pas*', emoji: '🤔' }
                  ]}
                  value={annualGeneralAnswer}
                  onChange={(val) => {
                    if (typeof val === 'string') {
                      setAnnualGeneralAnswer(val);
                      try { localStorage.setItem(annualStoragePrefix + 'general_wellbeing', JSON.stringify(val)); } catch {}
                    }
                  }}
                  showCheckIndicator
                  className="mb-2"
                />
                {!annualGeneralAnswer && (
                  <p className="text-xs text-white/70 mt-2">Sélectionne une option pour continuer.</p>
                )}
              </div>
              <div className="mt-auto flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 font-medium w-16 flex items-center justify-center bg-white/10 border-white/40 text-white hover:bg-white/20"
                  onClick={() => { setAnnualGeneral(false); }}
                  aria-label="Revenir"
                >
                  &lt;
                </Button>
                <Button
                  className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={!annualGeneralAnswer}
                  onClick={() => { if (annualGeneralAnswer) { setAnnualFeelings(true); } }}
                >
                  Ok
                </Button>
              </div>
      </div>
    </AnnualBackground>
      );
    }
    if (isAnnual && annualStarted && annualFinished) {
      return (
        <div className="relative min-h-screen w-full overflow-hidden animate-fadeIn">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1400&q=60')" }} />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
            <div className="max-w-xl w-full space-y-10">
              <div className="mb-2">
                <AnnualProgressBar className="mb-0" />
              </div>
              <h1 className="text-4xl font-semibold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">Très bien. C'est parti!</h1>
              <Button
                className="w-full h-14 text-base font-semibold bg-gradient-to-r from-indigo-500 to-fuchsia-600 hover:opacity-90 shadow-lg shadow-fuchsia-900/30"
                onClick={() => { setAnnualGeneral(true); }}
              >
                Continuer
              </Button>
            </div>
          </div>
        </div>
      );
    }
  if (isAnnual && annualStarted) {
      // Rendu des questions annuelles via le même composant DiagnosticStep
      const currentAnnualQuestion: any = annualQuestions[annualStep - 1];
      const currentAnnualAnswer = annualAnswers[currentAnnualQuestion?.id];

      const handleAnnualNext = async () => {
        // Étapes démographiques initiales (annualQuestions) -> on avance sans sauvegarder tant que pas terminé
        if (annualStep < annualQuestions.length) {
          setAnnualStep(annualStep + 1);
          return;
        }
        // Ici: l'utilisateur vient de valider la dernière question démographique.
        // Ancien comportement: on retournait immédiatement (bloquant la progression au step 3).
        // Nouveau: on marque le bloc démographique comme terminé pour afficher l'écran de transition.
        if (annualStep === annualQuestions.length && !annualFinished) {
          setAnnualFinished(true); // déclenche le rendu du bloc "Très bien. C'est parti!"
          return;
        }
        // On ne sauvegarde que quand tout le flux avancé (écran final marqué annualConclusion true)
        if (!annualConclusion) {
          // On bascule dans les écrans avancés sans persister tant que pas conclusion
          return;
        }
  try {
            const stress_level = Number(diagnosticAnswers?.stress_level) || 5;
            const energy_level = Number(diagnosticAnswers?.energy_level) || 5;
            const work_pressure = String(diagnosticAnswers?.work_pressure || annualAnswers?.work_pressure || 'Non précisé');

            // Agrégation exhaustive de toutes les réponses dispersées dans les states annuels
            const aggregatedAnnualAnswers: Record<string, any> = {
              ...annualAnswers, // contient déjà gender, age, department, etc.
              general_overall: annualGeneralAnswer || null,
              feelings: annualFeelingsAnswer || [],
              feelings_explain: annualExplainText || null,
              likert_general: annualLikertAnswer || null,
              likert_work: annualLikertWorkAnswer || null,
              satisfaction_score: annualSatisfactionAnswer ?? null,
              satisfaction_explain: annualExplainWhyText || null,
              work_schedule: annualWorkScheduleAnswer || null,
              workload_level: annualWorkloadAnswer ?? null,
              task_difficulty: annualTaskDifficultyAnswer ?? null,
              physical_fatigue: annualPhysicalFatigueAnswer ?? null,
              mental_fatigue: annualMentalFatigueAnswer ?? null,
              mental_fatigue_explain: annualMentalFatigueExplainText || null,
              pain_level: annualPainAnswer ?? null,
              pain_location: annualPainLocationText || null,
              anxiety_level: annualAnxietyAnswer ?? null,
              anxiety_explain: annualAnxietyExplainText || null,
              sleep_quality: annualSleepQualityAnswer ?? null,
              sleep_quality_explain: annualSleepQualityExplainText || null,
              sleep_duration: annualSleepDurationAnswer || null,
              nutrition_level: annualNutritionAnswer ?? null,
              nutrition_explain: annualNutritionExplainText || null,
              physical_activity: annualPhysicalActivityAnswer || null,
              physical_activity_detail: annualPhysicalActivityDetailText || null,
              physical_activity_no_explain: annualPhysicalActivityNoExplainText || null,
              symptoms: annualSymptomsSelected || [],
              workstation_adaptation: annualWorkstationText || null,
              practitioner_note: annualPractitionerNoteText || null,
              conclusion: annualConclusion ? true : false,
              quick_snapshot: diagnosticAnswers || null,
            };

            await apiService.diagnostic.saveAnnual({
              stress_level,
              energy_level,
              work_pressure,
              answers: aggregatedAnnualAnswers,
            });

            // Recharger les diagnostics (quick & annual)
            try {
              const res = await apiService.diagnostic.get();
              const data = res?.data ?? null;
              if (data && (data.quick || data.annual)) {
                setSavedQuickDiagnostic(data.quick || null);
                setSavedAnnualDiagnostic(data.annual || null);
                setSavedDiagnostic(data.quick || data.annual || null);
              } else {
                setSavedDiagnostic(data);
              }
            } catch {}
            toast({ title: 'Auto‑diagnostic annuel sauvegardé', description: 'Merci pour ces informations détaillées.' });
          } catch (e) {
            console.warn('Échec sauvegarde diagnostic annuel', e);
            toast({ title: 'Erreur', description: 'Impossible de sauvegarder le diagnostic annuel.', variant: 'destructive' });
          }
          setAnnualFinished(true);
      };

      const handleAnnualPrevious = () => {
        if (annualStep > 1) setAnnualStep(annualStep - 1);
      };

      const handleAnnualAnswerChange = (val: any) => {
        setAnnualAnswers(prev => ({ ...prev, [currentAnnualQuestion.id]: val }));
        // Auto-save immédiat (léger) – pourrait être amélioré avec debounce si besoin.
        try {
          const key = annualStoragePrefix + currentAnnualQuestion.id;
          localStorage.setItem(key, typeof val === 'string' ? JSON.stringify(val) : JSON.stringify(val));
        } catch {}
      };

      const isRequired = currentAnnualQuestion.question.includes('*');
      const hasAnswer = currentAnnualAnswer !== undefined && (
        currentAnnualQuestion.type !== 'text' || (typeof currentAnnualAnswer === 'string' && currentAnnualAnswer.trim() !== '')
      );
      const canProceed = !isRequired || hasAnswer;

      return (
        <div className="relative min-h-screen w-full overflow-hidden animate-fadeIn">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1400&q=60')" }} />
            <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
            <div className="relative z-10 min-h-screen px-4 pt-16 pb-10 flex flex-col">
              <div className="max-w-xl mx-auto w-full flex-1 flex flex-col">
                <AnnualProgressBar />
                <div className="rounded-2xl border border-white/30 bg-white/10 backdrop-blur-md p-6 shadow-lg flex flex-col flex-1">
                  <div className="mb-6 text-left">
                    <h2 className="text-xl font-semibold leading-relaxed whitespace-pre-line text-white">
                      {currentAnnualQuestion.question}
                    </h2>
                    {currentAnnualQuestion.description && (
                      <p className="mt-3 text-sm text-white/70 whitespace-pre-line">
                        {currentAnnualQuestion.description}
                      </p>
                    )}
                  </div>
                  <div className="mb-8">
                    {currentAnnualQuestion.type === 'choice' && (
                      <div className="space-y-3">
                        {currentAnnualQuestion.options?.map((opt:string) => {
                          const selected = currentAnnualAnswer === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleAnnualAnswerChange(opt)}
                              onMouseDown={(e) => e.currentTarget.classList.add('pressing')}
                              onMouseUp={(e) => e.currentTarget.classList.remove('pressing')}
                              onMouseLeave={(e) => e.currentTarget.classList.remove('pressing')}
                              className={`w-full rounded-xl border px-5 py-4 flex items-center justify-between transition [transition-property:background,border,color,transform] duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400/70 ${selected ? 'bg-white/25 border-white text-white shadow-lg animate-selectPop' : 'bg-white/10 border-white/40 text-white hover:bg-white/15'}`}
                              aria-pressed={selected}
                            >
                              <span className="text-left flex-1 pr-4">{opt}</span>
                              {selected && <span className="h-2.5 w-2.5 rounded-full bg-fuchsia-300 shadow-inner" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {currentAnnualQuestion.type === 'text' && (
                      <textarea
                        className="w-full min-h-[140px] rounded-xl border border-white/30 px-4 py-3 text-sm bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/80 focus:border-indigo-300 resize-vertical"
                        placeholder="Écris ta réponse ici..."
                        value={currentAnnualAnswer || ''}
                        onChange={(e) => handleAnnualAnswerChange(e.target.value)}
                      />
                    )}
                  </div>
                  <div className="mt-auto flex justify-end">
                    <Button
                      onClick={handleAnnualNext}
                      disabled={!canProceed}
                      className="h-12 px-8 text-base font-semibold bg-gradient-to-r from-indigo-500 to-fuchsia-600 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Ok
                    </Button>
                  </div>
                </div>
              </div>
            </div>
        </div>
      );
    }
    const questions = diagnosticQuestions;
  const currentQuestion: any = questions[diagnosticStep - 1];
    const currentAnswer = diagnosticAnswers[currentQuestion?.id];

    const handleNext = async () => {
      if (diagnosticStep < questions.length) {
        setDiagnosticStep(diagnosticStep + 1);
      } else {
        console.log('Diagnostic completed:', diagnosticAnswers);
        // Sauvegarder le diagnostic côté backend (protégé Sanctum)
        try {
          await apiService.diagnostic.saveQuick({
            stress_level: Number(diagnosticAnswers.stress_level) || 5,
            energy_level: Number(diagnosticAnswers.energy_level) || 5,
            work_pressure: String(diagnosticAnswers.work_pressure || 'Non précisé'),
            answers: diagnosticAnswers,
          });
          // Recharger le diagnostic sauvegardé
          try {
            const res = await apiService.diagnostic.get();
            const data = res?.data ?? null;
            if (data && (data.quick || data.annual)) {
              setSavedQuickDiagnostic(data.quick || null);
              setSavedAnnualDiagnostic(data.annual || null);
              setSavedDiagnostic(data.quick || data.annual || null);
            } else {
              setSavedDiagnostic(data);
            }
            const sd = (data && (data.quick || data.annual)) ? (data.quick || data.annual) : data;
            const computedStress = sd ? toFiveScale(Number(sd?.stress_level) || 3) : undefined;
            const computedEnergy = sd ? toFiveScale(Number(sd?.energy_level) || 3) : undefined;
            let computedMood = sd ? moodEmojiToScore(sd?.answers?.mood_emoji) : undefined;
            if (computedMood === undefined && computedStress !== undefined) {
              computedMood = clamp(6 - computedStress, 1, 5);
            }
            const isPositive = (computedStress !== undefined && computedEnergy !== undefined && computedMood !== undefined)
              ? (computedStress <= 2 && computedMood >= 4 && computedEnergy >= 3)
              : false;
            // Rediriger vers la page "Suggestions" dans tous les cas
            setShowPostDiagnosticSuggestions(false);
            setCurrentView('suggestions');
            toast({ title: 'Diagnostic sauvegardé', description: 'Voici vos suggestions personnalisées.' });
          } catch (_) {}
          if (!savedDiagnostic) {
            // Fallback: si on n'a pas pu recharger, décider avec les réponses locales
            const stress10 = Number(diagnosticAnswers.stress_level) || 5;
            const energy10 = Number(diagnosticAnswers.energy_level) || 5;
            const stress5 = toFiveScale(stress10);
            const energy5 = toFiveScale(energy10);
            let mood5: number | undefined = undefined;
            // Si on n'a pas un emoji exploitable, approx via le stress
            if (mood5 === undefined) mood5 = clamp(6 - stress5, 1, 5);
            const isPositiveLocal = (stress5 <= 2 && (mood5 ?? 3) >= 4 && energy5 >= 3);
            // Fallback: redirection vers "Suggestions" également
            setShowPostDiagnosticSuggestions(false);
            setCurrentView('suggestions');
            toast({ title: 'Diagnostic sauvegardé', description: 'Voici vos suggestions personnalisées.' });
          }
        } catch (e: any) {
          console.error('Erreur sauvegarde diagnostic:', e);
          toast({ title: e?.message || 'Erreur lors de la sauvegarde', variant: 'destructive' });
          // En cas d'erreur, rester sur les suggestions pour guider l’utilisateur
          setShowPostDiagnosticSuggestions(false);
          setCurrentView('suggestions');
        }
      }
    };

    const handlePrevious = () => {
      if (diagnosticStep > 1) {
        setDiagnosticStep(diagnosticStep - 1);
      }
    };

    const handleAnswerChange = (value: any) => {
      setDiagnosticAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: value
      }));
    };

    const isText = currentQuestion?.type === 'text';
    if (isText) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4 pt-12">
          <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6 space-y-6">
            <div>
              <p className="text-sm text-gray-500 mb-2">Question {diagnosticStep} / {questions.length}</p>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">{currentQuestion.question}</h2>
              <textarea
                className="w-full border rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[140px] resize-y"
                placeholder="Votre réponse..."
                value={currentAnswer || ''}
                onChange={(e) => handleAnswerChange(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Button variant="outline" disabled={diagnosticStep === 1} onClick={handlePrevious}>Précédent</Button>
              <Button onClick={handleNext} disabled={!currentAnswer}>Suivant</Button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4 pt-12">
        <DiagnosticStep
          question={currentQuestion}
          currentStep={diagnosticStep}
          totalSteps={questions.length}
          value={currentAnswer}
          onValueChange={handleAnswerChange}
          onNext={handleNext}
          onPrevious={handlePrevious}
          canGoNext={currentAnswer !== undefined}
        />
      </div>
    );
  };

  const renderChallenges = () => (
    <div className="space-y-6 animate-fadeIn pt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Mes Défis</h1>
          <Badge variant="secondary" className="text-xs">{challengeList.length}</Badge>
        </div>
        <Button variant="outline" size="sm" onClick={() => setCurrentView('dashboard')}>
          Retour
        </Button>
      </div>

      <ChallengeFilter 
        activeFilters={challengeFilters}
        onFilterChange={setChallengeFilters}
      />

      <div className="grid gap-4">
        {wellnessCards.map((card, index) => (
          <WellnessCard
            key={index}
            {...card}
            onAction={() => handleWellnessCardAction(card.contentType)}
            actionLabel="Je le fais !"
          />
        ))}
        {/* Liste des défis avec statut */}
        <div className="border rounded-lg p-4 bg-white/70">
          <h2 className="font-semibold mb-1">Mes défis (depuis la base)</h2>
          <div className="text-xs text-gray-500 mb-2">
            Total: {challengeList.length}
            {' '}·{' '}Terminés: {challengeList.filter(c => c.status === 'finished' || !!c.completed_at).length}
            {' '}·{' '}En cours: {challengeList.filter(c => c.status === 'in_progress').length}
            {' '}·{' '}Non démarrés: {challengeList.filter(c => c.status === 'not_started').length}
          </div>
          <ul className="space-y-1 text-sm">
            {challengeList.map((c) => (
              <li key={c.id} className="flex items-center justify-between">
                <span>{c.title}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100">
                  {c.status}{c.completed_at ? ` • ${new Date(c.completed_at).toLocaleString()}` : ''}
                </span>
              </li>
            ))}
            {challengeList.length === 0 && (
              <li className="text-gray-500 text-sm">Aucun défi pour l’instant</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );

  // Charger la liste quand on ouvre l’onglet Défis
  useEffect(() => {
    if (currentView === 'challenges') {
      loadChallenges();
    }
  }, [currentView]);

  // Charger une première fois au montage (si l'utilisateur est connecté)
  useEffect(() => {
    if (user) {
      loadChallenges();
    }
  }, [user]);

  // Désactiver totalement l'accès à "Tous les spécialistes" si diagnostic positif
  useEffect(() => {
    const computedStress = savedDiagnostic ? toFiveScale(Number(savedDiagnostic.stress_level) || 3) : undefined;
    const computedEnergy = savedDiagnostic ? toFiveScale(Number(savedDiagnostic.energy_level) || 3) : undefined;
    let computedMood = savedDiagnostic ? moodEmojiToScore(savedDiagnostic.answers?.mood_emoji) : undefined;
    if (computedMood === undefined && computedStress !== undefined) {
      computedMood = clamp(6 - computedStress, 1, 5);
    }
    if (computedMood === undefined && selectedMood !== undefined) computedMood = selectedMood;
    const isPositive = (computedStress !== undefined && computedEnergy !== undefined && computedMood !== undefined)
      ? (computedStress <= 2 && computedMood >= 4 && computedEnergy >= 3)
      : false;

    if (isPositive && currentView === 'professionals') {
      setCurrentView('dashboard');
    }
  }, [currentView, savedDiagnostic, selectedMood]);

  const renderProgress = () => (
    <div className="pt-4">
      <ProgressPage onBack={() => setCurrentView('dashboard')} />
    </div>
  );

  const renderProfessionals = () => {
    // Masquer la page "Tous les spécialistes" si résultats positifs
    const computedStress = savedDiagnostic ? toFiveScale(Number(savedDiagnostic.stress_level) || 3) : undefined;
    const computedEnergy = savedDiagnostic ? toFiveScale(Number(savedDiagnostic.energy_level) || 3) : undefined;
    let computedMood = savedDiagnostic ? moodEmojiToScore(savedDiagnostic.answers?.mood_emoji) : undefined;
    if (computedMood === undefined && computedStress !== undefined) {
      computedMood = clamp(6 - computedStress, 1, 5);
    }
    if (computedMood === undefined && selectedMood !== undefined) computedMood = selectedMood;
    const isPositive = (computedStress !== undefined && computedEnergy !== undefined && computedMood !== undefined)
      ? (computedStress <= 2 && computedMood >= 4 && computedEnergy >= 3)
      : false;

    if (isPositive) {
      return (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => setCurrentView('dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Retour</span>
            </Button>
            <h1 className="text-2xl font-bold">Spécialistes de santé</h1>
            <div></div>
          </div>
          <Card className="p-6 bg-white/80 text-center">
            <h2 className="text-lg font-semibold mb-2">Pas nécessaire pour le moment</h2>
            <p className="text-gray-600">Vos derniers résultats sont positifs. Aucun spécialiste n'est affiché.</p>
          </Card>
        </div>
      );
    }

    return (
      <HealthProfessionalsList
        onBack={() => setCurrentView('dashboard')}
        onBookAppointment={handleBookAppointment}
        onViewProfile={handleViewProfile}
      />
    );
  };

  const renderSpecialistProfile = () => (
    <SpecialistProfile
      specialist={selectedSpecialist}
      onBack={() => setCurrentView('dashboard')}
      onBookAppointment={handleBookAppointment}
    />
  );

  const renderBooking = () => (
    <BookingPage
      specialist={selectedSpecialist}
      onBack={() => setCurrentView('dashboard')}
      onBookingConfirmed={(b) => {
        addNotification({
          title: 'Rendez-vous confirmé',
          description: `${selectedSpecialist?.name ?? 'Spécialiste'} — ${b?.date} à ${b?.time}`,
        });
      }}
    />
  );

  const renderMeditation = () => (
    <MeditationContent
      onBack={() => setCurrentView('dashboard')}
  onComplete={() => handleChallengeComplete('meditation')}
    />
  );

  const renderBreathing = () => (
    <BreathingContent
      onBack={() => setCurrentView('dashboard')}
  onComplete={() => handleChallengeComplete('breathing')}
    />
  );

  const renderSleepRoutine = () => (
    <SleepRoutineContent
      onBack={() => setCurrentView('dashboard')}
  onComplete={() => handleChallengeComplete('sleep')}
    />
  );

  const renderBottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-2 z-50 safe-area-inset-bottom">
      <div className="flex justify-around max-w-md mx-auto">
        <Button 
          variant={currentView === 'dashboard' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setCurrentView('dashboard')}
          className="flex flex-col items-center space-y-1 h-12 px-3 min-w-0 flex-1"
        >
          <Heart className="h-4 w-4" />
          <span className="text-xs truncate">Accueil</span>
        </Button>
        
        <Button 
          variant={currentView === 'challenges' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setCurrentView('challenges')}
          className="flex flex-col items-center space-y-1 h-12 px-3 min-w-0 flex-1"
        >
          <Target className="h-4 w-4" />
          <span className="text-xs truncate">Défis</span>
        </Button>
        
        <Button 
          variant={currentView === 'progress' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setCurrentView('progress')}
          className="flex flex-col items-center space-y-1 h-12 px-3 min-w-0 flex-1"
        >
          <TrendingUp className="h-4 w-4" />
          <span className="text-xs truncate">Progrès</span>
        </Button>
        
        <Button 
          variant={currentView === 'profile' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setCurrentView('profile')}
          className="flex flex-col items-center space-y-1 h-12 px-3 min-w-0 flex-1"
        >
          <User className="h-4 w-4" />
          <span className="text-xs truncate">Profil</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-md mx-auto min-h-screen bg-white/50 backdrop-blur-sm">
        {/* Bouton de déconnexion discret */}
        <div className="absolute top-4 right-4 z-50">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}  
            className="text-gray-400 hover:text-red-600 hover:bg-red-50 bg-white/70 backdrop-blur-sm"
            title="Se déconnecter">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        <div className="px-4 py-6 pb-32 safe-area-inset-top">
          {currentView === 'dashboard' && renderDashboard()}
          {(currentView === 'diagnostic' || currentView === 'diagnostic-annual') && renderDiagnostic()}
          {currentView === 'challenges' && renderChallenges()}
          {currentView === 'progress' && renderProgress()}
          {currentView === 'profile' && <ProfilePage />}
          {currentView === 'professionals' && renderProfessionals()}
          {currentView === 'specialist-profile' && renderSpecialistProfile()}
          {currentView === 'booking' && renderBooking()}
          {currentView === 'appointments' && renderAppointments()}
          {currentView === 'meditation' && renderMeditation()}
          {currentView === 'breathing' && renderBreathing()}
          {currentView === 'sleep-routine' && renderSleepRoutine()}
          {currentView === 'suggestions' && renderSuggestions()}
        </div>
        
        {renderBottomNav()}
      </div>
    </div>
  );
};

export default Index;


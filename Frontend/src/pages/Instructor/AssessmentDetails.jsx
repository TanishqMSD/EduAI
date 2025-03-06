import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { cn } from "@/lib/utils";
import { useTheme } from "../../components/theme-provider";
import { useToast } from "../../components/ui/toast";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Users,
  BarChart2,
  Clock,
  Award,
  BookOpen,
  Brain,
  Target
} from 'lucide-react';
import { getAssessmentDetails, getAssessmentStats, deleteAssessment } from '../../api/axios.api';

const StatCard = ({ icon: Icon, label, value, description }) => {
  const { theme } = useTheme();
  return (
    <div className={cn(
      "p-6 rounded-2xl border",
      theme === 'dark' ? 'bg-[#110C1D] border-[#6938EF]/20' : 'bg-white border-border'
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-1">
          <span className="text-sm text-muted-foreground">{label}</span>
          <div className="text-2xl font-semibold">{value}</div>
        </div>
        <div className={cn(
          "p-3 rounded-xl",
          theme === 'dark' ? 'bg-[#1A1425]' : 'bg-accent/50'
        )}>
          <Icon className="w-5 h-5 text-[#6938EF]" />
        </div>
      </div>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
};

const AssessmentDetails = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchAssessmentData();
  }, [assessmentId]);

  const fetchAssessmentData = async () => {
    try {
      const [assessmentRes, statsRes] = await Promise.all([
        getAssessmentDetails(assessmentId),
        getAssessmentStats(assessmentId)
      ]);
      setAssessment(assessmentRes.data.assessment);
      setStats(statsRes.data.stats);
    } catch (error) {
      console.error('Error fetching assessment data:', error);
      toast({
        title: "Error",
        description: "Failed to load assessment details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this assessment?')) {
      return;
    }

    try {
      await deleteAssessment(assessmentId);
      toast({
        title: "Success",
        description: "Assessment deleted successfully",
      });
      navigate('/instructor/assessments');
    } catch (error) {
      console.error('Error deleting assessment:', error);
      toast({
        title: "Error",
        description: "Failed to delete assessment",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-[#6938EF]" />
          <span className="text-muted-foreground">Loading assessment details...</span>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Assessment not found</p>
          <button
            onClick={() => navigate('/instructor/assessments')}
            className="mt-4 text-[#6938EF] hover:underline"
          >
            Go back to assessments
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${assessment.title} - Assessment Details`}</title>
        <meta
          name="description"
          content={`View details and statistics for ${assessment.title}`}
        />
      </Helmet>

      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/instructor/assessments')}
              className="p-2 hover:bg-accent rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">{assessment.title}</h1>
              <p className="text-muted-foreground">{assessment.field}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/instructor/assessments/${assessmentId}/edit`)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl border",
                "hover:bg-accent/50 transition-colors duration-200",
                theme === 'dark' ? 'border-[#6938EF]/20' : 'border-border'
              )}
            >
              <Edit className="w-4 h-4" />
              <span className="text-sm font-medium">Edit Assessment</span>
            </button>
            <button
              onClick={handleDelete}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl",
                "bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors duration-200"
              )}
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm font-medium">Delete</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            icon={Users}
            label="Total Attempts"
            value={stats.totalAttempts}
            description="Number of students who took this assessment"
          />
          <StatCard 
            icon={Award}
            label="Average Score"
            value={`${stats.averageScore?.toFixed(1) || 'N/A'}`}
            description="Average performance across all attempts"
          />
          <StatCard 
            icon={Clock}
            label="Duration"
            value={`${assessment.duration} mins`}
            description="Time allowed for completion"
          />
          <StatCard 
            icon={Brain}
            label="Difficulty"
            value={assessment.difficulty}
            description="Assessment complexity level"
          />
        </div>

        {/* Assessment Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className={cn(
            "p-6 rounded-2xl border",
            theme === 'dark' ? 'bg-[#110C1D] border-[#6938EF]/20' : 'bg-white border-border'
          )}>
            <h2 className="text-xl font-semibold mb-4">Skills Assessed</h2>
            <div className="space-y-4">
              {assessment.skillsAssessed.map((skill, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-accent/50"
                >
                  <BookOpen className="w-5 h-5 text-[#6938EF]" />
                  <span>{skill}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={cn(
            "p-6 rounded-2xl border",
            theme === 'dark' ? 'bg-[#110C1D] border-[#6938EF]/20' : 'bg-white border-border'
          )}>
            <h2 className="text-xl font-semibold mb-4">Top Skill Gaps</h2>
            {stats.topSkillGaps && stats.topSkillGaps.length > 0 ? (
              <div className="space-y-4">
                {stats.topSkillGaps.map((gap, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-accent/50"
                  >
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-[#6938EF]" />
                      <span>{gap.skill}</span>
                    </div>
                    <span className="text-sm font-medium">
                      {gap.gapPercentage.toFixed(1)}% gap
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No skill gaps data available yet</p>
            )}
          </div>
        </div>

        {/* Questions Preview */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Questions</h2>
          <div className="space-y-4">
            {assessment.questions.map((question, index) => (
              <div
                key={index}
                className={cn(
                  "p-6 rounded-2xl border",
                  theme === 'dark' ? 'bg-[#110C1D] border-[#6938EF]/20' : 'bg-white border-border'
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-medium mb-2">Question {index + 1}</h3>
                    <p>{question.question}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded-full",
                      "bg-[#6938EF]/10 text-[#6938EF]"
                    )}>
                      {question.skillCategory}
                    </span>
                    <span className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded-full",
                      "bg-accent text-muted-foreground"
                    )}>
                      {question.difficultyLevel}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {question.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className={cn(
                        "p-3 rounded-lg",
                        option.isCorrect
                          ? "bg-green-500/10 text-green-500"
                          : "bg-accent/50"
                      )}
                    >
                      {option.text}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default AssessmentDetails; 
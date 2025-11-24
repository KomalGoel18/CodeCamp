// frontend/src/components/problems/ProblemDetailPage.tsx
import { useState, useEffect } from 'react';
import { ArrowLeft, Play, Check, Upload, MessageSquare } from 'lucide-react';
import { problemsAPI, submissionsAPI } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import CodeEditor from './CodeEditor';
import TestResults from './TestResults';
import DiscussionSection from './DiscussionSection';
import { useParams, useNavigate } from 'react-router-dom';

interface ProblemDetailPageProps {
  problem?: any;
  onBack?: () => void;
}

export default function ProblemDetailPage({ problem, onBack }: ProblemDetailPageProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'description' | 'discussion'>('description');
  const [language, setLanguage] = useState('javascript');
  const [fullProblem, setFullProblem] = useState<any>(problem ?? null);
  const [code, setCode] = useState('');
  const [testResults, setTestResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const params = useParams<{ id?: string }>();
  const navigate = useNavigate();


  useEffect(() => {
    // If a problem prop exists and has description, use it.
    if (problem) {
      setFullProblem(problem);
      setCode(problem.starterCode?.[language] || problem.starter_code?.[language] || '');
      return;
    }

    // If there is an id in the URL and no problem prop, fetch by id/number
    if (params.id) {
      (async () => {
        setLoading(true);
        try {
          const fetched = await problemsAPI.getProblem(params.id as any);
          // backend may return { problem: ... } or the raw problem object
          const p = fetched?.problem ?? fetched;
          setFullProblem(p);
          setCode(p?.starterCode?.[language] || p?.starter_code?.[language] || '');
        } catch (err) {
          console.error('Error fetching problem by id:', err);
        } finally {
          setLoading(false);
        }
      })();
    } else if ((problem?.problemNumber || fullProblem?.problemNumber) && !(problem?.description || fullProblem?.description)) {
      // fallback: fetch by problemNumber if we only have a minimal object
      fetchFullProblem();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem, params.id]);

  useEffect(() => {
    if (fullProblem) {
      setCode(fullProblem.starterCode?.[language] || fullProblem.starter_code?.[language] || '');
    }
  }, [language, fullProblem]);

  const fetchFullProblem = async () => {
    setLoading(true);
    try {
      const problemNumber = problem?.problemNumber || fullProblem?.problemNumber;
      if (!problemNumber) return;
      const problemData = await problemsAPI.getProblem(problemNumber);
      const p = problemData?.problem ?? problemData;
      setFullProblem(p);
      setCode(p.starterCode?.[language] || p.starter_code?.[language] || '');
    } catch (error) {
      console.error('Error fetching problem details:', error);
    } finally {
      setLoading(false);
    }
  };

  const languages = [
    { id: 'javascript', name: 'JavaScript' },
    { id: 'python', name: 'Python' },
    { id: 'java', name: 'Java' },
    { id: 'cpp', name: 'C++' },
  ];

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setCode(fullProblem?.starterCode?.[lang] || fullProblem?.starter_code?.[lang] || '');
  };

  const runTests = async () => {
    setIsRunning(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const mockResults = {
      passed: 3,
      total: 5,
      results: [
        { input: '[2,7,11,15], target=9', expected: '[0,1]', actual: '[0,1]', passed: true },
        { input: '[3,2,4], target=6', expected: '[1,2]', actual: '[1,2]', passed: true },
        { input: '[3,3], target=6', expected: '[0,1]', actual: '[0,1]', passed: true },
        { input: '[1,2,3], target=7', expected: 'null', actual: '[0,2]', passed: false },
        { input: '[5,5,5], target=10', expected: '[0,1]', actual: 'null', passed: false },
      ],
    };

    setTestResults(mockResults);
    setIsRunning(false);
  };

  const handleSubmit = async () => {
    if (!user || !fullProblem) return;
    
    setIsSubmitting(true);
    try {
      // Get problem ID - backend uses _id from MongoDB
      const problemId = fullProblem._id || fullProblem.id;
      
      const result = await submissionsAPI.submitSolution(problemId, code, language);
      
      // Update test results based on submission
      const submission = result.submission;
      const verdict = submission.verdict?.toLowerCase() || 'pending';
      
      setTestResults({
        passed: verdict === 'accepted' ? 5 : 3,
        total: 5,
        verdict: submission.verdict,
        runtime: submission.executionTime,
        memory: submission.memory,
      });
    } catch (error: any) {
      console.error('Error submitting solution:', error);
      setTestResults({
        passed: 0,
        total: 5,
        error: error.message || 'Submission failed',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
  onClick={() => { if (onBack) onBack(); else navigate(-1); }}
  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
>
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Problems</span>
          </button>
          <div className="flex items-center space-x-2">
            {languages.map((lang) => (
              <button
                key={lang.id}
                onClick={() => handleLanguageChange(lang.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  language === lang.id
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : 'bg-gray-800 text-gray-400 border border-gray-700 hover:text-white'
                }`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="lg:w-1/2 border-r border-gray-800 overflow-y-auto">
          <div className="p-6">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-800 rounded w-3/4 mb-4"></div>
                <div className="h-6 bg-gray-800 rounded w-1/4 mb-6"></div>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-white mb-4">{fullProblem?.title || problem?.title}</h1>

                <div className="flex items-center space-x-3 mb-6">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    (fullProblem?.difficulty || problem?.difficulty)?.toLowerCase() === 'easy' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                    (fullProblem?.difficulty || problem?.difficulty)?.toLowerCase() === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                    'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {(fullProblem?.difficulty || problem?.difficulty || 'MEDIUM').toUpperCase()}
                  </span>
                  <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm border border-blue-500/20">
                    {fullProblem?.category || problem?.category || 'General'}
                  </span>
                </div>
              </>
            )}

            <div className="flex space-x-1 mb-6 border-b border-gray-800">
              <button
                onClick={() => setActiveTab('description')}
                className={`px-4 py-3 font-medium transition-all ${
                  activeTab === 'description'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('discussion')}
                className={`flex items-center space-x-2 px-4 py-3 font-medium transition-all ${
                  activeTab === 'discussion'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Discussion</span>
              </button>
            </div>

            {activeTab === 'description' ? (
              loading ? (
                <div className="space-y-6 animate-pulse">
                  <div className="h-32 bg-gray-800 rounded"></div>
                  <div className="h-24 bg-gray-800 rounded"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Problem Statement</h3>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                      {fullProblem?.description || problem?.description || 'No description available'}
                    </p>
                  </div>

                  {((fullProblem?.examples || problem?.examples) && (fullProblem?.examples || problem?.examples).length > 0) && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Examples</h3>
                      {(fullProblem?.examples || problem?.examples).map((example: any, index: number) => (
                        <div key={index} className="bg-gray-800/50 rounded-lg p-4 mb-3 border border-gray-700">
                          <p className="text-gray-400 text-sm mb-2">Example {index + 1}:</p>
                          <div className="space-y-2">
                            <p className="text-white font-mono text-sm">
                              <span className="text-gray-400">Input:</span> {example.input}
                            </p>
                            <p className="text-white font-mono text-sm">
                              <span className="text-gray-400">Output:</span> {example.output}
                            </p>
                            {example.explanation && (
                              <p className="text-gray-300 text-sm">
                                <span className="text-gray-400">Explanation:</span> {example.explanation}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {(fullProblem?.constraints || problem?.constraints) && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Constraints</h3>
                      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                        <p className="text-gray-300 text-sm whitespace-pre-line">
                          {fullProblem?.constraints || problem?.constraints}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )
            ) : (
              <DiscussionSection problemId={fullProblem?._id || fullProblem?.id || problem?.id} />
            )}
          </div>
        </div>

        <div className="lg:w-1/2 flex flex-col">
          <div className="flex-1 flex flex-col">
            <CodeEditor code={code} setCode={setCode} language={language} />

            {testResults && <TestResults results={testResults} />}
          </div>

          <div className="bg-gray-900 border-t border-gray-800 p-4">
            <div className="flex items-center justify-between">
              <div className="flex space-x-3">
                <button
                  onClick={runTests}
                  disabled={isRunning}
                  className="flex items-center space-x-2 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-gray-700"
                >
                  <Play className="w-4 h-4" />
                  <span className="font-medium">{isRunning ? 'Running...' : 'Run Tests'}</span>
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit'}</span>
                </button>
              </div>

              {testResults && (
                <div className="flex items-center space-x-2">
                  {testResults.passed === testResults.total ? (
                    <div className="flex items-center space-x-2 text-green-400">
                      <Check className="w-5 h-5" />
                      <span className="font-semibold">All tests passed!</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">
                      {testResults.passed}/{testResults.total} tests passed
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

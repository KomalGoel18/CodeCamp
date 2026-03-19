import { useState, useEffect } from "react";
import { ArrowLeft, Play, Check, Upload } from "lucide-react";
import { problemsAPI, submissionsAPI, testsAPI } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import CodeEditor from "./CodeEditor";
import TestResults from "./TestResults";
import DiscussionSection from "./DiscussionSection";
import { useParams, useNavigate } from "react-router-dom";

interface ProblemDetailPageProps {
  problem?: any;
  onBack?: () => void;
}

export default function ProblemDetailPage({
  problem,
  onBack,
}: ProblemDetailPageProps) {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<"description" | "discussion">(
    "description"
  );
  const [language, setLanguage] = useState("javascript");
  const [fullProblem, setFullProblem] = useState<any>(problem ?? null);
  const [code, setCode] = useState("");
  const [testResults, setTestResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allTestsPassed, setAllTestsPassed] = useState(false);

  const params = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const fetchFullProblem = async (identifier?: string | number) => {
    try {
      const raw =
        identifier ??
        params.id ??
        problem?.problemNumber ??
        fullProblem?.problemNumber;

      if (raw == null) return;

      const num = Number(raw);

      if (Number.isNaN(num)) return;

      const fetched = await problemsAPI.getProblem(num);
      const p = (fetched as any)?.problem ?? fetched;

      setFullProblem(p);

      setCode(
        p?.starterCode?.[language] ||
          p?.starter_code?.[language] ||
          ""
      );
    } catch (err) {
      console.error("Error fetching problem details:", err);
    }
  };

  useEffect(() => {
    (async () => {
      if (problem) {
        setFullProblem(problem);

        setCode(
          problem.starterCode?.[language] ||
            problem.starter_code?.[language] ||
            ""
        );

        if (!problem.description) {
          await fetchFullProblem(problem.problemNumber);
        }

        return;
      }

      if (params.id) {
        await fetchFullProblem(params.id);
      }
    })();
  }, [problem, params.id]);

  useEffect(() => {
    if (fullProblem) {
      setCode(
        fullProblem.starterCode?.[language] ||
          fullProblem.starter_code?.[language] ||
          ""
      );
    }

    setAllTestsPassed(false);
    setTestResults(null);
  }, [language, fullProblem]);

  const languages = [
    { id: "javascript", name: "JavaScript" },
    { id: "python", name: "Python" },
    { id: "java", name: "Java" },
    { id: "cpp", name: "C++" },
  ];

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);

    setCode(
      fullProblem?.starterCode?.[lang] ||
        fullProblem?.starter_code?.[lang] ||
        ""
    );

    setAllTestsPassed(false);
    setTestResults(null);
  };

  const runTests = async () => {
    setTestResults(null);
    setAllTestsPassed(false);

    if (!code.trim()) {
      setTestResults({
        error: "Please write some code before running tests.",
      });
      return;
    }

    if (!fullProblem) {
      setTestResults({
        error: "Problem not loaded yet.",
      });
      return;
    }

    setIsRunning(true);

    try {
      const idToSend =
        fullProblem._id ??
        fullProblem.id ??
        fullProblem.problemNumber;

      const res = await testsAPI.runTests(idToSend, code, language);

      setTestResults({
        passed: res?.passed ?? 0,
        total: res?.total ?? 0,
        results: res?.results ?? [],
        warning:
          res?.passed !== res?.total
            ? "Some sample tests failed — you can still submit."
            : null,
      });

      setAllTestsPassed(res?.passed === res?.total);
    } catch (err: any) {
      console.error("Run tests error:", err);

      setTestResults({
        error: err?.message || "Failed to run tests.",
      });

      setAllTestsPassed(false);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!user || !fullProblem) return;

    if (!code.trim()) {
      setTestResults({
        error: "Please write code before submitting.",
      });
      return;
    }

    if (!allTestsPassed) {
      setTestResults({
        error: "Please pass all sample tests before submitting.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const idToSend =
        fullProblem._id ??
        fullProblem.id ??
        fullProblem.problemNumber;

      const result = await submissionsAPI.submitSolution(
        idToSend,
        code,
        language
      );

      const submission = result?.submission ?? result;

      setTestResults({
        verdict: submission?.verdict ?? "Unknown",
        runtime: submission?.executionTime ?? submission?.runtime ?? 0,
        memory: submission?.memory ?? 0,
        error: submission?.errorOutput || null,
      });
    } catch (error: any) {
      console.error("Submit error:", error);

      setTestResults({
        error: error?.message || "Submit failed.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const descriptionText =
    fullProblem?.description ??
    fullProblem?.statement ??
    fullProblem?.body ??
    "Problem description not available.";

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => {
              if (onBack) onBack();
              else navigate("/problems");
            }}
            className="flex items-center space-x-2 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Problems</span>
          </button>

          <div className="flex items-center space-x-2">
            {languages.map((lang) => (
              <button
                key={lang.id}
                onClick={() => handleLanguageChange(lang.id)}
                className={`px-4 py-2 rounded-lg text-sm ${
                  language === lang.id
                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    : "bg-gray-800 text-gray-400 border border-gray-700"
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
            <h1 className="text-3xl font-bold text-white mb-4">
              {fullProblem?.title}
            </h1>

            <div className="flex items-center space-x-3 mb-6">
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                {(fullProblem?.difficulty || "medium").toUpperCase()}
              </span>

              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm border border-blue-500/20">
                {fullProblem?.category || "General"}
              </span>
            </div>

            <div className="flex space-x-1 mb-6 border-b border-gray-800">
              <button
                onClick={() => setActiveTab("description")}
                className={`px-4 py-3 ${
                  activeTab === "description"
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-gray-400"
                }`}
              >
                Description
              </button>

              <button
                onClick={() => setActiveTab("discussion")}
                className={`px-4 py-3 ${
                  activeTab === "discussion"
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-gray-400"
                }`}
              >
                Discussion
              </button>
            </div>

            {activeTab === "description" ? (
              <p className="text-gray-300 whitespace-pre-line">
                {descriptionText}
              </p>
            ) : (
              <DiscussionSection problemId={fullProblem?._id} />
            )}
          </div>
        </div>

        <div className="lg:w-1/2 flex flex-col">
          <CodeEditor code={code} setCode={setCode} language={language} />

          {testResults && <TestResults results={testResults} />}

          <div className="bg-gray-900 border-t border-gray-800 p-4 flex gap-3">
            <button
              onClick={runTests}
              disabled={isRunning}
              className="px-6 py-3 bg-gray-800 text-white rounded-lg"
            >
              <Play className="w-4 h-4 inline mr-2" />
              {isRunning ? "Running..." : "Run Tests"}
            </button>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !allTestsPassed}
              className={`px-6 py-3 rounded-lg text-white ${
                allTestsPassed
                  ? "bg-blue-500"
                  : "bg-gray-700 cursor-not-allowed"
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>

            {testResults?.verdict === "Accepted" && (
              <div className="text-green-400 flex items-center ml-4">
                <Check className="w-4 h-4 mr-1" />
                Accepted
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
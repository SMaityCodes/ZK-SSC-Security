/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CustomCalendar } from "@/components/MeetingUI/calendar";
import { motion } from "framer-motion";
import { FiPlus } from "react-icons/fi";
import { useNavigate, useSearchParams } from "react-router-dom";
import Cookies from "js-cookie";
import { Issue } from "@/models/project.types";

const IssueBoard: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectid");
  const navigate = useNavigate();
  const authToken = Cookies.get("authToken");

 // Redirect to login if no authToken
  useEffect(() => {
    if (!authToken) {
      navigate("/login", { replace: true });
    }
  }, [authToken, navigate]);

  // Fetch issues
  useEffect(() => {
    const fetchIssues = async () => {
      if (!projectId) {
        setLoading(false);
        setError("Missing authentication or project ID.");
        return;
      }

      try {
        const res = await fetch(`http://localhost:5000/api/issue/project/${encodeURIComponent(projectId)}/issues`, {
         credentials : "include",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch issues.");
        }

        const data: Issue[] = await res.json();
        setIssues(data);
        setError(null);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "An error occurred.");
        setIssues([]);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, [authToken, projectId]);

  const handleIssueClick = (issueId: string) => {
    if (!projectId) return;
    navigate(`/submit?projectId=${projectId}&issueId=${issueId}`);
  };

  // Filter issues by selected deadline date (exact date match)
  const filteredIssues = selectedDate
    ? issues.filter((issue) => {
        const issueDate = new Date(issue.deadline);
        return (
          issueDate.getFullYear() === selectedDate.getFullYear() &&
          issueDate.getMonth() === selectedDate.getMonth() &&
          issueDate.getDate() === selectedDate.getDate()
        );
      })
    : issues;

  return (
    <div className="flex h-screen mt-20 bg-white">
      {/* Sidebar */}
      <aside className="w-20 bg-blue-600 text-white shadow-md flex flex-col items-center py-6 space-y-8">
        <div className="text-3xl font-semibold">t.</div>
        <div className="flex flex-col space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-8 h-8 bg-white rounded-lg" />
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-10 overflow-auto bg-blue-50">
        {/* Top Bar */}
        <div className="flex-1 p-10 overflow-auto bg-blue-50">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-bold text-blue-700">Issues</h1>
        <Button
          onClick={() => navigate('/createissue?projectId=' + projectId)}
          className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-5 py-2.5 rounded-lg shadow"
        >
          <FiPlus className="text-lg" /> Create new
        </Button>
      </div>
    </div>

        {/* Loading / Error / Empty / List */}
        {loading ? (
          <p className="text-blue-400">Loading issues...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : filteredIssues.length === 0 ? (
          <p className="text-gray-400 italic">No issues due on selected date.</p>
        ) : (
          <div className="grid grid-cols-3 gap-8 border-t border-blue-200 pt-6">
            {filteredIssues.map((issue) => (
              <motion.div
                key={issue._id}
                className="bg-white rounded-xl p-5 shadow-md border border-blue-100 cursor-pointer"
                whileHover={{ scale: 1.03 }}
                onClick={() => handleIssueClick(issue._id == null ? "" : issue._id)}
              >
                <Card className="border-none shadow-none">
                  <CardContent className="p-4 space-y-2">
                    <div className="text-lg font-semibold text-blue-700">{issue.title}</div>
                    <div className="text-xs text-blue-400">Due {new Date(issue.deadline).toDateString()}</div>
                    <div className="flex flex-wrap gap-2">
                      {issue.labels?.map((label) => (
                        <span
                          key={label}
                          className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Calendar Sidebar */}
      <div className="w-80 bg-white shadow-md p-8 flex flex-col gap-8">
        <div>
          <div className="text-sm text-gray-500 mb-2">Calendar</div>
          <div className="text-xl font-semibold text-blue-600">
            {selectedDate?.toDateString()}
          </div>
        </div>
        <CustomCalendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
        />
      </div>
    </div>
  );
};

export default IssueBoard;

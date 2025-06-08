import React, { useState, useEffect } from "react";
import { useNavigate, Link} from "react-router-dom";
import { motion } from "framer-motion";
import { FiPlus } from "react-icons/fi";
import Cookies from "js-cookie";
import { Card, CardContent } from "@/components/ui/card";
import { CustomCalendar } from "@/components/MeetingUI/calendar";
import { Project, Issue, ProjectsResponse } from "../models/project.types";

const ProjectDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const authToken = Cookies.get("authToken");
  

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      const user = Cookies.get("user");
      const userId = user ? JSON.parse(user)._id : "";
      try {
        const res = await fetch(`http://localhost:5000/api/project/projects/${userId}`, {
          credentials : "include",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch projects");
        }

        const data: ProjectsResponse = await res.json();
        setProjects(data);
      } catch (err) {
        console.error(err);
        setProjects({ asCreator: [], asContributor: [] }); // fallback empty state
      } finally {
        setLoading(false);
      }
    };

    if (authToken) {
      fetchProjects();
    }
  }, [authToken]);

  // Redirect to login if no authToken
  // if (!authToken) {
  //   return <Navigate to="/login" replace />;
  // }

  const getClosestIssue = (issues: Issue[]) =>
    [...issues].sort(
      (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    )[0];

    const renderProjects = (title: string, list: Project[]) => (
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-blue-700 mb-6">{title}</h2>
        {list.length === 0 ? (
          <p className="text-gray-400 italic">No projects here yet.</p>
        ) : (
          <div className="grid grid-cols-3 gap-8">
            {list.map((proj) => {
              const closest = getClosestIssue(proj.issues);
              return (
                <motion.div
                  key={proj._id}
                  whileHover={{ scale: 1.03 }}
                  className="bg-white rounded-xl p-5 shadow-md border border-blue-100 cursor-pointer"
                  onClick={() => navigate(`/issueboard?projectid=${proj._id}`)}
                >
                  <div className="mb-3">
                    <h3 className="text-xl font-semibold text-blue-600">{proj.name}</h3>
                    <p className="text-sm text-gray-500">{proj.organization}</p>
                    <p className="text-sm text-gray-400">By {proj.creator}</p>
                  </div>
    
                  {closest ? (
                    <Card className="border-none shadow-none bg-blue-50">
                      <CardContent className="p-4 space-y-2">
                        <div className="text-sm font-medium text-blue-700">{closest.title}</div>
                        <div className="text-xs text-blue-400">Due {closest.deadline}</div>
                        <div className="flex flex-wrap gap-2">
                          {closest.labels?.map((l) => (
                            <span
                              key={l}
                              className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded"
                            >
                              {l}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <p className="text-sm text-blue-300">No issues yet</p>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    );
    

  return (
    <div className="flex h-screen bg-white">
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
      <div className="flex-1 p-7 overflow-auto bg-blue-50 mt-15">
        <div className="flex justify-between items-center mb-15">
          <h1 className="text-4xl font-bold text-blue-700">Projects</h1>
          <Link
            to="/createproject"
            className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-5 py-2.5 rounded-lg shadow"
          >
            <FiPlus className="text-lg" />
            New Project
          </Link>
        </div>

        {loading ? (
          <p className="text-blue-400">Loading projects...</p>
        ) : (
          <>
            {renderProjects("Created by Me", projects?.asCreator ?? [])}
            {renderProjects("Contributing To", projects?.asContributor ?? [])}
          </>
        )}
      </div>

      {/* Calendar Sidebar */}
      <div className="w-80 bg-white shadow-md p-8 flex flex-col gap-8 mt-15">
        <div>
          <div className="text-sm text-gray-500 mb-2">Calendar</div>
          <div className="text-xl font-semibold text-blue-600">{selectedDate.toDateString()}</div>
        </div>
        <CustomCalendar
          mode="single"
          selected={selectedDate}
          onSelect={(d) => d && setSelectedDate(d)}
        />
      </div>
    </div>
  );
};

export default ProjectDashboard;

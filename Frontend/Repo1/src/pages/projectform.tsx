/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";

import { Project } from "../models/project.types";
import Cookies from "js-cookie";

const ProjectForm = () => {
 
  const navigate = useNavigate();

  const [contributorInput, setContributorInput] = useState("");
  const [contributors, setContributors] = useState<string[]>([]);
  const [initType, setInitType] = useState<"create" | "github">("create");

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      projectName: "",
      initType: "create",
      githubRepo: "",
      email: "",
      organization: "",
    },
  });

  const addContributor = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && contributorInput.trim()) {
      e.preventDefault();
      if (!contributors.includes(contributorInput.trim())) {
        setContributors([...contributors, contributorInput.trim()]);
        setContributorInput("");
      }
    }
  };

  const removeContributor = (id: string) => {
    setContributors(contributors.filter((c) => c !== id));
  };

  
  const onSubmit = async (data: any) => {
    const user = Cookies.get("user");
    const userId = user ? JSON.parse(user)._id : "";
    console.log("User ID:", userId);
    if (!userId) {
      alert("User not authenticated");
      return;
    }


    const project: Project = {
      name: data.projectName,
      organization: data.organization,
      creator: userId,
      contributors,
      issues: [],
    };

    console.log("🔧 Project Data:", project);

    try {
      const res = await fetch(`http://localhost:5000/api/project/project/create/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", },
        body: JSON.stringify(project),
        credentials: 'include'
      });
      if (!res.ok) {
        throw new Error("Failed to save project");
      }
      console.log("✅ Project saved successfully");
      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Error saving project:", err);
    }
  };

  return (
    <div className="w-full max-w-4xl h-auto mx-auto p-10 bg-white shadow rounded-lg">
      <h2 className="text-3xl font-bold mb-6 py-10 text-gray-800">
        Create Project
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Project Name */}
        <div>
          <label className="block text-sm font-medium">Project Name</label>
          <Input
            placeholder="Enter project name"
            {...register("projectName", { required: "Project name is required" })}
          />
          {errors.projectName && (
            <p className="text-red-500 text-sm mt-1">{errors.projectName.message}</p>
          )}
        </div>

        {/* Init Type */}
        <div>
          <label className="block text-sm font-medium">Initialization Type</label>
          <Select
            onValueChange={(val: "create" | "github") => {
              setInitType(val);
              setValue("initType", val);
            }}
            value={watch("initType")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="create">Create new project</SelectItem>
              <SelectItem value="github">Initialize from GitHub</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* GitHub Repo */}
        {initType === "github" && (
          <div>
            <label className="block text-sm font-medium">GitHub Repository URL</label>
            <Input
              placeholder="https://github.com/user/repo"
              {...register("githubRepo")}
            />
          </div>
        )}

        {/* Contributors */}
        <div>
          <label className="block text-sm font-medium">Contributor GitHub IDs</label>
          <div className="flex flex-wrap gap-2 mt-2 mb-2">
            {contributors.map((id, idx) => (
              <span
                key={idx}
                className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm flex items-center gap-1"
              >
                {id}
                <button
                  onClick={() => removeContributor(id)}
                  type="button"
                  className="text-xs text-red-500 hover:text-red-700 ml-1"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <Input
            placeholder="Type GitHub ID and press enter"
            value={contributorInput}
            onChange={(e) => setContributorInput(e.target.value)}
            onKeyDown={addContributor}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium">Your Email</label>
          <Input
            type="email"
            placeholder="you@example.com"
            {...register("email", { required: "Email is required" })}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Organization */}
        <div>
          <label className="block text-sm font-medium">Organization</label>
          <Input
            placeholder="Enter organization"
            {...register("organization", { required: "Organization is required" })}
          />
          {errors.organization && (
            <p className="text-red-500 text-sm mt-1">{errors.organization.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full mt-4">
          Initialize Project
        </Button>
      </form>
    </div>
  );
};

export default ProjectForm;

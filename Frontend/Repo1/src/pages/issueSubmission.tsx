/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { motion } from "framer-motion";

type FileEntry = {
  filename: string;
  hash: string;
};

export default function SubmitPage() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectid");
  const issueId = searchParams.get("issueid");
  const navigate = useNavigate();

  const [submitterName, setSubmitterName] = useState("");
  const [linkName, setLinkName] = useState(""); // New: link name input
  const [commandText, setCommandText] = useState(""); // New: command input (comma separated)
  const [preFiles, setPreFiles] = useState<FileEntry[]>([]);
  const [postFiles, setPostFiles] = useState<FileEntry[]>([]);
  const [dialogState, setDialogState] = useState<{ type: "pre" | "post"; open: boolean }>({ type: "pre", open: false });
  const [newFileData, setNewFileData] = useState<FileEntry>({ filename: "", hash: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  
  const handleAddFile = () => {
    const entry = { ...newFileData };
    if (dialogState.type === "pre") setPreFiles(prev => [...prev, entry]);
    else setPostFiles(prev => [...prev, entry]);

    setNewFileData({ filename: "", hash: "" });
    setDialogState(prev => ({ ...prev, open: false }));
  };

  const handleSubmit = () => {
    setError(null);
  
    const materials = preFiles.reduce((acc, file) => {
      acc[file.filename] = { sha256: file.hash };
      return acc;
    }, {} as Record<string, { sha256: string }>);
  
    const products = postFiles.reduce((acc, file) => {
      acc[file.filename] = { sha256: file.hash };
      return acc;
    }, {} as Record<string, { sha256: string }>);
  
    const commandArray = commandText
      .split(",")
      .map(str => str.trim())
      .filter(str => str.length > 0);
  
    const linkPayload = {
      _type: "link",
      name: linkName,
      command: commandArray,
      materials,
      products,
    };
  
    const jsonStr = JSON.stringify(linkPayload, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const uri = URL.createObjectURL(blob);
  
    const a = document.createElement("a");
    a.href = uri;
    a.download = `submission-${projectId}-${issueId || "new"}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(uri);
  
    navigate(`/dashboard`);
  };
  const closeDialog = () => {
    setDialogState({ ...dialogState, open: false });
  };

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">Error: {error}</p>;

  return (
    <motion.div
      className="max-w-4xl mx-auto mt-30 mb-40"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="mb-6 border-blue-400 shadow-md">
        <CardHeader>
          <CardTitle className="text-blue-700">Project Submission</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-blue-700 p-2">Your Name</Label>
            <Input
              className="border-blue-300 focus:ring-blue-400"
              placeholder="Enter your name"
              value={submitterName}
              onChange={e => setSubmitterName(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-blue-700 p-2">Link Name</Label>
            <Input
              className="border-blue-300 focus:ring-blue-400"
              placeholder='E.g., "submit"'
              value={linkName}
              onChange={e => setLinkName(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-blue-700 p-2">Command (comma-separated)</Label>
            <Input
              className="border-blue-300 focus:ring-blue-400"
              placeholder='E.g., submit, project:abc, issue:123'
              value={commandText}
              onChange={e => setCommandText(e.target.value)}
            />
          </div>
          <p className="text-sm text-gray-600">
            Project: {projectId} &nbsp;|&nbsp; Issue: {issueId || 'New Submission'}
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="pre" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-blue-100 border border-blue-300">
          <TabsTrigger value="pre">Pre-Commit</TabsTrigger>
          <TabsTrigger value="post">Post-Commit</TabsTrigger>
        </TabsList>

        <TabsContent value="pre">
          <FileSection
            title="Pre-Commit Files"
            files={preFiles}
            dialogType="pre"
            dialogState={dialogState}
            setDialogState={setDialogState}
            newFileData={newFileData}
            setNewFileData={setNewFileData}
            handleAddFile={handleAddFile}
            closeDialog={closeDialog}
          />
        </TabsContent>

        <TabsContent value="post">
          <FileSection
            title="Post-Commit Files"
            files={postFiles}
            dialogType="post"
            dialogState={dialogState}
            setDialogState={setDialogState}
            newFileData={newFileData}
            setNewFileData={setNewFileData}
            handleAddFile={handleAddFile}
            closeDialog={closeDialog}
          />
        </TabsContent>
      </Tabs>

      <Button
        className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white"
        onClick={handleSubmit}
      >
        Submit Project
      </Button>
    </motion.div>
  );
}

function FileSection({ title, files, dialogType, dialogState, setDialogState, newFileData, setNewFileData, handleAddFile, closeDialog }: any) {
  return (
    <Card className="mt-4 border-blue-300">
      <CardHeader className="flex justify-between items-center">
        <CardTitle className="text-blue-700">{title}</CardTitle>
        <Dialog open={dialogState.open && dialogState.type === dialogType}>
          <DialogTrigger asChild>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setDialogState({ type: dialogType, open: true })}
            >
              Add File
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-blue-300">
            <FileDialogForm
              newFileData={newFileData}
              setNewFileData={setNewFileData}
              handleAddFile={handleAddFile}
              closeDialog={closeDialog}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>{renderFileList(files)}</CardContent>
    </Card>
  );
}

function FileDialogForm({ newFileData, setNewFileData, handleAddFile, closeDialog }: any) {
  const handleClose = () => {
    setNewFileData({ filename: "", hash: "" });
    closeDialog();
  };

  return (
    <div className="space-y-4">
      <Label className="text-blue-700">File Name</Label>
      <Input
        className="border-blue-300 focus:ring-blue-400"
        value={newFileData.filename}
        onChange={(e) => setNewFileData({ ...newFileData, filename: e.target.value })}
      />
      <Label className="text-blue-700">File Hash</Label>
      <Input
        className="border-blue-300 focus:ring-blue-400"
        value={newFileData.hash}
        onChange={(e) => setNewFileData({ ...newFileData, hash: e.target.value })}
      />
      <Button
        className="w-full bg-blue-600 hover:bg-blue-700"
        onClick={() => {
          handleAddFile();
          handleClose();
        }}
      >
        Submit File
      </Button>
      <Button
        className="absolute top-2 right-2 text-white"
        onClick={handleClose}
      >
        ×
      </Button>
    </div>
  );
}

const renderFileList = (files: FileEntry[]) => {
  return (
    <div className="space-y-2">
      {files.map((file, idx) => (
        <div key={idx} className="flex justify-between items-center">
          <span>{file.filename}</span>
          <span className="text-sm text-gray-500">{file.hash}</span>
        </div>
      ))}
    </div>
  );
};

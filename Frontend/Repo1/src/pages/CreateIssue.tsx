import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const RULE_OPTIONS = ["CREATE", "DELETE", "MODIFY", "ALLOW", "REQUIRE", "DISALLOW"] as const;
type RuleType = (typeof RULE_OPTIONS)[number];

interface RulePattern {
  rule: RuleType;
  pattern: string;
}

export default function CreateFeaturePage() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [name, setName] = useState("");
  const [deadline, setDeadline] = useState<Date | undefined>(new Date());
  const [labelsInput, setLabelsInput] = useState("");
  const [labels, setLabels] = useState<string[]>([]);

  const [expectedCommand, setExpectedCommand] = useState("");

  const [materials, setMaterials] = useState<RulePattern[]>([]);
  const [materialRule, setMaterialRule] = useState<RuleType>("REQUIRE");
  const [materialPattern, setMaterialPattern] = useState("");

  const [products, setProducts] = useState<RulePattern[]>([]);
  const [productRule, setProductRule] = useState<RuleType>("REQUIRE");
  const [productPattern, setProductPattern] = useState("");

  const [showCalendar, setShowCalendar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addLabel = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && labelsInput.trim()) {
      e.preventDefault();
      if (!labels.includes(labelsInput.trim())) {
        setLabels([...labels, labelsInput.trim()]);
        setLabelsInput("");
      }
    }
  };

  const removeLabel = (label: string) => {
    setLabels(labels.filter(l => l !== label));
  };

  const addMaterial = () => {
    if (materialPattern.trim()) {
      setMaterials([...materials, { rule: materialRule, pattern: materialPattern.trim() }]);
      setMaterialPattern("");
      setMaterialRule("REQUIRE");
    }
  };

  const removeMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const addProduct = () => {
    if (productPattern.trim()) {
      setProducts([...products, { rule: productRule, pattern: productPattern.trim() }]);
      setProductPattern("");
      setProductRule("REQUIRE");
    }
  };

  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!projectId) {
      console.error("Project ID is missing");
      return;
    }
    setLoading(true);
    setError(null);

    const payload = {
      title,
      deadline: deadline?.toISOString() || "",
      labels,
      _type: "step",
      name,
      expected_command: expectedCommand.split(" ").filter(Boolean),
      expected_materials: materials.map(m => [m.rule, m.pattern]),
      expected_products: products.map(p => [p.rule, p.pattern]),
      projectId,
    };

    fetch(`http://localhost:5000/api/issue/project/${projectId}/issue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include'
    })
      .then(res => {
        console.log(res);
        if (!res.ok) throw new Error('Save failed');
        return res.json();
      })
      .then(() => {
        navigate(`/issueboard?projectId=${projectId}`);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">Error: {error}</p>;

  return (
    <div className="flex bg-gray-100 p-8 space-x-6 mt-15">
      <Card className="w-full max-w-3xl mx-auto p-6 shadow-xl border">
        <CardContent className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">
            Create Issue
          </h2>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} />
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <Label>Deadline</Label>
            <Button
              variant="outline"
              onClick={() => setShowCalendar(prev => !prev)}
              className="flex items-center justify-between w-full"
            >
              <span>{deadline ? format(deadline, "PPP") : "Choose a date"}</span>
              <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showCalendar ? 'rotate-180' : ''}`} />
            </Button>

            <AnimatePresence>
              {showCalendar && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <Calendar
                    mode="single"
                    selected={deadline}
                    onSelect={setDeadline}
                    className="mt-2 rounded-md border"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Labels */}
          <div className="space-y-2">
            <Label htmlFor="labels">Labels</Label>
            <div className="flex flex-wrap gap-2">
              {labels.map((l, idx) => (
                <span
                  key={idx}
                  className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  {l}
                  <button
                    onClick={() => removeLabel(l)}
                    type="button"
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <Input
              placeholder="Type label and press Enter"
              value={labelsInput}
              onChange={e => setLabelsInput(e.target.value)}
              onKeyDown={addLabel}
            />
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g. build-step"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          {/* Expected Command */}
          <div className="space-y-2">
            <Label htmlFor="expectedCommand">Expected Command</Label>
            <Input
              id="expectedCommand"
              placeholder="e.g. dget http://example.com/file.dsc"
              value={expectedCommand}
              onChange={e => setExpectedCommand(e.target.value)}
            />
          </div>

          {/* Materials */}
          <div className="space-y-2">
            <Label>Expected Materials</Label>
            <div className="flex gap-2">
              <select value={materialRule} onChange={e => setMaterialRule(e.target.value as RuleType)} className="border rounded px-2">
                {RULE_OPTIONS.map(rule => (
                  <option key={rule} value={rule}>{rule}</option>
                ))}
              </select>
              <Input
                placeholder="Pattern (e.g. *.cpp)"
                value={materialPattern}
                onChange={e => setMaterialPattern(e.target.value)}
              />
              <Button type="button" onClick={addMaterial}>Add</Button>
            </div>
            <ul className="space-y-1">
              {materials.map((m, idx) => (
                <li key={idx} className="flex justify-between items-center bg-green-50 px-2 py-1 rounded">
                  <span>{m.rule} {m.pattern}</span>
                  <button
                    onClick={() => removeMaterial(idx)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >×</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div className="space-y-2">
            <Label>Expected Products</Label>
            <div className="flex gap-2">
              <select value={productRule} onChange={e => setProductRule(e.target.value as RuleType)} className="border rounded px-2">
                {RULE_OPTIONS.map(rule => (
                  <option key={rule} value={rule}>{rule}</option>
                ))}
              </select>
              <Input
                placeholder="Pattern (e.g. *.cpp)"
                value={productPattern}
                onChange={e => setProductPattern(e.target.value)}
              />
              <Button type="button" onClick={addProduct}>Add</Button>
            </div>
            <ul className="space-y-1">
              {products.map((p, idx) => (
                <li key={idx} className="flex justify-between items-center bg-purple-50 px-2 py-1 rounded">
                  <span>{p.rule} {p.pattern}</span>
                  <button
                    onClick={() => removeProduct(idx)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >×</button>
                </li>
              ))}
            </ul>
          </div>

          <Button className="w-full" onClick={handleSubmit} disabled={!title || !deadline || !name}>
            Create Feature
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


export type RuleType = 'CREATE' | 'DELETE' | 'MODIFY' | 'ALLOW' | 'REQUIRE' | 'DISALLOW';

export interface Issue {
  _id?: string; // optional in payload (generated in DB)

  title: string;
  deadline: string; // ISO date string
  labels: string[];

  _type: 'step'; // fixed literal
  name: 'fetch'; // fixed literal

  expected_command: string[];
  expected_materials: [RuleType, string][];
  expected_products: [RuleType, string][];

  projectId: string;

  createdAt?: string; // optional (generated)
  updatedAt?: string;
}

  export type Project = {
   _id?: string;
    name: string;
    organization: string;
    creator: string;
    contributors: string[];
    issues: Issue[];
  };
  
  export type ProjectsResponse = {
    asCreator: Project[];
    asContributor: Project[];
  };
  
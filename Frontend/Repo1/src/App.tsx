import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Signup from './pages/signup';
import ProjectForm from './pages/projectform';
import CreateFeaturePage from './pages/CreateIssue';
import ProjectDashboard from './pages/listprojects';
import SubmitPage from './pages/issueSubmission';
import Login from './pages/Login';
import LandingPage from './pages/Home';
import IssueBoard from './pages/IssueDashboard';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path='/' element={<LandingPage />} />
          <Route path='/submit' element={<SubmitPage/>} />
          <Route path='/issueboard' element={<IssueBoard />} /> 
          <Route path='/signup' element={<Signup />} />
          <Route path='/login' element={<Login />} />
          <Route path='/createproject' element={<ProjectForm />} />
          <Route path='/createissue' element={<CreateFeaturePage />} />
          <Route path='/dashboard' element={<ProjectDashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}
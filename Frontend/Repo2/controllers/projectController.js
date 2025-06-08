const Project = require('../models/Project');
const jwt = require('jsonwebtoken');
const { errorHandler } = require('../helpers/deberrorHandler');

// Middleware: Verify JWT token
exports.requireSignin = (req, res, next) => {
  console.log('Authorization Header:', req.cookies); // Log Authorization header to verify token
  const token = req.cookies.token;  // Get token from the Authorization header
  console.log('Authorization Header:', req.cookies.token); // Log Authorization header to verify token
  
  if (!token) {
    console.log('Error: No token provided');
    return res.status(401).json({ error: "Authorization required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log('Error: Invalid or expired token', err);
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    console.log('Decoded user:', decoded); // Log decoded user info from JWT
    req.user = decoded;  // Attach the decoded user info to the request
    next();
  });
};

//middlewate: get project by ID
exports.projectById = (req, res, next, id) => {
    Project.findById(id).exec((err, project) => {
      if (err || !project) {
        return res.status(400).json({
          error: 'Project not found'
        });
      }
      req.project = project;
      next();
    });
  };

// Get all projects for a specific user (as creator and as contributor)
exports.list = async (req, res) => {
    try {
      const userId = req.params.userId;
  
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
  
      const asCreator = await Project.find({ creator: userId });
      const asContributor = await Project.find({ contributors: userId });
  
      res.json({ asCreator, asContributor });
    } catch (err) {
      console.error('Error fetching projects by user:', err);
      res.status(500).json({ error: 'Failed to fetch user projects' });
    }
  };
  

// Create a new project
exports.create = (req, res) => {
  if (!req.user) {
    console.log('Error: User is not authenticated');
    return res.status(401).json({ error: "User is not authenticated" });
  }

  console.log('Creating a new project:', req.body);
  const project = new Project(req.body);
  project.save((err, data) => {
    if (err) {
      console.log('Error saving project:', err);
      return res.status(400).json({
        error: errorHandler(err)
      });
    }
    console.log('New project created:', data); // Log the new project created
    res.json({ data });
  });
};

// Remove a project
exports.remove = (req, res) => {
  if (!req.user) {
    console.log('Error: User is not authenticated');
    return res.status(401).json({ error: "User is not authenticated" });
  }

  let project = req.project;
  console.log('Removing project:', project._id); // Log the project ID being removed
  project.remove((err, data) => {
    if (err) {
      console.log('Error removing project:', err);
      return res.status(400).json({
        error: errorHandler(err)
      });
    }
    console.log('Project removed:', data); // Log the removed project info
    res.json({
      message: "Project removed"
    });
  });
};

// Middleware: get project by ID
exports.projectById = (req, res, next, id) => {
  console.log('Fetching project by ID:', id); // Log the project ID being queried
  Project.findById(id).exec((err, project) => {
    if (err || !project) {
      console.log('Error: Project not found', err);
      return res.status(400).json({
        error: "Project not found"
      });
    }
    req.project = project;
    console.log('Project found:', project); // Log the project fetched from the DB
    next();
  });
};

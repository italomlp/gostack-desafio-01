const express = require("express");

const server = express();

const projects = [];
let requestsCounter = 0;

const counterMiddleware = (req, res, next) => {
  requestsCounter++;
  console.log("Requests:", requestsCounter);
  return next();
};

const checkIdMiddleware = (req, res, next) => {
  const { id } = req.params;
  const projectIndex = projects.findIndex(proj => proj.id === id);

  if (projectIndex < 0) {
    return res
      .status(404)
      .json({ message: `Project with id:${id} not exists` });
  }

  req.projectIndex = projectIndex;
  return next();
};

server.use(express.json());

server.use(counterMiddleware);

server.get("/projects", (req, res) => {
  return res.json({ projects });
});

server.post("/projects", (req, res) => {
  const { id, title } = req.body;
  const newProject = {
    id,
    title,
    tasks: []
  };

  const alreadyHasId = projects.findIndex(proj => proj.id === id) >= 0;

  if (alreadyHasId) {
    return res
      .status(500)
      .json({ message: `Project with id:${id} already exists` });
  }

  projects.push(newProject);

  return res.status(201).json({ project: newProject });
});

server.put("/projects/:id", checkIdMiddleware, (req, res) => {
  const { projectIndex } = req;
  const { title } = req.body;

  projects[projectIndex].title = title;

  return res.status(200).json({ project: projects[projectIndex] });
});

server.delete("/projects/:id", checkIdMiddleware, (req, res) => {
  const { projectIndex } = req;
  const deletedProject = projects[projectIndex];
  projects.splice(projectIndex, 1);

  return res.status(200).json({ project: deletedProject });
});

server.post("/projects/:id/tasks", checkIdMiddleware, (req, res) => {
  const {
    projectIndex,
    body: { title }
  } = req;
  projects[projectIndex].tasks.push(title);

  return res.status(201).json({ project: projects[projectIndex] });
});

server.listen(3000);

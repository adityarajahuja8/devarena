import Submission from '../models/Submission.js';
import Team from '../models/Team.js';
import Hackathon from '../models/Hackathon.js';
import Registration from '../models/Registration.js';

// @desc    Submit a project
// @route   POST /api/v1/submissions
// @access  Participant (team leader)
export const createSubmission = async (req, res) => {
  const {
    hackathonId, teamId, projectName, problemStatement,
    solutionDescription, githubRepo, liveDemo, techStack, demoVideoLink,
  } = req.body;

  const hackathon = await Hackathon.findById(hackathonId);
  if (!hackathon) return res.status(404).json({ success: false, message: 'Hackathon not found.' });

  // Check deadline
  if (new Date() > hackathon.endDate) {
    return res.status(400).json({ success: false, message: 'Submission deadline has passed.' });
  }

  const team = await Team.findById(teamId);
  if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });

  // Only team leader can submit
  if (team.leader.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Only the team leader can submit the project.' });
  }

  // Check not already submitted
  const existing = await Submission.findOne({ team: teamId, hackathon: hackathonId });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Team has already submitted.' });
  }

  // Handle uploaded files (stored locally via Multer, would be Cloudinary in production)
  const screenshots = req.files?.screenshots?.map((f) => f.path) || [];
  const presentationPDF = req.files?.presentationPDF?.[0]?.path || '';

  const submission = await Submission.create({
    team: teamId,
    hackathon: hackathonId,
    submittedBy: req.user._id,
    projectName,
    problemStatement,
    solutionDescription,
    githubRepo: githubRepo || '',
    liveDemo: liveDemo || '',
    techStack: Array.isArray(techStack) ? techStack : (techStack ? techStack.split(',').map(s => s.trim()) : []),
    screenshots,
    presentationPDF,
    demoVideoLink: demoVideoLink || '',
  });

  // Mark team as submitted
  team.hasSubmitted = true;
  await team.save();

  res.status(201).json({ success: true, message: 'Project submitted successfully!', data: { submission } });
};

// @desc    Get submission by team
// @route   GET /api/v1/submissions/:id
// @access  Private
export const getSubmission = async (req, res) => {
  const submission = await Submission.findById(req.params.id)
    .populate('team', 'name members leader')
    .populate('submittedBy', 'name email')
    .populate('hackathon', 'title endDate')
    .populate('assignedJudges', 'name email');

  if (!submission) return res.status(404).json({ success: false, message: 'Submission not found.' });

  res.status(200).json({ success: true, data: { submission } });
};

// @desc    Update submission (before deadline)
// @route   PUT /api/v1/submissions/:id
// @access  Participant (team leader)
export const updateSubmission = async (req, res) => {
  const submission = await Submission.findById(req.params.id).populate('hackathon', 'endDate');
  if (!submission) return res.status(404).json({ success: false, message: 'Submission not found.' });

  // Check deadline
  if (new Date() > submission.hackathon.endDate) {
    return res.status(400).json({ success: false, message: 'Cannot edit after deadline.' });
  }

  const team = await Team.findById(submission.team);
  if (team.leader.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Only the team leader can edit the submission.' });
  }

  const allowed = ['projectName', 'problemStatement', 'solutionDescription', 'githubRepo', 'liveDemo', 'techStack', 'demoVideoLink'];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) submission[field] = req.body[field];
  });

  await submission.save();

  res.status(200).json({ success: true, message: 'Submission updated.', data: { submission } });
};

// @desc    Get all submissions for a hackathon (Organizer/Admin/Judge)
// @route   GET /api/v1/submissions/hackathon/:hackathonId
// @access  Organizer, Admin, Judge
export const getHackathonSubmissions = async (req, res) => {
  const query = { hackathon: req.params.hackathonId };

  // Judges only see submissions assigned to them
  if (req.user.role === 'judge') {
    query.assignedJudges = req.user._id;
  }

  const submissions = await Submission.find(query)
    .populate('team', 'name members leader')
    .populate('submittedBy', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: { submissions, count: submissions.length } });
};

// @desc    Assign judges to a submission
// @route   POST /api/v1/submissions/:id/assign-judges
// @access  Organizer, Admin
export const assignJudgesToSubmission = async (req, res) => {
  const { judgeIds } = req.body;
  const submission = await Submission.findById(req.params.id);
  if (!submission) return res.status(404).json({ success: false, message: 'Submission not found.' });

  submission.assignedJudges = judgeIds;
  await submission.save();

  res.status(200).json({ success: true, message: 'Judges assigned.', data: { submission } });
};

// @desc    Get participant's own submission
// @route   GET /api/v1/submissions/my/:hackathonId
// @access  Participant
export const getMySubmission = async (req, res) => {
  const reg = await Registration.findOne({
    participant: req.user._id,
    hackathon: req.params.hackathonId,
  });
  if (!reg || !reg.team) {
    return res.status(200).json({ success: true, data: { submission: null } });
  }

  const submission = await Submission.findOne({ team: reg.team, hackathon: req.params.hackathonId })
    .populate('hackathon', 'title endDate');

  res.status(200).json({ success: true, data: { submission: submission || null } });
};

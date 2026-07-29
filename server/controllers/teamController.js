import Team from '../models/Team.js';
import Registration from '../models/Registration.js';
import Hackathon from '../models/Hackathon.js';
import { generateJoinCode } from '../utils/generateJoinCode.js';
import { sendEmail, emailTemplates } from '../utils/sendEmail.js';

// @desc    Create a new team
// @route   POST /api/v1/teams
// @access  Participant
export const createTeam = async (req, res) => {
  const { name, hackathonId } = req.body;

  // Auto-register for the hackathon if not registered yet
  let registration = await Registration.findOne({
    participant: req.user._id,
    hackathon: hackathonId,
  });
  if (!registration) {
    registration = await Registration.create({
      participant: req.user._id,
      hackathon: hackathonId,
    });
  }


  // Check if user already has a team in this hackathon
  const existingTeam = await Team.findOne({
    hackathon: hackathonId,
    members: req.user._id,
  });
  if (existingTeam) {
    return res.status(400).json({ success: false, message: 'You are already in a team for this hackathon.' });
  }

  // Check hackathon is still open
  const hackathon = await Hackathon.findById(hackathonId);
  if (!hackathon) return res.status(404).json({ success: false, message: 'Hackathon not found.' });

  // Generate unique 6-char join code
  const joinCode = await generateJoinCode(hackathonId);

  const team = await Team.create({
    name,
    hackathon: hackathonId,
    leader: req.user._id,
    members: [req.user._id],
    joinCode,
  });

  // Link team to registration
  registration.team = team._id;
  await registration.save();

  await team.populate(['leader', 'members', 'hackathon']);

  res.status(201).json({
    success: true,
    message: `Team "${name}" created! Share the join code: ${joinCode}`,
    data: { team },
  });
};

// @desc    Join a team via join code
// @route   POST /api/v1/teams/join
// @access  Participant
export const joinTeam = async (req, res) => {
  const { code, hackathonId } = req.body;

  if (!code || !hackathonId) {
    return res.status(400).json({ success: false, message: 'Join code and hackathon ID are required.' });
  }

  // Auto-register for the hackathon if not registered yet
  let registration = await Registration.findOne({
    participant: req.user._id,
    hackathon: hackathonId,
  });
  if (!registration) {
    registration = await Registration.create({
      participant: req.user._id,
      hackathon: hackathonId,
    });
  }


  // Check not already in a team
  const existingTeam = await Team.findOne({
    hackathon: hackathonId,
    members: req.user._id,
  });
  if (existingTeam) {
    return res.status(400).json({ success: false, message: 'You are already in a team for this hackathon.' });
  }

  // Find team by {code, hackathon}
  const team = await Team.findOne({
    joinCode: code.toUpperCase().trim(),
    hackathon: hackathonId,
  }).populate('hackathon', 'maxTeamSize title');

  if (!team) {
    return res.status(404).json({ success: false, message: 'Invalid join code. Please check and try again.' });
  }

  // Enforce max team size
  if (team.members.length >= team.hackathon.maxTeamSize) {
    return res.status(400).json({
      success: false,
      message: `Team is full. Maximum ${team.hackathon.maxTeamSize} members allowed.`,
    });
  }

  // Add member
  team.members.push(req.user._id);
  await team.save();

  // Update registration with team
  registration.team = team._id;
  await registration.save();

  await team.populate(['leader', 'members']);

  // Email notification (non-blocking)
  try {
    await sendEmail({
      to: req.user.email,
      ...emailTemplates.teamJoined(req.user.name, team.name, team.hackathon.title),
    });
  } catch (emailErr) {
    console.error('Email send failed:', emailErr.message);
  }


  res.status(200).json({
    success: true,
    message: `You've joined team "${team.name}"!`,
    data: { team },
  });
};

// @desc    Get team details
// @route   GET /api/v1/teams/:id
// @access  Private (team members, organizer, admin)
export const getTeam = async (req, res) => {
  const team = await Team.findById(req.params.id)
    .populate('leader', 'name email avatar')
    .populate('members', 'name email avatar skills')
    .populate('hackathon', 'title startDate endDate maxTeamSize');

  if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });

  res.status(200).json({ success: true, data: { team } });
};

// @desc    Update team name (leader only)
// @route   PUT /api/v1/teams/:id
// @access  Participant (leader)
export const updateTeam = async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });

  if (team.leader.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Only the team leader can edit the team.' });
  }

  if (req.body.name) team.name = req.body.name;
  await team.save();

  res.status(200).json({ success: true, message: 'Team updated.', data: { team } });
};

// @desc    Delete team (leader only, pre-submission)
// @route   DELETE /api/v1/teams/:id
// @access  Participant (leader)
export const deleteTeam = async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });

  if (team.leader.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Only the team leader can delete the team.' });
  }

  if (team.hasSubmitted) {
    return res.status(400).json({ success: false, message: 'Cannot delete a team that has already submitted.' });
  }

  // Reset all members' registrations (remove team link)
  await Registration.updateMany({ team: team._id }, { $set: { team: null } });
  await team.deleteOne();

  res.status(200).json({ success: true, message: 'Team deleted.' });
};

// @desc    Regenerate join code (leader only)
// @route   POST /api/v1/teams/:id/regenerate-code
// @access  Participant (leader)
export const regenerateJoinCode = async (req, res) => {
  const team = await Team.findById(req.params.id).populate('hackathon', 'title');
  if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });

  if (team.leader.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Only the team leader can regenerate the join code.' });
  }

  const newCode = await generateJoinCode(team.hackathon._id);
  team.joinCode = newCode;
  await team.save();

  res.status(200).json({
    success: true,
    message: 'Join code regenerated!',
    data: { joinCode: newCode },
  });
};

// @desc    Remove a member from the team (leader only)
// @route   DELETE /api/v1/teams/:id/members/:userId
// @access  Participant (leader)
export const removeMember = async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });

  if (team.leader.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Only the team leader can remove members.' });
  }

  const memberId = req.params.userId;
  if (memberId === team.leader.toString()) {
    return res.status(400).json({ success: false, message: 'Leader cannot remove themselves. Transfer leadership first.' });
  }

  team.members = team.members.filter((m) => m.toString() !== memberId);
  await team.save();

  // Clear team from their registration
  await Registration.updateOne(
    { participant: memberId, hackathon: team.hackathon },
    { $set: { team: null } }
  );

  res.status(200).json({ success: true, message: 'Member removed.', data: { team } });
};

// @desc    Leave a team (non-leader member)
// @route   POST /api/v1/teams/:id/leave
// @access  Participant (non-leader)
export const leaveTeam = async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });

  if (team.leader.toString() === req.user._id.toString()) {
    return res.status(400).json({ success: false, message: 'Leader cannot leave the team. Transfer leadership or delete the team.' });
  }

  team.members = team.members.filter((m) => m.toString() !== req.user._id.toString());
  await team.save();

  await Registration.updateOne(
    { participant: req.user._id, hackathon: team.hackathon },
    { $set: { team: null } }
  );

  res.status(200).json({ success: true, message: 'You have left the team.' });
};

// @desc    Transfer team leadership
// @route   PATCH /api/v1/teams/:id/transfer
// @access  Participant (leader)
export const transferLeadership = async (req, res) => {
  const { newLeaderId } = req.body;
  const team = await Team.findById(req.params.id);
  if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });

  if (team.leader.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Only the team leader can transfer leadership.' });
  }

  if (!team.members.map((m) => m.toString()).includes(newLeaderId)) {
    return res.status(400).json({ success: false, message: 'New leader must be a current team member.' });
  }

  team.leader = newLeaderId;
  await team.save();

  res.status(200).json({ success: true, message: 'Leadership transferred.', data: { team } });
};

// @desc    Get participant's team for a hackathon
// @route   GET /api/v1/teams/my/:hackathonId
// @access  Participant
export const getMyTeam = async (req, res) => {
  const team = await Team.findOne({
    hackathon: req.params.hackathonId,
    members: req.user._id,
  })
    .populate('leader', 'name email avatar')
    .populate('members', 'name email avatar skills')
    .populate('hackathon', 'title maxTeamSize');

  if (!team) {
    return res.status(200).json({ success: true, data: { team: null } });
  }

  res.status(200).json({ success: true, data: { team } });
};

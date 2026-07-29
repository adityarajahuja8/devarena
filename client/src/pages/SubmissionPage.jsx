import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Input, { Textarea } from '../components/ui/Input';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import { submissionService, teamService, hackathonService } from '../services';
import { FiGithub, FiGlobe, FiVideo, FiUploadCloud, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const SubmissionPage = () => {
  const { id: hackathonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [team, setTeam] = useState(null);
  const [hackathon, setHackathon] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    projectName: '',
    problemStatement: '',
    solutionDescription: '',
    githubRepo: '',
    liveDemo: '',
    techStack: '',
    demoVideoLink: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const hackRes = await hackathonService.getOne(hackathonId);
      setHackathon(hackRes.data.data.hackathon);

      const teamRes = await teamService.getMy(hackathonId);
      setTeam(teamRes.data.data.team);

      if (teamRes.data.data.team) {
        const subRes = await submissionService.getMy(hackathonId);
        const sub = subRes.data.data.submission;
        if (sub) {
          setSubmission(sub);
          setFormData({
            projectName: sub.projectName || '',
            problemStatement: sub.problemStatement || '',
            solutionDescription: sub.solutionDescription || '',
            githubRepo: sub.githubRepo || '',
            liveDemo: sub.liveDemo || '',
            techStack: (sub.techStack || []).join(', '),
            demoVideoLink: sub.demoVideoLink || '',
          });
        }
      }
    } catch (err) {
      toast.error('Failed to load submission data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [hackathonId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!team) {
      toast.error('You must be in a team to submit a project');
      return;
    }
    if (team.leader?._id !== user?._id) {
      toast.error('Only the team leader can submit the project');
      return;
    }
    setSubmitting(true);
    try {
      if (submission) {
        // Update existing
        await submissionService.update(submission._id, formData);
        toast.success('Submission updated successfully!');
        navigate(`/hackathons/${hackathonId}`);
      } else {
        // Create new
        const form = new FormData();
        form.append('hackathonId', hackathonId);
        form.append('teamId', team._id);
        Object.keys(formData).forEach((k) => form.append(k, formData[k]));

        await submissionService.create(form);
        toast.success('Project submitted successfully! 🎉');
        navigate(`/hackathons/${hackathonId}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 space-y-6">
        <Skeleton height="300px" className="w-full rounded-2xl" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="max-w-xl mx-auto p-12 text-center text-gray-400 glass-card my-12">
        <h3 className="text-xl font-bold text-white mb-2">No Team Found</h3>
        <p className="text-sm mb-4">You must create or join a team for this hackathon before submitting a project.</p>
        <Button variant="primary" onClick={() => navigate(`/teams/${hackathonId}`)}>
          Go to Teaming Module
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-purple-400">Project Submission</span>
          <h1 className="text-3xl font-extrabold font-display text-white mt-1">
            {submission ? 'Edit Project Submission' : 'Submit Hackathon Project'}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Team: <strong className="text-purple-300">{team.name}</strong> • Hackathon: <strong className="text-white">{hackathon?.title}</strong>
          </p>
        </div>
        {submission && <Badge status={submission.status}>{submission.status}</Badge>}
      </div>

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Project Name"
            placeholder="e.g. DevArena Autonomous AI"
            value={formData.projectName}
            onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
            required
          />

          <Textarea
            label="Problem Statement"
            placeholder="What problem does your project solve?"
            value={formData.problemStatement}
            onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
            required
          />

          <Textarea
            label="Solution Description"
            placeholder="Explain how your project works, your architecture, and key features..."
            value={formData.solutionDescription}
            onChange={(e) => setFormData({ ...formData, solutionDescription: e.target.value })}
            rows={5}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="GitHub Repository URL"
              placeholder="https://github.com/org/repo"
              value={formData.githubRepo}
              onChange={(e) => setFormData({ ...formData, githubRepo: e.target.value })}
              icon={<FiGithub />}
            />
            <Input
              label="Live Demo URL"
              placeholder="https://myproject.vercel.app"
              value={formData.liveDemo}
              onChange={(e) => setFormData({ ...formData, liveDemo: e.target.value })}
              icon={<FiGlobe />}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Tech Stack (comma separated)"
              placeholder="React, Node.js, MongoDB, Socket.io"
              value={formData.techStack}
              onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
            />
            <Input
              label="Demo Video Link (Loom / YouTube)"
              placeholder="https://youtube.com/watch?v=..."
              value={formData.demoVideoLink}
              onChange={(e) => setFormData({ ...formData, demoVideoLink: e.target.value })}
              icon={<FiVideo />}
            />
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={submitting}
              icon={<FiUploadCloud />}
            >
              {submission ? 'Update Project Submission' : 'Submit Project'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default SubmissionPage;

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Input, { Textarea } from '../components/ui/Input';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { authService } from '../services';
import { FiUser, FiGithub, FiLinkedin, FiSave, FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    skills: (user?.skills || []).join(', '),
    github: user?.github || '',
    linkedin: user?.linkedin || '',
  });

  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
  });

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPass, setLoadingPass] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      const skillsArray = formData.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await authService.updateProfile({
        ...formData,
        skills: skillsArray,
      });

      updateUser(res.data.data.user);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePassSubmit = async (e) => {
    e.preventDefault();
    if (!passData.currentPassword || !passData.newPassword) {
      toast.error('Fill in password fields');
      return;
    }
    setLoadingPass(true);
    try {
      await authService.changePassword(passData);
      toast.success('Password updated successfully!');
      setPassData({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setLoadingPass(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold font-display text-white">Your Profile</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your account information and credentials</p>
        </div>
        <Badge status={user?.status}>{user?.role}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <Card className="text-center p-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 p-[2px] mx-auto mb-4">
              <div className="w-full h-full bg-[#08080B] rounded-full flex items-center justify-center text-3xl font-bold font-display text-cyan-300">
                {user?.name?.[0] || 'U'}
              </div>
            </div>
            <h3 className="text-lg font-bold text-white">{user?.name}</h3>
            <p className="text-xs text-gray-400 mb-4">{user?.email}</p>
            <div className="pt-4 border-t border-white/10 text-xs text-gray-400 space-y-2 text-left">
              <div><strong className="text-gray-300">Role:</strong> <span className="uppercase text-cyan-400 font-semibold">{user?.role}</span></div>
              <div><strong className="text-gray-300">Status:</strong> <span className="uppercase text-emerald-400 font-semibold">{user?.status}</span></div>
              <div><strong className="text-gray-300">Joined:</strong> {new Date(user?.createdAt).toLocaleDateString()}</div>
            </div>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-8">
          <Card className="p-8">
            <h3 className="text-lg font-bold font-display text-white mb-6 flex items-center gap-2">
              <FiUser className="text-cyan-400" /> Personal Details
            </h3>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <Input
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Textarea
                label="Bio"
                placeholder="Tell us about your background, interests, and projects..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
              <Input
                label="Skills (comma separated)"
                placeholder="React, Node.js, Python, Tailwind"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              />
              <Input
                label="GitHub URL"
                placeholder="https://github.com/username"
                value={formData.github}
                onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                icon={<FiGithub />}
              />
              <Input
                label="LinkedIn URL"
                placeholder="https://linkedin.com/in/username"
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                icon={<FiLinkedin />}
              />
              <Button type="submit" variant="primary" loading={loadingProfile} icon={<FiSave />}>
                Save Changes
              </Button>
            </form>
          </Card>

          <Card className="p-8">
            <h3 className="text-lg font-bold font-display text-white mb-6 flex items-center gap-2">
              <FiLock className="text-cyan-400" /> Change Password
            </h3>
            <form onSubmit={handlePassSubmit} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                value={passData.currentPassword}
                onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
                required
              />
              <Input
                label="New Password"
                type="password"
                value={passData.newPassword}
                onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                required
              />
              <Button type="submit" variant="outline" loading={loadingPass}>
                Update Password
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;

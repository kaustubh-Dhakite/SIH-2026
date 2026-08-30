import React, { useState } from 'react';
import { Layout } from '../components/Layout/Layout';
import { Card } from '../components/Common/Card';
import { Button } from '../components/Common/Button';
import { Input } from '../components/Common/Input';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdateProfile = () => {
    toast.success('Profile updated successfully');
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    toast.success('Password changed successfully');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
            Settings
          </h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
            Manage your account and system preferences
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Account Settings */}
          <div className="space-y-6">
            <Card title="Account Information">
              <div className="space-y-4">
                <Input
                  label="Username"
                  value={user?.username || ''}
                  disabled
                />
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  label="Role"
                  value={user?.role || ''}
                  disabled
                />
                <Button onClick={handleUpdateProfile}>
                  Update Profile
                </Button>
              </div>
            </Card>

            <Card title="Change Password">
              <div className="space-y-4">
                <Input
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <Input
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button onClick={handleChangePassword}>
                  Change Password
                </Button>
              </div>
            </Card>

            <Card title="API Keys">
              <div className="space-y-4">
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  Manage API keys for programmatic access
                </p>
                <Button variant="secondary">
                  Generate New API Key
                </Button>
              </div>
            </Card>
          </div>

          {/* System Settings (Admin Only) */}
          <div className="space-y-6">
            {isAdmin && (
              <>
                <Card title="System Preferences">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                        Default Model
                      </label>
                      <select className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary">
                        <option>Qwen3-8B</option>
                        <option>Qwen3-Coder</option>
                      </select>
                    </div>

                    <Input
                      label="VRAM Budget (GB)"
                      type="number"
                      defaultValue="16"
                    />

                    <Input
                      label="Session Timeout (hours)"
                      type="number"
                      defaultValue="24"
                    />

                    <Button>Save System Settings</Button>
                  </div>
                </Card>

                <Card title="Service Endpoints">
                  <div className="space-y-4">
                    <Input
                      label="Ollama URL"
                      defaultValue="http://ollama:11434"
                    />
                    <Input
                      label="Qdrant URL"
                      defaultValue="http://qdrant:6333"
                    />
                    <Button>Update Endpoints</Button>
                  </div>
                </Card>

                <Card title="Data Management">
                  <div className="space-y-4">
                    <Input
                      label="Audit Log Retention (days)"
                      type="number"
                      defaultValue="90"
                    />
                    <Button variant="danger">
                      Clear Old Audit Logs
                    </Button>
                  </div>
                </Card>
              </>
            )}

            {!isAdmin && (
              <Card>
                <div className="text-center py-8 text-light-text-secondary dark:text-dark-text-secondary">
                  <p>System settings are only available to administrators</p>
                </div>
              </Card>
            )}

            <Card title="Danger Zone">
              <div className="space-y-4">
                <p className="text-sm text-error">
                  Deleting your account is permanent and cannot be undone
                </p>
                <Button variant="danger">
                  Delete Account
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

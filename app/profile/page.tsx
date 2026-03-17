"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import KycUploader from '@/components/KycUploader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, User } from 'lucide-react';

export default function ProfilePage() {
  const supabase = createClient();
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ full_name: string; avatar_url: string; avatar_storage_path?: string }>({ full_name: '', avatar_url: '' });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  async function fetchProfile() {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, avatar_storage_path')
      .eq('id', user!.id)
      .single();

    if (error) console.error('Fetch profile error:', error);
    else {
      const nextProfile = data || { full_name: '', avatar_url: '' };
      setProfile(nextProfile);

      if (nextProfile.avatar_storage_path) {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (token) {
          const resp = await fetch('/api/profile/avatar-url', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (resp.ok) {
            const body = await resp.json();
            if (body?.url) {
              setProfile((prev) => ({ ...prev, avatar_url: body.url }));
            }
          }
        }
      }
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  async function handleSave() {
    if (!supabase || !user) return;
    setSaving(true);
    try {
      const updateData: { full_name: string; avatar_storage_path?: string } = { full_name: profile.full_name };

      // Upload avatar if new file
      if (avatarFile) {
        const safeName = avatarFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const path = `${user.id}/profile/${Date.now()}-${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, avatarFile);

        if (uploadError) throw uploadError;

        updateData.avatar_storage_path = path;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, ...updateData, updated_at: new Date().toISOString() });

      if (error) throw error;

      setEditing(false);
      if (avatarFile) URL.revokeObjectURL(previewUrl);
      fetchProfile(); // Refresh
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Save failed: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (!user) {
    return <div className="p-8 text-center">Please log in to view your profile.</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-6 w-6" />
            My Profile
          </CardTitle>
          <CardDescription>Update your personal information and avatar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="flex flex-col items-center space-y-2">
              <Avatar className="h-24 w-24">
                <AvatarImage src={previewUrl || profile.avatar_url} />
                <AvatarFallback>{profile.full_name.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <Input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="w-48"
              />
              {previewUrl && (
                <img src={previewUrl} alt="Preview" className="h-20 w-20 rounded-full object-cover" />
              )}
            </div>
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  disabled={!editing}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant={editing ? 'default' : 'outline'}
                  onClick={() => setEditing(!editing)}
                  className="gap-1"
                >
                  <User className="h-4 w-4" />
                  {editing ? 'Cancel' : 'Edit Profile'}
                </Button>
                {editing && (
                  <Button onClick={handleSave} disabled={saving} className="gap-1">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Document Upload Test (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <KycUploader userId={user.id} onUploaded={(docs) => console.log('Uploaded:', docs)} />
        </CardContent>
      </Card>
    </div>
  );
}

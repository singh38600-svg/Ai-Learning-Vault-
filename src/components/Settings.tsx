import ProfileSettings from './ProfileSettings';
import { Profile } from '../types';

interface SettingsProps {
  userId: string;
  profile: Profile;
  onProfileUpdate: (updated: Profile) => void;
}

export default function Settings({ userId, profile, onProfileUpdate }: SettingsProps) {
  return (
    <div id="settings-view" className="space-y-6 max-w-2xl mx-auto">
      <ProfileSettings
        userId={userId}
        profile={profile}
        onProfileUpdate={onProfileUpdate}
      />
    </div>
  );
}

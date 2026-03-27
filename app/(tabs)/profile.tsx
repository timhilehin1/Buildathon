import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/src/store/auth-store';
import { useProfile, useUpdateProfile, usePayoutAccount } from '@/src/hooks/use-profile';
import { profileApi } from '@/src/api/profile';
import { Card } from '@/src/components/Card';
import { LoadingSpinner } from '@/src/components/LoadingSpinner';
import { Colors, FontSize, FontWeight, Spacing } from '@/src/constants/theme';

function SettingsRow({
  label,
  value,
  onPress,
  right,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress && !right}
      style={styles.settingsRow}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Text style={styles.settingsLabel}>{label}</Text>
      {right ?? (value ? <Text style={styles.settingsValue}>{value}</Text> : null)}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { signOut } = useAuthStore();
  const { data: profile, isLoading } = useProfile();
  const { data: payoutAccount } = usePayoutAccount();
  const updateProfile = useUpdateProfile();
  const [optIn, setOptIn] = useState(profile?.leaderboard_opt_in ?? false);

  if (isLoading) return <LoadingSpinner />;

  async function handleLeaderboardToggle(value: boolean) {
    setOptIn(value);
    try {
      await updateProfile.mutateAsync({ leaderboard_opt_in: value });
    } catch {
      setOptIn(!value);
    }
  }

  function handleExport() {
    Alert.alert('Export Data', 'Your transaction data will be exported as JSON.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Export',
        onPress: async () => {
          try {
            await profileApi.exportData();
            Alert.alert('Done', 'Data exported successfully.');
          } catch {
            Alert.alert('Error', 'Export failed. Make sure you have an internet connection.');
          }
        },
      },
    ]);
  }

  function handleDeleteAccount() {
    Alert.alert(
      'Delete Account',
      'This will permanently delete all your data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await profileApi.deleteAccount();
              await signOut();
            } catch {
              Alert.alert('Error', 'Could not delete account. Please try again.');
            }
          },
        },
      ]
    );
  }

  const displayName = profile
    ? `${profile.first_name} ${profile.last_name}`.trim()
    : 'Your Account';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerBar}>
        <Text style={styles.screenTitle}>Profile</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar + Name */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{displayName[0]?.toUpperCase() ?? '?'}</Text>
          </View>
          <Text style={styles.displayName}>{displayName}</Text>
          {profile?.username ? (
            <Text style={styles.username}>@{profile.username}</Text>
          ) : null}
        </View>

        {/* Account Info */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <SettingsRow label="Name" value={displayName} />
          <SettingsRow label="Username" value={profile?.username ? `@${profile.username}` : '—'} />
          <SettingsRow label="Country" value={profile?.country ?? '—'} />
          <SettingsRow label="State" value={profile?.state ?? '—'} />
        </Card>

        {/* Payout Account */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Payout Account</Text>
          {payoutAccount ? (
            <>
              <SettingsRow label="Bank" value={payoutAccount.bank_name} />
              <SettingsRow label="Account" value={`****${payoutAccount.account_number.slice(-4)}`} />
            </>
          ) : (
            <Text style={styles.noPayoutText}>No payout account set</Text>
          )}
        </Card>

        {/* Preferences */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <SettingsRow
            label="Leaderboard"
            right={
              <Switch
                value={optIn}
                onValueChange={handleLeaderboardToggle}
                trackColor={{ true: Colors.primary, false: Colors.border }}
                thumbColor={Colors.white}
              />
            }
          />
        </Card>

        {/* Data */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <SettingsRow label="Export Data" onPress={handleExport} />
        </Card>

        {/* Danger Zone */}
        <Card style={[styles.section, styles.dangerCard]}>
          <TouchableOpacity onPress={() => signOut()} style={styles.dangerRow}>
            <Text style={styles.dangerText}>Sign Out</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDeleteAccount} style={styles.dangerRow}>
            <Text style={[styles.dangerText, styles.deleteText]}>Delete Account</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  headerBar: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  screenTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  content: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xxl },
  avatarSection: { alignItems: 'center', paddingVertical: Spacing.lg },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: { color: Colors.white, fontSize: FontSize.xxl, fontWeight: FontWeight.bold },
  displayName: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  username: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing.xs },
  section: { marginBottom: 0 },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingsLabel: { fontSize: FontSize.md, color: Colors.text },
  settingsValue: { fontSize: FontSize.md, color: Colors.textSecondary },
  noPayoutText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  dangerCard: { borderColor: Colors.border },
  dangerRow: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dangerText: { fontSize: FontSize.md, color: Colors.text, textAlign: 'center' },
  deleteText: { color: Colors.error },
});

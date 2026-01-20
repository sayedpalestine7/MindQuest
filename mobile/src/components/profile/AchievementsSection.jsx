import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import achievementService from '../../services/achievementService';

const AchievementBadge = ({ achievement }) => {
  const { title, description, icon, unlocked, progress, total } = achievement;
  const progressPercentage = total > 1 ? Math.round((progress / total) * 100) : (unlocked ? 100 : 0);

  return (
    <View style={[styles.badge, !unlocked && styles.badgeLocked]}>
      <View style={[styles.badgeIcon, !unlocked && styles.badgeIconLocked]}>
        <Text style={styles.icon}>{unlocked ? icon : '🔒'}</Text>
      </View>
      
      <View style={styles.badgeContent}>
        <Text style={[styles.badgeTitle, !unlocked && styles.textLocked]}>
          {title}
        </Text>
        <Text style={[styles.badgeDescription, !unlocked && styles.textLocked]}>
          {description}
        </Text>
        
        {!unlocked && total > 1 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, { width: `${progressPercentage}%` }]} 
              />
            </View>
            <Text style={styles.progressText}>
              {progress}/{total}
            </Text>
          </View>
        )}
      </View>

      {unlocked && (
        <View style={styles.checkmark}>
          <Ionicons name="checkmark-circle" size={24} color="#10b981" />
        </View>
      )}
    </View>
  );
};

export default function AchievementsSection({ studentId }) {
  const [achievements, setAchievements] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'unlocked', 'locked'

  const fetchAchievements = async (forceRefresh = false) => {
    try {
      if (forceRefresh) setRefreshing(true);
      else setLoading(true);

      const result = await achievementService.getAchievements(studentId, forceRefresh);
      
      if (result.success) {
        setAchievements(result.data.achievements);
        setStats(result.data.stats);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, [studentId]);

  const getFilteredAchievements = () => {
    if (!achievements) return [];
    
    switch (filter) {
      case 'unlocked':
        return achievements.unlocked;
      case 'locked':
        return achievements.locked;
      default:
        return achievements.all;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading achievements...</Text>
      </View>
    );
  }

  if (!achievements || !stats) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#ef4444" />
        <Text style={styles.errorText}>Failed to load achievements</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => fetchAchievements(true)}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const filteredAchievements = getFilteredAchievements();

  return (
    <View style={styles.container}>
      {/* Stats Header */}
      <View style={styles.statsHeader}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.unlockedCount}</Text>
          <Text style={styles.statLabel}>Unlocked</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalAchievements}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.completionPercentage}%</Text>
          <Text style={styles.statLabel}>Progress</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}>
            All ({achievements.all.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterTab, filter === 'unlocked' && styles.filterTabActive]}
          onPress={() => setFilter('unlocked')}
        >
          <Text style={[styles.filterTabText, filter === 'unlocked' && styles.filterTabTextActive]}>
            Unlocked ({achievements.unlocked.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterTab, filter === 'locked' && styles.filterTabActive]}
          onPress={() => setFilter('locked')}
        >
          <Text style={[styles.filterTabText, filter === 'locked' && styles.filterTabTextActive]}>
            Locked ({achievements.locked.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Achievements List */}
      <ScrollView
        style={styles.achievementsList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchAchievements(true)}
            colors={['#6366f1']}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredAchievements.map((achievement) => (
          <AchievementBadge key={achievement.id} achievement={achievement} />
        ))}
        
        {filteredAchievements.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No achievements in this category</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    marginTop: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#6366f1',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statsHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#6366f1',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  filterTabTextActive: {
    color: '#fff',
  },
  achievementsList: {
    flex: 1,
  },
  badge: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#10b981',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  badgeLocked: {
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  badgeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#d1fae5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  badgeIconLocked: {
    backgroundColor: '#e2e8f0',
  },
  icon: {
    fontSize: 32,
  },
  badgeContent: {
    flex: 1,
  },
  badgeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  textLocked: {
    color: '#94a3b8',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
  },
  progressText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },
  checkmark: {
    marginLeft: 8,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
});

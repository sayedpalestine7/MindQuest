import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import studentService from '../../services/studentService';
import courseService from '../../services/courseService';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#6366f1',
  },
  propsForBackgroundLines: {
    strokeDasharray: '',
    stroke: '#e2e8f0',
    strokeWidth: 1,
  },
};

const StatCard = ({ icon, label, value, color = '#6366f1' }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export default function PerformanceCharts({ studentId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPerformanceData();
  }, [studentId]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);

      const [student, courses] = await Promise.all([
        studentService.getStudentById(studentId),
        courseService.getEnrolledCourses(studentId, false)
      ]);

      const coursesArray = Array.isArray(courses) ? courses : [];
      const totalCourses = coursesArray.length;

      const courseMetrics = coursesArray.map((course) => {
        const totalLessons = course.totalLessons ?? course.lessonIds?.length ?? 0;
        const completedLessons = Math.min(course.completedLessons ?? 0, totalLessons);
        const progressPercent = totalLessons > 0
          ? Math.min(100, Math.round((completedLessons / totalLessons) * 100))
          : 0;

        return { totalLessons, completedLessons, progressPercent };
      });

      const completedCourses = courseMetrics.filter(
        (c) => c.totalLessons > 0 && c.completedLessons >= c.totalLessons
      ).length;
      const inProgressCourses = courseMetrics.filter(
        (c) => c.totalLessons > 0 && c.completedLessons > 0 && c.completedLessons < c.totalLessons
      ).length;
      const totalLessons = courseMetrics.reduce((sum, c) => sum + c.totalLessons, 0);
      const completedLessons = courseMetrics.reduce((sum, c) => sum + c.completedLessons, 0);
      const avgProgress = totalCourses > 0
        ? Math.min(
            100,
            Math.round(courseMetrics.reduce((sum, c) => sum + c.progressPercent, 0) / totalCourses)
          )
        : 0;

        // Mock weekly progress data (in real app, fetch from backend)
        const weeklyProgress = {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            data: [3, 5, 2, 8, 6, 4, 7], // Lessons completed per day
          }],
        };

        // Course progress distribution
        const progressDistribution = [
          {
            name: 'Completed',
            population: completedCourses,
            color: '#10b981',
            legendFontColor: '#64748b',
            legendFontSize: 13,
          },
          {
            name: 'In Progress',
            population: inProgressCourses,
            color: '#6366f1',
            legendFontColor: '#64748b',
            legendFontSize: 13,
          },
          {
            name: 'Not Started',
            population: totalCourses - completedCourses - inProgressCourses,
            color: '#e2e8f0',
            legendFontColor: '#64748b',
            legendFontSize: 13,
          },
        ];

        // Course difficulty breakdown
        const difficultyData = {
          labels: ['Beginner', 'Intermediate', 'Advanced'],
          datasets: [{
            data: [
              coursesArray.filter(c => c.difficulty === 'Beginner').length || 1,
              coursesArray.filter(c => c.difficulty === 'Intermediate').length || 1,
              coursesArray.filter(c => c.difficulty === 'Advanced').length || 1,
            ],
          }],
        };

        setData({
          stats: {
            totalCourses,
            completedCourses,
            inProgressCourses,
            totalLessons,
            completedLessons,
            avgProgress,
            score: student?.studentData?.score || 0,
          },
          weeklyProgress,
          progressDistribution,
          difficultyData,
        });
    } catch (err) {
      console.error('Error fetching performance data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading performance data...</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="bar-chart-outline" size={64} color="#cbd5e1" />
        <Text style={styles.errorText}>Unable to load performance data</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Stats Overview */}
      <View style={styles.statsGrid}>
        <StatCard
          icon="trophy"
          label="Total Score"
          value={data.stats.score}
          color="#f59e0b"
        />
        <StatCard
          icon="trending-up"
          label="Avg Progress"
          value={`${data.stats.avgProgress}%`}
          color="#6366f1"
        />
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          icon="checkmark-circle"
          label="Completed"
          value={data.stats.completedCourses}
          color="#10b981"
        />
        <StatCard
          icon="time"
          label="In Progress"
          value={data.stats.inProgressCourses}
          color="#3b82f6"
        />
      </View>

      {/* Weekly Progress Chart */}
      {/* <View style={styles.chartSection}>
        <View style={styles.chartHeader}>
          <Ionicons name="calendar" size={20} color="#6366f1" />
          <Text style={styles.chartTitle}>Weekly Activity</Text>
        </View>
        <LineChart
          data={data.weeklyProgress}
          width={screenWidth - 48}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withInnerLines
          withOuterLines
          withVerticalLabels
          withHorizontalLabels
          withDots
          withShadow={false}
        />
        <Text style={styles.chartCaption}>Lessons completed per day this week</Text>
      </View> */}

      {/* Course Progress Distribution */}
      {data.progressDistribution.some(item => item.population > 0) && (
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Ionicons name="pie-chart" size={20} color="#6366f1" />
            <Text style={styles.chartTitle}>Course Distribution</Text>
          </View>
          <PieChart
            data={data.progressDistribution}
            width={screenWidth - 48}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            style={styles.chart}
          />
          <Text style={styles.chartCaption}>Status of enrolled courses</Text>
        </View>
      )}

      {/* Difficulty Breakdown */}
      <View style={styles.chartSection}>
        <View style={styles.chartHeader}>
          <Ionicons name="stats-chart" size={20} color="#6366f1" />
          <Text style={styles.chartTitle}>Course Difficulty</Text>
        </View>
        <BarChart
          data={data.difficultyData}
          width={screenWidth - 48}
          height={220}
          chartConfig={{
            ...chartConfig,
            barPercentage: 0.7,
          }}
          style={styles.chart}
          showValuesOnTopOfBars
          fromZero
        />
        <Text style={styles.chartCaption}>Courses by difficulty level</Text>
      </View>

      {/* Summary Stats */}
      <View style={styles.summarySection}>
        <Text style={styles.summaryTitle}>Learning Summary</Text>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Lessons</Text>
          <Text style={styles.summaryValue}>{data.stats.totalLessons}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Completed Lessons</Text>
          <Text style={styles.summaryValue}>{data.stats.completedLessons}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Completion Rate</Text>
          <Text style={styles.summaryValue}>
            {data.stats.totalLessons > 0 
              ? Math.round((data.stats.completedLessons / data.stats.totalLessons) * 100)
              : 0}%
          </Text>
        </View>
      </View>
    </ScrollView>
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
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  chartSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 12,
  },
  chartCaption: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
  },
  summarySection: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
});

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function TableField({ content }) {
  if (!content) return null;

  const tableData = typeof content === 'string' ? JSON.parse(content) : content;
  
  if (!tableData || !tableData.headers || !tableData.rows) {
    return null;
  }

  return (
    <ScrollView horizontal style={styles.container}>
      <View>
        {/* Header Row */}
        <View style={styles.row}>
          {tableData.headers.map((header, index) => (
            <View key={index} style={styles.headerCell}>
              <Text style={styles.headerText}>{header}</Text>
            </View>
          ))}
        </View>

        {/* Data Rows */}
        {tableData.rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((cell, cellIndex) => (
              <View key={cellIndex} style={styles.cell}>
                <Text style={styles.cellText}>{cell}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  row: {
    flexDirection: 'row',
  },
  headerCell: {
    minWidth: 120,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderBottomWidth: 2,
    borderBottomColor: '#D1D5DB',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  headerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  cell: {
    minWidth: 120,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  cellText: {
    fontSize: 14,
    color: '#4B5563',
  },
});

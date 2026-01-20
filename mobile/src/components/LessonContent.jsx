import React from 'react';
import { View, StyleSheet } from 'react-native';
import ParagraphField from './fields/ParagraphField';
import ImageField from './fields/ImageField';
import YoutubeField from './fields/YoutubeField';
import CodeField from './fields/CodeField';
import TableField from './fields/TableField';
import QuestionField from './fields/QuestionField';

export default function LessonContent({ fields }) {
  const renderField = (field, index) => {
    const { type, content, _id } = field;

    switch (type) {
      case 'paragraph':
        return <ParagraphField key={_id || index} content={content} />;
      
      case 'image':
        return <ImageField key={_id || index} content={content} />;
      
      case 'youtube':
        return <YoutubeField key={_id || index} content={content} />;
      
      case 'code':
        return <CodeField key={_id || index} content={content} />;
      
      case 'table':
        return <TableField key={_id || index} content={content} />;
      
      case 'question':
        return <QuestionField key={_id || index} field={field} />;
      
      case 'animation':
        // Animation will be rendered as video/GIF
        return <ImageField key={_id || index} content={content?.animationUrl || content} />;
      
      case 'minigame':
        // Skipping minigames for now as per requirements
        return null;
      
      default:
        console.warn(`Unknown field type: ${type}`);
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {fields.map((field, index) => renderField(field, index))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
});

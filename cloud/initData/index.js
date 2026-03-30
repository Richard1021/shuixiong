const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event, context) => {
  const courses = [
    {
      title: '动物世界',
      titleEn: 'Animal World',
      type: 'animals',
      stage: 'S1',
      coverImage: '',
      description: '学习常见动物的英语单词',
      segments: [
        { id: 1, word: 'Cat', sentence: 'The cat is cute.', audioUrl: '' },
        { id: 2, word: 'Dog', sentence: 'The dog runs fast.', audioUrl: '' },
        { id: 3, word: 'Bird', sentence: 'The bird can fly.', audioUrl: '' },
        { id: 4, word: 'Fish', sentence: 'The fish swims in water.', audioUrl: '' },
        { id: 5, word: 'Rabbit', sentence: 'The rabbit is white.', audioUrl: '' },
      ],
      createdAt: db.serverDate(),
    },
    {
      title: '水果乐园',
      titleEn: 'Fruit Paradise',
      type: 'fruits',
      stage: 'S1',
      coverImage: '',
      description: '学习常见水果的英语单词',
      segments: [
        { id: 1, word: 'Apple', sentence: 'I like apple.', audioUrl: '' },
        { id: 2, word: 'Banana', sentence: 'The banana is yellow.', audioUrl: '' },
        { id: 3, word: 'Orange', sentence: 'The orange is sweet.', audioUrl: '' },
        { id: 4, word: 'Grape', sentence: 'I love grapes.', audioUrl: '' },
      ],
      createdAt: db.serverDate(),
    },
    {
      title: '日常用语',
      titleEn: 'Daily Expressions',
      type: 'daily',
      stage: 'S1',
      coverImage: '',
      description: '学习日常英语口语表达',
      segments: [
        { id: 1, word: 'Hello', sentence: 'Hello, how are you?', audioUrl: '' },
        { id: 2, word: 'Thank you', sentence: 'Thank you very much.', audioUrl: '' },
        { id: 3, word: 'Sorry', sentence: 'I am sorry.', audioUrl: '' },
        { id: 4, word: 'Good morning', sentence: 'Good morning, everyone.', audioUrl: '' },
        { id: 5, word: 'Goodbye', sentence: 'Goodbye, see you tomorrow.', audioUrl: '' },
        { id: 6, word: 'Please', sentence: 'Please help me.', audioUrl: '' },
      ],
      createdAt: db.serverDate(),
    },
    {
      title: '颜色世界',
      titleEn: 'Color World',
      type: 'colors',
      stage: 'S1',
      coverImage: '',
      description: '学习常见颜色的英语单词',
      segments: [
        { id: 1, word: 'Red', sentence: 'The apple is red.', audioUrl: '' },
        { id: 2, word: 'Blue', sentence: 'The sky is blue.', audioUrl: '' },
        { id: 3, word: 'Green', sentence: 'The grass is green.', audioUrl: '' },
        { id: 4, word: 'Yellow', sentence: 'The sun is yellow.', audioUrl: '' },
      ],
      createdAt: db.serverDate(),
    },
  ];

  try {
    const collection = db.collection('courses');

    const results = await Promise.all(
      courses.map(course => collection.add({ data: course }))
    );

    return {
      success: true,
      message: `成功插入 ${results.length} 条课程数据`,
      ids: results.map(r => r._id),
    };
  } catch (error) {
    return {
      success: false,
      message: '初始化失败: ' + error.message,
    };
  }
};

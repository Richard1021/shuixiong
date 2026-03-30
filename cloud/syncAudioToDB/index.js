const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event, context) => {
  const { files } = event;

  if (!files || files.length === 0) {
    return { success: false, message: '没有文件数据' };
  }

  const results = [];

  for (const file of files) {
    const { name, stage, theme, fileID } = file;

    try {
      const queryRes = await db.collection('audioMaterials').where({
        stage,
        theme,
        fileName: name,
      }).get();

      if (queryRes.data.length > 0) {
        await db.collection('audioMaterials').doc(queryRes.data[0]._id).update({
          data: { fileID, updatedAt: db.serverDate() },
        });
        results.push({ name, action: 'updated' });
      } else {
        await db.collection('audioMaterials').add({
          data: {
            fileName: name,
            title: name.replace('.mp3', '').replace(/_/g, ' '),
            stage,
            theme,
            fileID,
            audioUrl: fileID,
            createdAt: db.serverDate(),
            updatedAt: db.serverDate(),
          },
        });
        results.push({ name, action: 'created' });
      }
    } catch (err) {
      results.push({ name, action: 'error', message: err.message });
    }
  }

  return {
    success: true,
    message: `处理 ${results.length} 个文件`,
    results,
  };
};

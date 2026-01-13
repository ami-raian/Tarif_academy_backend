// Quick test script to verify Bunny.net works
const axios = require('axios');

const BUNNY_API_KEY = 'a38eb2ea-35dd-4973-8d658be43f01-d705-4b83';
const BUNNY_LIBRARY_ID = '579754';

async function testBunny() {
  try {
    console.log('\n🧪 Testing Bunny.net API...\n');

    const response = await axios.post(
      `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos`,
      {
        title: 'Test Video from Node.js',
      },
      {
        headers: {
          'AccessKey': BUNNY_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ SUCCESS! Video created:');
    console.log('   Video ID:', response.data.guid);
    console.log('   Video Library ID:', response.data.videoLibraryId);
    console.log('   Title:', response.data.title);
    console.log('\n🎉 Your Bunny.net credentials are working!\n');

    // Clean up - delete test video
    try {
      await axios.delete(
        `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${response.data.guid}`,
        {
          headers: {
            'AccessKey': BUNNY_API_KEY,
          },
        }
      );
      console.log('🗑️  Test video deleted\n');
    } catch (err) {
      console.log('⚠️  Could not delete test video (you can delete it manually)\n');
    }

  } catch (error) {
    console.error('❌ FAILED:');
    console.error('   Status:', error.response?.status);
    console.error('   Error:', error.response?.data || error.message);
    console.log('\n');
  }
}

testBunny();

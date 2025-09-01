const cron = require('node-cron');
const Seller = require('../models/SellerModel'); // adjust path
const { getWeekLabel } = require('../utils/relatedFunc');


cron.schedule('0 0 * * 1', async () => {
  console.log('Weekly seller activity update started...');
  const weekLabel = getWeekLabel();

  try {
    const sellers = await Seller.find();
    for (const seller of sellers) {
      ['productActivity', 'reviewActivity'].forEach(field => {
        const exists = seller[field].some(w => w.week === weekLabel);
        if (!exists) {
          seller[field].push({ week: weekLabel, count: 0 });
          if (seller[field].length > 7) {
            seller[field] = seller[field].slice(-7);
          }
        }
      });
      await seller.save({validateBeforeSave : false});
    }
    console.log('Weekly seller activity update completed.');
  } catch (err) {
    console.error('Error in weekly seller activity update:', err);
  }
});

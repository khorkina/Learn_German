// Google AdSense Configuration
// Replace with your actual AdSense publisher ID
const ADSENSE_CONFIG = {
  enabled: false,
  publisherId: 'ca-pub-XXXXXXXXXXXXXXXX',
  adSlots: {
    header: {
      slot: 'XXXXXXXXXX',
      format: 'horizontal'
    },
    sidebar: {
      slot: 'XXXXXXXXXX',
      format: 'rectangle'
    },
    footer: {
      slot: 'XXXXXXXXXX',
      format: 'horizontal'
    }
  }
};

// To enable ads:
// 1. Set enabled to true
// 2. Replace publisherId with your AdSense publisher ID
// 3. Replace slot IDs with your actual ad unit IDs
// 4. Add ad placement divs to your HTML where desired
// 5. Include AdSense script in HTML: <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=YOUR_PUBLISHER_ID" crossorigin="anonymous"></script>

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ADSENSE_CONFIG;
}

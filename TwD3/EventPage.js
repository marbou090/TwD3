chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {

        var TwitterWindowCounter = 0;
        chrome.tabs.query({}, tabs => {
            for (let i = 0; i < tabs.length; i++) {
                if (tabs[i].url === 'https://tweetdeck.twitter.com/') {
                    TwitterWindowCounter += 1;
                }
            }

            if (TwitterWindowCounter > 1) {
                //設定参照
                chrome.storage.sync.get('deleteWindowEnabled', function(value) {
                    var deleteWindowEnabled = value.deleteWindowEnabled;
                    if (deleteWindowEnabled === true) {
                        //二窓検知時のタブ削除処理
                        chrome.tabs.query({ 'url': 'https://tweetdeck.twitter.com/' }, function(tab) {
                            for (let i = 1; i < TwitterWindowCounter; i++) {
                                chrome.tabs.remove(tab[i].id);
                            }
                            chrome.tabs.update(tab[0].id, { active: true });
                        });
                    }
                });
                //通知
                const options = {
                    iconUrl: 'icon.png',
                    type: 'list',
                    title: "TwD3",
                    message: '',
                    priority: 1,
                    items: [{
                        title: 'detected',
                        message: chrome.i18n.getMessage('MultipleTweetDeckWindow')
                    }]
                };
                let notificationId = "notification";
                chrome.notifications.create(notificationId, options);
            }
        });
        sendResponse({ returnValue: true });
    }
);
//通知クリック時
chrome.notifications.onClicked.addListener(
    function(notificationId) {
        chrome.tabs.query({}, tabs => {
            //最初に開かれているTweetDeckウィンドウへ移動
            chrome.tabs.query({ "url": "https://tweetdeck.twitter.com/" }, function(tab) {
                if (tab.length > 0) chrome.tabs.update(tab[0].id, { active: true });
            });
        });
    }
)
document.getElementById('scrape').addEventListener('click', async function() {
    let tabs = await chrome.tabs.query({active: true, currentWindow: true});
    try {
        let result = await chrome.scripting.executeScript({
            target: {tabId: tabs[0].id},
            function: scrapeYoutube
        });

        if (result[0].result.error) {
            console.log(result[0].result);
            console.log(result[0].result.error);
            alert('An error occurred: ' + result[0].result.error);
        } else {
            chrome.runtime.sendMessage({type: 'saveData', data: result[0].result});
        }
    } catch (err) {
        console.log(err);
        alert('An error occurred: ' + err.message);
    }
});

document.getElementById('analyze').addEventListener('click', function() {
    chrome.tabs.create({url: chrome.runtime.getURL('analyze.html')});
});

document.getElementById('delete').addEventListener('click', function() {
    deleteData();
});

async function scrapeYoutube() {
    try {
        if (window.location.hostname !== 'www.youtube.com') {
            return {error: 'Please make sure you are on YouTube\'s homepage'};
        }

        let data = [];
        let items = document.querySelectorAll('ytd-rich-item-renderer, ytd-video-renderer');

        if (!items.length) {
            return {error: 'No videos found to scrape'};
        }

        for(let item of items) {
            let titleElement = item.querySelector('#video-title');
            let publisherElement = item.querySelector('#text>a');
            let viewsElement = item.querySelector('#metadata-line span');

            let title = titleElement ? titleElement.textContent.trim() : null;
            let publisher = publisherElement ? publisherElement.textContent.trim() : null;
            let views = viewsElement ? viewsElement.textContent.trim().match(/(\d+\.?\d*)([MK]? views)?/)[0] : null;

            if (title && publisher && views) {
                let timestamp = new Date().toLocaleString('en-US', {timeZone: 'UTC', hour12: false});
                data.push({title, publisher, views, timestamp});
            }
        }

        if (!data.length) {
            return {error: 'No valid videos were found to scrape'};
        }

        console.log(data);
        return data;
    } catch (err) {
        console.log(err);
        return {error: 'An error occurred while scraping'};
    }
}

function deleteData() {
    chrome.storage.local.clear(function () {
        var error = chrome.runtime.lastError;
        if (error) {
            console.log(error);
        } else {
            console.log('Data deleted.');
        }
    });
}
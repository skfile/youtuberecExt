document.getElementById('scrape').addEventListener('click', async function() {
    let tabs = await chrome.tabs.query({active: true, currentWindow: true});
    try {
        let result = await chrome.scripting.executeScript({
            target: {tabId: tabs[0].id},
            function: scrapeYoutube
        });

        if (result[0].result.error) {
            console.log(result[0].result)
            console.log(result[0].result.error); // Log any errors
            alert('An error occurred: ' + result[0].result.error);
        } else {
            // Send message to background script to save data
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
function scrapeYoutube() {
    try {
        if (window.location.hostname !== 'www.youtube.com') {
            return {error: 'Please make sure you are on YouTube\'s homepage'};
        }

        let data = [];
        let items = document.querySelectorAll('#details');
        if (!items.length) {
            return {error: 'No videos found to scrape'};
        }

        for(let item of items) {
            let titleElement = item.querySelector('#video-title');
            let publisherElement = item.querySelector('#avatar-link');
            let viewsElement = item.querySelector('ytd-video-meta-block');
            // let linkElement = item.querySelector('#video-title-link');

            let title = titleElement ? titleElement.textContent : null;
            let publisher = publisherElement ? publisherElement.getAttribute('title') : null;
            let views = viewsElement ? viewsElement.textContent.match(/(\d+\.?\d*)([MK]? views)?/)[0] : null;
            // let link = linkElement ? linkElement.getAttribute('href') : null;

            // if (title && publisher && views && link) {
            //     let timestamp = new Date().toLocaleString('en-US', {timeZone: 'UTC', hour12: false});
            //     data.push({title, publisher, views, link, timestamp});
            // }
            if (title && publisher && views) {
                let timestamp = new Date().toLocaleString('en-US', {timeZone: 'UTC', hour12: false});
                data.push({title, publisher, views, timestamp});
            }
        }

        console.log(data); // This will log scraped data to the console
        return data;
    } catch (err) {
        console.log(err); 
        return {error: 'An error occurred while scraping'};
    }
}
function deleteData() {
    chrome.storage.local.clear(function () {
        console.log('Data deleted.');
    });
}

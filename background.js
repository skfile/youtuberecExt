chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'saveData') {
        let dateKey = new Date().toLocaleString('en-US', {timeZone: 'UTC', hour12: false}); // Use the date/time as the key
        chrome.storage.local.set({[dateKey]: request.data}, () => {
            console.log('Data saved', request.data); // Log the saved data
        });
    }
});
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (request.type === 'saveData') {
//         let dateKey = new Date().toISOString().split('T')[0]; // Use the date as the key
//         chrome.storage.local.set({[dateKey]: request.data}, () => {
//             console.log('Data saved', request.data); // Log the saved data
//         });
//     }
// });
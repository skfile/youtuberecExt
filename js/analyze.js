chrome.storage.local.get(null, function(result) {
    let currentDate = new Date().toLocaleDateString();
    let currentTime = new Date().toLocaleTimeString();
    console.log(`Data retrieved on ${currentDate} at ${currentTime}:`, result);
    let scrapedDataDiv = document.getElementById('scrapedData');
    
    let wordCounts = [];
    let publisherCounts = [];
    let viewCounts = [];

    for(let dateKey in result) {
        if (result.hasOwnProperty(dateKey)) {
            let data = result[dateKey];
            
            wordCounts.push({
                date: dateKey,
                value: getWordCounts(data)
            });
            
            publisherCounts.push({
                date: dateKey,
                value: getPublisherCounts(data)
            });
            
            viewCounts.push({
                date: dateKey,
                values: getViewCounts(data)
            });

            let h3 = document.createElement('h3');
            h3.textContent = `Data for ${dateKey}`;
            scrapedDataDiv.appendChild(h3);
            
            for(let entry of data) {
                let p = document.createElement('p');
                p.textContent = `Title: ${entry.title}, Publisher: ${entry.publisher}, Views: ${entry.views}`;
                scrapedDataDiv.appendChild(p);
            }
        }
    }
    
    createBarChart(wordCounts, 'Word Counts over time', '#wordCountChart');
    createBarChart(publisherCounts, 'Publisher Counts over time', '#publisherCountChart');
    createMultiBarChart(viewCounts, 'View Counts over time', '#viewCountChart');
    // createStackedBarChart(multiWordCounts, 'Word Counts over time', '#wordCountChart');
    // createStackedBarChart(multiPublisherCounts, 'Publisher Counts over time', '#publisherCountChart');
    // createStackedBarChart(multiViewCounts, 'View Counts over time', '#viewCountChart');

});

function getPublisherCounts(data) {
    let publisherCounts = {};
    for (let entry of data) {
        let publisher = entry.publisher.toLowerCase();
        if (publisher in publisherCounts) {
            publisherCounts[publisher]++;
        } else {
            publisherCounts[publisher] = 1;
        }
    }
    return Object.keys(publisherCounts).length;
}

function getViewCounts(data) {
    let viewCounts = [];
    for (let entry of data) {
        let views = parseInt(entry.views.replace(/\D/g,'')) || 0;
        viewCounts.push(views);
    }
    return viewCounts;
}

function getWordCounts(data) {
    let wordCounts = {};
    let stopwords = ["the", "is", "and", "or", "it", "this", "that", "for", "on", "with", "as", "was", "are", "to", "of", "in", "a", "an", "by", "i", "you", "we", "they", "he", "she", "be", "will", "has", "have", "do", "at", "from", "not", "my", "your", "his", "her", "our", "their"];
    for (let entry of data) {
        let words = entry.title.split(/\s+/);
        for (let word of words) {
            word = word.toLowerCase();
            if (stopwords.includes(word)) {
                continue;
            }
            if (word in wordCounts) {
                wordCounts[word]++;
            } else {
                wordCounts[word] = 1;
            }
        }
    }
    return Object.keys(wordCounts).length;
}
function createBarChart(data, chartTitle, chartId) {
    let margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    let x = d3.scaleBand().range([0, width]).padding(0.1);
    let y = d3.scaleLinear().range([height, 0]);

    let svg = d3.select(chartId).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.domain(data.map(function(d) { return d.date; }));
    y.domain([0, d3.max(data, function(d) { return +d.value; })]);

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));
        
    svg.append("g")
        .call(d3.axisLeft(y));

    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.date); })
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return y(+d.value); })
        .attr("height", function(d) { return height - y(+d.value); })
        .attr("fill", "steelblue");  // specifying color for the bars
}

function createMultiBarChart(data, chartTitle, chartId) {
    let margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    let x = d3.scaleBand().range([0, width]).padding(0.1);
    let y = d3.scaleLinear().range([height, 0]);

    let svg = d3.select(chartId).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let newData = data.map(function(d) {
        return {
            date: d.date,
            value: d3.sum(d.values)
        };
    });

    x.domain(newData.map(function(d) { return d.date; }));
    y.domain([0, d3.max(newData, function(d) { return +d.value; })]);

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));
        
    svg.append("g")
        .call(d3.axisLeft(y));

    svg.selectAll(".bar")
        .data(newData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.date); })
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return y(+d.value); })
        .attr("height", function(d) { return height - y(+d.value); })
        .attr("fill", "steelblue");  // specifying color for the bars
}
function createStackedBarChart(data, chartTitle, chartId) {
    let margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    let x = d3.scaleBand()
        .range([0, width])
        .padding(0.1);

    let y = d3.scaleLinear()
        .range([height, 0]);

    let color = d3.scaleOrdinal(d3.schemeCategory10);

    let svg = d3.select(chartId).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let keys = Array.from(new Set(data.flatMap(d => Object.keys(d.values))));

    let stack = d3.stack()
        .keys(keys)
        .value((d, key) => d.values[key] || 0);

    let series = stack(data);

    x.domain(data.map(d => d.date));
    y.domain([0, d3.max(series, a => d3.max(a, d => d[1]))]).nice();

    svg.append("g")
        .selectAll("g")
        .data(series)
        .enter().append("g")
            .attr("fill", d => color(d.key))
        .selectAll("rect")
        .data(d => d)
        .enter().append("rect")
            .attr("x", (d, i) => x(d.data.date))
            .attr("y", d => y(d[1]))
            .attr("height", d => y(d[0]) - y(d[1]))
            .attr("width", x.bandwidth());

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y));
}

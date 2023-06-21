// Fetch data from storage
chrome.storage.local.get(null, function (items) {
    let videos = [];
    for (let key in items) {
        videos.push(items[key]);
    }

    // Create line chart for views over time
    let viewsOverTimeData = videos.map(video => {
        if (!video || !video.views || !video.timestamp) return null;
        let views = video.views;
        if (typeof views === 'string') {
            views = parseInt(views.replace(/\D/g,'')); // Remove non-numeric characters
        } else {
            views = 0; // default value if views is undefined or not a string
        }
        return {
            date: new Date(video.timestamp),
            value: views
        };
    }).filter(item => item); // Filter out null values

    createLineChart(viewsOverTimeData, "lineChart", "Views Over Time", "Date", "Views");

    // Create word frequency bar chart
    let wordFrequencyData = countWordsInTitles(videos);
    createBarChart(wordFrequencyData, "barChart", "Word Frequency", "Word", "Frequency");

    // Create publisher recommendation bar chart
    let publisherData = countPublishers(videos);
    createBarChart(publisherData, "publisherChart", "Publisher Recommendations", "Publisher", "Count");
});

// Function to count frequency of words in titles
function countWordsInTitles(videos) {
    let wordCount = {};
    videos.forEach(video => {
        if (!video || !video.title) return;
        let title = video.title;
        if (typeof title === 'string') {
            title = title.replace(/[^a-zA-Z0-9\s.,!?]/g, ''); // Remove non-alphanumeric characters
            let titleWords = title.split(' ');
            titleWords.forEach(word => {
                wordCount[word] = (wordCount[word] || 0) + 1;
            });
        }
    });
    return Object.entries(wordCount).map(([word, count]) => ({name: word, value: count}));
}

// Function to count frequency of video recommendations by publishers
function countPublishers(videos) {
    let publisherCount = {};
    videos.forEach(video => {
        if (!video || !video.publisher) return;
        let publisher = video.publisher;
        if (typeof publisher === 'string') {
            publisher = publisher.replace(/[^a-zA-Z0-9\s.,!?]/g, ''); // Remove non-alphanumeric characters
            publisherCount[publisher] = (publisherCount[publisher] || 0) + 1;
        }
    });
    return Object.entries(publisherCount).map(([publisher, count]) => ({name: publisher, value: count}));
}
// Function to create a line chart
function createLineChart(data, divId, chartTitle, xLabel, yLabel) {
    // Select the div container
    const svg = d3.select(`#${divId}`).append("svg");

    // Set the dimensions
    const margin = {top: 10, right: 30, bottom: 30, left: 60},
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // Append the svg object to the body of the page
    svg.append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Add X axis
    const x = d3.scaleTime().domain(d3.extent(data, function (d) { return d.date; })).range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Add Y axis
    const y = d3.scaleLinear().domain([0, d3.max(data, function (d) { return +d.value; })]).range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add the line
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(function (d) { return x(d.date); })
            .y(function (d) { return y(d.value); })
        );

    // Add chart title
    svg.append("text")
       .attr("x", (width / 2))             
       .attr("y", 0 - (margin.top / 2))
       .attr("text-anchor", "middle")  
       .style("font-size", "16px") 
       .style("text-decoration", "underline")  
       .text(chartTitle);

    // Label x-axis
    svg.append("text")             
      .attr("transform", "translate(" + (width/2) + " ," + (height + margin.top + 20) + ")")
      .style("text-anchor", "middle")
      .text(xLabel);

    // Label y-axis
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text(yLabel);
}

// Function to create a bar chart
function createBarChart(data, divId, chartTitle, xLabel, yLabel) {
    // Select the div container
    const svg = d3.select(`#${divId}`).append("svg");

    // Set the dimensions
    const margin = {top: 10, right: 30, bottom: 30, left: 60},
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // Append the svg object to the body of the page
    svg.append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Add X axis
    const x = d3.scaleBand().range([0, width]).domain(data.map(function (d) { return d.name; })).padding(0.2);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    // Add Y axis
    const y = d3.scaleLinear().domain([0, d3.max(data, function (d) { return d.value; })]).range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add bars
    svg.selectAll("mybar")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", function (d) { return x(d.name); })
        .attr("width", x.bandwidth())
        .attr("fill", "#69b3a2")
        .attr("height", function (d) { return height - y(0); }) // always equal to 0
        .attr("y", function (d) { return y(0); }) // always equal to height
        .transition()
        .duration(800)
        .attr("y", function (d) { return y(d.value); })
        .attr("height", function (d) { return height - y(d.value); })
        .delay(function (d,i){return(i*100)})

    // Add chart title
    svg.append("text")
       .attr("x", (width / 2))             
       .attr("y", 0 - (margin.top / 2))
       .attr("text-anchor", "middle")  
       .style("font-size", "16px") 
       .style("text-decoration", "underline")  
       .text(chartTitle);

    // Label x-axis
    svg.append("text")             
      .attr("transform", "translate(" + (width/2) + " ," + (height + margin.top + 20) + ")")
      .style("text-anchor", "middle")
      .text(xLabel);

    // Label y-axis
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text(yLabel);
}

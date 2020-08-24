// Function to display the default page
function init() {
    // Access json data
    d3.json("./samples.json").then(function(data) {
    
    // Define and assign needed variables
    var otuIDs = data.samples[0].otu_ids.slice(0,10);
    otuIDsStrings = otuIDs.map(String);
    for(var i=0;i<otuIDsStrings.length;i++){
        otuIDsStrings[i]="OTU " + otuIDsStrings[i];
    }

    var sampleValues = data.samples[0].sample_values.slice(0,10);
    var otuLabels = data.samples[0].otu_labels.slice(0,10);

    // Create trace for bar
    var trace = {
        x: sampleValues,
        y: otuIDsStrings,
        type: "bar", 
        orientation: 'h',
        text: otuLabels
    };
    // Create trace for bubble
    var trace1 = {
        x: otuIDsStrings,
        y: sampleValues,
        mode: 'markers',
        text: otuLabels,
        marker: {
            color: otuIDs,
            size: sampleValues,
            opacity: [0.6, 0.7, 0.8, 0.9]
        }
    };
  
    // Create the data arrays for plots
    var dataArray = [trace];
    var dataArray1 = [trace1];

    // Define plot layouts
    var layout = {
      yaxis:{ autorange:'reversed' }
    };

    var layout1 = {
        xaxis:{ title:'OTU ID' }
    };
  
    // Plot the chart to a div tag with corresponding id
    Plotly.newPlot("bar", dataArray, layout);
    Plotly.newPlot("bubble", dataArray1, layout1);

    // Define variables for demographic data
    var demoData = data.metadata[0];
    var demoDataList = [];

    // Iterate through each key and value and push to array as string
    Object.entries(demoData).forEach(([key, value]) => {
        demoDataList.push(key + ": " + value.toString());
    });

    // Add demo data to html
    d3.select("#sample-metadata")
    .selectAll("h5")
    .data(demoDataList)
    .enter()
    .append("h5")
    .html(function(d) {
        return d;
    });

    var dropDownOptions = data.names;
    
    // Add drop down options to html
    d3.select("#selDataset")
    .selectAll("option")
    .data(dropDownOptions)
    .enter()
    .append("option")
    .html(function(d) {
        return d;
    });

    // BONUS
    var bonusData = [
        {
            domain: { x: [0, 1], y: [0, 1] },
            value: demoData.wfreq,
            title: { text: "Belly Button Washing Frequency<br>Scrubs Per Week" },
            type: "indicator",
            mode: "gauge+number",
            gauge: {
                axis: { range: [null, 9] }
            }
        }
    ];

    var bonuysLayout = { width: 600, height: 500, margin: { t: 0, b: 0 } };
    Plotly.newPlot('gauge', bonusData);
});
}

// Initiate the default page
init();

// On change to the DOM, call getData()
d3.selectAll("#selDataset").on("change", optionChanged);

// Function called by DOM changes
function optionChanged() {
 d3.json("./samples.json").then(function(data) {

  var dropdownMenu = d3.select("#selDataset");

  // Assign the value of the dropdown menu option to a variable
  var dataset = dropdownMenu.property("value");
  var otuID;
  var otuIDsString;
  var values;
  var otuLabel;
  var demoMeta;
  var demoMetaList = [];
  var washFreq;

  // Loop through json metadata list and find corresponding sample
  for (var k = 0; k < data.metadata.length; k++) {
    demoMeta = data.metadata[k];
    if (data.metadata[k].id.toString() === dataset) { 
      // Iterate through each key and value, convert object to string array
      Object.entries(demoMeta).forEach(([key, value]) => {
          demoMetaList.push(key + ": " + value.toString());
      });
      
      // Clear and then update demo htmal data
      d3.select("#sample-metadata")
      .selectAll("h5")
      .data(demoMetaList)
      .remove()
      .enter()
      .append("h5")
      .html(function(d) {
         return d;
      });
      washFreq = demoMeta.wfreq;
      break;
    }
  }

  // Loop through json sample list and find corresponding sample
  for (var i = 0; i < data.samples.length; i++) {
      if (data.samples[i].id === dataset) {
        otuID = data.samples[i].otu_ids.slice(0,10);
        otuIDsString = otuID.map(String);

        for(var j = 0; j < otuIDsString.length; j++){
            otuIDsString[j]="OTU " + otuIDsString[j];
        }

        values = data.samples[i].sample_values.slice(0,10);
        otuLabel = data.samples[i].otu_labels.slice(0,10);

        // Call function to update the chart
        updatePlotly(otuID, otuIDsString, values, otuLabel, washFreq);
        break;
      }
  }
});
}

// function to update the restyled plot's values
function updatePlotly(otu, otustring, value, label, freq) {
    Plotly.restyle("bar", "x", [value]);
    Plotly.restyle("bar", "y", [otustring]);
    Plotly.restyle("bar", "text", [label]);
    Plotly.restyle("bubble", "x", [otustring]);
    Plotly.restyle("bubble", "y", [value]);
    Plotly.restyle("bubble", "text", [label]);
    Plotly.restyle("bubble", "marker.color", [otu]);
    Plotly.restyle("gauge", "value", [freq]);
}
 
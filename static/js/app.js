 /****************************************
  *   Initialize the visualizations
  ****************************************/
 d3.json('/samples').then(data => {  
    // Grab a reference to the dropdown select element
    var selector = d3.select('#selDataset');

    var sampleNames = data['names'];

    sampleNames.sort((a,b) => (a-b));
  
    sampleNames.forEach(sample => {
      selector
        .append('option')
        .property('value', sample)
        .text(sample);        
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];

    buildCharts(firstSample);
    buildMetadata(firstSample);
    });

/****************************************
  *   buildCharts() function
  ****************************************/
function buildCharts(sample) {
  d3.json('/samples').then(data => {
    var samples = data['samples'];
    var resultArray = samples['filter'](sampleObj => sampleObj['id'] == sample);
    var result = resultArray[0];

    var otu_ids = result['otu_ids'];
    var otu_labels = result['otu_labels'];
    var sample_values = result['sample_values'];

    /***********
    // Build the Bubble Chart
    *******/
    var bubbleLayout = {
      title: 'Bacteria Cultures Per Sample',
      xaxis: { title: 'OTU ID' }
    };
    
    var bubbleData = [
      {
        x: otu_ids,
        y: sample_values,
        text: otu_labels,
        mode: 'markers',
        marker: {
          size: sample_values,
          color: otu_ids,
          colorscale: 'Earth'
        }
      }
    ];

    Plotly.newPlot('bubble', bubbleData, bubbleLayout);

    /***********
    // Build the Bar Chart
    *******/
    
    /* 20210130 DDW: We should build a sort operation here  
      Also consider reengineering the objects into array of objects
    */
    
    var yticks = otu_ids.slice(0, 10).map(otuID => `OTU ${otuID}`);

    var barData = [
      {
        x: sample_values.slice(0, 10).reverse(),
        y: yticks.reverse(),
        customdata: otu_labels.slice(0, 10).reverse(),
        text: sample_values.slice(0, 10).reverse(),
        textposition: 'auto',
        hovertemplate: '%{customdata}<extra></extra>',
        type: 'bar',
        orientation: 'h',
        marker: {color: 'royalblue'}
      }
    ];

    var barLayout = {
      title: 'Top 10 Bacteria Cultures Found',
      xaxis: {'title': 'Sample Values'},
    };

    Plotly.newPlot('bar', barData, barLayout);
    
  });
} // end of buildCharts function

/****************************************
  *   buildMetadata() function
  ****************************************/
function buildMetadata(sample) {
  d3.json('/samples').then((data) => {
    var metadata = data['metadata'];

    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj['id'] == sample);
    var result = resultArray[0];
    
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select('#sample-metadata');

    // Use `.html('') to clear any existing metadata
    PANEL.html('');

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append('h6').text(`${key.toUpperCase()}: ${value}`);
    });

    // Build the Gauge Chart
    wash_frequency = result.wfreq;
    buildGauge(wash_frequency);
    // buildGaugeAdvanced(wash_frequency);
  });
} // end of buildMetadata function

/****************************************
  *   buildGauge() function
  ****************************************/
function buildGauge(wash_frequency) {

  /* need to make this responsive */
  var data = [
    {
      type: "indicator",
      mode: "gauge+number",
      value: wash_frequency,
      title: { text: "Weekly Wash Frequency", font: { size: 16 } },
      gauge: {
        axis: { range: [null, 9], tickwidth: 1 },
        bar: { color: "royalblue" },
        bgcolor: "white",
        borderwidth: 2,
        bordercolor: "gray",
        steps: [
          { range: [0, 9], color: "lavender" },
        ]
      }
    }
  ];
  
  var layout = {
    margin: { t: 25, r: 25, l: 25, b: 25 },
    font: { size: 12 }
  };
  
  var GAUGE = d3.select('#gauge').node();
  Plotly.newPlot(GAUGE, data, layout);

} // end of buildGauge function

/****************************************
  *   buildGaugeAdvanced() function
  *   This used to be an example on d3js.org 
  *   but it was taken down
  ****************************************/
function buildGaugeAdvanced(wfreq) {
  // Enter the washing frequency between 0 and 180
  var level = parseFloat(wfreq) * 20;

  // Trig to calc meter point
  var degrees = 180 - level;
  var radius = 0.5;
  var radians = (degrees * Math.PI) / 180;
  var x = radius * Math.cos(radians);
  var y = radius * Math.sin(radians);

  // Path: may have to change to create a better triangle
  var mainPath = "M -.0 -0.05 L .0 0.05 L ";
  var pathX = String(x);
  var space = " ";
  var pathY = String(y);
  var pathEnd = " Z";
  var path = mainPath.concat(pathX, space, pathY, pathEnd);

  var data = [
    {
      type: "scatter",
      x: [0],
      y: [0],
      marker: { size: 12, color: "850000" },
      showlegend: false,
      name: "Freq",
      text: level,
      hoverinfo: "text+name"
    },
    {
      values: [50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50],
      rotation: 90,
      text: ["8-9", "7-8", "6-7", "5-6", "4-5", "3-4", "2-3", "1-2", "0-1", ""],
      textinfo: "text",
      textposition: "inside",
      marker: {
        colors: [
          "rgba(0, 105, 11, .5)",
          "rgba(10, 120, 22, .5)",
          "rgba(14, 127, 0, .5)",
          "rgba(110, 154, 22, .5)",
          "rgba(170, 202, 42, .5)",
          "rgba(202, 209, 95, .5)",
          "rgba(210, 206, 145, .5)",
          "rgba(232, 226, 202, .5)",
          "rgba(240, 230, 215, .5)",
          "rgba(255, 255, 255, 0)"
        ]
      },
      labels: ["8-9", "7-8", "6-7", "5-6", "4-5", "3-4", "2-3", "1-2", "0-1", ""],
      hoverinfo: "label",
      hole: 0.5,
      type: "pie",
      showlegend: false
    }
  ];

  var layout = {
    shapes: [
      {
        type: "path",
        path: path,
        fillcolor: "850000",
        line: {
          color: "850000"
        }
      }
    ],
    title: "<b>Belly Button Washing Frequency</b> <br> Scrubs per Week",
    height: 500,
    width: 500,
    xaxis: {
      zeroline: false,
      showticklabels: false,
      showgrid: false,
      range: [-1, 1]
    },
    yaxis: {
      zeroline: false,
      showticklabels: false,
      showgrid: false,
      range: [-1, 1]
    }
  };

  var GAUGE = document.getElementById("gauge");
  Plotly.newPlot(GAUGE, data, layout);
}

/****************************************
  *   optionChanged() function
  ****************************************/
 function optionChanged() {

  selector = d3.event.target;
  newSample = selector['value'];

  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
} // end of optionChanged function


/****************************************
  *   Add event listener to the drop down
 ****************************************/
var selector = d3.select('#selDataset');
selector.on('change', optionChanged)
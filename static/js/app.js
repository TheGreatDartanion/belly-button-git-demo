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
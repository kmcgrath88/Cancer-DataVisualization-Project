// Creating empty canvases for chart.js graphs
var bar = document.getElementById('bar').getContext('2d');
var barGraph = new Chart(bar, {});

var doughnut = document.getElementById("doughnut");
var doughnutChart = new Chart(doughnut, {});

var radar = document.getElementById('radar').getContext('2d');
var radarChart = new Chart(radar, {});

var polar = document.getElementById("polar");
var polarChart = new Chart(polar, {});

// Create a map object
var myMap = L.map("map", {
  center: [37.09, -95.71],
  zoom: 4
});

// Add a tile layer
L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/light-v10",
  accessToken: API_KEY
}).addTo(myMap);

// Initializing dashboard
function init() {
  // Running function on North Carolina to create initial dashboard.
  updateDash('North Carolina');
};

// Creating function to update the dashboard when a state is clicked on the map
function updateDash(state) {

  // Retrieving data from mongodb through python, flask, and the app.py file
  d3.request("http://127.0.0.1:5000/cancer_dash/").get(incomingData => {
    var incomingData = JSON.parse(incomingData.response);

    d3.request("http://127.0.0.1:5000/cancer_mortality").get(incomingMortalityData => {
      var mortalityData = JSON.parse(incomingMortalityData.response);
      console.log(mortalityData);

      // Storing all cancer data to a variable
      var allData = incomingData.features;
      console.log(allData);

      // Filtering data by state
      // console.log(incomingData)
      var state1 = allData.filter(value =>
        value.properties.NAME == state);
      console.log(state1);

      // Retrieving filtered state properties where all cancer data is contained
      var stateValues = state1[0].properties;
      console.log(stateValues);

      // Finding state entry and creating list of arrays
      var stateEntry = Object.entries(stateValues);
      console.log(stateEntry);

      // Getting mortality entry for state
      var stateMortality = mortalityData.filter(value =>
        value.State == state);
      console.log(stateMortality[0]);
      console.log(stateMortality[0].breast);
      var stateMortalityValue = stateMortality[0];
      console.log(stateMortalityValue);

      // Slicing and sorting cancers from greatest to least
      var allCancers = Object.entries(stateValues).slice(6, 24).sort((a, b) => b[1] - a[1]);
      console.log(allCancers);

      // Slicing top 5 cancers from all cancers
      var top5 = allCancers.slice(0, 5);
      console.log(top5);

      // Creating empty lists to store labels/values for graphs
      var top5Labels = [];
      var top5Values = [];
      var allCancerLabels = [];
      var allCancerValues = [];
      var test = []

      // Looping through top 5 cancers and adding labels and values to appropriate lists
      for (i = 0; i < top5.length; i++) {
        top5Labels[i] = top5[i][0].charAt(0).toUpperCase() + top5[i][0].slice(1)
        // var nf = Intl.NumberFormat()
        // top5Values[i] = nf.format(top5[i][1])
        // console.log(top5Values)
        top5Values[i] = top5[i][1]
      };

      // Looping through all cancers and adding labels and values to appropriate lists
      for (i = 0; i < allCancers.length; i++) {
        allCancerLabels[i] = allCancers[i][0].charAt(0).toUpperCase() + allCancers[i][0].slice(1)
        allCancerValues[i] = allCancers[i][1]
      };

      console.log(top5Labels);
      console.log(top5Values);
      console.log(allCancerLabels);
      console.log(allCancerValues);

      // Get mortality values that match the top5incidence labels
      var top5MortalityValues = [];
      for (i = 0; i < top5Labels.length; i++) {
        var cancerSelect = top5Labels[i].toLowerCase()
        console.log(cancerSelect);
        top5MortalityValues.push(stateMortalityValue[cancerSelect]);
      };
      console.log(top5MortalityValues);

      // Get mortality values that match allcancer labels
      var allMortalityValues = [];
      for (i = 0; i < allCancerLabels.length; i++) {
        var allCancerSelect = allCancerLabels[i].toLowerCase()
        allMortalityValues.push(stateMortalityValue[allCancerSelect]);
      }
      console.log(allMortalityValues);

      // Bar graph for top 5 cancers through Chart.js
      // Destroy empty graph first
      barGraph.destroy();
      barGraph = new Chart(bar, {
        // The type of chart we want to create
        type: 'bar',
        // The data for our dataset
        data: {
          labels: top5Labels,
          datasets: [{
            label: 'Number of Cases',
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            data: top5Values
          }],
        },
        // Formatting xAxes, yAxes, title, legend, and layout
        options: {
          scales: {
            xAxes: [{
              scaleLabel: {
                display: true,
                labelString: 'Cancer Type',
                fontStyle: 'bold',
                padding: 10
              }
            }],
            yAxes: [{
              scaleLabel: {
                display: true,
                labelString: 'Number of Cases',
                fontStyle: 'bold',
                padding: 10
              },
              ticks: {
                min: 0,
                maxTicksLimit: 7,
              }
            }]

          },
          title: {
            display: true,
            text: `Top 5 Cancer Incidences In ${state1[0].properties.NAME}`,
            fontSize: 14,
            fontStyle: "bold",
            padding: 20
          },
          legend: {
            display: false,
          },
          layout: {
            padding: {
              left: 0,
              right: 0,
              top: 0,
              bottom: 20
            }
          }
        }
      }
      );

      // Doughnut graph for all cancers through Chart.js
      doughnutChart.destroy();
      doughnutChart = new Chart(doughnut, {
        type: "doughnut",
        data: {
          labels: allCancerLabels,
          datasets: [
            {
              data: allCancerValues,
              borderWidth: 1,
            }
          ],
        },
        // Formatting colorscheme, title, legend, and layout
        options: {
          plugins: {
            colorschemes: {
              scheme: 'tableau.HueCircle19',
            }
          },
          responsive: true,
          title: {
            display: true,
            text: `Cancer Incidence In ${state1[0].properties.NAME}`,
            fontSize: 14,
            fontStyle: "bold",
            padding: 20
          },
          legend: {
            display: true,
            position: 'right',
          },
          cutoutPercentage: 40,
          layout: {
            padding: {
              left: 0,
              right: 0,
              top: 0,
              bottom: 20
            }
          }
        }
      });

      //Radar Chart for state incidence vs mortality for top 5 cancers through Chart.js
      radarChart.destroy();
      radarChart = new Chart(radar, {
        type: 'radar',
        data: {
          labels: top5Labels,
          datasets: [{
            label: state1[0].properties.NAME + " Incidence",
            fill: true,
            backgroundColor: 'rgb(255, 99, 132, 0.2)',
            borderColor: 'rgb(255, 99, 132)',
            pointBackgroundColor: 'rgb(255, 99, 132)',
            pointBorderColor: "#fff",
            data: top5Values
          },
          {
            label: state1[0].properties.NAME + " Mortality",
            backgroundColor: 'rgb(54,162,235, 0.2)',
            borderColor: 'rgb(54,162,235)',
            pointBackgroundColor: 'rgb(54,162,235)',
            pointBorderColor: "#fff",
            data: top5MortalityValues
          }]
        },
        // Formatting title and layout
        options: {
          title: {
            display: true,
            text: `Incidence Vs Mortality In ${state1[0].properties.NAME}`,
            fontSize: 14,
            fontStyle: "bold",
            padding: 20
          },
          layout: {
            padding: {
              left: 0,
              right: 0,
              top: 0,
              bottom: 20
            }
          }
        }
      });

      // Polar area chart for top 5 cancers per state through Chart.js
      polarChart.destroy()
      polarChart = new Chart(polar, {
        type: 'polarArea',
        data: {
          labels: top5Labels,
          datasets: [
            {
              backgroundColor: ["rgb(62,149,205, .7)", "rgb(142,94,162, .7)", "rgb(60,186,159, .7)", "rgb(232,195,185, .7)", "rgb(196,88,80, .7)"],
              data: top5Values
            }
          ]
        },
        // Formatting title and layout
        options: {
          title: {
            display: true,
            text: `Top 5 Cancer Incidences In ${state1[0].properties.NAME}`,
            fontSize: 14,
            fontStyle: "bold",
            padding: 20
          },
          layout: {
            padding: {
              left: 0,
              right: 0,
              top: 0,
              bottom: 20
            }
          },
          startAngle: -20
        }
      });

      // Bubble chart trace through plotly
      var bubbleTrace = [{
        x: allCancerValues,
        y: allMortalityValues,
        mode: "markers",
        marker: {
          size: allMortalityValues,
          sizeref: 50,
          color: allCancerValues,
          colorscale: 'Viridis',
        },
        text: allCancerLabels,
      }];

      // Bubble chart layout
      var bubbleLayout = {
        height: 600,
        title: `<b>Cancer Incidence Vs Mortality in ${state1[0].properties.NAME}</b>`,
        xaxis: { title: "<b>Cancer Incidence</b>" },
        yaxis: {
          title: "<b>Cancer Mortality</b>",
        },
      };

      // Creating bubble chart
      Plotly.newPlot("bubble", bubbleTrace, bubbleLayout);

    })
  })
};

// Function that will determine the color of a state based on cancer incidence
function chooseColor(val) {
  if (val < 10000) {
    return "#FFE400";
  }
  else if (val >= 10000 && val < 20000) {
    return "#FFB200";
  }
  else if (val >= 20000 && val < 30000) {
    return "#FF8000";
  }
  else if (val >= 30000 && val < 40000) {
    return "#FF6100";
  }
  else if (val >= 40000 && val < 60000) {
    return "#FF2A00";
  }
  else {
    return "red";
  }
};

// Grabbing our GeoJSON data
d3.request("http://127.0.0.1:5000/cancer_dash/").get(data => {
  var data = JSON.parse(data.response)
  // Creating a GeoJSON layer with the retrieved data
  L.geoJson(data, {
    // Creating style that will adjust color of state based on all_cancer incidence
    style: function (feature) {
      return {
        color: "black",
        fillColor: chooseColor(feature.properties.all_cancers),
        fillOpacity: 0.5,
        weight: 1.5
      };
    },
    // Called on each feature
    onEachFeature: function (feature, layer) {
      layer.on({
        // When a user's mouse touches a map feature, the mouseover event calls this function, that feature's opacity changes to 90% so that it stands out
        mouseover: function (event) {
          layer = event.target;
          layer.setStyle({
            fillOpacity: 0.9
          });
        },
        // When the cursor no longer hovers over a map feature - when the mouseout event occurs - the feature's opacity reverts back to 20%
        mouseout: function (event) {
          layer = event.target;
          layer.setStyle({
            fillOpacity: 0.5
          });
        },
        // When a feature (state) is clicked, it is enlarged to fit the screen
        click: function (event) {
          //myMap.fitBounds(event.target.getBounds());
          console.log(event.target.feature.properties.NAME)
          updateDash(event.target.feature.properties.NAME)
        }
      });
      layer.bindPopup("<h1>" + feature.properties.NAME + "</h1> <hr> <h3> Cancer Incidence: " + feature.properties.all_cancers.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") + "</h3>")
    }
  }).addTo(myMap);

  // Legend specific
  var legend = L.control({ position: "bottomright" });

  legend.onAdd = function (myMap) {
    var div = L.DomUtil.create("div", "legend");
    div.innerHTML += "<h4>Cancer Incidence</h4>";
    div.innerHTML += '<i style="background: #FFE400"></i> <10,000 <br>';
    div.innerHTML += '<i style="background: #FFB200"></i><span>10,000 - 20,000</span><br>';
    div.innerHTML += '<i style="background: #FF8000"></i><span>20,000 - 30,000</span><br>';
    div.innerHTML += '<i style="background: #FF6100"></i><span>30,000 - 40,000</span><br>';
    div.innerHTML += '<i style="background: #FF2A00"></i><span>40,000 - 60,000</span><br>';
    div.innerHTML += '<i style="background: red"></i> <span>>60,000</span><br>';

    return div;
  };

  legend.addTo(myMap);
});

// Initializing dashboard
init();
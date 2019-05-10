import React, { Component } from 'react';
import './App.css';
import { useTheme, create, percent, Circle, color } from "@amcharts/amcharts4/core";
import { MapChart, MapImageSeries, MapPolygonSeries, HeatLegend, ZoomControl, projections } from "@amcharts/amcharts4/maps";
import { XYChart, CategoryAxis, ColumnSeries, ValueAxis } from "@amcharts/amcharts4/charts";
import am4geodata_usaLow from "@amcharts/amcharts4-geodata/usaLow";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import Papa from 'papaparse';
import zipcodes from 'zipcodes';
import Bootstrap from 'bootstrap/dist/css/bootstrap.css';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';

import AL from "@amcharts/amcharts4-geodata/region/usa/alLow";
import AK from "@amcharts/amcharts4-geodata/region/usa/akLow";
import AR from "@amcharts/amcharts4-geodata/region/usa/arLow";
import AZ from "@amcharts/amcharts4-geodata/region/usa/azLow";
import CA from "@amcharts/amcharts4-geodata/region/usa/caLow";

import CO from "@amcharts/amcharts4-geodata/region/usa/coLow";
import CT from "@amcharts/amcharts4-geodata/region/usa/ctLow";
import DE from "@amcharts/amcharts4-geodata/region/usa/deLow";
import FL from "@amcharts/amcharts4-geodata/region/usa/flLow";

import GA from "@amcharts/amcharts4-geodata/region/usa/gaLow";
import HI from "@amcharts/amcharts4-geodata/region/usa/hiLow";
import ID from "@amcharts/amcharts4-geodata/region/usa/idLow";
import IL from "@amcharts/amcharts4-geodata/region/usa/ilLow";
import IN from "@amcharts/amcharts4-geodata/region/usa/inLow";

import IA from "@amcharts/amcharts4-geodata/region/usa/iaLow";
import KS from "@amcharts/amcharts4-geodata/region/usa/ksLow";
import KY from "@amcharts/amcharts4-geodata/region/usa/kyLow";
import LA from "@amcharts/amcharts4-geodata/region/usa/laLow";
import ME from "@amcharts/amcharts4-geodata/region/usa/meLow";

import MD from "@amcharts/amcharts4-geodata/region/usa/mdLow";
import MA from "@amcharts/amcharts4-geodata/region/usa/maLow";
import MI from "@amcharts/amcharts4-geodata/region/usa/miLow";
import MN from "@amcharts/amcharts4-geodata/region/usa/mnLow";
import MS from "@amcharts/amcharts4-geodata/region/usa/msLow";

import MO from "@amcharts/amcharts4-geodata/region/usa/moLow";
import MT from "@amcharts/amcharts4-geodata/region/usa/mtLow";
import NE from "@amcharts/amcharts4-geodata/region/usa/neLow";
import NV from "@amcharts/amcharts4-geodata/region/usa/nvLow";
import NH from "@amcharts/amcharts4-geodata/region/usa/nhLow";

import NJ from "@amcharts/amcharts4-geodata/region/usa/njLow";
import NM from "@amcharts/amcharts4-geodata/region/usa/nmLow";
import NY from "@amcharts/amcharts4-geodata/region/usa/nyLow";
import NC from "@amcharts/amcharts4-geodata/region/usa/ncLow";
import ND from "@amcharts/amcharts4-geodata/region/usa/ndLow";

import OH from "@amcharts/amcharts4-geodata/region/usa/ohLow";
import OK from "@amcharts/amcharts4-geodata/region/usa/okLow";
import OR from "@amcharts/amcharts4-geodata/region/usa/orLow";
import PA from "@amcharts/amcharts4-geodata/region/usa/paLow";
import RI from "@amcharts/amcharts4-geodata/region/usa/riLow";

import SC from "@amcharts/amcharts4-geodata/region/usa/scLow";
import SD from "@amcharts/amcharts4-geodata/region/usa/sdLow";
import TN from "@amcharts/amcharts4-geodata/region/usa/tnLow";
import TX from "@amcharts/amcharts4-geodata/region/usa/txLow";
import UT from "@amcharts/amcharts4-geodata/region/usa/utLow";

import VT from "@amcharts/amcharts4-geodata/region/usa/vtLow";
import VA from "@amcharts/amcharts4-geodata/region/usa/vaLow";
import WA from "@amcharts/amcharts4-geodata/region/usa/waLow";
import WV from "@amcharts/amcharts4-geodata/region/usa/wvLow";
import WI from "@amcharts/amcharts4-geodata/region/usa/wiLow";
import WY from "@amcharts/amcharts4-geodata/region/usa/wyLow";


var csv = require('./data.csv');
const dataObjects = [];
const statesMap = new Map();
let statesArray = [];
let schoolsArray = [];
const schoolsMap = new Map();
let sData = [];
var schoolToState = {};
var stateToIndex = {};
var numScholarships = 0;
var totalGrantAmount = 0;
let chart = null;
let chart2 = null;
let chart3 = null;

useTheme(am4themes_animated);
const initialState = {
  visible: false,
  data: null,
  university: "...",
  grantamt: "",
  state: "...",
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = initialState;
    this.renderMap = this.renderMap.bind(this);
    this.renderSchoolData = this.renderSchoolData.bind(this);
    this.loadData = this.loadData.bind(this);
    this.dataCallback = this.dataCallback.bind(this);
    this.renderStateChart = this.renderStateChart.bind(this);
    this.renderSchoolChart = this.renderSchoolChart.bind(this);
    this.renderGeneralStats = this.renderGeneralStats.bind(this);
    this.connecToServer = this.connecToServer.bind(this);
  }

  resetState = () => {
    statesArray = Array.from(new Set(statesArray));
    this.renderMap();
  }

  connecToServer() {
    fetch('/');
  }

  dataCallback = (results, file) => {
    let currSchool = results.data[0].Institution;
    let totalGrant = 0;
    let latitude = results.data[0].Latitude;
    let longitude = results.data[0].Longitude;
    let currState = zipcodes.lookup(results.data[0].PayeeZip).state;
    let yearByYearGrant = [];
    var count = 0;
    var i = 0;
    while (i < results.data.length) {
      //  @@@@@@@@@@@@@@
      schoolToState[currSchool] = currState.substring(3, 5);


      let grantAmount = results.data[i].GrantAmt.substring(1);
      grantAmount = grantAmount.replace(',', "");
      grantAmount = parseFloat(grantAmount);

      if (currSchool === results.data[i].Institution) {

        numScholarships++;
        // console.log("num sch " + numScholarships);
        totalGrantAmount+=grantAmount;

        let currLat = results.data[i].Latitude;
        if (currLat != null) {
          let lat = currLat.substring(0, currLat.length - 2);
          latitude = parseFloat(lat);
        }

        let currLong = results.data[i].Longitude;
        if (currLong != null) {
          let long = currLong.substring(0, currLong.length - 2);
          longitude = -1 * parseFloat(long);
        }

        let state = zipcodes.lookup(parseInt(results.data[i].PayeeZip));
        if (state === null) {
          currState = "";
        }
        else {
          if (state != null) {
            currState = "US-" + state.state;
          }
          else {
            let parseCity = results.data[i].PayeeCityStZip.split(',')[1].trim();
            parseCity = parseCity.split(' ')[0];
            currState = "US-" + parseCity;
          }
        }

        totalGrant += grantAmount;
        var exists = false;
        var j;
        var currYear = "20" + results.data[i].GrantDate.substring(results.data[i].GrantDate.length - 2);
        for (j = 0; j < yearByYearGrant.length; j++) {
          if (yearByYearGrant[j].year == currYear) {
            yearByYearGrant[j].total += 1;
            yearByYearGrant[j].grantAmount += grantAmount;
            exists = true;
          }
        }
        if (!exists) {
          var yearGrant = { year: currYear, total: 1, grantAmount: grantAmount };
          yearByYearGrant.push(yearGrant);
        }

        i++;
      }
      else {
        count++;
        dataObjects.push({
          "zoomLevel": 5,
          "scale": 0.5,
          "title": currSchool,
          "latitude": latitude,
          "longitude": longitude,
          "totalGrant": totalGrant,
          "state": currState,
          "yearlyList": yearByYearGrant,
        });
        currSchool = results.data[i].Institution;
        schoolsArray.push(currSchool);
        yearByYearGrant = [];
        totalGrant = 0;
      }
    }

    //  map the school to its state
    let index;
    for (index = 0; index < dataObjects.length; index++) {
      schoolsMap.set(dataObjects[index].title, dataObjects[index].totalGrant);
    }

    this.setState({ data: dataObjects }, (updatedState) => {
      this.renderMap();
      this.renderGeneralStats();
    });
  }

  loadData = () => {
    let config = {
      delimiter: ",",	// auto-detect
      newline: "",	// auto-detect
      header: true,
      dynamicTyping: true,
      complete: this.dataCallback,
      download: true,
      delimitersToGuess: [',', '\t', '|', ';', Papa.RECORD_SEP, Papa.UNIT_SEP]
    };
    Papa.parse(csv, config);
  }

  renderMap() {
    // Themes begin
    useTheme(am4themes_animated);
    // Themes end

    // Create map instance
    chart = create("chartdiv", MapChart);

    // Set map definition
    chart.geodata = am4geodata_usaLow;

    // Set projection
    chart.projection = new projections.AlbersUsa();

    chart.zoomControl = new ZoomControl();
    chart.zoomControl.align = "left";
    chart.zoomControl.height = 100;
    chart.centerMap = true;

    // Create map polygon series
    let polygonSeries = chart.series.push(new MapPolygonSeries());

    // Make map load polygon data (state shapes and names) from GeoJSON
    polygonSeries.useGeodata = true;

    // Set heatmap values for each state
    polygonSeries.data = [
      {
        id: "US-AL",
        value: 4447100,
        schools: [],
        stateMap: AL,
        full: "Alabama",
      },
      {
        id: "US-AK",
        value: 626932,
        schools: [],
        stateMap: AK,
        full: "Alaska",
      },
      {
        id: "US-AZ",
        value: 5130632,
        schools: [],
        stateMap: AZ,
        full: "Arizona",
      },
      {
        id: "US-AR",
        value: 2673400,
        schools: [],
        stateMap: AR,
        full: "Arkansas",
      },
      {
        id: "US-CA",
        value: 33871648,
        schools: [],
        stateMap: CA,
        full: "California",
      },
      {
        id: "US-CO",
        value: 4301261,
        schools: [],
        stateMap: CO,
        full: "Colorado",
      },
      {
        id: "US-CT",
        value: 3405565,
        schools: [],
        stateMap: CT,
        full: "Connecticut",
      },
      {
        id: "US-DE",
        value: 783600,
        schools: [],
        stateMap: DE,
        full: "Delaware",
      },
      {
        id: "US-FL",
        value: 15982378,
        schools: [],
        stateMap: FL,
        full: "Florida",
      },
      {
        id: "US-GA",
        value: 8186453,
        schools: [],
        stateMap: GA,
        full: "Georgia",
      },
      {
        id: "US-HI",
        value: 1211537,
        schools: [],
        stateMap: HI,
        full: "Hawaii",
      },
      {
        id: "US-ID",
        value: 1293953,
        schools: [],
        stateMap: ID,
        full: "Idaho",
      },
      {
        id: "US-IL",
        value: 12419293,
        schools: [],
        stateMap: IL,
        full: "Illinois",
      },
      {
        id: "US-IN",
        value: 6080485,
        schools: [],
        stateMap: IN,
        full: "Indiana",
      },
      {
        id: "US-IA",
        value: 2926324,
        schools: [],
        stateMap: IA,
        full: "Iowa",
      },
      {
        id: "US-KS",
        value: 2688418,
        schools: [],
        stateMap: KS,
        full: "Kansas",
      },
      {
        id: "US-KY",
        value: 4041769,
        schools: [],
        stateMap: KY,
        full: "Kentucky",
      },
      {
        id: "US-LA",
        value: 4468976,
        schools: [],
        stateMap: LA,
        full: "Louisiana",
      },
      {
        id: "US-ME",
        value: 1274923,
        schools: [],
        stateMap: ME,
        full: "Maine",
      },
      {
        id: "US-MD",
        value: 5296486,
        schools: [],
        stateMap: MD,
        full: "Maryland",
      },
      {
        id: "US-MA",
        value: 6349097,
        schools: [],
        stateMap: MA,
        full: "Massachusetts",
      },
      {
        id: "US-MI",
        value: 9938444,
        schools: [],
        stateMap: MI,
        full: "Michigan",
      },
      {
        id: "US-MN",
        value: 4919479,
        schools: [],
        stateMap: MN,
        full: "Minnesota",
      },
      {
        id: "US-MS",
        value: 2844658,
        schools: [],
        stateMap: MS,
        full: "Mississippi",
      },
      {
        id: "US-MO",
        value: 5595211,
        schools: [],
        stateMap: MO,
        full: "Missouri",
      },
      {
        id: "US-MT",
        value: 902195,
        schools: [],
        stateMap: MT,
        full: "Montana",
      },
      {
        id: "US-NE",
        value: 1711263,
        schools: [],
        stateMap: NE,
        full: "Nebraska",
      },
      {
        id: "US-NV",
        value: 1998257,
        schools: [],
        stateMap: NV,
        full: "Nevada",
      },
      {
        id: "US-NH",
        value: 1235786,
        schools: [],
        stateMap: NH,
        full: "New Hampshire",
      },
      {
        id: "US-NJ",
        value: 8414350,
        schools: [],
        stateMap: NJ,
        full: "New Jersey",
      },
      {
        id: "US-NM",
        value: 1819046,
        schools: [],
        stateMap: NM,
        full: "New Mexico",
      },
      {
        id: "US-NY",
        value: 18976457,
        schools: [],
        stateMap: NY,
        full: "New York",
      },
      {
        id: "US-NC",
        value: 8049313,
        schools: [],
        stateMap: NC,
        full: "North Carolina",
      },
      {
        id: "US-ND",
        value: 642200,
        schools: [],
        stateMap: ND,
        full: "North Dakota",
      },
      {
        id: "US-OH",
        value: 11353140,
        schools: [],
        stateMap: OH,
        full: "Ohio",
      },
      {
        id: "US-OK",
        value: 3450654,
        schools: [],
        stateMap: OK,
        full: "Oklahoma",
      },
      {
        id: "US-OR",
        value: 3421399,
        schools: [],
        stateMap: OR,
        full: "Oregon",
      },
      {
        id: "US-PA",
        value: 12281054,
        schools: [],
        stateMap: PA,
        full: "Pennsylvania",
      },
      {
        id: "US-RI",
        value: 1048319,
        schools: [],
        stateMap: RI,
        full: "Rhode Island",
      },
      {
        id: "US-SC",
        value: 4012012,
        schools: [],
        stateMap: SC,
        full: "South Carolina",
      },
      {
        id: "US-SD",
        value: 754844,
        schools: [],
        stateMap: SD,
        full: "South Dakota",
      },
      {
        id: "US-TN",
        value: 5689283,
        schools: [],
        stateMap: TN,
        full: "Tennessee",
      },
      {
        id: "US-TX",
        value: 20851820,
        schools: [],
        stateMap: TX,
        full: "Texas",
      },
      {
        id: "US-UT",
        value: 2233169,
        schools: [],
        stateMap: UT,
        full: "Utah",
      },
      {
        id: "US-VT",
        value: 608827,
        schools: [],
        stateMap: VT,
        full: "Vermont",
      },
      {
        id: "US-VA",
        value: 7078515,
        schools: [],
        stateMap: VA,
        full: "Virginia",
      },
      {
        id: "US-WA",
        value: 5894121,
        schools: [],
        stateMap: WA,
        full: "Washington",
      },
      {
        id: "US-WV",
        value: 1808344,
        schools: [],
        stateMap: WV,
        full: "West Virginia",
      },
      {
        id: "US-WI",
        value: 5363675,
        schools: [],
        stateMap: WI,
        full: "Wisconsin",
      },
      {
        id: "US-WY",
        value: 493782,
        schools: [],
        stateMap: WY,
        full: "Wyoming",
      },
    ];

    //  map the state to its index in sData
    var index;
    for (index = 0; index < polygonSeries.data.length; index++) {
      let state = polygonSeries.data[index].id.substring(3, 5);
      stateToIndex[state] = index;
    }

    let minValue = 0;
    let maxValue = 0;
    var i;

    for (i = 0; i < polygonSeries.data.length; i++) {

      // filter array by each state id
      let currState = polygonSeries.data[i].id;

      let stateArr = dataObjects.filter((obj) => {
        return obj.state === currState;
      });
      polygonSeries.data[i].schools = stateArr;

      // sum up the values in each subarray
      let sum = stateArr.reduce((a, b) => a + b.totalGrant, 0);

      // put sum in value of data array
      polygonSeries.data[i].value = sum;
      statesArray.push(polygonSeries.data[i].id.substring(3));

      let stateString = polygonSeries.data[i].id.substring(3);
      statesMap.set(stateString, sum);

      if (sum < minValue) {
        minValue = sum;
      }
      if (sum > maxValue) {
        maxValue = sum;
      }
    }
    sData = polygonSeries.data;
    statesArray = Array.from(new Set(statesArray));

    polygonSeries.heatRules.push({
      property: "fill",
      target: polygonSeries.mapPolygons.template,
      min: chart.colors.getIndex(1).brighten(2),
      max: chart.colors.getIndex(1).brighten(-0.3),
      minValue: minValue,
      maxValue: maxValue / 42,
    });

    // Set up heat legend
    let heatLegend = chart.createChild(HeatLegend);
    heatLegend.series = polygonSeries;
    heatLegend.align = "right";
    heatLegend.dx = 25;
    heatLegend.valign = "top";
    heatLegend.width = percent(25);
    heatLegend.marginRight = percent(9);
    heatLegend.minValue = 0;
    heatLegend.maxValue = 40000000;

    // Set up custom heat map legend labels using axis ranges
    let minRange = heatLegend.valueAxis.axisRanges.create();
    minRange.value = heatLegend.minValue;
    minRange.label.text = "$0";
    let maxRange = heatLegend.valueAxis.axisRanges.create();
    maxRange.value = heatLegend.maxValue;
    maxRange.label.text = "$4m";

    // Blank out internal heat legend value axis labels
    heatLegend.valueAxis.renderer.labels.template.adapter.add("text", function (labelText) {
      return "";
    });

    // Configure series tooltip
    let polygonTemplate = polygonSeries.mapPolygons.template;
    polygonTemplate.tooltipText = "{name}: ${value}";
    polygonTemplate.nonScalingStroke = true;
    polygonTemplate.strokeWidth = 0.5;

    // Create hover state and set alternative fill color
    let hs = polygonTemplate.states.create("hover");
    hs.properties.fill = color("#EE4742");

    polygonTemplate.events.on("hit", (ev) => {
      let state = ev.target.dataItem.dataContext;
      this.renderState(state);
      this.renderStateChart(state, polygonSeries.data);
    });

    let imageSeries = chart.series.push(new MapImageSeries()); //mapImageSeries
    imageSeries.mapImages.template.propertyFields.longitude = "longitude";
    imageSeries.mapImages.template.propertyFields.latitude = "latitude";
    imageSeries.mapImages.template.propertyFields.value = "value";
    imageSeries.data = this.state.data;

    let circle = imageSeries.mapImages.template.createChild(Circle);
    circle.radius = 2;
    circle.fill = color("#000000");
    circle.stroke = color("#000000");
    circle.strokeWidth = 2;
    circle.nonScaling = true;
    circle.tooltipText = "{title}: ${totalGrant}";

    circle.events.on("hit", function (ev) {
      let context = ev.target.dataItem.dataContext;

      var state = schoolToState[context.title];
      var index = stateToIndex[state];
      let school = ev.target.dataItem.dataContext.title;
      let grant = ev.target.dataItem.dataContext.totalGrant;
      this.setState({
        visible: true,
        university: school + ": ",
        totalGrant: "$" + grant,
      });
      this.renderSchoolChart(ev.target.dataItem.dataContext);
      this.renderState(sData[index]);
    }, this);

  }

  renderSchoolData = (city) => {
    this.setState({
      visible: true
    });
  }

  renderSchoolChart = (school) => {
    chart3 = create("chartdiv2", XYChart);

    let title = chart3.titles.create();
    title.text = "Grant amounts awarded to " + school.title;
    title.fontSize = 15;
    title.marginBottom = 30;

    // Add data
    chart3.data = school.yearlyList;
    // Create axes
    let categoryAxis = chart3.xAxes.push(new CategoryAxis());
    categoryAxis.dataFields.category = "year";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 30;

    categoryAxis.renderer.labels.template.fontSize = 10;
    // categoryAxis.renderer.labels.template.horizontalCenter = "right";
    // categoryAxis.renderer.labels.template.verticalCenter = "middle";
    // categoryAxis.renderer.labels.template.rotation = 270;

    let valueAxis = chart3.yAxes.push(new ValueAxis());
    // Create series
    let series = chart3.series.push(new ColumnSeries());
    series.dataFields.valueY = "grantAmount";
    series.dataFields.value = "total"
    series.dataFields.categoryX = "year";
    series.name = "Year";
    series.stacked = true;
    series.columns.template.tooltipText = "Total: [bold]${valueY}[/]\nGrants: [bold]{total}";
    series.columns.template.fillOpacity = .8;
    series.stroke = color("#B4D9DB");
    series.columns.template.fill = color("#B4D9DB");

    let columnTemplate = series.columns.template;
    columnTemplate.strokeWidth = 2;
    columnTemplate.strokeOpacity = 1;

  }

  renderStateChart = (state, stateData) => {

    chart2 = create("chartdiv2", XYChart);

    let title = chart2.titles.create();
    title.text = "Top 5 Schools in " +  state.name;
    title.fontSize = 15;
    title.marginBottom = 30;

    let schoolData = state.schools;
    schoolData.sort(function (a, b) {
      return parseInt(b.totalGrant) - parseInt(a.totalGrant);
    });

    // Add data
    chart2.data = schoolData.slice(0, 5);

    // Create axes
    let categoryAxis = chart2.xAxes.push(new CategoryAxis());
    categoryAxis.dataFields.category = "title";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 30;

    categoryAxis.renderer.labels.template.fontSize = 10;
    categoryAxis.renderer.labels.template.wrap = true;
    categoryAxis.renderer.labels.template.maxWidth = 75;

    let valueAxis = chart2.yAxes.push(new ValueAxis());

    // Create series
    let series = chart2.series.push(new ColumnSeries());
    series.dataFields.valueY = "totalGrant";
    series.dataFields.categoryX = "title";
    series.name = "Visits";
    series.columns.template.tooltipText = "{categoryX}: [bold]{valueY}[/]";
    series.columns.template.fillOpacity = .8;
    series.stroke = color("#B4D9DB");
    series.columns.template.fill = color("#B4D9DB");

    series.columns.template.events.on("hit", function (ev) {
      console.log("clicked on ", ev.target._dataItem.categories.categoryX);
      let school = dataObjects.filter((obj) => {
        if (obj.title === ev.target._dataItem.categories.categoryX) {
          return obj;
        }
      });
      this.setState({
        visible: true,
        university: school[0].title + ":",
        totalGrant: "$" + school[0].totalGrant,
      });
      this.renderSchoolChart(school[0]);
    }, this);

    let columnTemplate = series.columns.template;
    columnTemplate.strokeWidth = 2;
    columnTemplate.strokeOpacity = 1;
  }

  componentDidMount() {
    this.connecToServer();
    this.loadData();
  }

  componentWillUnmount() {
    if (this.chart) {
      this.chart.dispose();
    }
  }

  renderState = (state) => {

    chart = create("chartdiv", MapChart);

    this.setState({ state: state.name });
    // Set map definition
    chart.geodata = state.stateMap;

    let title = chart.titles.create();
    // title.text = "Click on a state or school for more info";
    title.fontSize = 25;
    title.marginBottom = 30;

    // Set projection
    chart.projection = new projections.Miller(); 

    // Create map polygon series
    var polygonSeries = chart.series.push(new MapPolygonSeries());

    // Exclude Antartica
    polygonSeries.exclude = ["AQ"];

    // Make map load polygon (like country names) data from GeoJSON
    polygonSeries.useGeodata = true;

    chart.zoomControl = new ZoomControl();
    chart.zoomControl.align = "left";
    chart.zoomControl.height = 100;

    // Configure series
    var polygonTemplate = polygonSeries.mapPolygons.template;
    polygonTemplate.tooltipText = "{name}";
    polygonTemplate.fill = color("#93A9B7");

    // Create hover state and set alternative fill color
    var hs = polygonTemplate.states.create("hover");
    hs.properties.fill = color("#EE4742");

    polygonTemplate.events.on("hit", (ev) => {
      ev.target.series.chart.zoomToMapObject(ev.target);
    });

    let imageSeries = chart.series.push(new MapImageSeries()); //mapImageSeries
    imageSeries.mapImages.template.propertyFields.longitude = "longitude";
    imageSeries.mapImages.template.propertyFields.latitude = "latitude";
    imageSeries.mapImages.template.propertyFields.value = "value";
    imageSeries.data = dataObjects.filter((obj) => {
      if (obj.state === state.id) {
        return obj;
      }
    });

    let circle = imageSeries.mapImages.template.createChild(Circle);
    circle.radius = 2;
    circle.fill = color("#000000");
    circle.stroke = color("#000000");
    circle.strokeWidth = 2;
    circle.nonScaling = true;
    circle.tooltipText = "{title}: ${totalGrant}";

    circle.events.on("hit", function (ev) {
      let school = ev.target.dataItem.dataContext.title;
      let grant = ev.target.dataItem.dataContext.totalGrant;
      this.setState({
        visible: true,
        university: school + ": ",
        totalGrant: "$" + grant,
      });
      this.renderSchoolChart(ev.target.dataItem.dataContext);
    }, this);

  }

  showSchools = (selected) => {
    let schoolGrant;
    let yearlyList;
    dataObjects.filter((obj) => {
      if (obj.title === selected.toString()) {
        schoolGrant = obj.totalGrant;
        yearlyList = obj.yearlyList;
        return obj.totalGrant;
      }
    });
    this.setState({
      visible: true,
      university: selected + ":",
      totalGrant: "$" + schoolGrant,
    });
  }

  showSchoolsByState = (selected) => {
    let schoolsString = "";
    sData.filter((obj) => {
      if (obj.id.substring(3) === selected.toString()) {
        let i;
        for (i = 0; i < obj.schools.length; i++) {
          let amount = schoolsMap.get(obj.schools[i].title.toString());
          schoolsString += obj.schools[i].title.toString() + ": $" + amount + '*';
        }
        schoolsString = schoolsString.split('*').map(t => {
          return <div>{t}</div>;
        });
      }
    });
    this.setState({
      visible: true,
      university: schoolsString,
    });
  }

  back = () => {
    let state = sData.filter((obj) => {
      if (obj.full === this.state.state.toString()) {
        return obj;
      }
    });
    if (state[0] != undefined)
      this.renderStateChart(state[0], []);
  }

  renderGeneralStats = () => {
    var bigDiv = document.getElementById('chartdiv2');

    var centerText = document.createElement("div");
    centerText.className += " general-stats-div";

    var h = document.createElement("H1");
    h.className+= " general-stats";
    var t = document.createTextNode("ACF Scholarships");
    h.appendChild(t);

    var h2 = document.createElement("H5");
    h2.className+= " general-stats";
    var roundedTGA = Math.trunc(totalGrantAmount);
    var tga = roundedTGA.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    var t2 = document.createTextNode("$" + tga + " awarded");
    h2.appendChild(t2);

    var h3 = document.createElement("H5");
    h3.className+= " general-stats";
    var nS = numScholarships.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    var t3 = document.createTextNode(nS + " total scholarships awarded");
    h3.appendChild(t3);

    var h4 = document.createElement("H5");
    h4.className+= " general-stats";
    var sAL = schoolsArray.length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    var t4 = document.createTextNode(sAL + " US schools");
    h4.appendChild(t4);

    centerText.appendChild(h);
    centerText.appendChild(h2);
    centerText.appendChild(h3);
    centerText.appendChild(h4);


    bigDiv.appendChild(centerText);

  }

  render() {

    let searchBars =
      <div class="searchBars" style={{ marginLeft: '5%', marginRight: '5%', marginTop: '3.5%' }} >
        <Typeahead id="search-bar" placeholder="search by state" onChange={(selected) => {
          if (selected.length === 0) {
            this.setState({ visible: false, university: "", totalGrant: "" });
          }
          else {
            let state = sData.filter((obj) => {
              if (obj.id.substring(3) === selected.toString()) {
                return obj;
              }
            });
            this.renderState(state[0]);
            this.renderStateChart(state[0], []);
          }
        }} options={statesArray} />
        <Typeahead id="search-bar" placeholder="search by school" onChange={(selected) => {
          if (selected.length === 0) {
            this.setState({ visible: false, university: "", totalGrant: "" });
          }
          else {
            this.showSchools(selected);
            let school = dataObjects.filter((obj) => {
              if (obj.title === selected.toString()) {
                return obj;
              }
            });
            this.setState({
              visible: true,
              university: selected.toString() + ": ",
            });

            //  change the current state displayed to the state this school belongs to
            var state = schoolToState[selected.toString()];
            var index = stateToIndex[state];
            this.renderState(sData[index]);
            this.renderSchoolChart(school[0]);
          }
        }} options={schoolsArray} />
      </div>;

    let mapCard =
      <div>
        <div class="mdc-card">
          {/* <CardMedia> */}
            <div id="chartdiv" style={{ width: "100%", height: '50vh'}}></div>
          {/* </CardMedia> */}
        </div>
        <div style={{ marginTop: '1%' }}>
            <button type="button" class="btn btn-dark" onClick={this.resetState}>Return to United States Map</button>
          </div>
      </div>;

    let state = this.state.state === "..." ? "" : this.state.state;

    return (
      <div class="wrap">
        <div class="contents">
          <div id="bannerimage"></div>
          <div class="floatleft" >
            {searchBars}
            <div style={{ marginLeft: '5%', marginRight: '5%', marginTop: '5%', marginBottom: '5%' }}>
              {mapCard}
            </div>
          </div>

          <div class="cityInfo floatright">
            <div style={{ marginTop: '25.8%', marginRight: '5%'}}>
              <div>
                <div class="mdc-card">
                  {/* <CardMedia> */}
                    <div id="chartdiv2" style={{ width: "100%", height: '50vh' }}></div>
                  {/* </CardMedia> */}
                </div>
                <div style={{ marginTop: '1%' }}>
                  <button type="button" class="btn btn-dark" onClick={this.back}>View {state} Chart</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;

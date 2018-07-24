



var margin = { top: 30, right: 10, bottom: 10, left: 10 },
    width = window.innerWidth - 5 * window.innerWidth / 100 - margin.left - margin.right,
    height = window.innerHeight / 2 - 5 * window.innerHeight / 100 - margin.top - margin.bottom;

var x = d3.scale.ordinal().rangePoints([0, width], 1),
    y = {},
    dragging = {};

var line = d3.svg.line(),
    axis = d3.svg.axis().orient("left"),
    background,
    foreground;

var svg = d3.select("#chartID")
    //.append("div")
    //.classed("svg-container",true)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    //.attr("preserveAspectRatio", "xMinYMin meet")
    //.attr("viewBox", "0 0 600 400")
    //.classed("svg-content-responsive", true)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var time;
// Extract the list of dimensions and create a scale for each.
var dimensions = d3.keys(csv_data[0]).filter(function (d) {
    if (d === "group") return false;

    if (d != "time") {
        y[d] = d3.scale.linear()
            .domain(d3.extent(csv_data, function (p) { return +p[d]; }))
            .range([height, 0]);
    }
    else {
        y[d] = d3.scale.ordinal()
            .domain(csv_data.map(function (p) { return p[d]; }))
            .rangePoints([height, 0]);

    }

    return true;
	/*  
	return (d != "group" && d!= "time" ) && (y[d] = d3.scale.linear()
        .domain(d3.extent(csv_data, function(p) { return +p[d]; }))
        .range([height, 0]));*/
});


//dimensions.push("time"); 
/*console.log(dimensions);*/
x.domain(dimensions);


// Add group grey lines for context.
background = svg.append("svg:g")
    .attr("class", "background")
    .selectAll("path")
    .data(csv_data)
    .enter().append("svg:path")
    .attr("d", path)
    .attr("opacity", 0.2)
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut);

//call changeColor depend on group selected
  var select = d3.select("#colorGroupBy")
  .append("select")
  .attr("class", "colorGroupSelect")
  .on("change", getGoupByColor);

  var label="group"
  var uniqueItems = [...new Set(dataLabel)]


  function getGoupByColor(){

      console.log(uniqueItems)

      label = this.value
      console.log(label)
      var dataLabel = csv_data.map(function(d) { return d[label]; });
      uniqueItems = Array.from(new Set(dataLabel))
      console.log(uniqueItems)
  }

console.log(label)
console.log(uniqueItems)
  var colorOptions = select.selectAll('colorOptions')
	  .data((d3.keys(csv_data[0])));


  colorOptions
	  .enter()
		.append("option")
        .attr("class", "colorOptions")
		.attr("value", function(d) {return d;})
		.text(function(d) {return d;});
    
var dataLabel = csv_data.map(function(d) { return d[label]; });
// CREATE A COLOR SCALE
var color = d3.scale.ordinal()
    .domain('b1','b2','b3')
    .range(d3.schemeRdYlGn[3])
  
// var color = d3.scale.ordinal()
//     .domain(dataLabel)
//     .range(d3.schemeRdYlBu[dataLabel.length])

// Add colored group lines for focus.
foreground = svg.append("svg:g")
    .attr("class", "foreground")
    .selectAll("path")
    .data(csv_data)
    .enter().append("svg:path")
    .attr("d", path)
    .attr("stroke-width",2)
    .attr("stroke", function (d) {
        return color(d[label]);
    })
    .attr("opacity", 0.2)
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut);

// Add a group element for each dimension.
var g = svg.selectAll(".dimension")
    .data(dimensions)
    .enter().append("svg:g")
    .attr("class", "dimension")
    .attr("transform", function (d) { return "translate(" + x(d) + ")"; })
    .call(d3.behavior.drag()
        .on("dragstart", function (d) {
            dragging[d] = this.__origin__ = x(d);
            background.attr("visibility", "hidden");
        })
        .on("drag", function (d) {
            dragging[d] = Math.min(width, Math.max(0, this.__origin__ += d3.event.dx));
            foreground.attr("d", path);
            dimensions.sort(function (a, b) { return position(a) - position(b); });
            x.domain(dimensions);
            g.attr("transform", function (d) { return "translate(" + position(d) + ")"; })
        })
        .on("dragend", function (d) {
            delete this.__origin__;
            delete dragging[d];
            transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
            transition(foreground)
                .attr("d", path);
            background
                .attr("d", path)
                .transition()
                .delay(500)
                .duration(0)
                .attr("visibility", null);

        }));





// Add an axis and title.
g.append("svg:g")
    .attr("class", "axis")
    .each(function (d) { d3.select(this).call(axis.scale(y[d])) })
    .append("svg:text")
    .attr("text-anchor", "middle")
    .attr("y", -9)
    .text(String)
    .on("dblclick", handleClick);


// Add and store a brush for each axis.
var brushg = g.append("svg:g")
    .attr("class", "brush")
    .each(function (d) {
        d3.select(this).call(y[d].brush = d3.svg.multibrush()
            .extentAdaption(resizeExtent)
            .y(y[d]).on("brush", brush));
    })
    .selectAll("rect").call(resizeExtent);
// Create Event Handlers for mouse

    function resizeExtent(selection) {
        selection
            .attr("x", -8)
            .attr("width", 16);
    }

    function position(d) {
        var v = dragging[d];
        return v == null ? x(d) : v;
    }

    function transition(g) {
        return g.transition().duration(500);
    }

    function reverse(g) {

    }

    // Returns the path for a given data point.
    function path(d) {
        return line(dimensions.map(function (p) { return [position(p), y[p](d[p])]; }));
    }

    // toggling the display of foreground lines when we fliping the y Axis
    function render() {

        svg.select(".foreground").selectAll("path").remove();
        svg.select(".background").selectAll("path").remove();


        background = svg.select(".background")
            .selectAll("path")
            .data(csv_data)
            .enter().append("svg:path")
            .attr("d", path)
            .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut);

        foreground = svg.select(".foreground")
            .selectAll("path")
            .data(csv_data)
            .enter().append("svg:path")
            .attr("d", path)
            .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut)
            .attr("stroke", function (d) {
                return color(d.group);
            });
    }
function handleMouseOver(d) {  // Add interactivity
    // Use D3 to select element, change color and size
    d3.select(this)
        .transition()
        .duration(500)
        .attr("stroke-width", 5)
        .attr("opacity", 1);
}
function handleMouseOut(d) {
    // Use D3 to select element, change color back to normal
    d3.select(this)
        .transition()
        .duration(500)
        .attr("stroke-width", '2px')
        .attr("opacity", 0.2);
}

    // handle db click for fliping y axis
    function handleClick(d, j) {
        console.log(d + '-' + j);
        var dimension = svg.selectAll(".dimension");

        /* Fliping Y axis */
        y[d].domain(y[d].domain().reverse());

        d3.select(dimension[0][j]).transition().duration(1100)
            .call(axis.scale(y[d]));

        /*Fliping brush*/
        if (y[d].brush.empty() == false) {

            /* get brush extent */
            var extent = y[d].brush.extent();

            /* brush move */
            d3.select(dimension[0][j]).select(".brush").call(y[d].brush.extent(extent));

            /* delete brushs */
            //d3.select(dimension[0][j]).select(".brush").remove(); 
            d3.svg.selectAll(".brush").filter(function (d) { return d.length > 1; })
                .
                render();
            brush();
        } else {
            render();
        }


    }

    // Handles a brush event, toggling the display of foreground lines.
    function brush() {
        var actives = dimensions.filter(function (p) { return !y[p].brush.empty(); }),
            extents = actives.map(function (p) { return y[p].brush.extent(); });
        foreground.style("display", function (d) {
            return actives.every(function (p, i) {
                return extents[i].some(function (e) {
                    return e[0] <= d[p] && d[p] <= e[1];
                });
            }) ? null : "none";
        });
    }
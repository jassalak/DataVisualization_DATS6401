
var width = 500,
      height = 500,
      start = 0,
      end = 2.25, // a$ changed from 2.25 --> 1.5
      numSpirals = 3                                // a$ changed =3 --> =3 This changes the blue line.
      margin = {top:50,bottom:50,left:50,right:50};

    var theta = function(r) {
      return numSpirals * Math.PI * r ; // 
    };

    // used to assign nodes color by group
    var color = d3.scaleOrdinal(d3.schemeCategory10);

    var r = d3.min([width, height]) / 1.75 -40 ; // changes the radius of the circle(swirl) // a$ changed 2 --> 1.75

    var radius = d3.scaleLinear()
      .domain([start, end])
      .range([40, r]);

    var svg = d3.select("#spiralchart").append("svg")
      .attr("width", width + margin.right + margin.left)
      .attr("height", height + margin.left + margin.right)
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var points = d3.range(start, end + 0.001, (end - start) / 1000);

    var spiral = d3.radialLine()
      .curve(d3.curveCardinal)
      .angle(theta)
      .radius(radius);

    var path = svg.append("path")
      .datum(points)
      .attr("id", "spiral")
      .attr("d", spiral)
      .style("fill", "none")
      .style("stroke", "steelblue");

    var spiralLength = path.node().getTotalLength(),
        N = 365,                              // a$ changed 365 to 365
        barWidth = (spiralLength / N) - 1;
    
/*	//this is with randomized data
	var someData = [];
    for (var i = 0; i < N; i++) {
      var currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + i);
      someData.push({
        date: currentDate,
        value: Math.random(),
        group: currentDate.getMonth()
      });
    } 
*/
	
	//this is with data data
	//var someData = [];
	
	d3.json("data/data6.json", function(someData) {
		someData.forEach(function(d) {
		   //console.log(d.value);
		   d.date = new Date(d.date);
		});	
		update(someData);
	});
	
	function update(someData) {	
		
		var timeScale = d3.scaleTime()
		  .domain(d3.extent(someData, function(d){
			return d.date;             // a$ changed d.date --> d.date    
		  }))
		  .range([r/4, spiralLength]); // a$ changed 0 --> r/4
		
		// yScale for the bar height
		var yScale = d3.scaleLinear()
		  .domain([50000, d3.max(someData, function(d){ // a$ changed 0 to d3.min(someData,function(d)
			return d.value;
		  })])                          
		  .range([ 0, (r / numSpirals) - 30]); // a$ changed 0 --> r/4

		svg.selectAll("rect")
		  .data(someData)
		  .enter()
		  .append("rect")
		  .attr("x", function(d,i){
			
			var linePer = d.index * 4.875, // a$ changed timeScale(d.date) --> d.index * 4.25 
				posOnLine = path.node().getPointAtLength(linePer), // a$ changed --> the end
				angleOnLine = path.node().getPointAtLength(linePer - barWidth);
		  
			d.linePer = linePer; // % distance are on the spiral
			d.x = posOnLine.x; // x postion on the spiral
			d.y = posOnLine.y; // y position on the spiral
			
			d.a = (Math.atan2(angleOnLine.y, angleOnLine.x) * 180 / Math.PI) - 90; //angle at the spiral position

			return d.x;
		  })
		  .attr("y", function(d){
			return d.y;
		  })
		  .attr("width", function(d){
			return barWidth;
		  })
		  .attr("height", function(d){
			return yScale(d.value);
		  })
		  .style("fill", function(d){return color(d.group);})
		  .style("stroke", "none")
		  .attr("transform", function(d){
			return "rotate(" + d.a + "," + d.x  + "," + d.y + ")"; // rotate the bar
		  });
		
		// add date labels
		var tF = d3.timeFormat("%Y"), // a$ changed "%b %Y" --> "%Y"
			firstInMonth = {};

		svg.selectAll("text")
		  .data(someData)
		  .enter()
		  .append("text")
		  .attr("dy", 10)
		  .style("text-anchor", "start")
		  .style("font", "10px arial")
		  .append("textPath")
		  // only add for the first of each month
		  .filter(function(d){
			var sd = tF(d.date);
			if (!firstInMonth[sd]){ 
			  firstInMonth[sd] = 1;
			  return true;
			}
			return false;
		  })
		  .text(function(d){
			return tF(d.date);
		  })
		  // place text along spiral
		  .attr("xlink:href", "#spiral")
		  .style("fill", "grey")
		  .attr("startOffset", function(d){
			return ((d.linePer / spiralLength) * 100) + "%";
		  })
		  
		var tooltip = d3.select("#spiralchart")
		.append('div')
		.attr('class', 'tooltip');

		tooltip.append('div')
		.attr('class', 'date');
		tooltip.append('div')
		.attr('class', 'value');
		tooltip.append('div')
		.attr('class', 'group'); // a$ added this line in		
				tooltip.append('div')
		.attr('class', 'index'); // a$ added this line in	

		svg.selectAll("rect")
		.on('mouseover', function(d) {

			tooltip.select('.date').html("Date: <b>" + d.date.toDateString() + "</b>");
			tooltip.select('.value').html("Value: <b>" + Math.round(d.value*100)/100 + "<b>");
			tooltip.select('.group').html("Group: <b>" + d.group + "<b>"); // a$ added this line in
			tooltip.select('.index').html("Index: <b>" + d.index + "<b>"); // a$ added this line in
			
			d3.select(this)
			.style("fill","#FFFFFF")
			.style("stroke","#000000")
			.style("stroke-width","2px");

			tooltip.style('display', 'block');
			tooltip.style('opacity',2);

		})
		.on('mousemove', function(d) {
			tooltip.style('top', (d3.event.layerY + 10) + 'px')
			.style('left', (d3.event.layerX - 25) + 'px');
		})
		.on('mouseout', function(d) {
			d3.selectAll("rect")
			.style("fill", function(d){return color(d.group);})
			.style("stroke", "none")

			tooltip.style('display', 'none');
			tooltip.style('opacity',0);
		})
	};
	

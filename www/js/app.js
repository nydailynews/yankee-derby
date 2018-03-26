// UTILS
var utils = {
    ap_numerals: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'],
    months: ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'],
    ap_months: ['Jan.', 'Feb.', 'March', 'April', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'],
    ap_date: function(date) {
        // Given a date such as "2018-02-03" return an AP style date.
        var parts = date.split('-')
        var day = +parts[2];
        var month = this.ap_months[+parts[1] - 1];
        return month + ' ' + day + ', ' + parts[0];
    },
    rando: function() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for ( var i=0; i < 8; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    },
    add_zero: function(i) {
        // For values less than 10, return a zero-prefixed version of that value.
        if ( +i < 10 ) return "0" + i;
        return i;
    },
    parse_date: function(date ) {
        // date is a datetime-looking string such as "2017-07-25"
        // Returns a unixtime integer.
        if ( typeof date !== 'string' ) return Date.now();

        var date_bits = date.split(' ')[0].split('-');

        // We do that "+date_bits[1] - 1" because months are zero-indexed.
        var d = new Date(date_bits[0], +date_bits[1] - 1, date_bits[2], 0, 0, 0);
        return d.getTime();
    },
    get_json: function(path, obj, callback) {
        // Downloads local json and returns it.
        // Cribbed from http://youmightnotneedjquery.com/
        var request = new XMLHttpRequest();
        request.open('GET', path, true);

        request.onload = function() {
            if ( request.status >= 200 && request.status < 400 ) {
                obj.data = JSON.parse(request.responseText);
                callback();
            }
            else {
                console.error('DID NOT LOAD ' + path + request);
                return false;
            }
        };
        request.onerror = function() {};
        request.send();
    },
    add_class: function(el, class_name) {
        // From http://youmightnotneedjquery.com/#add_class
        if ( el.classlist ) el.classList.add(class_name);
        else el.className += ' ' + class_name;
        return el;
    },
    add_js: function(src, callback) {
        var s = document.createElement('script');
        if ( typeof callback === 'function' ) s.onload = function() { callback(); }
        //else console.log("Callback function", callback, " is not a function");
        s.setAttribute('src', src);
        document.getElementsByTagName('head')[0].appendChild(s);
    },
}

// STATS
// First init fires, then on_load.
var stats = {
    config: {
    },
    update_config: function(config) {
        // Take an external config object and update this config object.
        for ( var key in config )
        {
            if ( config.hasOwnProperty(key) )
            {
                this.config[key] = config[key];
            }
        }
        return true;
    },
    on_load: function() {
		chrt.init();
    },
    init: function(year) {
        if ( year == null ) year = 2018;
        // get_json takes three params: filepath, the object that's calling it, and a callback.
        utils.get_json('test/yankee-slugger-' + year + '.json', stats, this.on_load);
    }
}

// PARAGRAPH
// This object handles the text
var pg = {
    config: {
    },
    update_config: function(config) {
        // Take an external config object and update this config object.
        for ( var key in config )
        {
            if ( config.hasOwnProperty(key) )
            {
                this.config[key] = config[key];
            }
        }
        return true;
    },
    on_load: function() {
    },
    init: function(year) {
    }
}

// CHART
// This object handles the chart
var chrt = {
    config: {
    },
    update_config: function(config) {
        // Take an external config object and update this config object.
        for ( var key in config )
        {
            if ( config.hasOwnProperty(key) )
            {
                this.config[key] = config[key];
            }
        }
        return true;
    },
    build_chart: function(type) {
		if ( type == null ) type = 'hrs';
        chrt.type = type;
        var type_key = {
            hrs: 'Home runs',
            rbis: 'RBIs',
            avg: 'Batting average',
            ops: 'OPS' };
		var margin = { 'left': 50, 'top': 10 };
		var width = 800;
		var height = 370;
		var x = d3.scaleTime().range([0, width]),
            y = d3.scaleLinear().range([height, 0]),
            z = d3.scaleOrdinal(d3.schemeCategory10);
        var line = d3.line()
            .curve(d3.curveBasis)
            .x(function(d) { console.log(d.date, x(d.date), d); return x(d.date); })
            .y(function(d) { return y(d.value); });
		var svg = d3.select('svg#daily'),
             g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		var data = stats.data;
        var keys = Object.keys(data[0]).slice(1);
        data.forEach(function(d) {
			d.date = chrt.parse_time(d.date);
        });
        var slugger_stats = keys.map(function(id) {
            console.log(id);
            return {
                id: id,
                values: data.map(function(d) {
                    return { date: d.date, value: d[id]};
                })
            };
        });
		//x.domain(d3.extent(season_dates, function(d) { return chrt.format_time(chrt.parse_time(d)); }));
        //x.domain(season_dates.map(function(d) { return chrt.format_time(chrt.parse_time(d)) }));
        //x.domain(d3.extent(data, function(d) { console.log('AAAA', d.date); return d.date; }));
		x.domain(d3.extent(season_dates, function(d) { return chrt.parse_time(d); }));
        y.domain([0,
            d3.max(slugger_stats, function(c) { return d3.max(c.values, function(d) { return d.value; }); })
        ]);
        z.domain(slugger_stats.map(function(c) { return c.id; }));
		//y.domain([0, d3.max(data, function(d) { 
		//	  return Math.max(d['judge-' + type], d['stanton-' + type], d['leader-' + type]); })]);

		g.append("g")
            .attr('class', 'axis axis--x')
			.attr("transform", "translate(0," + height + ")")
			.call(d3.axisBottom(x));

		g.append("g")
            .attr("class", "axis axis--y")
			.call(d3.axisLeft(y))
            .append('text')
                .attr('x', 50)
                .attr('dx', '.5em')
                .attr('fill', '#333')
                .text(type_key[type]);

        var lines = g.selectAll('.lines')
            .data(slugger_stats)
            .enter().append('g')
                .attr('class', 'line-group');

        lines.append('path')
            .attr('class', 'line')
            .attr('stroke-width', '3px')
            .attr('fill', 'none')
            .attr('display', function(d) { if ( d.id.indexOf(type) === -1 ) return 'none'; else return ''; })
            .attr('d', function(d) { console.log(d.values); return line(d.values); })
            .style('stroke', function(d) { return z(d.id); });
	},
    on_load: function() {
        chrt.parse_time = d3.timeParse('%Y-%m-%d');
        chrt.format_time = d3.timeFormat('%B %e');
		chrt.build_chart();
    },
    init: function(year) {
		//utils.add_js('http://interactive.nydailynews.com/js/d3/d3.v4.min.js', chrt.on_load);
		this.on_load();
    }
}
var season_dates = ['2018-03-29', '2018-03-30', '2018-03-31', '2018-04-01', '2018-04-02', '2018-04-03', '2018-04-04', '2018-04-05', '2018-04-06', '2018-04-07', '2018-04-08', '2018-04-09', '2018-04-10', '2018-04-11', '2018-04-12', '2018-04-13', '2018-04-14', '2018-04-15', '2018-04-16', '2018-04-17', '2018-04-18', '2018-04-19', '2018-04-20', '2018-04-21', '2018-04-22', '2018-04-23', '2018-04-24', '2018-04-25', '2018-04-26', '2018-04-27', '2018-04-28', '2018-04-29', '2018-04-30', '2018-05-01', '2018-05-02', '2018-05-03', '2018-05-04', '2018-05-05', '2018-05-06', '2018-05-07', '2018-05-08', '2018-05-09', '2018-05-10', '2018-05-11', '2018-05-12', '2018-05-13', '2018-05-14', '2018-05-15', '2018-05-16', '2018-05-17', '2018-05-18', '2018-05-19', '2018-05-20', '2018-05-21', '2018-05-22', '2018-05-23', '2018-05-24', '2018-05-25', '2018-05-26', '2018-05-27', '2018-05-28', '2018-05-29', '2018-05-30', '2018-05-31', '2018-06-01', '2018-06-02', '2018-06-03', '2018-06-04', '2018-06-05', '2018-06-06', '2018-06-07', '2018-06-08', '2018-06-09', '2018-06-10', '2018-06-11', '2018-06-12', '2018-06-13', '2018-06-14', '2018-06-15', '2018-06-16', '2018-06-17', '2018-06-18', '2018-06-19', '2018-06-20', '2018-06-21', '2018-06-22', '2018-06-23', '2018-06-24', '2018-06-25', '2018-06-26', '2018-06-27', '2018-06-28', '2018-06-29', '2018-06-30', '2018-07-01', '2018-07-02', '2018-07-03', '2018-07-04', '2018-07-05', '2018-07-06', '2018-07-07', '2018-07-08', '2018-07-09', '2018-07-10', '2018-07-11', '2018-07-12', '2018-07-13', '2018-07-14', '2018-07-15', '2018-07-16', '2018-07-17', '2018-07-18', '2018-07-19', '2018-07-20', '2018-07-21', '2018-07-22', '2018-07-23', '2018-07-24', '2018-07-25', '2018-07-26', '2018-07-27', '2018-07-28', '2018-07-29', '2018-07-30', '2018-07-31', '2018-08-01', '2018-08-02', '2018-08-03', '2018-08-04', '2018-08-05', '2018-08-06', '2018-08-07', '2018-08-08', '2018-08-09', '2018-08-10', '2018-08-11', '2018-08-12', '2018-08-13', '2018-08-14', '2018-08-15', '2018-08-16', '2018-08-17', '2018-08-18', '2018-08-19', '2018-08-20', '2018-08-21', '2018-08-22', '2018-08-23', '2018-08-24', '2018-08-25', '2018-08-26', '2018-08-27', '2018-08-28', '2018-08-29', '2018-08-30', '2018-08-31', '2018-09-01', '2018-09-02', '2018-09-03', '2018-09-04', '2018-09-05', '2018-09-06', '2018-09-07', '2018-09-08', '2018-09-09', '2018-09-10', '2018-09-11', '2018-09-12', '2018-09-13', '2018-09-14', '2018-09-15', '2018-09-16', '2018-09-17', '2018-09-18', '2018-09-19', '2018-09-20', '2018-09-21', '2018-09-22', '2018-09-23', '2018-09-24', '2018-09-25', '2018-09-26', '2018-09-27', '2018-09-28', '2018-09-29', '2018-09-30'];
var season_dates = ['2018-03-29', '2018-03-30', '2018-03-31', '2018-04-01', '2018-04-02', '2018-04-03'];

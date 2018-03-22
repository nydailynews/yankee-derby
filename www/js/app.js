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
		load_chart();
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
		if ( type == null ) type = 'homeruns';
		var margin = { 'left': 50, 'top': 10 };
		var width = 800;
		var height = 370;
		var x = d3.scaleTime().range([0, width]);
		var y = d3.scaleLinear().range([height, 0]);
		var l0 = d3.line()
			.x(function(d) { return x(d.date) })
			.y(function(d) { return y(d['judge-' + type]) });
		var l1 = d3.line()
			.x(function(d) { return x(d.date) })
			.y(function(d) { return y(d['stanton-' + type]) });
		var l2 = d3.line()
			.x(function(d) { return x(d.date) })
			.y(function(d) { return y(d['leader-' + type]) });
		var svg = d3.select('svg#daily')
			.append('g')
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		var data = stats.data;
        data.forEach(function(d) {
			d.date = chrt.parse_time(d.date);
			});
        console.log(type,data);
		x.domain(d3.extent(data, function(d) { return chrt.parse_time(d.date); }));
		y.domain([0, d3.max(data, function(d) {
			  return Math.max(d['judge-' + type], d['stanton-' + type], d['leader-' + type]); })]);

		// Add the X Axis
		svg.append("g")
			.attr("transform", "translate(0," + height + ")")
			.call(d3.axisBottom(x));

		// Add the Y Axis
		svg.append("g")
			.call(d3.axisLeft(y));

		svg.append('path')
            .data([data])
            .attr('class', 'line line0')
            .attr('d', l0);
		
		svg.append('path')
            .data([data])
            .attr('class', 'line line1')
            .attr('d', l1);
		
		svg.append('path')
            .data([data])
            .attr('class', 'line line2')
            .attr('d', l2);

	},
    on_load: function() {
        chrt.parse_time = d3.timeParse('%Y-%m-%d');
		chrt.build_chart();
    },
    init: function(year) {
		//utils.add_js('http://interactive.nydailynews.com/js/d3/d3.v4.min.js', chrt.on_load);
    }
}

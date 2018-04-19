// UTILS
var utils = {
    ap_numerals: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'],
    months: ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'],
    ap_months: ['Jan.', 'Feb.', 'March', 'April', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'],
    ap_date: function(date) {
        // Given a date such as "2018-02-03" return an AP style date.
        var this_year = new Date().getFullYear();
        var parts = date.split('-')
        var day = +parts[2];
        var month = this.ap_months[+parts[1] - 1];
        if ( this_year == +parts[0] ) return month + ' ' + day;
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
    add_zeros: function(i, digits) {
        // Fill decimals with zeros to the number of digits. Returns a string.
        var str = '' + +i;
        var len = str.length - 2;   // The "2" is the "0." in the string.

        while ( len <= digits ) {
            str = str + '0';
            len = str.length - 2;
        }
        // Axe the leading zero, if there is one
        str = str.replace('0.', '.');
        return str;
    },
    parse_date_str: function(date) {
        // date is a datetime-looking string such as "2017-07-25"
        // Returns a date object.
        if ( typeof date !== 'string' ) return Date.now();

        var date_bits = date.split(' ')[0].split('-');

        // We do that "+date_bits[1] - 1" because months are zero-indexed.
        var d = new Date(date_bits[0], +date_bits[1] - 1, date_bits[2], 0, 0, 0);
        return d;
    },
    parse_date: function(date) {
        // date is a datetime-looking string such as "2017-07-25"
        // Returns a unixtime integer.
        var d = this.parse_date_str(date);
        return d.getTime();
    },
    days_between: function(from, to) {
        // Get the number of days between two dates. Returns an integer. If to is left blank, defaults to today.
        // Both from and to should be strings 'YYYY-MM-DD'.
        // Cribbed from https://stackoverflow.com/questions/542938/how-do-i-get-the-number-of-days-between-two-dates-in-javascript
        if ( to == null ) to = new Date();
        else to = this.parse_date_str(to);
        from = this.parse_date_str(from);
        var days_diff = Math.floor((from-to)/(1000*60*60*24));
        return days_diff;
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
    stats: ['avg', 'hrs', 'rbis', 'ops'],
    update_table: function() {
        // Update the Slugger Stats table with the latest numbers from the spreadsheet.
        // The latest will be in stats.latest.
        var fields = ['-avg', '-hrs', '-rbis', '-ops'];
        var players = ['judge', 'stanton'];
        for ( var i = 0; i < fields.length; i ++ ) {
            for ( var j = 0; j < players.length; j ++ ) {
                field = players[j] + fields[i];
                if ( fields[i] == '-avg' || fields[i] == '-ops' ) {
                    document.getElementById(field).textContent = utils.add_zeros(stats.latest[field], 2);
                }
                else {
                    document.getElementById(field).textContent = stats.latest[field];
                }

            }
        }
    },
    update_datestamp: function() {
        // Update the datestamp's time element.
        // We add one day to the date because if the stats are current through yesterday that means it was updated today, at least.
        var el = document.querySelector('.datestamp time');
        
        // Turn the date string (YYYY-MM-DD) into a date object so we can increment it one day.
        var d = stats.latest['date'].split('-');
        var latest = new Date(d[0], d[1], d[2]);
        latest.setDate(latest.getDate() + 1);
        var date_str = latest.getFullYear() + '-' + utils.add_zero(latest.getMonth()) + '-' + utils.add_zero(latest.getDate());
        el.textContent = utils.ap_date(date_str);
    },
    on_load: function() {
        chrt.init();
        stats.latest = stats.data[stats.data.length-1];
        stats.update_datestamp();
        stats.update_table();
        pg.latest = stats.latest;
        pg.init();
    },
    init: function(year) {
        if ( year == null ) year = 2018;
        // get_json takes three params: filepath, the object that's calling it, and a callback.
        //utils.get_json('test/yankee-derby-' + year + '.json', stats, this.on_load);
        utils.get_json('output/yankee-derby-' + year + '.json?' + utils.rando(), stats, this.on_load);
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
    descriptors: {
        'one-word': [
            ['narrow', 'slight', 'slim'],
            ['smallish', 'small', ''],
            ['respectable', 'healthy', 'decent', 'measurable'],
            ['sizable', 'significant', ''],
            ['meaty', 'monstrous', 'major'],
            ],
        'phrase': [
            [', but just barely,'],
            [' by a small margin,'],
            [' by a healthy margin,'],
            [' by a good amount,'],
            [' by a landslide,'],
        ],
        'lead': [
            ['is winning'],
            ['leads in'],
            ['holds a healthy advantage in'],
            ['dominates'],
            ['is crushing in'],
        ],
        'yikes': [['yikes', 'ouch', 'ugh', 'oof',]]
    },
    rando_descriptor(field, index, seed) {
        // Returns a random descriptor for descriptor fields that have multiple options.
        // This is based on a seed plus the date, so the descriptor will be the same for a whole day.
        if ( typeof seed === 'undefined' ) var seed = 0;
        var l = this.descriptors[field][index].length;
        var day_seed = new Date().getDate();


    },
    measure_diff: function(stat, diff) {
        // Take a stat and the difference between the two stats.
        // Return a value between 0 and 4 depending on how large the difference is between the two numbers.
        var index = 0;
        diff = +diff;
        if ( stat == 'avg' ) {
            if ( diff < .02 ) index = 0;
            else if ( diff < .05 ) index = 1;
            else if ( diff < .09 ) index = 2;
            else if ( diff < .15 ) index = 3;
            else index = 4;
        }
        if ( stat == 'ops' ) {
            if ( diff < .05 ) index = 0;
            else if ( diff < .1 ) index = 1;
            else if ( diff < .15 ) index = 2;
            else if ( diff < .3 ) index = 3;
            else index = 4;
        }
        if ( stat == 'hrs' ) {
            if ( diff < 3 ) index = 0;
            else if ( diff < 5 ) index = 1;
            else if ( diff < 9 ) index = 2;
            else if ( diff < 13 ) index = 3;
            else index = 4;
        }
        if ( stat == 'rbis' ) {
            if ( diff < 5 ) index = 0;
            else if ( diff < 9 ) index = 1;
            else if ( diff < 13 ) index = 2;
            else if ( diff < 20 ) index = 3;
            else index = 4;
        }
        if ( stat == 'diff' ) {
            if ( diff < 3 ) index = 0;
            else if ( diff < 6 ) index = 1;
            else if ( diff < 9 ) index = 2;
            else if ( diff < 12 ) index = 3;
            else index = 4;
        }

        return index;
    },
    build_stat: function(stat) {
        // Build sentence comparing the two sluggers and populate the assigned id's
        // There are two types: A tie, and a lead.
        var numbers = {
            Stanton: +this.l['stanton-' + stat],
            Judge: +this.l['judge-' + stat]
        };

        var diff = numbers['Stanton'] - numbers['Judge'];
        if ( diff < 0 ) diff *= -1;

        // We publish the difference in the average section, and to do that we need to run a calculation
        // and turn it into a string.
        var diff_str = '';
        if ( stat == 'avg' ) {
            var diff_str = '' + Math.round(1000 * diff);
            document.getElementById('avg-number-diff').textContent = diff_str;
        }

        added_zeros = 2;
        if ( stat == 'avg' || stat == 'ops' ) {
            numbers['Stanton'] = utils.add_zeros(numbers['Stanton'], added_zeros);
            numbers['Judge'] = utils.add_zeros(numbers['Judge'], added_zeros);
        }
        var pluralize = '' ;
        if ( stat == 'avg' ) pluralize = '’s';

        var type = 'leader';
        if ( numbers['Stanton'] == numbers['Judge'] ) {
            type = 'tie';
            // Switch the hidden ones
            document.getElementById(stat + '-has-leader').setAttribute('class', 'hide');
            document.getElementById(stat + '-tied').setAttribute('class', '');
            document.getElementById(stat + '-number').textContent = numbers['Stanton'];
            this.scoreboard['tie'] += 1;
        }
        else {
            var leader = 'Stanton';
            var follower = 'Judge';
            if ( numbers['Judge'] > numbers['Stanton'] ) {
                leader = 'Judge';
                follower = 'Stanton';
            }
            document.getElementById(stat + '-leader').textContent = leader + pluralize;
            document.getElementById(stat + '-leader-number').textContent = numbers[leader];
            document.getElementById(stat + '-follower').textContent = follower + pluralize;
            document.getElementById(stat + '-follower-number').textContent = numbers[follower];

            // Descriptors
            diff_measure = this.measure_diff(stat, diff);
            if ( stat == 'avg' ) {
                var desc = this.descriptors['one-word'][diff_measure][0];
                if ( desc !== '' ) desc = 'a ' + desc;
                document.getElementById(stat + '-desc').textContent = desc;
            }
            else if ( stat == 'ops' || stat == 'hrs' ) {
                var desc = this.descriptors['phrase'][diff_measure][0];
                document.getElementById(stat + '-desc').textContent = desc;
            }

			// Sometimes if the batting average is really low we comment on that.
			if ( stat == 'avg' ) {
                //if ( numbers[leader] < .2 ) document.getElementById('avg-leader-yikes').textContent = 
                //if ( numbers[follower] < .2 ) console.log('ya');
            }

            // Tally the winners
            this.scoreboard[leader] += 1;
            this.diff_scoreboard[leader] += diff_measure;
        }
        
    },
    scoreboard: {
        'tie': 0,
        'Stanton': 0,
        'Judge': 0
    },
    diff_scoreboard: {
        'Stanton': 0,
        'Judge': 0
    },
    full_names: {
        'Stanton': 'Giancarlo Stanton',
        'Judge': 'Aaron Judge'
    },
    build_lead: function() {
        // OVERALL
        // Build the first clause of the paragraph based on who's leading and by how much.
        // 
        // Handle a tie
        if ( this.scoreboard['Stanton'] == this.scoreboard['Judge'] ) {
            document.getElementById('has-leader').setAttribute('class', 'hide');
            document.getElementById('tied').setAttribute('class', '');
            return true;
        }
        var leader = 'Judge';
        if ( this.scoreboard['Stanton'] > this.scoreboard['Judge'] ) leader = 'Stanton';
        var diff_measure = this.measure_diff('diff', this.diff_scoreboard[leader]);
        document.getElementById('desc').textContent = this.descriptors['lead'][diff_measure];
        document.getElementById('leader').textContent = this.full_names[leader];
        return true;
    },
    init: function() {
        this.l = stats.latest;
        for ( i = 0; i < 4; i++ ) {
            //var sentence_type = this.get_type(stats.stats[i]);
            this.build_stat(stats.stats[i]);
        }
        this.build_lead();
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
    player_key: {
        judge: 'Judge',
        stanton: 'Stanton',
        leader: 'MLB leader',
        'judge-stanton': 'Judge & Stanton',
        'maris-mantle': 'Maris & Mantle'
    },
    type_key: {
        hrs: 'home runs',
        rbis: 'RBIs',
        avg: 'batting average',
        ops: 'OPS'
    },
    type_key_axis: {
        hrs: 'Home runs',
        rbis: 'RBIs',
        avg: 'Batting average',
        ops: 'On-base plus slugging'
    },
    y_axis_key_offset: {
        hrs: 50,
        rbis: 25,
        avg: 70,
        ops: 100 
    },
    y_max: {
        avg: 1,
        ops: 2
    },
    ties: [],
    check_for_ties: function() {
        // Loop through the latest record and see if there are any ties.
        // If so, add the field to the ties array.
        chrt.ties = [];
        var fields = Object.keys(chrt.type_key);
        var l = fields.length;
        var latest = stats.data[stats.data.length - 1];
        // latest will look something like judge-hrs: "3", stanton-hrs: "3", leader-hrs: "6", judge-rbis: "8", …}
        
        //var players = ['judge', 'stanton'];
        for ( var i = 0; i < l; i ++ ) {
            var field = fields[i];
            if ( +latest['judge-' + field] == +latest['stanton-' + field] ) chrt.ties.push(field);
        }
    },
    slug_to_label: function(slug, record) {
        // Take a slug, such as "judge-hrs", and turn that into a human-readable string, "Judge home runs"
        // In certain situations include the latest value for that statistic.
        // If there's a tie between Judge and Stanton, write "TIE" instead of the label.
        var bits = slug.split('-');
        var player = bits[0];
        var field = bits[1];
        var label = this.player_key[player] + ' ' + this.type_key[field];
        if ( player === 'leader' && typeof record !== 'undefined' && typeof record['value'] !== 'undefined' ) {
            // Special treatment goes here
            var s = record['value']['value'];
            if ( field == 'avg' || field == 'ops' ) {
                s = utils.add_zeros(s, 2);
            }
            label += ' (' + s + ')';
        }
        // Check for ties.
        if ( player !== 'leader' && this.ties.indexOf(field) !== -1 ) label = 'Tie';
        return label;
    },
    button_click: function(btn) {
        // The event handler for button clicking.
        //
        // If it's a click on an already-active button don't do anything.
        if ( btn.getAttribute('class') == 'active' ) return false;

        // Clear all the buttons 
        var active = document.querySelectorAll('button.active');
        Array.prototype.forEach.call(active, function(el, i) { el.setAttribute('class', ''); });

        //var el = document.getElementById(btn.id);
        utils.add_class(btn, 'active');
        this.load_chart(btn.id);
        document.location.hash = '#stat-' + btn.id;
    },
    clear_chart: function() {
        // Remove the things in the chart
        document.getElementById('daily').innerHTML = '';
    },
    load_chart: function(type) {
        // The machinations to hide and load a chart. Used by the buttons and the permalink.
        this.clear_chart();
        this.build_chart(type);
    },
    load_chart_from_hash: function(hash) {
        // Load a particular chart. This is a wrapper function used when someone permalinks a chart.
        // Options: stat-hrs / stat-rbis / stat-avg / stat-ops
        var bits = hash.split('-');
        var type = bits[1];
        if ( bits.length > 2 ) type = bits.slice(1).join('-');
        console.log("TYPE", type);
        this.load_chart(type);
        document.getElementById('avg').setAttribute('class', '');
        document.getElementById(type).setAttribute('class', 'active');
        window.setTimeout(function() { document.getElementById('bottom-chart').scrollIntoView() }, 1000);
    },
    build_maris_mantle_comparison: function() {
        // Put together the home run data from the two sluggers we need to compare
        // against the Maris / Mantle home run totals.
        // Also, adjust the Maris / Mantle dates to be comparable against Stanton / Judge.
        //
        // The maris-mantle data is in chrt.data, and is keyed to the dates.
        // The slugger data is in stats.data.
        // We want to return a new array.
        var data = [];
        var a1 = chrt.data;
        var a2 = stats.data;
        var l = a2.length;
        var stanton_judge = 0;
        var maris_mantle = 0;
        for ( var i = 0; i < l; i ++ ) {
            // Yes, if the array is undefined we take whatever was the previous value and use that.
            if ( typeof a2[i] !== 'undefined' ) {
                stanton_judge = +a2[i]['stanton-hrs'] + +a2[i]['judge-hrs'];
                date_1961 = a2[i]['date'].replace('2018', '1961');
            }
            console.log(date_1961);
            if ( date_1961 in a1 ) maris_mantle = a1[date_1961]['maris-mantle-hrs'];
            var record = {
                date: a2[i]['date'],
				'stanton_judge-hrs': stanton_judge,
				'maris_mantle-hrs': maris_mantle
            };
            data.push(record);
        }
        return data;
    },
    build_chart: function(type) {
        // Adapted from https://bl.ocks.org/mbostock/3884955
        if ( type == null ) type = 'maris-mantle';
        if ( type == null ) type = 'avg';
        chrt.type = type;
        var margin = { 'left': 50, 'top': 10 };
        var width = 800;
        var height = 370;

        var x = d3.scaleTime().range([0, width]),
            y = d3.scaleLinear().range([height, 0])
            z = d3.scaleOrdinal().domain(stats.data).range(['#003087', '#E4002C', '#aaa']);

		// y-axis tick text formatting
        var s = d3.formatSpecifier("f");
		s.precision = d3.precisionFixed(0);
		if ( type === 'avg' || type === 'ops' ) s.precision = d3.precisionFixed(0.001);
        var ticks = y.ticks(10),
            tickFormat = y.tickFormat(10, s);

        var line = d3.line()
            //.curve(d3.curveBasis)
            .x(function(d) { /*console.log(d.date, x(d.date), d);*/ return x(d.date); })
            .y(function(d) { return y(d.value); });
        var svg = d3.select('svg#daily'),
             g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        var data = stats.data;
        if ( type == 'maris-mantle' ) data = this.build_maris_mantle_comparison();
        var keys = Object.keys(data[0]).slice(1);
        var slugger_stats = keys.map(function(id) {
            // Zero out the chart values for the inactive fields
            if ( id.indexOf(type) === -1 ) return { id: id, values: [] }; 

            return {
                id: id,
                values: data.map(function(d) {
                    return { date: chrt.parse_time(d.date), value: d[id]};
                })
            };
        });
        x.domain(d3.extent(this.season_dates, function(d) { return chrt.parse_time(d); }));
        
        // We set the max at 1 for batting average and OPS, and [puts on shades] this is how we do it [cue drums]
        if ( typeof this.y_max[type] !== 'undefined' ) y.domain([0, this.y_max[type]]);
        else {
            y.domain([0,
                d3.max(slugger_stats, function(c) { return d3.max(c.values, function(d) { return +d.value + 5; }); })
            ]);
        }
        z.domain(slugger_stats.map(function(c) { return c.id; }));
        //y.domain([0, d3.max(data, function(d) { 
        //    return Math.max(d['judge-' + type], d['stanton-' + type], d['leader-' + type]); })]);

        g.append("g")
            .attr('class', 'axis axis--x')
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        g.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(y).ticks(10,s))
            .append('text')
                .attr('x', this.y_axis_key_offset[type])
                .attr('dx', 5)
                .attr('fill', '#333')
                .text(this.type_key_axis[type]);

        var lines = g.selectAll('.lines')
            .data(slugger_stats)
            .enter().append('g')
                .attr('class', 'line-group');

        lines.append('path')
            .attr('class', 'line')
            .attr('stroke-width', '3px')
            .attr('fill', 'none')
            .attr('display', function(d) { if ( d.id.indexOf(type) === -1 ) return 'none'; else return ''; })
            .attr('d', function(d) { return line(d.values); })
            .style('stroke', function(d) { return z(d.id); });

        lines.append('text')
            .datum(function(d) { return { id: d.id, value: d.values[d.values.length - 1]}; })
            .attr('transform', function(d) {
                if ( typeof d.value === 'undefined' ) return '';
                return 'translate(' + x(d.value.date) + ',' + y(d.value.value) + ')';
                })
            .attr('x', 3)
            .attr('dy', 4)
            .style("font", "14px sans-serif")
            .attr('display', function(d) { if ( d.id.indexOf(type) === -1 ) return 'none'; else return ''; })
            .text(function(d) { return chrt.slug_to_label(d.id, d) });
    },
    on_load: function() {
        chrt.parse_time = d3.timeParse('%Y-%m-%d');
        chrt.format_time = d3.timeFormat('%B %e');
        chrt.build_chart();
        chrt.check_for_ties();
        if ( document.location.hash.indexOf('#stat') !== -1 ) chrt.load_chart_from_hash(document.location.hash.substr(1));
    },
    init: function(year) {
        //utils.add_js('http://interactive.nydailynews.com/js/d3/d3.v4.min.js', chrt.on_load);
        if ( is_mobile ) this.season_dates = season_dates_all.splice(0, 160);
        else this.season_dates = season_dates_all.splice(0, 30);
        utils.get_json('static/maris-mantle-keyed-1961.json', chrt, this.on_load);
    }
}
var season_dates_all = ['2018-03-29', '2018-03-30', '2018-03-31', '2018-04-01', '2018-04-02', '2018-04-03', '2018-04-04', '2018-04-05', '2018-04-06', '2018-04-07', '2018-04-08', '2018-04-09', '2018-04-10', '2018-04-11', '2018-04-12', '2018-04-13', '2018-04-14', '2018-04-15', '2018-04-16', '2018-04-17', '2018-04-18', '2018-04-19', '2018-04-20', '2018-04-21', '2018-04-22', '2018-04-23', '2018-04-24', '2018-04-25', '2018-04-26', '2018-04-27', '2018-04-28', '2018-04-29', '2018-04-30', '2018-05-01', '2018-05-02', '2018-05-03', '2018-05-04', '2018-05-05', '2018-05-06', '2018-05-07', '2018-05-08', '2018-05-09', '2018-05-10', '2018-05-11', '2018-05-12', '2018-05-13', '2018-05-14', '2018-05-15', '2018-05-16', '2018-05-17', '2018-05-18', '2018-05-19', '2018-05-20', '2018-05-21', '2018-05-22', '2018-05-23', '2018-05-24', '2018-05-25', '2018-05-26', '2018-05-27', '2018-05-28', '2018-05-29', '2018-05-30', '2018-05-31', '2018-06-01', '2018-06-02', '2018-06-03', '2018-06-04', '2018-06-05', '2018-06-06', '2018-06-07', '2018-06-08', '2018-06-09', '2018-06-10', '2018-06-11', '2018-06-12', '2018-06-13', '2018-06-14', '2018-06-15', '2018-06-16', '2018-06-17', '2018-06-18', '2018-06-19', '2018-06-20', '2018-06-21', '2018-06-22', '2018-06-23', '2018-06-24', '2018-06-25', '2018-06-26', '2018-06-27', '2018-06-28', '2018-06-29', '2018-06-30', '2018-07-01', '2018-07-02', '2018-07-03', '2018-07-04', '2018-07-05', '2018-07-06', '2018-07-07', '2018-07-08', '2018-07-09', '2018-07-10', '2018-07-11', '2018-07-12', '2018-07-13', '2018-07-14', '2018-07-15', '2018-07-16', '2018-07-17', '2018-07-18', '2018-07-19', '2018-07-20', '2018-07-21', '2018-07-22', '2018-07-23', '2018-07-24', '2018-07-25', '2018-07-26', '2018-07-27', '2018-07-28', '2018-07-29', '2018-07-30', '2018-07-31', '2018-08-01', '2018-08-02', '2018-08-03', '2018-08-04', '2018-08-05', '2018-08-06', '2018-08-07', '2018-08-08', '2018-08-09', '2018-08-10', '2018-08-11', '2018-08-12', '2018-08-13', '2018-08-14', '2018-08-15', '2018-08-16', '2018-08-17', '2018-08-18', '2018-08-19', '2018-08-20', '2018-08-21', '2018-08-22', '2018-08-23', '2018-08-24', '2018-08-25', '2018-08-26', '2018-08-27', '2018-08-28', '2018-08-29', '2018-08-30', '2018-08-31', '2018-09-01', '2018-09-02', '2018-09-03', '2018-09-04', '2018-09-05', '2018-09-06', '2018-09-07', '2018-09-08', '2018-09-09', '2018-09-10', '2018-09-11', '2018-09-12', '2018-09-13', '2018-09-14', '2018-09-15', '2018-09-16', '2018-09-17', '2018-09-18', '2018-09-19', '2018-09-20', '2018-09-21', '2018-09-22', '2018-09-23', '2018-09-24', '2018-09-25', '2018-09-26', '2018-09-27', '2018-09-28', '2018-09-29', '2018-09-30'];

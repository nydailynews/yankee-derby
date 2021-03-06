// UTILS
var utils = {
    ap_numerals: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'],
    get_ap_numeral: function(i) {
        if ( +i < 11 ) return this.ap_numerals[+i];
        return i;
    },
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
    rando_by_day: function(max) {
        // Generate a semi-random integer from zero to the max argument,
        // based on what the date is.
        var d = new Date().getDate();
        return d % +max;
    },
    get_rando_by_day: function(arr) {
        // Given an array, return a random item from it based on today's date.
        var l = arr.length;
        var index = this.rando_by_day(l);
        return arr[index];
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

        if ( len < digits ) {
            while ( len <= digits ) {
                str = str + '0';
                len = str.length - 2;
            }
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
        pathing: ''
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
    fields: ['avg', 'hrs', 'rbis', 'ops'],
    players: ['judge', 'stanton', 'leader'],
    update_table: function() {
        // Update the Slugger Stats table with the latest numbers from the spreadsheet.
        // The latest will be in stats.latest.
        var fields = stats.fields;
        var players = ['judge', 'stanton'];
        for ( var i = 0; i < fields.length; i ++ ) {
            for ( var j = 0; j < players.length; j ++ ) {
                field = players[j] + '-' + fields[i];
                if ( document.getElementById(field) !== null ) {
                    if ( fields[i] == 'avg' || fields[i] == 'ops' ) {
                        document.getElementById(field).textContent = utils.add_zeros(stats.latest[field], 2);
                    }
                    else {
                        document.getElementById(field).textContent = stats.latest[field];
                    }
                }
            }
        }
    },
    update_datestamp: function(record) {
        // Update the datestamp's time element.
        // We add one day to the date because if the stats are current through yesterday that means it was updated today, at least.
        var el = document.querySelector('.datestamp time');
        
        // Turn the date string (YYYY-MM-DD) into a date object so we can increment it one day.
        // Must account for the month handling of javascript's Date object -- "04" is May, "03" is April.
        if ( record == null ) var d = stats.latest['date'].split('-');
        else var d = record['date'].split('-');

        var latest = new Date(d[0], +d[1] - 1, d[2]);
        latest.setDate(latest.getDate() + 1);
        var date_str = latest.getFullYear() + '-' + utils.add_zero(latest.getMonth() + 1) + '-' + utils.add_zero(latest.getDate());
        el.textContent = utils.ap_date(date_str);
    },
    on_load: function() {
        // ** TODO: Rewrite this function so all the other objects aren't triggered here.
        // Triggering the inits of the other objects here also makes this app impossible to configure for any other year than 2018.
        chrt.init(stats.year);
        stats.latest_index = stats.data.length-1;
        stats.latest = stats.data[stats.latest_index];
        stats.update_datestamp();
        stats.update_table();
        pg.latest = stats.latest;
        pg.init(stats.year);
        lt.init(stats.year);
    },
    init: function(year) {
        if ( year == null ) year = 2018;
        this.year = year;
        // get_json takes three params: filepath, the object that's calling it, and a callback.
        //utils.get_json('test/yankee-derby-' + year + '.json', stats, this.on_load);
        utils.get_json(this.config.pathing + 'output/yankee-derby-' + year + '.json?' + utils.rando(), stats, this.on_load);
    }
}

// SENTENCES
// This object handles writing sentences about the stats.
// We're going to use the sentences in widget-sentence.html.
var sentence = {
    config: {
        pathing: '../../',
        pathing: '',
        player: '',
        field: ''
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
    },
    random: function(max) {
        return Math.floor(Math.random() * max);
    },
    fields: stats.fields, //['avg', 'hrs', 'rbis', 'ops'],
    players: stats.players, //['judge', 'stanton', 'leader'],
    sentence_types: ['since_last', 'to_leader', 'to_other', 'to_self'],
    sentence_types: ['since_last', 'to_self', 'to_leader'],
    since_last: function(player, field) {
        // Calculate how many days it has been since something happened.
        var current;
        var days = 0;
        var key = player + '-' + field;
        var now = this.data[this.data.length - 1][key];
        for ( var i = this.data.length - 1; i --; i >= 0 ) {
            days ++;
            current = this.data[i][key];
            console.log(now, current, days);
            if ( now !== current ) break;
        }
        return days;
    },
    write_sentence: function(player, field) {
        // Write a sentence about one of the players’ stats.
        // Pass it zero arguments for it to generate a random sentence.
        // There are a few types of sentences it can generate: Days since last home run / RBI, or stat comparison (to self, to opponent, to MLB leader)
        if ( player === null ) {
            player = this.players[this.random(this.players.length)];
            if ( player === 'leader' ) {
                while ( player === 'leader' ) {
                    player = this.players[this.random(this.players.length)];
                }
            }
        }
        if ( field === null ) field = this.fields[this.random(this.fields.length)];
        var days = 29;
        var url = 'http://interactive.nydailynews.com/project/yankees-sluggers-tracker/';
        var key = player + '-' + field;
        var leader_key = 'leader-' + field;
        var current = this.data[this.data.length - 1];

        var since_last = '';
        if ( ['hrs', 'rbis'].indexOf(field) !== -1 ) since_last = this.since_last(player, field);

        var type = this.sentence_types[this.random(this.sentence_types.length)];
        if ( since_last === '' && type === 'since_last' ) {
            while ( type === 'since_last' ) {
                type = this.sentence_types[this.random(this.sentence_types.length)];
            }
        }

        console.log(player, field, type);
        var name_full = pg.full_names[player];
        var field_full_singular = chrt.type_key_axis[field];
        var field_full = chrt.type_key_axis[field];
        if ( ['RBIs', 'Home runs'].indexOf(field_full) !== -1 ) var field_full_singular = field_full.slice(0, -1);
        if ( ['On-base plus slugging', 'Batting average', 'Home run'].indexOf(field_full_singular) !== -1 ) {
            field_full = field_full.charAt(0).toLowerCase() + field_full.substr(1);
            field_full_singular = field_full.charAt(0).toLowerCase() + field_full_singular.substr(1);
        }
        var s = '';

        if ( type === 'since_last' ) {
            var ess = 's';
            if ( since_last === 1 ) ess = '';
            s = 'It has been ' + utils.get_ap_numeral(since_last) + ' day' + s + ' since ' + name_full + '’s last ' + field_full_singular + '.';
        }
        else if ( type === 'to_self' ) {
            // We comparing performance to self, there are multiple types here: Previous month and specific month.
            // We're building previous month first.
            compare = this.compare_stat(player, field, days);
            s = name_full;
            if ( ['hrs', 'rbis'].indexOf(field) !== -1 ) s += ' has ' + utils.get_ap_numeral(compare['diff']) + ' ' + field_full + ' in the previous ' + ( days + 1 ) + ' days.';
            else {
                var points = Math.floor(compare['diff'] * 1000);
                var clause = ' points in the last ' + ( days + 1 ) + ' days, from ' + utils.add_zeros(compare['from'][key], 3) + ' to ' + utils.add_zeros(current[key], 3) + '.';
                var updown = 'is up ' + utils.get_ap_numeral(points) + clause;
                if ( compare['diff'] > current[key] ) updown = 'is down ' + utils.get_ap_numeral(points) + clause;
                else if ( compare['diff'] === current[key] ) updown = 'stayed the same in the last ' + ( days + 1 ) + ' days.';

                s += '’s ' + field_full + ' ' + updown;
            }
        }
        else if ( type === 'to_leader' ) {
            compare = this.compare_two(player, 'leader', field, days);
            var leads = 'leads';
            if ( compare['lead'] === 'two' ) leads = 'trails';
            else if ( compare['lead'] === 'tied' ) leads = 'is tied with';
            s = name_full + ' ' + leads + ' the MLB leader';
            if ( ['hrs', 'rbis'].indexOf(field) !== -1 ) s += ' by ' + utils.get_ap_numeral(Math.abs(compare['diff'])) + ' ' + field_full;
            else {
                var points = Math.floor(Math.abs(compare['diff'] * 1000));
                var ess = 's';
                if ( points === 1 ) ess = '';
                s += ' in ' + field_full + ' by ' + utils.get_ap_numeral(points) + ' point' + ess;
                compare['one'] = utils.add_zeros(compare['one'], 3);
                compare['two'] = utils.add_zeros(compare['two'], 3);
            }
            s += ', ' + compare['one'] + ' to ' + compare['two'] + '.';
        }

        s = s.replace('Aaron Judge', '<a href="' + url + '" target="_top">Aaron Judge</a>');
        s = s.replace('Giancarlo Stanton', '<a href="' + url + '" target="_top">Giancarlo Stanton</a>');
        // Clean up batting average / OPS leading-zeroes
        s = s.replace(/0\./g, '.');

        return "SLUGGER STAT: " + s;
    },
    compare_two: function(player_one, player_two, field, days, offset) {
        // Given two players and a field (days and offset are set for later), return who's ahead and by how much.
        if ( offset === undefined ) offset = 1;
        var key_one = player_one + '-' + field;
        var key_two = player_two + '-' + field;
        var one = this.latest[key_one];
        var two = this.latest[key_two];
        var diff = one - two;
        var lead = 'one';
        if ( two > one ) lead = 'two';
        else if ( two === one ) lead = 'tied';
        var d = { lead: lead, diff: diff, one: one, two: two }
        console.log(d);
        return d;
    },
    compare_stat: function(player, field, days, offset) {
        // Given a player, a field and the number of days, return how a stat has changed, as well as the two records being compared.
        if ( offset === undefined ) offset = 1;
        var key = player + '-' + field;
        var from_index = sentence.data_l - ( offset + days );
        var to_index = sentence.data_l - offset;
        var from = sentence.data[from_index];
        var to = sentence.data[to_index];

        var diff = to[key] - from[key];
        var dates = [from['date'], to['date']];
        return { 'from': from, 'to': to, 'diff': diff, 'dates': dates };
    },
    update_sentence: function() {
        // Write the sentence to the place where the sentence goes.
        var player = null, field = null;
        if ( this.config.player !== '' ) {
            player = this.config.player;
            utils.add_class(document.getElementById('stat-tracker-sentence'), player);
        }
        if ( this.config.field !== '' ) field = this.config.field;

        var sentence = this.write_sentence(player, field);
        var el = document.querySelector('#stat-tracker-sentence p');
        el.innerHTML = sentence;
    },
    on_load: function() {
        sentence.data_l = sentence.data.length;
        sentence.latest_index = sentence.data.length - 1;
        sentence.latest = sentence.data[sentence.latest_index];
        
        sentence.update_sentence();
    },
    init: function(year, config) {
		if ( year == null ) year = 2018;
        if ( config !== null ) this.update_config(config);
        if ( typeof stats.data === 'undefined' ) utils.get_json(this.config.pathing + 'output/yankee-derby-' + year + '.json?' + utils.rando(), sentence, this.on_load);
        else {
            this.data = stats.data;
            this.on_load();
        }
    }
}

// LATEST GRAF
// This object handles the graf that tells us the latest game info
var lt = {
    config: {
        pathing: '../../'
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
    },
    publish_latest: function(rec) {
        // Take a game record object and put it on the page.
        var parent = document.getElementById('slugger-stats');
        var el = document.createElement('section');
        el.id = 'gamer';
        var blurb = lt.write_blurb(rec);
        el.innerHTML = '<h2>Yesterday’s Game</h2>\n <p>' + blurb + '</p>';
        parent.insertBefore(el, parent.firstChild);
    },
    write_blurb: function(rec) {
        // Turn a game record object into a paragraph.
        // An object looks something like this:
        // date: "2018-05-08"
        // gamer-headline: "Yankees move into tie atop AL East with 3-2 win over Red Sox"
        // gamer-url: "http://www.nydailynews.com/sports/baseball/yankees/yankees-move-tie-atop-al-east-3-2-win-red-sox-article-1.3979129"
        // games-back-division: ""
        // home-game: "1"
        // in-division: "1"
        // opponent-score: "2"
        // record-last-ten: ""
        // streak: "7"
        // total-losses: "10"
        // total-wins: "25"
        // win: "1"
        // yankees-score: "3"
        var html = 'Yankees fall ' + rec['opponent-score'] + '-' + rec['yankees-score'] + '.';
        var stats_blurb = this.write_stats_blurb(1);
        if ( +rec['yankees-score'] > +rec['opponent-score'] ) html = 'Yankees win ' + rec['yankees-score'] + '-' + rec['opponent-score'] + '.';
        if ( rec['gamer-url'] != '' ) html += ' Game story: <a href="' + rec['gamer-url'] + '">' + rec['gamer-headline'] + '</a>.'; 
        return html;
    },
    write_stats_blurb: function(days_back) {
        // Returns a blurb describing how each of the sluggers have done in the last X days, where X is days_back and defaults to 1.
        if ( days_back == null ) days_back = 1;
        r = this.compare_stats(days_back);
        console.log(r);
    },
    compare_stats: function(days_back) {
        // Given a number of days back (defaults to 1), compare the sluggers stats against the latest full day of their stats.
        // Returns a record-like object similar to this:
        // judge-avg: "0.295"
        // judge-hrs: "8"
        // judge-ops: "0.968"
        // judge-rbis: "24"
        // leader-avg: "0.36"
        // leader-hrs: "13"
        // leader-ops: "1.261"
        // leader-rbis: "32"
        // stanton-avg: "0.237"
        // stanton-hrs: "9"
        // stanton-ops: "0.828"
        // stanton-rbis: "21"
        if ( days_back == null ) days_back = 1;
        var from = stats.data[stats.latest_index - +days_back];
        var to = stats.latest;

        var r = {};

        var fields = stats.fields;
        var players = stats.players;
        for ( var i = 0; i < fields.length; i ++ ) {
            for ( var j = 0; j < players.length; j ++ ) {
                field = players[j] + '-' + fields[i];
                r[field] = +to[field] - +from[field];
                
                // Sometimes when you subtract floats in javascript you get janky results such as -0.014000000000000012
                if ( -1 < r[field] && r[field] < 1 ) r[field] = Math.round(r[field] * 1000) / 1000;
            }
        }
        return r;
    },
    on_load: function() {
        // See if we have a record for today's or yesterday's game, and if we do, add it to the interactive.
        var yesterday = stats.latest['date'];
        var l = lt.data.length;
        var latest;
        for ( var i = 0; i < l; i ++ ) {
            if ( yesterday == lt.data[i]['date'] ) record = lt.data[i];
        }
        console.log(record);
        if ( record['opponent-score'] != '' ) lt.publish_latest(record);
    },
    init: function(year) {
        if ( year == null ) year = 2018;
        utils.get_json(this.config.pathing + 'feeds/json/yankees-games-' + year + '.json', lt, lt.on_load);
    }
}

// PARAGRAPH
// This object handles the comparison text
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
            ['sizable', 'significant', 'whopping', 'monster', 'meaty', ''],
            ['gigantic', 'monstrous', 'gargantuan'],
        ],
        'phrase': [
            [', but just barely,', '', ', by a little,',],
            [' by a small margin,', ''],
            [' by a healthy margin,', ''],
            [' by a good amount,', ''],
            [' by a landslide,', ''],
        ],
        'lead': [
            ['is winning'],
            ['leads in', 'is ahead in'],
            ['holds a healthy advantage in', 'is definitely winning', 'has a strong lead in'],
            ['dominates'],
            ['is crushing in'],
        ],
        'yikes': [['yikes', 'ouch', 'ugh', 'oof',]]
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
                var desc = utils.get_rando_by_day(this.descriptors['one-word'][diff_measure]);
                if ( desc !== '' ) desc = 'a ' + desc;
                document.getElementById(stat + '-desc').textContent = desc;
            }
            else if ( stat == 'ops' || stat == 'hrs' ) {
                var desc = utils.get_rando_by_day(this.descriptors['phrase'][diff_measure]);
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
        'Judge': 'Aaron Judge',
        'stanton': 'Giancarlo Stanton',
        'judge': 'Aaron Judge'
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
        document.getElementById('desc').textContent = utils.get_rando_by_day(this.descriptors['lead'][diff_measure]);
        document.getElementById('leader').textContent = this.full_names[leader];
        return true;
    },
    init: function() {
        this.l = stats.latest;
        for ( i = 0; i < 4; i++ ) {
            //var sentence_type = this.get_type(stats.fields[i]);
            this.build_stat(stats.fields[i]);
        }
        this.build_lead();
    }
}

// CHART
// This object handles the chart
var chrt = {
    config: {
        pathing: ''
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
        'stanton_judge': 'Judge & Stanton',
        'maris_mantle': 'Maris & Mantle'
    },
    type_key: {
        hrs: 'home runs',
        rbis: 'RBIs',
        avg: 'batting average',
        ops: 'OPS',
        'maris-mantle': 'home runs'
    },
    type_key_abbr: {
        hrs: 'HRs',
        rbis: 'RBIs',
        avg: 'AVG',
        ops: 'OPS',
        'maris-mantle': 'HRs'
    },
    type_key_axis: {
        hrs: 'Home runs',
        rbis: 'RBIs',
        avg: 'Batting average',
        ops: 'On-base plus slugging',
        'maris-mantle': 'Home runs'
    },
    y_axis_key_offset: {
        hrs: 50,
        rbis: 25,
        avg: 70,
        ops: 100,
        'maris-mantle': 50
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
        var latest = [];
        if ( typeof stats.data !== 'undefined' ) { console.log(stats.data); latest = stats.data[stats.data.length - 1]; }
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
        if ( bits.length > 2 ) field = bits.slice(1).join('-'); // This is for fields that have dashes in them, we've got one of those it's just the way it worked out.
        var label = this.player_key[player];
        if ( player === 'leader' ) label = this.player_key[player] + ' ' + this.type_key_abbr[field];
        if ( typeof record !== 'undefined' && typeof record['value'] !== 'undefined' ) {
            // Special treatment goes here
            var s = record['value']['value'];
            if ( field == 'avg' || field == 'ops' ) {
                s = utils.add_zeros(s, 2);
            }
            label += ' (' + s + ')';
        }
        // Check for ties.
        if ( player !== 'leader' && this.ties.indexOf(field) !== -1 ) {
            label = 'Tie';
            if ( field == 'maris-mantle' ) label += ' (' + s + ')';
        }
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
        this.load_chart(type);
        document.getElementById('hrs').setAttribute('class', '');
        document.getElementById(type).setAttribute('class', 'active');
        window.setTimeout(function() { document.getElementById('bottom-chart').scrollIntoView() }, 1000);
    },
    figcaption: {
        hrs: '',
        rbis: '',
        avg: '',
        ops: '',
        'maris-mantle': ''
    },
    build_tweet: function(link_text, tweet_text) {
        // Return markup suitable for a "TWEET THIS" link.
        // Markup will generally look like: <a target="_blank" href="https://twitter.com/intent/tweet?text=Here's something cool&url=http://interactive.nydailynews.com/&via=NYDNi&related=nydailynews,NYDNi">Tweet</a>
        var tt = tweet_text.trim().slice(0, -1).replace(/ +(?= )/g, '');
        tt = tt.replace('Giancarlo Stanton', '@Giancarlo818');
        tt = tt.replace('Aaron Judge', '@TheJudge44');
        tt = tt.replace(/(\r\n\t|\n|\r\t)/gm, '');
        tt = tt.replace(/  +/gm, ' ');
        tt = 'YANKEES SLUGGER TRACKER: ' + tt;
        tt = encodeURI(tt);
        var url = document.location.origin + document.location.pathname;
        //url = 'http://interactive.nydailynews.com/project/yankees-sluggers-tracker/';
        var href = 'https://twitter.com/intent/tweet?text=' + tt + '&url=' + url + '&via=NYDNi&related=NYDNSports,NYDNi';
        //var href = 'https://twitter.com/intent/tweet?text=' + tt + '&url=' + url + '';

        return '<a target="_blank" href="' + href + '">' + link_text + '</a>';
    },
    build_figcaption: function() {
        // Write the sentence and start on the tweet link that go into the figure element’s figcaption element.
        if ( this.type.indexOf('mantle') !== -1 ) return this.build_maris_mantle_caption();

        var el = document.querySelector('figure figcaption#daily-blurb');
        var markup_raw = document.getElementById(this.type + '-tied').textContent;
        if ( chrt.ties.indexOf(this.type) === -1 ) markup_raw = document.getElementById(this.type + '-has-leader').textContent; 

        markup = markup_raw.replace('Stanton', 'Giancarlo Stanton');
        markup = markup.replace('Judge', 'Aaron Judge');
        markup = markup.replace(', and', '.');
        markup = markup.replace('in OPS', 'In OPS');
        el.innerHTML = markup + this.build_tweet('⬅️ <em>tweet this</em>', markup);
        // ** TODO: Write a blurb about how far they are off of the MLB leader.
    },
    build_maris_mantle_caption: function() {
        // Write a custom caption for the Maris & Mantle chart
        var caption = 'Compare the M&M Boys’ historic 1961 home run totals (the Yankees season that year started April 14, 16 days after the 2018 Yankees season start date) against the Stanton & Judge home run totals for this season.';
        if ( document.getElementById('bottom-chart') ) {
            var el = document.querySelector('#bottom-chart p');
            el.textContent = caption;
            var el = document.querySelector('figure figcaption#daily-blurb');
            el.textContent = caption;
        }
        else if ( document.getElementById('standalone-chart') ) {
            var el = document.querySelector('#standalone-chart p');
            el.textContent = caption;
            this.build_maris_mantle_caption_detail();
        }
    },
    build_maris_mantle_caption_detail: function() {
        // This function is called on the standalone maris/mantle chart
        //if ( typeof stats.data === 'undefined' ) return false;
        var data = this.build_maris_mantle_comparison();
        var el = document.querySelector('figure figcaption#daily-blurb');
        var latest = data[data.length - 1];
        var caption = 'As of ' + utils.ap_date(latest['date']) + ', ';
        var diff = +latest['stanton_judge-maris-mantle'] - +latest['maris_mantle-maris-mantle'];
        var s = 's';
        if ( Math.abs(diff) === 1 ) s = '';

        if ( diff === 0 ) caption += 'Stanton and Judge are tied with Roger Maris and Mickey Mantle’s 1961 home run total.';
        else {
            if ( diff > 0 ) caption += 'Stanton and Judge are ' + utils.get_ap_numeral(diff) + ' home run' + s + ' ahead of Roger Maris and Mickey Mantle’s home run total in their historic 1961 season.';
            else caption += 'Roger Maris and Mickey Mantle lead Stanton and Judge by ' + utils.get_ap_numeral(Math.abs(diff)) + ' home run' + s + '.';
        }
            
        el.innerHTML = caption + this.build_tweet(' <em>tweet this</em>', caption);
        return diff;
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
            if ( date_1961 in a1 ) maris_mantle = a1[date_1961]['maris-mantle-hrs'];
            var record = {
                date: a2[i]['date'],
                'stanton_judge-maris-mantle': stanton_judge,
                'maris_mantle-maris-mantle': maris_mantle
            };
            data.push(record);
        }
        
        // Check for ties, make sure we haven't already checked before.
        if ( this.ties.indexOf('maris-mantle') === -1 ) {
            var l = data[data.length - 1];
            if ( l['maris_mantle-maris-mantle'] === l['stanton_judge-maris-mantle'] ) this.ties.push('maris-mantle');
        }
        return data;
    },
    build_chart: function(type) {
        // Adapted from https://bl.ocks.org/mbostock/3884955
        if ( type == null ) type = 'hrs';
        chrt.type = type;
        if ( type !== 'maris-mantle') document.querySelector('#bottom-chart p').textContent = this.original_caption;
        this.build_figcaption();
        var margin = { 'left': 50, 'top': 10 };
        var width = 800;
        if ( is_mobile ) width = 600;
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
        if ( type === 'maris-mantle' ) {
            this.build_maris_mantle_caption();
            data = this.build_maris_mantle_comparison();
            this.data_mantle = data;
        }
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
        chrt.check_for_ties();
        window.setTimeout(function() { chrt.build_chart(chrt.type) }, 1000);
        if ( document.location.hash.indexOf('#stat') !== -1 ) chrt.load_chart_from_hash(document.location.hash.substr(1));
    },
    init: function(year, config) {
        //utils.add_js('http://interactive.nydailynews.com/js/d3/d3.v4.min.js', chrt.on_load);
        if ( config !== null ) this.update_config(config);
        if ( is_mobile ) this.season_dates = season_dates_all;
        else this.season_dates = season_dates_all.splice(0, 150);
        
        if ( document.getElementById('bottom-chart') ) this.original_caption = document.querySelector('#bottom-chart p').textContent;

        // This fires on the Maris-Mantle standalone
        if ( typeof stats.data !== 'object' ) {
            var url = this.config.pathing + 'output/yankee-derby-' + year + '.json?' + utils.rando();
            utils.get_json(url, stats, 
                    function () { stats.update_datestamp(stats.data[stats.data.length - 1])}
                    );
        }
        utils.get_json(this.config.pathing + 'static/maris-mantle-keyed-1961.json', chrt, this.on_load);
    }
}
var season_dates_all = ['2018-03-29', '2018-03-30', '2018-03-31', '2018-04-01', '2018-04-02', '2018-04-03', '2018-04-04', '2018-04-05', '2018-04-06', '2018-04-07', '2018-04-08', '2018-04-09', '2018-04-10', '2018-04-11', '2018-04-12', '2018-04-13', '2018-04-14', '2018-04-15', '2018-04-16', '2018-04-17', '2018-04-18', '2018-04-19', '2018-04-20', '2018-04-21', '2018-04-22', '2018-04-23', '2018-04-24', '2018-04-25', '2018-04-26', '2018-04-27', '2018-04-28', '2018-04-29', '2018-04-30', '2018-05-01', '2018-05-02', '2018-05-03', '2018-05-04', '2018-05-05', '2018-05-06', '2018-05-07', '2018-05-08', '2018-05-09', '2018-05-10', '2018-05-11', '2018-05-12', '2018-05-13', '2018-05-14', '2018-05-15', '2018-05-16', '2018-05-17', '2018-05-18', '2018-05-19', '2018-05-20', '2018-05-21', '2018-05-22', '2018-05-23', '2018-05-24', '2018-05-25', '2018-05-26', '2018-05-27', '2018-05-28', '2018-05-29', '2018-05-30', '2018-05-31', '2018-06-01', '2018-06-02', '2018-06-03', '2018-06-04', '2018-06-05', '2018-06-06', '2018-06-07', '2018-06-08', '2018-06-09', '2018-06-10', '2018-06-11', '2018-06-12', '2018-06-13', '2018-06-14', '2018-06-15', '2018-06-16', '2018-06-17', '2018-06-18', '2018-06-19', '2018-06-20', '2018-06-21', '2018-06-22', '2018-06-23', '2018-06-24', '2018-06-25', '2018-06-26', '2018-06-27', '2018-06-28', '2018-06-29', '2018-06-30', '2018-07-01', '2018-07-02', '2018-07-03', '2018-07-04', '2018-07-05', '2018-07-06', '2018-07-07', '2018-07-08', '2018-07-09', '2018-07-10', '2018-07-11', '2018-07-12', '2018-07-13', '2018-07-14', '2018-07-15', '2018-07-16', '2018-07-17', '2018-07-18', '2018-07-19', '2018-07-20', '2018-07-21', '2018-07-22', '2018-07-23', '2018-07-24', '2018-07-25', '2018-07-26', '2018-07-27', '2018-07-28', '2018-07-29', '2018-07-30', '2018-07-31', '2018-08-01', '2018-08-02', '2018-08-03', '2018-08-04', '2018-08-05', '2018-08-06', '2018-08-07', '2018-08-08', '2018-08-09', '2018-08-10', '2018-08-11', '2018-08-12', '2018-08-13', '2018-08-14', '2018-08-15', '2018-08-16', '2018-08-17', '2018-08-18', '2018-08-19', '2018-08-20', '2018-08-21', '2018-08-22', '2018-08-23', '2018-08-24', '2018-08-25', '2018-08-26', '2018-08-27', '2018-08-28', '2018-08-29', '2018-08-30', '2018-08-31', '2018-09-01', '2018-09-02', '2018-09-03', '2018-09-04', '2018-09-05', '2018-09-06', '2018-09-07', '2018-09-08', '2018-09-09', '2018-09-10', '2018-09-11', '2018-09-12', '2018-09-13', '2018-09-14', '2018-09-15', '2018-09-16', '2018-09-17', '2018-09-18', '2018-09-19', '2018-09-20', '2018-09-21', '2018-09-22', '2018-09-23', '2018-09-24', '2018-09-25', '2018-09-26', '2018-09-27', '2018-09-28', '2018-09-29', '2018-09-30'];

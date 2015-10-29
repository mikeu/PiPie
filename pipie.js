var PiPie = (function (undefined) {
    var radius = 150;

    var color = d3.scale.category10();

    var digit_counts;

    var pie, path, arc;

    // Some of this updating and tweening is based on:
    //   http://codepen.io/orchard/pen/bltfm
    // Store the displayed angles in _current.
    // Then, interpolate from _current to the new angles.
    // During the transition, _current is updated in-place by d3.interpolate.
    function arcTween(a) {
        var i = d3.interpolate(this.orig, a);
        this.orig = i(0);
        return function(t) {
            return arc(i(t));
        };
    }

    function initial_pie (selector) {
        // Reset the animation and counts
        d3.select(selector)
            .selectAll('svg')
            .remove();
        digit_counts = [0,0,0,1,0,0,0,0,0,0]; // "pi = 3", initially

        // Create the SVG in the now-empty div, translated so that the origin
        // is at the centre of the circle
        var svg = d3.select(selector)
            .append('svg')
                .attr('width', 2*radius)
                .attr('height', 2*radius)
            .append('g')
                .attr('transform', 'translate(' + radius + ',' + radius + ')');

        // This will draw the arcs of the pie chart
        arc = d3.svg.arc()
            .outerRadius(radius);

        // This will calculate the angles to pass to arc
        pie = d3.layout.pie()
            .value(function (d) { return d; })
            .sort(null) // leave in their initial order

        path = svg.selectAll('path')
            .data(pie(digit_counts))
            .enter()
                .append('path')
                .attr('d', arc)
                .attr('fill', function (d, i) {
                    return color(i);
                })
                .each(function (d) { this.orig = d;});
    }

    function update_pie () {
        path.data(pie(digit_counts))
        path.transition().duration(500).attrTween("d", arcTween); // redraw the arcs
    }

    // Update the digit_counts by adding n digits, starting at position s
    function update_counts (n, s) {
        digits = PiMill.get_digits(n, s);
        n = digits.length; // In case we went past the end
        for (var i = 0; i < n; i++) {
            digit_counts[digits.charAt(i)]++;
        }
        return n;
    }

    function update_count (selector, n) {
        d3.select(selector).text(n);
    }

    function build_bins (n, steps) {
        var bins = [1];
        var added = 1; // The initial 3
        var step; // Size of the next step
        var base = Math.pow(n, 1/steps); // Use a logarithmic scale
        var next_level = base;
        for (var i = 1; i < steps - 1; i++) {
            step = Math.floor(next_level) - added;
            if (step < 1) {
                step = 1;
            }
            bins.push(step);
            added += step;
            next_level *= base;
        }
        bins.push(n - added);

        return bins;
    }

    return {
        go: function (sel_pie, sel_count, n, steps) {
            if (n === undefined) {
                n = 100;
            }
            if (steps === undefined) {
                steps = 10;
            }

            initial_pie(sel_pie);

            var bin_sizes = build_bins(n, steps);
            var bin = 1;
            var digits_used = 1;

            update_count(sel_count, digits_used);

            function iterate () {
                var added = update_counts(bin_sizes[bin], digits_used);
                digits_used += added;
                update_count(sel_count, digits_used);
                update_pie();
                if (++bin < bin_sizes.length) {
                    window.setTimeout(iterate, 500)
                }
            }
            iterate();
        }
    };
}());

/*
 * Based on the spigot algorithm, with code from
 *   http://stackoverflow.com/questions/4084571/implementing-the-spigot-algorithm-for-%CF%80-pi
 */
function act_on_pi_digits (n, f)
{
    var len = Math.floor(10*n/3) + 1;
    var A = [];

    for (var i = 0; i < len; i++)
    {
        A[i] = 2;
    }

    var nines = 0;
    var predigit = 0;

    for (var j = 1; j < n+1; ++j)
    {
        var q = 0;

        for (var i = len; i > 0; --i)
        {
            var x = Math.floor(10*A[i-1] + q*i);
            A[i-1] = Math.floor(x % (2*i - 1));
            q = Math.floor(x/(2*i - 1));
        }

        A[0] = q%10;
        q = Math.floor(q / 10);

        if (q == 9) {
            ++nines;
        }
        else if (q == 10) {
            f(predigit + 1);
            for (var k = 0; k < nines; ++k)
            {
                f(0);
            }
            predigit = 0;
            nines = 0;
        }
        else {
            f(predigit);
            predigit = q;
            while (nines > 0) {
                f(9);
                nines--;
            }

        }
    }

    f(predigit);

    // Empty the large array
    A.length = 0;
}

function build_pie (n, sel_pie, sel_pct)
{
    var complete_pct = d3.select(sel_pct);
    complete_pct.text('0%');

    var counts = [];
    var count = 0;
    for (var i = 0; i < 10; i++)
    {
        counts[i] = 0;
    }


    var radius = 150;

    var color = d3.scale.category10();

    var svg = d3.select(sel_pie)
        .append('svg')
            .attr('width', 2*radius)
            .attr('height', 2*radius)
        .append('g')
            .attr('transform', 'translate(' + radius + ',' + radius + ')');

    // This will draw the arcs of the pie chart
    var arc = d3.svg.arc()
        .outerRadius(radius);

    // This will calculate the angles to pass to arc
    var pie = d3.layout.pie()
        .value(function (d) { return d; })
        .sort(null) // leave in their initial order

    var path = svg.selectAll('path')
        .data(pie([0,0,0,1,0,0,0,0,0,0]))
        .enter()
            .append('path')
            .attr('d', arc)
            .attr('fill', function (d, i) {
                return color(i);
            })
            .each(function (d) { this.orig = d;});

    // Some of this updating and tweening is based on:
    //   http://codepen.io/orchard/pen/bltfm
    // Store the displayed angles in _current.
    // Then, interpolate from _current to the new angles.
    // During the transition, _current is updated in-place by d3.interpolate.
    function arcTween(a) {
        var i = d3.interpolate(this.orig, a);
        this.orig = i(0);
        return function(t) {
            return arc(i(t));
        };
    }

    ten_percent = Math.round(n / 10);
    var add_digit = function (m)
    {
        counts[m] +=1;
        count++;
        if (count % ten_percent == 0) {
            completion = Math.round(100 * count / n) + '%'
            complete_pct.text(completion);
            path.data(pie(counts))
            path.transition().duration(500).attrTween("d", arcTween); // redraw the arcs
        }
    }

    act_on_pi_digits(n, add_digit);

    path.data(pie(counts))
    path.transition().duration(500).attrTween("d", arcTween); // redraw the arcs
}

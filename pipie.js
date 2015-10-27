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

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const urls = [
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json",
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json",
];
const requests = urls.map((url) => axios.get(url));

const fetchData = async () => {
    try {
        const data = await Promise.all(requests).then((res) =>
            res.map((res) => res.data)
        );
        return data;
    } catch (err) {
        console.log(err);
    }
};

const render = async () => {
    const data = await fetchData();
    const colors = d3.scaleOrdinal(d3.schemeRdPu[7]);
    const xLegScale = d3.scaleLinear().domain([0, 7]).range([0, 280]);
    const tickScaler = d3.scaleLinear().domain([0, 7]).range([3, 66]);
    const mapColors = d3
        .scaleQuantize()
        .domain([3, 66])
        .range(d3.schemeRdPu[7]);

    const svg = d3
        .select("body")
        .append("svg")
        .attr("id", "graph")
        .attr("width", 1200)
        .attr("height", 700);

    const g = svg
        .append("g")
        .attr("id", "legend")
        .attr("transform", "translate(750, 30)");

    g.selectAll("rect")
        .data([0, 1, 2, 3, 4, 5, 6])
        .enter()
        .append("rect")
        .attr("width", 40)
        .attr("height", 8)
        .attr("x", (d) => d * 40)
        .style("fill", (d) => colors(d));

    const xLegAxis = d3
        .axisBottom(xLegScale)
        .ticks(8)
        .tickSize(13)
        .tickFormat((_, i) => tickScaler(i) + "%");
    g.append("g").attr("id", "legendAxis").call(xLegAxis);

    svg.append("g")
        .attr("transform", "translate(170, 0)")
        .selectAll("path")
        .data(topojson.feature(data[1], data[1].objects.counties).features)
        .enter()
        .append("path")
        .attr("d", d3.geoPath())
        .attr("class", "county")
        .attr("data-fips", (d) => d.id)
        .attr(
            "data-education",
            (d) =>
                data[0].filter((res) => res.fips === d.id)[0].bachelorsOrHigher
        )
        .style("fill", (d) =>
            mapColors(
                data[0].filter((res) => res.fips === d.id)[0].bachelorsOrHigher
            )
        )
        .on("mouseover", (d, i) => {
            const eduData = data[0].filter((res) => res.fips === i.id)[0];
            d3
                .select("body")
                .append("div")
                .attr("id", "tooltip")
                .attr("data-education", () => eduData.bachelorsOrHigher)
                .style("position", "absolute")
                .style("left", d.pageX + 20 + "px")
                .style("top", d.pageY - 50 + "px")
                .style("opacity", 0.9).html(`
                <p>${eduData.area_name}, ${eduData.state}: ${eduData.bachelorsOrHigher}%</p>
                `);
        })
        .on("mouseout", () => d3.selectAll("#tooltip").remove());
};

render();

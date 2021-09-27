import {processData} from "./process.js";

d3.queue()
    .defer(function (url, callback) {
        d3.json(url).then(function (file) {
            callback(null, file)
        })
    }, "./data/test.json")
    .defer(function (url, callback) {
        d3.csv(url).then(function (file) {
            callback(null, file)
        })
    }, "./data/medicate.csv")
    .defer(function (url, callback) {
        d3.csv(url).then(function (file) {
            callback(null, file)
        })
    }, "./data/classification_disease.csv")
    .defer(function (url, callback) {
        d3.csv(url).then(function (file) {
            callback(null, file)
        })
    }, "./data/classification_order.csv")
    .defer(function (url, callback) {
        d3.csv(url).then(function (file) {
            callback(null, file)
        })
    }, "./data/predictive.csv")
    .defer(function (url, callback) {
        d3.csv(url).then(function (file) {
            callback(null, file)
        })
    }, "./data/all.csv")
    .defer(function (url, callback) {
        d3.csv(url).then(function (file) {
            callback(null, file)
        })
    }, "./data/preds.csv")
    .defer(function (url, callback) {
        d3.csv(url).then(function (file) {
            callback(null, file)
        })
    }, "./data/a.csv")
    .defer(function (url, callback) {
        d3.csv(url).then(function (file) {
            callback(null, file)
        })
    }, "./data/a_mean.csv")
    .await((error, testData, medicateDataRR, diseaseDataRR, orderDataRR, predictiveDataRR,checkDataRR,predsDataRR,clusterDataRR,clusterMeanDataRR) =>{
        var [byOrder,predsDataUpdate02,checkDataUpdate02,allInfomation03,allJson00,clusterMeanDataLine]
            = processData(error, medicateDataRR, diseaseDataRR, orderDataRR, predictiveDataRR,checkDataRR,predsDataRR,clusterDataRR,clusterMeanDataRR)
        // console.log(testData);
        // console.log(allJson)
        // console.log(allInfomation03)
        // console.log(clusterMeanDataLine)
      // console.log(dealDataToJson(allInfomation03))

        //0.转换数据为name-children 形式的json形式
        // console.log(d3.hierarchy(allJson))

        /*
        * 处理选择的数据
        * */



        const chooseArray = [
            {name:0,value:"性别-年龄-疾病",sindex:[0,1,2]},
            {name:1,value:"性别-疾病-年龄",sindex:[0,2,1]},
            {name:2,value:"年龄-性别-疾病",sindex:[1,0,2]},
            {name:3,value:"年龄-疾病-性别",sindex:[1,2,0]},
            {name:4,value:"疾病-性别-年龄",sindex:[2,0,1]},
            {name:5,value:"疾病-年龄-性别",sindex:[2,1,0]}
        ];
        let mappingArray = [
            ["男","女"],
            ["青年","老年"],
            ["创伤","外科系统疾病","内科系统疾病"]
        ]

        d3.select('#div_choose').select('sl-dropdown').select('sl-menu')
            .selectAll('sl-menu-item')
            .data(chooseArray)
            .enter()
            .append('sl-menu-item')
            .text(d=>(d.name+1)+"→"+d.value)
            .on('click',function (i,d) {
                // let updateJson = updateJsonFunction(d);
                let sindex = d.sindex;
                let allJson = dealDataToJson(byOrder,checkDataUpdate02,predsDataUpdate02,sindex)
                updateAll(allJson)
            });

        console.log(allJson00)
        updateAll(allJson00)

        function updateAll(allJson) {
            //1.处理数据
            const data = d3.hierarchy(allJson)
                .sort((a, b) => d3.ascending(a.data.name, b.data.name))
            console.log(data)

            function autoBox() {
                document.body.appendChild(this);
                const {x, y, width, height} = this.getBBox();
                document.body.removeChild(this);
                return [x, y, width, height];
            }

            /*
            * 开始
            * */
            const diameter = 1400;

            const width = diameter;
            const height = diameter;
            const radius = width/3;
            const perCell = 200;
            const perCellWidth = perCell*2;
            const perCellHeight = perCell*0.5;
            const padding = perCell*0.2;

            const fontsize = 10;

            const color_small = d3.scaleOrdinal()
                .domain(["cn", "cw", "r"])
                .range(["#9b8bba", "#82d6c3", "#d95f02"]);

            var stack3 = d3.stack()
                .keys(["cn","cw","r"])
                .order(d3.stackOrderDescending)
                .offset(d3.stackOffsetNone);
            // .offset(d3.stackOffsetSilhouette);

            const minAlbumin = 35;
            const maxAlbumin = 50;
            var yAlone = d3.scaleLinear()
                .domain([0, 2000])
                .range([perCellHeight, 0]);

            var yAlone2 = d3.scaleLinear()
                .domain([minAlbumin, maxAlbumin])
                .range([perCellHeight, 0]);
            var x = d3.scaleLinear()
                .domain([0,11])
                .range([0, perCellWidth-2*padding]);
            var area = d3.area()
                .x(d => x(d.data.xcategory))
                .y0(d => yAlone(d[0]))
                .y1(d => yAlone(d[1]))
                .curve(d3.curveMonotoneY);

            let line = d3.line()
                .curve(d3.curveMonotoneY)
                .defined((d) => !isNaN(d.albumin))
                .x((d,i) =>x(i))
                .y(d => yAlone2(d.albumin))

            let lineMean = d3.line()
                .curve(d3.curveNatural)
                .defined((d) => !isNaN(d.albumin))
                .x((d,i) =>x(i))
                .y(d => yAlone2(d.albumin))

            //定义布局
            const tree = d3.tree()
                .size([2 * Math.PI, radius])
                .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth)

            //正式的方法
            const root = tree(data);


            d3.select('.Big-svg-g').remove();
            var svg = d3.select("svg")
                .attr('width', width)
                .attr('height', height)
                .append('g')
                .attr('transform', 'translate(' + diameter *0.3 + ',' + diameter *0.2 + ')scale(0.5)')
                .attr('class','Big-svg-g')

            let svgInfo = svg.append('g')
                .append('g')
                .attr('transform',`translate(${width*0.5},${-height*0.35})scale(2)`)

            svgInfo.append('rect')
                .attr('width',350)
                .attr('height',160)
                .attr('opacity',0.1)
                .attr('transform',`translate(-20,-20)`)
                .attr('fill','rgba(91,92,110,1)')

            svgInfo.append('rect')
                .attr('width',350)
                .attr('height',160)
                .attr('opacity',0.1)
                .attr('transform',`translate(${-20},${200})`)
                .attr('fill','rgba(91,92,110,1)')

            /*
            * 绘制曲线
            * */
            svgInfo.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(0," + (perCell-2.5*padding) + ")")
                .call(d3.axisBottom(x).ticks(11))
                .selectAll('g.tick text')
                .attr('font-size',fontsize);

            svgInfo.append("g")
                .attr("class", "axis")
                .call(d3.axisLeft(yAlone2).tickSize(2.25).tickValues([30,minAlbumin,35,40,45,50]))
                .selectAll('g.tick text')
                .attr('font-size',fontsize);

            let lineColor = d3.scaleLinear()
                .domain([0,1,2,3])
                .range(["#9b8bba","#e098c7","#8fd3e8","#005eaa"])
            svgInfo.append('g')
                .selectAll('path')
                .data(clusterMeanDataLine)
                .enter()
                .append("path")
                .attr("fill", "none")
                .attr('class','line_path')
                .attr("stroke", d=>lineColor(d[0].cluster))
                .attr("stroke-width", 2)
                .attr('opacity',0.85)
                // .style("stroke-dasharray","4,5")
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("d", lineMean);

            svgInfo.append('g')
                .selectAll('line')
                .data(clusterMeanDataLine)
                .enter()
                .append("line")
                .attr('x0',0)
                .attr('y0',0)
                .attr('x1',20)
                .attr('y1',0)
                .attr("stroke", d=>lineColor(d[0].cluster))
                .attr("stroke-width", 5)
                .attr('opacity',0.85)
                .attr('transform',(d,i)=>`translate(${250+i%2*40},${i===0||i===1?-10:0})`)

            svgInfo.append('g')
                .selectAll('text')
                .data(clusterMeanDataLine)
                .enter()
                .append("text")
                .attr('font-family',"宋")
                .attr('class', 'legend_text')
                .text(d=>d[0].cluster+1)
                .attr('font-size', fontsize)
                .style('text-anchor',"start")
                .attr('transform',(d,i)=>`translate(${250+i%2*40-7},${(i===0||i===1?-10:0)+4})`)

            /*
            * **************************************************************
            * */


            svg.append("g")
                .attr("fill", "none")
                .attr("stroke", "#2e4783")
                .attr("stroke-opacity", 0.4)
                .attr("stroke-width", 1.5)
                .selectAll("path")
                .data(root.links())
                .join("path")
                .attr("d", d3.linkRadial()
                    .angle(d => d.x)
                    .radius(d => d.y));

            svg.append("g")
                .selectAll("circle")
                .data(root.descendants())
                .join("circle")
                .attr("transform", d => `
        rotate(${d.x * 180 / Math.PI - 90})
        translate(${d.y},0)
      `)
                .attr("fill", d => d.children ? "#555" : (d.data.patient[0].diag_big === 0 ?"#0098d9"
                    :(d.data.patient[0].diag_big === 1?"#c12e34":"#32a487")))
                // .attr('test',d=>{console.log(d)})
                .attr('stroke',d=>d.children?"none":(d.data.patient[0].sex === 0 ?"#005eaa":"#c12e34"))
                .attr("r", d=>d.children?8:6)
                .on('click',(event,d)=>updateCheckView(event,d))

            svg.append("g")
                .attr("font-family", "sans-serif")
                .attr("stroke-linejoin", "round")
                .attr("stroke-width", 3)
                .selectAll("text")
                .data(root.descendants())
                .join("text")
                .attr("transform", d => `
        rotate(${d.x * 180 / Math.PI - 90}) 
        translate(${d.y},0) 
        rotate(${d.x >= Math.PI ? 180 : 0})
      `)
                .attr("dy", "0.31em")
                .attr("x", d => d.x < Math.PI === !d.children ? 6 : -6)
                .attr("text-anchor", d => d.x < Math.PI === !d.children ? "start" : "end")
                .attr("font-size", d=>d.children?20:14)
                .text(d => d.data.name)
                .on('click',(event,d)=>updateCheckView(event,d))
                .on('mouseover',(event,d)=>{
                    d3.select(this)
                        .attr("font-size", d=>d.children?20*2:14*2)
                })
                .on('mouseleave',(event,d)=>{
                    d3.select(this)
                        .attr("font-size", d=>d.children?20:14)
                })
                .clone(true).lower()
                .attr("stroke", "white")

            // svg.attr("viewBox", autoBox);
            // svg.attr('viewBox',[-width/1.8,-width/1.8,width,width])
            // svg.attr('width',width)
            //     .attr('height',width)
            //     .attr('transform',`translate(${width},0)`)



            /*
            * 在右侧显示出点击的患者
            * 循环开始：d.children存在，不存在直接就访问那个数据，然后渲染出来。
            * 循环深度：depth
            *
            * */
            function updateCheckView(event,datas) {
                console.log(datas)

                const drawer = document.querySelector('.drawer-scrolling');
                drawer.show();

                d3.select('#container-svg g').remove()

                let svg = d3.select('#container-svg')
                    .attr('width','30vw')
                    .attr('height','3600vh')
                    .append('g');
                svg
                    .attr('transform','translate(20,0)scale(1)')

                /*
                * 绘制坐标轴--start
                * */

                /*
                * 绘制坐标轴--end
                * */

                /*
                * 绘制用药方式
                * */
                console.log(datas)
                updateAllCell(datas)

                function updateAllCell(datas) {

                    d3.select('#svg-gall').remove();

                    console.log(datas)
                    d3.select('sl-drawer').attr('label',datas.data.name);

                    let depth = datas.depth;
                    let gAll = svg.append('g').attr('id','svg-gall').attr('transform','translate(0,40)')

                    if(depth===0){
                        let temp = [];
                        datas.children.forEach(d=>{
                            d.children.forEach(d=>{
                                d.children.forEach(d=>{
                                    d.children.forEach(d=>{
                                        temp = temp.concat(d.children);//每个元素都写了2次
                                    })
                                })
                            })
                        })
                        console.log(temp)

                        d3.select('sl-drawer').attr('label',datas.data.name+"("+(temp.length)+"名患者)");
                        // datas.children = temp;
                        // console.log(datas.children)

                        const dayGroups = gAll.selectAll('.patient-vis')//就是页面上的一行。
                            .data(temp);
                        dayGroups.exit().remove();

                        const dayGroupsEnter = dayGroups.enter()
                            .append('g')
                            .attr('class', 'patient-vis')

                        dayGroupsEnter.append('rect')
                            .attr('x', 0)
                            .attr('y',0)
                            .attr('width',perCellWidth*1.2)
                            .attr('height',perCellHeight*1.8)
                            .attr('fill', '#000')
                            .attr('opacity', 0.0)//最开始就看不见，后面mouseover后就能看见了。

                        /*可视化一行的数据*/
                        dayGroupsEnter.merge(dayGroups)
                            .transition()
                            .attr('transform', (d, i) => `translate(0, ${(perCellHeight*2) * i})`)
                            .each((d, i, dom) => {
                                visualizeLine(d, d3.select(dom[i]), i);
                            });

                        /*oneg.append('rect')
                            .attr('width',perCellWidth-2*padding)
                            .attr('height',perCellHeight)
                            .attr('fill','#ddd')*/

                        /*oneg.append("g")
                            .append('text')
                            .attr('font-family',"仿宋")
                            .attr('class', 'legend_text')
                            .text('(剂量ml)')
                            .attr('font-size', 7)
                            .style('text-anchor',"start")
                            .attr("transform", "translate(20," + (yAlone2(maxAlbumin)+1) + ")")

                        oneg.append("g")
                            .append('text')
                            .attr('font-family',"仿宋")
                            .attr('class', 'legend_text')
                            .text('(检测值(白蛋白))')
                            .attr('font-size', 7)
                            .style('text-anchor',"end")
                            .attr("transform", `translate(${x(11)-11},${(yAlone2(maxAlbumin)+1)})`)

                        oneg.append("g")
                            .attr("class", "axis")
                            .attr("transform", "translate(0," + (perCell-2.5*padding) + ")")
                            .call(d3.axisBottom(x).ticks(11))
                            .selectAll('g.tick text')
                            .attr('font-size',5);

                        oneg.append("g")
                            .attr("class", "axis")
                            .call(d3.axisRight(yAlone).tickSize(2.25).tickValues([200,1000,1500,2000]))
                            .selectAll('g.tick text')
                            .attr('font-size',5);

                        oneg.append("g")
                            .attr("class", "axis")
                            .attr('transform',`translate(${perCellWidth-2*padding},${0})`)
                            .call(d3.axisLeft(yAlone2).tickSize(2.25).tickValues([minAlbumin,35,40,45,50]))
                            .selectAll('g.tick text')
                            .attr('font-size',5);*/

                        /* oneRect.append('text')
                             .attr('font-family',"华文隶书")
                             .attr('class', 'legend_text')
                             .text('你好')
                             .attr('font-size', '0.75em')
                             .style('text-anchor',"start")
                             .attr('transform',`translate(${0},${i*perCell*1.1})`)*/



                        /*  gAll.append('g')
                              .selectAll('.series')
                              .data(series)
                              .enter().append("path")
                              .attr("class", "series")
                              .attr("d", area)
                              .attr("stroke", "white")
                              .attr("stroke-width", "0.5px") // <======= change this for thicker white lines
                              // .attr('ddd',d=>{console.log(d)})
                              .style("fill", d => color_small(d.key))
                              .style("opacity", 0.65) // <== can change this for a lighter start color
                              .on("mouseleave", (_, i, n) => {
                                  d3.select(event.currentTarget).style("opacity", 0.65) // <== can change this for a lighter start color
                              })
                              .on("mouseenter", (d) => {
                                  d3.select(event.currentTarget).style("opacity", 1.0)  // <== full opacity color
                              });*/
                    }

                    if(depth===1){
                        let temp = [];
                        datas.children.forEach(d=>{
                            d.children.forEach(d=>{
                                d.children.forEach(d=>{
                                    temp = temp.concat(d.children);
                                })
                            })
                        })

                        console.log(temp)
                        d3.select('sl-drawer').attr('label',datas.data.name+"("+(temp.length)+"名患者)");
                        // datas.children = temp;
                        // console.log(datas.children)

                        const dayGroups = gAll.selectAll('.patient-vis')//就是页面上的一行。
                            .data(temp);
                        dayGroups.exit().remove();

                        const dayGroupsEnter = dayGroups.enter()
                            .append('g')
                            .attr('class', 'patient-vis')

                        dayGroupsEnter.append('rect')
                            .attr('x', 0)
                            .attr('y',0)
                            .attr('width',perCellWidth*1.2)
                            .attr('height',perCellHeight*1.8)
                            .attr('fill', '#000')
                            .attr('opacity', 0.0)//最开始就看不见，后面mouseover后就能看见了。

                        /*可视化一行的数据*/
                        dayGroupsEnter.merge(dayGroups)
                            .transition()
                            .attr('transform', (d, i) => `translate(0, ${(perCellHeight*2) * i})`)
                            .each((d, i, dom) => {
                                visualizeLine(d, d3.select(dom[i]), i);
                            });

                        /*oneg.append('rect')
                            .attr('width',perCellWidth-2*padding)
                            .attr('height',perCellHeight)
                            .attr('fill','#ddd')*/

                        /*oneg.append("g")
                            .append('text')
                            .attr('font-family',"仿宋")
                            .attr('class', 'legend_text')
                            .text('(剂量ml)')
                            .attr('font-size', 7)
                            .style('text-anchor',"start")
                            .attr("transform", "translate(20," + (yAlone2(maxAlbumin)+1) + ")")

                        oneg.append("g")
                            .append('text')
                            .attr('font-family',"仿宋")
                            .attr('class', 'legend_text')
                            .text('(检测值(白蛋白))')
                            .attr('font-size', 7)
                            .style('text-anchor',"end")
                            .attr("transform", `translate(${x(11)-11},${(yAlone2(maxAlbumin)+1)})`)

                        oneg.append("g")
                            .attr("class", "axis")
                            .attr("transform", "translate(0," + (perCell-2.5*padding) + ")")
                            .call(d3.axisBottom(x).ticks(11))
                            .selectAll('g.tick text')
                            .attr('font-size',5);

                        oneg.append("g")
                            .attr("class", "axis")
                            .call(d3.axisRight(yAlone).tickSize(2.25).tickValues([200,1000,1500,2000]))
                            .selectAll('g.tick text')
                            .attr('font-size',5);

                        oneg.append("g")
                            .attr("class", "axis")
                            .attr('transform',`translate(${perCellWidth-2*padding},${0})`)
                            .call(d3.axisLeft(yAlone2).tickSize(2.25).tickValues([minAlbumin,35,40,45,50]))
                            .selectAll('g.tick text')
                            .attr('font-size',5);*/

                        /* oneRect.append('text')
                             .attr('font-family',"华文隶书")
                             .attr('class', 'legend_text')
                             .text('你好')
                             .attr('font-size', '0.75em')
                             .style('text-anchor',"start")
                             .attr('transform',`translate(${0},${i*perCell*1.1})`)*/



                        /*  gAll.append('g')
                              .selectAll('.series')
                              .data(series)
                              .enter().append("path")
                              .attr("class", "series")
                              .attr("d", area)
                              .attr("stroke", "white")
                              .attr("stroke-width", "0.5px") // <======= change this for thicker white lines
                              // .attr('ddd',d=>{console.log(d)})
                              .style("fill", d => color_small(d.key))
                              .style("opacity", 0.65) // <== can change this for a lighter start color
                              .on("mouseleave", (_, i, n) => {
                                  d3.select(event.currentTarget).style("opacity", 0.65) // <== can change this for a lighter start color
                              })
                              .on("mouseenter", (d) => {
                                  d3.select(event.currentTarget).style("opacity", 1.0)  // <== full opacity color
                              });*/
                    }

                    if(depth===2){
                        let temp = [];
                        datas.children.forEach(d=>{
                            d.children.forEach(d=>{
                                temp = temp.concat(d.children);
                            })
                        })

                        d3.select('sl-drawer').attr('label',datas.data.name+"("+(temp.length)+"名患者)");
                        // datas.children = temp;
                        // console.log(datas.children)

                        const dayGroups = gAll.selectAll('.patient-vis')//就是页面上的一行。
                            .data(temp);
                        dayGroups.exit().remove();

                        const dayGroupsEnter = dayGroups.enter()
                            .append('g')
                            .attr('class', 'patient-vis')

                        dayGroupsEnter.append('rect')
                            .attr('x', 0)
                            .attr('y',0)
                            .attr('width',perCellWidth*1.2)
                            .attr('height',perCellHeight*1.8)
                            .attr('fill', '#000')
                            .attr('opacity', 0.0)//最开始就看不见，后面mouseover后就能看见了。

                        /*可视化一行的数据*/
                        dayGroupsEnter.merge(dayGroups)
                            .transition()
                            .attr('transform', (d, i) => `translate(0, ${(perCellHeight*2) * i})`)
                            .each((d, i, dom) => {
                                visualizeLine(d, d3.select(dom[i]), i);
                            });

                        /*oneg.append('rect')
                            .attr('width',perCellWidth-2*padding)
                            .attr('height',perCellHeight)
                            .attr('fill','#ddd')*/

                        /*oneg.append("g")
                            .append('text')
                            .attr('font-family',"仿宋")
                            .attr('class', 'legend_text')
                            .text('(剂量ml)')
                            .attr('font-size', 7)
                            .style('text-anchor',"start")
                            .attr("transform", "translate(20," + (yAlone2(maxAlbumin)+1) + ")")

                        oneg.append("g")
                            .append('text')
                            .attr('font-family',"仿宋")
                            .attr('class', 'legend_text')
                            .text('(检测值(白蛋白))')
                            .attr('font-size', 7)
                            .style('text-anchor',"end")
                            .attr("transform", `translate(${x(11)-11},${(yAlone2(maxAlbumin)+1)})`)

                        oneg.append("g")
                            .attr("class", "axis")
                            .attr("transform", "translate(0," + (perCell-2.5*padding) + ")")
                            .call(d3.axisBottom(x).ticks(11))
                            .selectAll('g.tick text')
                            .attr('font-size',5);

                        oneg.append("g")
                            .attr("class", "axis")
                            .call(d3.axisRight(yAlone).tickSize(2.25).tickValues([200,1000,1500,2000]))
                            .selectAll('g.tick text')
                            .attr('font-size',5);

                        oneg.append("g")
                            .attr("class", "axis")
                            .attr('transform',`translate(${perCellWidth-2*padding},${0})`)
                            .call(d3.axisLeft(yAlone2).tickSize(2.25).tickValues([minAlbumin,35,40,45,50]))
                            .selectAll('g.tick text')
                            .attr('font-size',5);*/

                        /* oneRect.append('text')
                             .attr('font-family',"华文隶书")
                             .attr('class', 'legend_text')
                             .text('你好')
                             .attr('font-size', '0.75em')
                             .style('text-anchor',"start")
                             .attr('transform',`translate(${0},${i*perCell*1.1})`)*/



                        /*  gAll.append('g')
                              .selectAll('.series')
                              .data(series)
                              .enter().append("path")
                              .attr("class", "series")
                              .attr("d", area)
                              .attr("stroke", "white")
                              .attr("stroke-width", "0.5px") // <======= change this for thicker white lines
                              // .attr('ddd',d=>{console.log(d)})
                              .style("fill", d => color_small(d.key))
                              .style("opacity", 0.65) // <== can change this for a lighter start color
                              .on("mouseleave", (_, i, n) => {
                                  d3.select(event.currentTarget).style("opacity", 0.65) // <== can change this for a lighter start color
                              })
                              .on("mouseenter", (d) => {
                                  d3.select(event.currentTarget).style("opacity", 1.0)  // <== full opacity color
                              });*/
                    }

                    if(depth===3){
                        let temp = [];
                        datas.children.forEach(d=>{
                            temp = temp.concat(d.children);
                        })

                        d3.select('sl-drawer').attr('label',datas.data.name+"("+(temp.length)+"名患者)");
                        // datas.children = temp;
                        // console.log(datas.children)

                        const dayGroups = gAll.selectAll('.patient-vis')//就是页面上的一行。
                            .data(temp);
                        dayGroups.exit().remove();

                        const dayGroupsEnter = dayGroups.enter()
                            .append('g')
                            .attr('class', 'patient-vis')

                        dayGroupsEnter.append('rect')
                            .attr('x', 0)
                            .attr('y',0)
                            .attr('width',perCellWidth*1.2)
                            .attr('height',perCellHeight*1.8)
                            .attr('fill', '#000')
                            .attr('opacity', 0.0)//最开始就看不见，后面mouseover后就能看见了。

                        /*可视化一行的数据*/
                        dayGroupsEnter.merge(dayGroups)
                            .transition()
                            .attr('transform', (d, i) => `translate(0, ${(perCellHeight*2) * i})`)
                            .each((d, i, dom) => {
                                visualizeLine(d, d3.select(dom[i]), i);
                            });

                        /*oneg.append('rect')
                            .attr('width',perCellWidth-2*padding)
                            .attr('height',perCellHeight)
                            .attr('fill','#ddd')*/

                        /*oneg.append("g")
                            .append('text')
                            .attr('font-family',"仿宋")
                            .attr('class', 'legend_text')
                            .text('(剂量ml)')
                            .attr('font-size', 7)
                            .style('text-anchor',"start")
                            .attr("transform", "translate(20," + (yAlone2(maxAlbumin)+1) + ")")

                        oneg.append("g")
                            .append('text')
                            .attr('font-family',"仿宋")
                            .attr('class', 'legend_text')
                            .text('(检测值(白蛋白))')
                            .attr('font-size', 7)
                            .style('text-anchor',"end")
                            .attr("transform", `translate(${x(11)-11},${(yAlone2(maxAlbumin)+1)})`)

                        oneg.append("g")
                            .attr("class", "axis")
                            .attr("transform", "translate(0," + (perCell-2.5*padding) + ")")
                            .call(d3.axisBottom(x).ticks(11))
                            .selectAll('g.tick text')
                            .attr('font-size',5);

                        oneg.append("g")
                            .attr("class", "axis")
                            .call(d3.axisRight(yAlone).tickSize(2.25).tickValues([200,1000,1500,2000]))
                            .selectAll('g.tick text')
                            .attr('font-size',5);

                        oneg.append("g")
                            .attr("class", "axis")
                            .attr('transform',`translate(${perCellWidth-2*padding},${0})`)
                            .call(d3.axisLeft(yAlone2).tickSize(2.25).tickValues([minAlbumin,35,40,45,50]))
                            .selectAll('g.tick text')
                            .attr('font-size',5);*/

                        /* oneRect.append('text')
                             .attr('font-family',"华文隶书")
                             .attr('class', 'legend_text')
                             .text('你好')
                             .attr('font-size', '0.75em')
                             .style('text-anchor',"start")
                             .attr('transform',`translate(${0},${i*perCell*1.1})`)*/



                        /*  gAll.append('g')
                              .selectAll('.series')
                              .data(series)
                              .enter().append("path")
                              .attr("class", "series")
                              .attr("d", area)
                              .attr("stroke", "white")
                              .attr("stroke-width", "0.5px") // <======= change this for thicker white lines
                              // .attr('ddd',d=>{console.log(d)})
                              .style("fill", d => color_small(d.key))
                              .style("opacity", 0.65) // <== can change this for a lighter start color
                              .on("mouseleave", (_, i, n) => {
                                  d3.select(event.currentTarget).style("opacity", 0.65) // <== can change this for a lighter start color
                              })
                              .on("mouseenter", (d) => {
                                  d3.select(event.currentTarget).style("opacity", 1.0)  // <== full opacity color
                              });*/
                    }

                    if(depth===4){
                        let temp = datas.children;
                        d3.select('sl-drawer').attr('label',datas.data.name+"("+(temp.length)+"名患者)");

                        const dayGroups = gAll.selectAll('.patient-vis')//就是页面上的一行。
                            .data(temp);
                        dayGroups.exit().remove();

                        const dayGroupsEnter = dayGroups.enter()
                            .append('g')
                            .attr('class', 'patient-vis')

                        dayGroupsEnter.append('rect')
                            .attr('x', 0)
                            .attr('y',0)
                            .attr('width',perCellWidth*1.2)
                            .attr('height',perCellHeight*1.8)
                            .attr('fill', '#000')
                            .attr('opacity', 0.0)//最开始就看不见，后面mouseover后就能看见了。

                        /*可视化一行的数据*/
                        dayGroupsEnter.merge(dayGroups)
                            .transition()
                            .attr('transform', (d, i) => `translate(0, ${(perCellHeight*2) * i})`)
                            .each((d, i, dom) => {
                                visualizeLine(d, d3.select(dom[i]), i);
                            });

                        /*oneg.append('rect')
                            .attr('width',perCellWidth-2*padding)
                            .attr('height',perCellHeight)
                            .attr('fill','#ddd')*/

                        /*oneg.append("g")
                            .append('text')
                            .attr('font-family',"仿宋")
                            .attr('class', 'legend_text')
                            .text('(剂量ml)')
                            .attr('font-size', 7)
                            .style('text-anchor',"start")
                            .attr("transform", "translate(20," + (yAlone2(maxAlbumin)+1) + ")")

                        oneg.append("g")
                            .append('text')
                            .attr('font-family',"仿宋")
                            .attr('class', 'legend_text')
                            .text('(检测值(白蛋白))')
                            .attr('font-size', 7)
                            .style('text-anchor',"end")
                            .attr("transform", `translate(${x(11)-11},${(yAlone2(maxAlbumin)+1)})`)

                        oneg.append("g")
                            .attr("class", "axis")
                            .attr("transform", "translate(0," + (perCell-2.5*padding) + ")")
                            .call(d3.axisBottom(x).ticks(11))
                            .selectAll('g.tick text')
                            .attr('font-size',5);

                        oneg.append("g")
                            .attr("class", "axis")
                            .call(d3.axisRight(yAlone).tickSize(2.25).tickValues([200,1000,1500,2000]))
                            .selectAll('g.tick text')
                            .attr('font-size',5);

                        oneg.append("g")
                            .attr("class", "axis")
                            .attr('transform',`translate(${perCellWidth-2*padding},${0})`)
                            .call(d3.axisLeft(yAlone2).tickSize(2.25).tickValues([minAlbumin,35,40,45,50]))
                            .selectAll('g.tick text')
                            .attr('font-size',5);*/

                        /* oneRect.append('text')
                             .attr('font-family',"华文隶书")
                             .attr('class', 'legend_text')
                             .text('你好')
                             .attr('font-size', '0.75em')
                             .style('text-anchor',"start")
                             .attr('transform',`translate(${0},${i*perCell*1.1})`)*/



                        /*  gAll.append('g')
                              .selectAll('.series')
                              .data(series)
                              .enter().append("path")
                              .attr("class", "series")
                              .attr("d", area)
                              .attr("stroke", "white")
                              .attr("stroke-width", "0.5px") // <======= change this for thicker white lines
                              // .attr('ddd',d=>{console.log(d)})
                              .style("fill", d => color_small(d.key))
                              .style("opacity", 0.65) // <== can change this for a lighter start color
                              .on("mouseleave", (_, i, n) => {
                                  d3.select(event.currentTarget).style("opacity", 0.65) // <== can change this for a lighter start color
                              })
                              .on("mouseenter", (d) => {
                                  d3.select(event.currentTarget).style("opacity", 1.0)  // <== full opacity color
                              });*/
                    }

                    if(depth===5){
                        let temp = datas;
                        d3.select('sl-drawer').attr('label',datas.data.name+"("+(temp.length)+"名患者)");

                        const dayGroups = gAll.selectAll('.patient-vis')//就是页面上的一行。
                            .data(temp);
                        dayGroups.exit().remove();

                        const dayGroupsEnter = dayGroups.enter()
                            .append('g')
                            .attr('class', 'patient-vis')

                        dayGroupsEnter.append('rect')
                            .attr('x', 0)
                            .attr('y',0)
                            .attr('width',perCellWidth*1.2)
                            .attr('height',perCellHeight*1.8)
                            .attr('fill', '#000')
                            .attr('opacity', 0.0)//最开始就看不见，后面mouseover后就能看见了。

                        /*可视化一行的数据*/
                        dayGroupsEnter.merge(dayGroups)
                            .transition()
                            .attr('transform', (d, i) => `translate(0, ${(perCellHeight*2) * i})`)
                            .each((d, i, dom) => {
                                visualizeLine(d, d3.select(dom[i]), i);
                            });

                        /*oneg.append('rect')
                            .attr('width',perCellWidth-2*padding)
                            .attr('height',perCellHeight)
                            .attr('fill','#ddd')*/

                        /*oneg.append("g")
                            .append('text')
                            .attr('font-family',"仿宋")
                            .attr('class', 'legend_text')
                            .text('(剂量ml)')
                            .attr('font-size', 7)
                            .style('text-anchor',"start")
                            .attr("transform", "translate(20," + (yAlone2(maxAlbumin)+1) + ")")

                        oneg.append("g")
                            .append('text')
                            .attr('font-family',"仿宋")
                            .attr('class', 'legend_text')
                            .text('(检测值(白蛋白))')
                            .attr('font-size', 7)
                            .style('text-anchor',"end")
                            .attr("transform", `translate(${x(11)-11},${(yAlone2(maxAlbumin)+1)})`)

                        oneg.append("g")
                            .attr("class", "axis")
                            .attr("transform", "translate(0," + (perCell-2.5*padding) + ")")
                            .call(d3.axisBottom(x).ticks(11))
                            .selectAll('g.tick text')
                            .attr('font-size',5);

                        oneg.append("g")
                            .attr("class", "axis")
                            .call(d3.axisRight(yAlone).tickSize(2.25).tickValues([200,1000,1500,2000]))
                            .selectAll('g.tick text')
                            .attr('font-size',5);

                        oneg.append("g")
                            .attr("class", "axis")
                            .attr('transform',`translate(${perCellWidth-2*padding},${0})`)
                            .call(d3.axisLeft(yAlone2).tickSize(2.25).tickValues([minAlbumin,35,40,45,50]))
                            .selectAll('g.tick text')
                            .attr('font-size',5);*/

                        /* oneRect.append('text')
                             .attr('font-family',"华文隶书")
                             .attr('class', 'legend_text')
                             .text('你好')
                             .attr('font-size', '0.75em')
                             .style('text-anchor',"start")
                             .attr('transform',`translate(${0},${i*perCell*1.1})`)*/



                        /*  gAll.append('g')
                              .selectAll('.series')
                              .data(series)
                              .enter().append("path")
                              .attr("class", "series")
                              .attr("d", area)
                              .attr("stroke", "white")
                              .attr("stroke-width", "0.5px") // <======= change this for thicker white lines
                              // .attr('ddd',d=>{console.log(d)})
                              .style("fill", d => color_small(d.key))
                              .style("opacity", 0.65) // <== can change this for a lighter start color
                              .on("mouseleave", (_, i, n) => {
                                  d3.select(event.currentTarget).style("opacity", 0.65) // <== can change this for a lighter start color
                              })
                              .on("mouseenter", (d) => {
                                  d3.select(event.currentTarget).style("opacity", 1.0)  // <== full opacity color
                              });*/
                    }

                    function visualizeLine(d,dom,i) {

                        let oneData = d.data.patient;
                        let series = stack3(oneData);

                        dom.append('rect')
                            .attr('width',perCellWidth*0.86)
                            .attr('height',perCellHeight*1.74)
                            .attr('x',-padding*0.3)
                            .attr('y',-padding)
                            .attr('fill','#ddd')

                        dom.append("g")
                            .append('text')
                            .attr('font-family',"宋")
                            .attr('class', 'legend_text')
                            .text(oneData[0].patientId)
                            .attr('font-size', fontsize+2)
                            .style('text-anchor',"end")
                            .attr("transform", "translate("+72+"," + (yAlone2(maxAlbumin)-20) + ")")

                        dom.append("g")
                            .append('text')
                            .attr('font-family',"宋")
                            .attr('class', 'legend_text')
                            .text(oneData[0].sex===0?'(男)':"(女)")
                            .attr('font-size', fontsize+2)
                            .style('text-anchor',"start")
                            .attr("transform", "translate("+74+"," + (yAlone2(maxAlbumin)-20) + ")")

                        dom.append("g")
                            .append('text')
                            .attr('font-family',"宋")
                            .attr('class', 'legend_text')
                            .text(oneData[0].age+"岁")
                            .attr('font-size', fontsize+2)
                            .style('text-anchor',"start")
                            .attr("transform", "translate("+110+"," + (yAlone2(maxAlbumin)-20) + ")")

                        dom.append("g")
                            .append('text')
                            .attr('font-family',"宋")
                            .attr('class', 'legend_text')
                            .text(oneData[0].diag)
                            .attr('font-size', fontsize+2)
                            .style('text-anchor',"start")
                            .attr("transform", "translate("+150+"," + (yAlone2(maxAlbumin)-20) + ")")



                        dom.append("g")
                            .attr("class", "axis")
                            .attr("transform", "translate(0," + (perCell-2.5*padding) + ")")
                            .append('line')
                            .attr('x1',0)
                            .attr('y1',0)
                            .attr('x2',x(11))
                            .attr('y2',0)
                            .style('stroke','#333')
                            .attr('stroke-width',1.5)

                        dom.append("g")
                            .append('text')
                            .attr('font-family',"仿宋")
                            .attr('class', 'legend_text')
                            .text('(剂量ml)')
                            .attr('font-size', fontsize)
                            .style('text-anchor',"start")
                            .attr("transform", "translate("+fontsize*3+"," + (yAlone2(maxAlbumin)+1) + ")")

                        dom.append("g")
                            .append('text')
                            .attr('font-family',"仿宋")
                            .attr('class', 'legend_text')
                            .text('(检测值(白蛋白))')
                            .attr('font-size', fontsize)
                            .style('text-anchor',"end")
                            .attr("transform", `translate(${x(11)-fontsize*1.5},${(yAlone2(maxAlbumin)+1)})`)

                        dom.append("g")
                            .attr("class", "axis")
                            .attr("transform", "translate(0," + (perCell-2.5*padding) + ")")
                            .call(d3.axisBottom(x).ticks(11))
                            .selectAll('g.tick text')
                            .attr('font-size',fontsize);

                        dom.append("g")
                            .attr("class", "axis")
                            .call(d3.axisRight(yAlone).tickSize(2.25).tickValues([200,1000,1500,2000]))
                            .selectAll('g.tick text')
                            .attr('font-size',fontsize);

                        dom.append("g")
                            .attr("class", "axis")
                            .attr('transform',`translate(${perCellWidth-2*padding},${0})`)
                            .call(d3.axisLeft(yAlone2).tickSize(2.25).tickValues([30,minAlbumin,35,40,45,50]))
                            .selectAll('g.tick text')
                            .attr('font-size',fontsize);

                        dom.append('g')
                            .selectAll('.series')
                            .data(series)
                            .enter().append("path")
                            .attr("class", "series")
                            .attr("d", area)
                            .attr("stroke", "white")
                            .attr("stroke-width", "0.5px") // <======= change this for thicker white lines
                            // .attr('ddd',d=>{console.log(d)})
                            .style("fill", d => color_small(d.key))
                            .style("opacity", 0.65) // <== can change this for a lighter start color
                            .on("mouseleave", (_, i, n) => {
                                d3.select(event.currentTarget).style("opacity", 0.65) // <== can change this for a lighter start color
                            })
                            .on("mouseenter", (d) => {
                                d3.select(event.currentTarget).style("opacity", 1.0)  // <== full opacity color
                            });

                        console.log(oneData)
                        dom.append('g')
                            .append("path")
                            .datum(oneData)
                            .attr("fill", "none")
                            .attr('class','line_path')
                            .attr("stroke", "#626c91")
                            .attr("stroke-width", 1)
                            .attr('opacity',0.85)
                            // .style("stroke-dasharray","4,5")
                            .attr("stroke-linejoin", "round")
                            .attr("stroke-linecap", "round")
                            .attr("d", line);

                        dom.append('g')
                            .selectAll('circle')
                            .data(oneData)
                            .enter()
                            .append('circle')
                            .attr('r',d=>d.albumin>minAlbumin?2:3)
                            .attr('stroke','#fff')
                            .attr('stroke-width',1)
                            .attr('class','readings')
                            .attr('fill',d=>d.albumin>minAlbumin?"black":"#d95f02")
                            .attr('opacity',1)
                            .attr('transform',(d,i)=>`translate(${x(i)},${yAlone2(d.albumin)})`)


                    }

                    /*if(depth===5){
                        let oneData = datas.data.patient;
                        let series = stack3(oneData);

                        gAll.append('rect')
                            .attr('width',perCellWidth*0.86)
                            .attr('height',perCellHeight*1.74)
                            .attr('x',-padding*0.3)
                            .attr('y',-padding)
                            .attr('fill','#ddd')

                        gAll.append("g")
                            .attr("class", "axis")
                            .attr("transform", "translate(0," + (perCell-2.5*padding) + ")")
                            .append('line')
                            .attr('x1',0)
                            .attr('y1',0)
                            .attr('x2',x(11))
                            .attr('y2',0)
                            .style('stroke','#333')
                            .attr('stroke-width',1.5)

                        gAll.append("g")
                            .append('text')
                            .attr('font-family',"宋")
                            .attr('class', 'legend_text')
                            .text(oneData[0].patientId)
                            .attr('font-size', fontsize+2)
                            .style('text-anchor',"end")
                            .attr("transform", "translate("+72+"," + (yAlone2(maxAlbumin)-20) + ")")

                        gAll.append("g")
                            .append('text')
                            .attr('font-family',"宋")
                            .attr('class', 'legend_text')
                            .text(oneData[0].sex===0?'(男)':"(女)")
                            .attr('font-size', fontsize+2)
                            .style('text-anchor',"start")
                            .attr("transform", "translate("+74+"," + (yAlone2(maxAlbumin)-20) + ")")

                        gAll.append("g")
                            .append('text')
                            .attr('font-family',"宋")
                            .attr('class', 'legend_text')
                            .text(oneData[0].age+"岁")
                            .attr('font-size', fontsize+2)
                            .style('text-anchor',"start")
                            .attr("transform", "translate("+110+"," + (yAlone2(maxAlbumin)-20) + ")")

                        gAll.append("g")
                            .append('text')
                            .attr('font-family',"宋")
                            .attr('class', 'legend_text')
                            .text(oneData[0].diag)
                            .attr('font-size', fontsize+2)
                            .style('text-anchor',"start")
                            .attr("transform", "translate("+150+"," + (yAlone2(maxAlbumin)-20) + ")")

                        gAll.append("g")
                            .append('text')
                            .attr('font-family',"仿宋")
                            .attr('class', 'legend_text')
                            .text('(剂量ml)')
                            .attr('font-size', fontsize)
                            .style('text-anchor',"start")
                            .attr("transform", "translate("+fontsize*3+"," + (yAlone2(maxAlbumin)+1) + ")")


                        gAll.append("g")
                            .append('text')
                            .attr('font-family',"仿宋")
                            .attr('class', 'legend_text')
                            .text('(检测值(白蛋白))')
                            .attr('font-size', fontsize)
                            .style('text-anchor',"end")
                            .attr("transform", `translate(${x(11)-fontsize*1.5},${(yAlone2(maxAlbumin)+1)})`)

                        gAll.append("g")
                            .attr("class", "axis")
                            .attr("transform", "translate(0," + (perCell-2.5*padding) + ")")
                            .call(d3.axisBottom(x).ticks(11))
                            .selectAll('g.tick text')
                            .attr('font-size',fontsize);

                        gAll.append("g")
                            .attr("class", "axis")
                            .call(d3.axisRight(yAlone).tickSize(2.25).tickValues([200,1000,1500,2000]))
                            .selectAll('g.tick text')
                            .attr('font-size',fontsize);

                        gAll.append("g")
                            .attr("class", "axis")
                            .attr('transform',`translate(${perCellWidth-2*padding},${0})`)
                            .call(d3.axisLeft(yAlone2).tickSize(2.25).tickValues([30,minAlbumin,35,40,45,50]))
                            .selectAll('g.tick text')
                            .attr('font-size',fontsize);

                        gAll.append('g')
                            .selectAll('.series')
                            .data(series)
                            .enter().append("path")
                            .attr("class", "series")
                            .attr("d", area)
                            .attr("stroke", "white")
                            .attr("stroke-width", "0.5px") // <======= change this for thicker white lines
                            // .attr('ddd',d=>{console.log(d)})
                            .style("fill", d => color_small(d.key))
                            .style("opacity", 0.65) // <== can change this for a lighter start color
                            .on("mouseleave", (_, i, n) => {
                                d3.select(event.currentTarget).style("opacity", 0.65) // <== can change this for a lighter start color
                            })
                            .on("mouseenter", (d) => {
                                d3.select(event.currentTarget).style("opacity", 1.0)  // <== full opacity color
                            });

                        gAll.append("path")
                            .datum(oneData)
                            .attr("fill", "none")
                            .attr('class','line_path')
                            .attr("stroke", "#626c91")
                            .attr("stroke-width", 1)
                            .attr('opacity',0.85)
                            // .style("stroke-dasharray","4,5")
                            .attr("stroke-linejoin", "round")
                            .attr("stroke-linecap", "round")
                            .attr("d", line);

                        gAll
                            .selectAll('circle')
                            .data(oneData)
                            .enter()
                            .append('circle')
                            .attr('r',d=>d.albumin>minAlbumin?2:3)
                            .attr('stroke','#fff')
                            .attr('stroke-width',1)
                            .attr('class','readings')
                            .attr('fill',d=>d.albumin>minAlbumin?"black":"#d95f02")
                            .attr('opacity',1)
                            .attr('transform',(d,i)=>`translate(${x(i)},${yAlone2(d.albumin)})`)

                    }*/


                    /*let allRect =
                        gAll.append('g')
                        .selectAll('rect')
                        .data(data)
                        .enter()
                        .append('rect')
                        .attr('class','hello')
                        .attr('width',size-padding)
                        .attr('height',perCell)
                        .attr('transform',(d,i)=>`translate(${padding/2},${2*padding+i*perCell*1.1})`)
                        .attr('fill','#ddd')*/

                    // cell3.each()


                }


            }

            function dealDataToJson(allInfomation03) {

                let allJson = {"name":"全部","children":[]};
                allInfomation03.forEach((data11,i11)=>{

                    data11[1].forEach((data1,i1)=>{
                        // console.log(data)
                        data1[1].forEach((data,i)=>{
                            // console.log(data)
                            data[1].forEach((d,i)=>{
                                let temp = {}
                                temp["name"] = d[0];
                                temp["value"] = 1;
                                temp["patient"] = d[1];
                                data[1][i] = temp;
                            })

                            let temp = {};//疾病划分
                            temp["name"] = data[0]===0?"创伤":(data[0]===1?"外科系统疾病":"内科系统疾病")
                            temp["children"] = data[1];
                            data1[1][i] = temp;
                        })
                        let temp = {};//年龄划分
                        temp["name"] = data1[0]===0?"青年":"老年"
                        temp["children"] = data1[1];
                        data11[1][i1] = temp;
                    })

                    let temp = {};//性别划分
                    temp["name"] = data11[0]===0?"男":"女"
                    temp["children"] = data11[1];
                    allJson["children"].push(temp);

                    // allInfomation03[i11]

                    // allInfomation02[i][1] = data[1]
                })

                return allJson;

            }
        }


        function dealDataToJson(byOrder,checkDataUpdate02,predsDataUpdate02,sindex=[0,1,2]){
            // console.log([0,1,2].toString()==="0,1,2")
            console.log(byOrder)

            let allInfomation02;//只需要更换这里

            switch (sindex.toString()) {
                case '0,1,2':
                    allInfomation02 = d3.groups(byOrder,d=>d.cluster,d=>d.sex,d=>d.age_cluster,d=>d.diag_big,d=>d.patientId);//只需要更换这里
                    break;
                case '1,2,0':
                    allInfomation02 = d3.groups(byOrder,d=>d.cluster,d=>d.age_cluster,d=>d.diag_big,d=>d.sex,d=>d.patientId);
                    break;
                case '2,0,1':
                    allInfomation02 = d3.groups(byOrder,d=>d.cluster,d=>d.diag_big,d=>d.sex,d=>d.age_cluster,d=>d.patientId);
                    break;
                case '1,0,2':
                    allInfomation02 = d3.groups(byOrder,d=>d.cluster,d=>d.age_cluster,d=>d.sex,d=>d.diag_big,d=>d.patientId);
                    break;
                case '0,2,1':
                    allInfomation02 = d3.groups(byOrder,d=>d.cluster,d=>d.sex,d=>d.diag_big,d=>d.age_cluster,d=>d.patientId);
                    break;
                case '2,1,0':
                    allInfomation02 = d3.groups(byOrder,d=>d.cluster,d=>d.diag_big,d=>d.age_cluster,d=>d.sex,d=>d.patientId);
                    break;
                default:
                    console.log('error')
            }
            console.log(allInfomation02)
            allInfomation02.forEach((data22,i22)=>{
                data22[1].forEach((data11,i11)=>{
                    data11[1].forEach((data1,i1)=>{
                        // console.log(data)
                        data1[1].forEach((data,i)=>{
                            // console.log(data)
                            data[1].forEach((d,i)=>{
                                // console.log(d,i)

                                let temp = d3.groups(d[1],d=>d.xcategory)
                                // console.log(temp)
                                temp.forEach((d,i)=>{//d[0]为该患者第几天,需要将d转换为{xcategory:,cn,cw,r,diag,diag_big,diag_small,patientId}
                                    // console.log(d)
                                    let obj = {'xcategory':d[1][0].xcategory,"cn": 0, "cw": 0, "r": 0,'count':d[1].length,
                                        'diag_big':d[1][0].diag_big,'diag_small':d[1][0].diag_small,'diag':d[1][0].diag,
                                        'patientId':d[1][0].patientId,'age':d[1][0].age,'sex':d[1][0].sex,'albumin':0,preds:-1}
                                    d[1].forEach(d=>{
                                        let tag = d.order_category;//用药划分为肠内0、肠外1、人血白蛋白2
                                        let dose = d.dose;
                                        switch (tag) {
                                            case 0:
                                                obj.cn += dose;
                                                break;
                                            case 1:
                                                obj.cw += dose;
                                                break;
                                            case 2:
                                                obj.r += dose;
                                                break;
                                        }
                                    })
                                    let patientIdm = d[1][0].patientId;
                                    //取出xcatetory的白蛋白值
                                    // console.log(patientIdm)
                                    checkDataUpdate02.forEach(d=>{
                                        if(d[0]===patientIdm){
                                            obj["albumin"] = d[1][i].albumin;
                                        }
                                    })
                                    predsDataUpdate02.forEach(d=>{
                                        if(d[0]===patientIdm && d[1][i]!==undefined){
                                            obj["preds"] = +d[1][i].preds;
                                        }
                                    })

                                    temp[i] = obj;
                                })
                                // console.log(temp)
                                let tempa = [temp[0].patientId,temp]
                                data[1][i] = tempa;
                            })
                        })
                    })
                })
            })
            console.log(allInfomation02)

            // console.log(allInfomation02);

            //转换为json的形式:

            let allInfomation03 = allInfomation02;
            console.log(allInfomation03)


            let allJson = {"name":"全部","children":[]};
            allInfomation03.forEach((data22,i22)=>{
                data22[1].forEach((data11,i11)=>{

                    data11[1].forEach((data1,i1)=>{
                        // console.log(data)
                        data1[1].forEach((data,i)=>{
                            // console.log(data)
                            data[1].forEach((d,i)=>{
                                let temp = {}
                                temp["name"] = d[0];
                                temp["value"] = 1;
                                temp["patient"] = d[1];
                                data[1][i] = temp;
                            })

                            let temp = {};//疾病划分
                            temp["name"] = data[0]===0?mappingArray[sindex[2]][0]:(data[0]===1?mappingArray[sindex[2]][1]:(mappingArray[sindex[2]][2]?mappingArray[sindex[2]][2]:"none"))
                            temp["children"] = data[1];
                            data1[1][i] = temp;
                        })
                        let temp = {};//年龄划分
                        temp["name"] = data1[0]===0?mappingArray[sindex[1]][0]:(data1[0]===1?mappingArray[sindex[1]][1]:(mappingArray[sindex[1]][2]?mappingArray[sindex[1]][2]:"none"))
                        temp["children"] = data1[1];
                        data11[1][i1] = temp;
                    })
                    let temp = {};//性别划分
                    temp["name"] = data11[0]===0?mappingArray[sindex[0]][0]:(data11[0]===1?mappingArray[sindex[0]][1]:(mappingArray[sindex[0]][2]?mappingArray[sindex[0]][2]:"none"))
                    temp["children"] = data11[1];
                    data22[1][i11] = temp;
                })
                // console.log(data22)
                let temp = {};//性别划分
                temp["name"] = data22[0]+1;
                temp["children"] = data22[1];
                allJson["children"].push(temp);
            })

            console.log(allJson)
            return allJson;
        }

    });
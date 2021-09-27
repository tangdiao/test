function dateToStr(date) {
    return date.format('YYYY-MM-DD');
}
function dealDataToJson(allInfomation03) {

    let allJson = {"name":"root","children":[]};
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

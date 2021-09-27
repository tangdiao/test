export function processData(error, medicateDataRR, diseaseDataRR, orderDataRR, predictiveDataRR,checkDataRR,predsDataRR,clusterDataRR,clusterMeanDataRR) {

    var medicateData = [];
    var diseaseData = [];
    var orderData = [];
    var medicateDataByPatientIdByDate = [];
    var stackVisData = [];
    var predictiveData = [];
    var checkData = [];
    var predsData = [];
    var clusterData = [];
    var clusterMeanData = [];
    // console.log(medicateDataRR,diseaseDataRR,orderDataRR,predictiveDataRR);
    //1.将表里面的数据统一格式：
    //(1)
    for (let i = 0; i < medicateDataRR.length; i++) {
        const patientId = medicateDataRR[i]["患者ID"];
        const date = dateToStr(moment(new Date(medicateDataRR[i]["时间"].split(" ")[0].replaceAll('/', '-'))));
        const order = medicateDataRR[i]["医嘱"];
        const dose = parseFloat(medicateDataRR[i]["剂量"]);
        const medicate = {patientId: patientId, date: date, order: order, dose: dose};
        medicateData.push(medicate);
    }
    //(2)
    for (let i = 0; i < diseaseDataRR.length; i++) {
        const patientId = diseaseDataRR[i]["PATIENT_ID (14.csv)"];
        const diag = diseaseDataRR[i]["RELEVANT_CLINIC_DIAG (14.csv)"];
        const diag_small = parseInt(diseaseDataRR[i]["疾病分类（0：创伤；1：t循环系统疾病；2：神经系统疾病；3：术后；4：感染；5：肿瘤；6.呼吸衰竭；7.胰腺炎；8.其他）"]);
        const diag_big = parseInt(diseaseDataRR[i]["疾病分类（0：创伤；1：外科系统疾病；2：内科系统疾病）"]);
        const disease = {patientId: patientId, diag: diag, diag_small: diag_small, diag_big: diag_big};
        diseaseData.push(disease);
    }
    //(3)
    for (let i = 0; i < orderDataRR.length; i++) {
        const order = orderDataRR[i]["医嘱"];
        const order_category = +orderDataRR[i]["医嘱分类（0：肠内营养；1：肠外营养；2：人血白蛋白注射液）"];
        const orders = {order: order, order_category: order_category};
        orderData.push(orders);
    }
    //(4)
    for (let i = 0; i < predictiveDataRR.length; i++) {
        const patientId = predictiveDataRR[i]["ID"];
        const test = +predictiveDataRR[i]["test"];
        const pred = +predictiveDataRR[i]["preds"];
        const predictives = {patientId: patientId, test: test,pred:pred};
        predictiveData.push(predictives);
    }
    //(5)
    for (let i = 0; i < checkDataRR.length; i++) {
        const patientId = checkDataRR[i]["PATIENT_ID (14.csv) (all_12_v1.csv)"];
        const age = parseInt(checkDataRR[i]["age"]);
        const age_cluster = parseInt(checkDataRR[i]["age_cluster"])
        const sex = parseInt(checkDataRR[i]["sex"]);
        const albumin = +checkDataRR[i]["白蛋白"];
        const checks = {patientId: patientId, albumin: albumin,age:age,age_cluster:age_cluster, sex:sex};
        checkData.push(checks);
    }
    //(6)
    for (let i = 0; i < predsDataRR.length; i++) {
        const patientId = predsDataRR[i]["PATIENT_ID"];
        const preds = +predsDataRR[i]["preds"];
        const predss = {patientId: patientId, preds: preds};
        predsData.push(predss);
    }

    //(00)---cluster
    for (let i = 0; i < clusterDataRR.length; i++) {
        const patientId = clusterDataRR[i]["patientId"];
        const clusterTag = parseInt(clusterDataRR[i]["新标签"])
        const clusters = {patientId: patientId, clusterTag: clusterTag};
        clusterData.push(clusters);
    }

    //(00)--cluster_mean
    for (let i = 0; i < clusterMeanDataRR.length; i++) {
        const cluster = parseInt(clusterMeanDataRR[i]["cluster"]);
        const d1 = parseFloat(clusterMeanDataRR[i]["D1"])
        const d2 = parseFloat(clusterMeanDataRR[i]["D2"])
        const d3 = parseFloat(clusterMeanDataRR[i]["D3"])
        const d4 = parseFloat(clusterMeanDataRR[i]["D4"])
        const d5 = parseFloat(clusterMeanDataRR[i]["D5"])
        const d6 = parseFloat(clusterMeanDataRR[i]["D6"])
        const d7 = parseFloat(clusterMeanDataRR[i]["D7"])
        const d8 = parseFloat(clusterMeanDataRR[i]["D8"])
        const d9 = parseFloat(clusterMeanDataRR[i]["D9"])
        const d10 = parseFloat(clusterMeanDataRR[i]["D10"])
        const d11 = parseFloat(clusterMeanDataRR[i]["D11"])
        const d12 = parseFloat(clusterMeanDataRR[i]["D12"])
        const count = parseInt(clusterMeanDataRR[i]["count"])
        const clusters = {cluster: cluster, count: count, d1:d1,d2:d2,d3:d3,
            d4:d4,d5:d5,d6:d6,d7:d7,d8:d8,d9:d9,d10:d10,d11:d11,d12:d12};
        clusterMeanData.push(clusters);
    }

    console.log(clusterMeanData)
    let clusterMeanDataLine = [];
    //处理数据为曲线需要的格式[[{cluster:0,x:0,ablumin:},{cluster:0,x:1,albumin:},{x:2},{x:3}],   [], [], []]
    clusterMeanData.forEach(d=>{
        let temp = [];
        let dict1 = {cluster:d.cluster,xcategory:0,albumin:d.d1}
        let dict2 = {cluster:d.cluster,xcategory:1,albumin:d.d2}
        let dict3 = {cluster:d.cluster,xcategory:2,albumin:d.d3}
        let dict4 = {cluster:d.cluster,xcategory:3,albumin:d.d4}
        let dict5 = {cluster:d.cluster,xcategory:4,albumin:d.d5}
        let dict6 = {cluster:d.cluster,xcategory:5,albumin:d.d6}
        let dict7 = {cluster:d.cluster,xcategory:6,albumin:d.d7}
        let dict8 = {cluster:d.cluster,xcategory:7,albumin:d.d8}
        let dict9 = {cluster:d.cluster,xcategory:8,albumin:d.d9}
        let dict10 = {cluster:d.cluster,xcategory:9,albumin:d.d10}
        let dict11 = {cluster:d.cluster,xcategory:10,albumin:d.d11}
        let dict12 = {cluster:d.cluster,xcategory:11,albumin:d.d12}
        temp.push(dict1,dict2,dict3,dict4,dict5,dict6,dict7,dict8,dict9,dict10,dict11,dict12)
        clusterMeanDataLine.push(temp);

    })
    // console.log(clusterMeanDataLine)

    // console.log(medicateData)
    // console.log(diseaseData)
    // console.log(predictiveData)
    // console.log(predsData)

    // 2.将疾病分类数据和用药数据合并在一起，用药分类，白蛋白值
    //+cluster
    for (let i in medicateData) {
        let patientIdm = medicateData[i].patientId;
        //用药数据
        for (let j in diseaseData) {
            if (diseaseData[j].patientId === patientIdm) {
                let diag = diseaseData[j].diag;
                let diag_small = diseaseData[j].diag_small;
                let diag_big = diseaseData[j].diag_big;
                medicateData[i]["diag"] = diag;
                medicateData[i]["diag_small"] = diag_small;
                medicateData[i]["diag_big"] = diag_big;
            }
        }
        //用药分类：
        let orderm = medicateData[i].order;//用药的表里面的空的
        for (let k in orderData) {
            if (orderm === orderData[k].order) {
                medicateData[i]["order_category"] = orderData[k].order_category;
            } else if (orderm === "") {
                medicateData[i]["order_category"] = -1;
            }
        }
        //聚类结果：
        clusterData.forEach(d=>{
            if(d.patientId === patientIdm){
                medicateData[i]["cluster"] = d.clusterTag
            }
        })

    }
    // console.log(medicateData)



    medicateDataByPatientIdByDate = d3.groups(medicateData, d => d.patientId, d => d.date)
    //任务2：分析不同营养在特定疾病类型下随着时间变化的情况。
    //任务2下的数据：
    medicateDataByPatientIdByDate.forEach(d => {//每个人
        d[1].forEach((d, i) => {//每一天
            if (d[1][0].diag_big === undefined || isNaN(d[1][0].diag_big)) {
                return;
            }
            var cn = 0, cw = 0, r = 0;
            d[1].forEach(d => {//一个对象了，相对应着一行{}
                //对每一天的肠内营养、肠外营养、人血白蛋白的量进行统计
                let dose = +d.dose;
                // console.log(d.order_category)
                if (+d.order_category === 0) {
                    cn += dose;
                } else if (+d.order_category === 1) {
                    cw += dose;
                } else if (+d.order_category === 2) {
                    r += dose;
                }
            })
            // console.log(cn,cw,r)
            d[1] = {
                'index': i,
                'cn': cn,
                'cw': cw,
                'r': r,
                'diag': d[1][0].diag,
                'diag_small': d[1][0].diag_small,
                'diag_big': d[1][0].diag_big,
                'patientId': d[1][0].patientId,
                'date': d[1][0].date
            }
            stackVisData.push(d[1])
        })
    });
    // console.log(medicateDataByPatientIdByDate)

    //按照疾病diag_big进行分类，
    // console.log(stackVisData)
    let stackVisData2 = d3.groups(stackVisData, d => d.diag_big)//不能使用stackVisData接收了。
    // console.log(stackVisData2)
    stackVisData2.forEach((d,i) => {//3个疾病分类
        let obj = {};
        let temp = d3.groups(d[1], d => d.index);
        // console.log(temp)//[[0,[{61个对象},{},{}...{}]],[1,[{},{},{}...{}]],[2,[{},{},{}...{}]]]，12个
        temp.forEach((d,i) => {//目的：循环这12天的，把每天变成1个对象{xcategory:0,cn:,cw:,r:}
            /*let obj = {"cn": 0, "cw": 0, "r": 0,'index':d.index,'diag':d.diag,'date':d.date,
                'diag_big':d.diag_big,'diag_small':d.diag_small,'patientId':d.patientId}*/
            let obj = {"cn": 0, "cw": 0, "r": 0,'xcategory':d[1][0].index,'count':d[1].length}
            d[1].forEach(d => {//遍历61个{}
                obj.cn += d.cn;
                obj.cw += d.cw;
                obj.r += d.r;
            })
            temp[i] = obj;
        })
        stackVisData2[i][1] = temp;
    });
    // console.log(stackVisData2)

    //任务1：分析不同疾病在特定营养方式下的变化情况。
    let medicateDataByPatientIdByDate2 = d3.groups(medicateData, d => d.patientId, d => d.date)
    var byOrder = [];
    var checkDataUpdate02 = d3.groups(checkData,d=>d.patientId)
    // console.log(checkDataUpdate02)
    medicateDataByPatientIdByDate2.forEach(d => {//每个人
        d[1].forEach((d, i) => {//每一天
            // console.log(d[1][0].diag_small)
            if (d[1][0].diag_big === undefined || isNaN(d[1][0].diag_big) || isNaN(d[1][0].diag_small)) {
                return;
            }
            d[1].forEach(d => {//一个对象了，相对应着一行{}
                //对每一天的肠内营养、肠外营养、人血白蛋白的量进行统计
                let sex = -1;
                let age = -1;
                let age_cluster = -1;
                checkDataUpdate02.forEach(v=>{
                    age_cluster = v[0]===d.patientId?v[1][0]['age_cluster']:age_cluster;
                    sex = v[0]===d.patientId?v[1][0]['sex']:sex;
                    age = v[0]===d.patientId?v[1][0]['age']:age;
                });
                let dict = {'xcategory':i,'cluster':d.cluster,'patientId':d.patientId,'sex':sex,'age':age,'age_cluster':age_cluster,'order_category':d.order_category,'order':d.order,
                    'dose':d.dose,'diag_small':d.diag_small,'diag_big':d.diag_big,'diag':d.diag,'date':d.date};
                    byOrder.push(dict);
            })
        })
    })
    // console.log(byOrder);

    var orderCategory = d3.groups(byOrder,d=>d.order_category).filter(d=>(d[0]!==-1)&&d[0]!==undefined)//先按医嘱分为肠内、肠外、人血
    orderCategory.forEach((d,i)=>{//每一个d[1]变成[{},{},{}...{}]12个时间
        let temp = d3.groups(d[1],d=>d.xcategory)//12的[[0,[{},{}]],[],[]]
        temp.forEach((d,i)=>{//将多个{}转换成temp[i][1]转换为{}
            let diag0=0,diag1=0,diag2=0,diag3=0,diag4=0,diag5=0,diag6=0,diag7=0,diag8=0;
            let count0=0,count1=0,count2=0,count3=0,count4=0,count5=0,count6=0,count7=0,count8=0;
            d[1].forEach(d=>{
                let dose = d.dose;
                switch (d.diag_small) {
                    case 0:
                        count0++;
                        diag0 += dose;
                        break;
                    case 1:
                        count1++;
                        diag1 += dose;
                        break;
                    case 2:
                        count2++;
                        diag2 += dose;
                        break;
                    case 3:
                        count3++;
                        diag3 += dose;
                        break;
                    case 4:
                        count4++;
                        diag4 += dose;
                        break;
                    case 5:
                        count5++;
                        diag5 += dose;
                        break;
                    case 6:
                        count6++;
                        diag6 += dose;
                        break;
                    case 7:
                        count7++;
                        diag7 += dose;
                        break;
                    case 8:
                        count8++;
                        diag8 += dose;
                        break;
                }
            })
            temp[i] = {'xcategory':i,'diag0':diag0/count0,'diag1':diag1/count1,'diag2':diag2/count2,
                'diag3':diag3/count3,'diag4':diag4/count4,'diag5':diag5/count5,
                'diag6':diag6/count6,'diag7':diag7/count7,'diag8':diag8/count8}
           /* temp[i] = {'xcategory':i,'diag0':diag0,'diag1':diag1,'diag2':diag2,
                'diag3':diag3,'diag4':diag4,'diag5':diag5,
                'diag6':diag6,'diag7':diag7,'diag8':diag8}*/
        })
        orderCategory[i][1] = temp;
    })

    // 把所有的患者信息给表示出来：
    let allInfomation = d3.groups(byOrder,d=>d.diag_small,d=>d.patientId);
    // console.log(allInfomation)
    let checkDataUpdate = d3.groups(checkData,d=>d.patientId)
    let predsDataUpdate = d3.groups(predsData,d=>d.patientId)
    // console.log(predsDataUpdate)
    allInfomation.forEach((data,i)=>{
        data[1].forEach((d,i)=>{//这里的d[0]是患者ID
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
                checkDataUpdate.forEach(d=>{
                    if(d[0]===patientIdm){
                        obj["albumin"] = d[1][i].albumin;
                    }
                })
                predsDataUpdate.forEach(d=>{
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
        allInfomation[i][1] = data[1]
    })
    console.log(allInfomation)

    //组织成 tree 需要的
    // console.log(byOrder)
    let predsDataUpdate02 = d3.groups(predsData,d=>d.patientId);
    let allInfomation02 = d3.groups(byOrder,d=>d.cluster,d=>d.sex,d=>d.age_cluster,d=>d.diag_big,d=>d.patientId);//只需要更换这里
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
                            let obj = {'xcategory':d[1][0].xcategory,"cluster":d[1][0].clusterTag,"cn": 0, "cw": 0, "r": 0,'count':d[1].length,
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


    // console.log(allInfomation02);

    //转换为json的形式:

    let allInfomation03 = allInfomation02;
    console.log(allInfomation03)
    let allJson = dealDataToJson(allInfomation03);



    /*
    * 将数组转换为json，并处理相应的字段。
    * */

    function dealDataToJson(allInfomation03) {

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
               data22[1][i11] = temp;
           })
            console.log(data22)
            let temp = {};
            temp["name"] = data22[0]+1;
            temp["children"] = data22[1];
            allJson["children"].push(temp);
        })


        return allJson;

    }

    // console.log(allInfomation03);
    // console.log(allJson)


    console.log(byOrder)
    console.log(predsDataUpdate02)
    console.log(checkDataUpdate02)
    console.log(allJson)

    return [byOrder,predsDataUpdate02,checkDataUpdate02,allInfomation02,allJson,clusterMeanDataLine];
}










import * as React from "react";
import { IContextProvider, } from '../uxp';
import { 
    TitleBar, 
    WidgetWrapper,
    Select,
    useToast ,
    DateRangePicker,
    DropDownButton,
    HorizontalScrollList,
    Loading ,
    LinkWidgetContainer,
    FilterPanel
} from "uxp/components";

import Highcharts, { Point } from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HC_more from 'highcharts/highcharts-more';
HC_more(Highcharts);
import Highchartstock from "highcharts/highstock";
HC_more(Highchartstock);
require("highcharts/indicators/indicators")(Highchartstock);
require("highcharts/indicators/pivot-points")(Highchartstock);
require("highcharts/indicators/macd")(Highchartstock);
require("highcharts/modules/boost")(Highchartstock);
require("highcharts/modules/exporting")(Highchartstock);
require("highcharts/modules/map")(Highchartstock);
import HC_seriesLBL from 'highcharts/modules/series-label';
HC_seriesLBL(Highchartstock);
import { LucyModel, Metrics } from "./common";
import './AQISummary.scss';


interface IWidgetProps {
    uxpContext?: IContextProvider,
    instanceId?: string
}

const AQISummaryLiteWidget: React.FunctionComponent<IWidgetProps> = (props) => {

    const [AssetList,setAssetList] = React.useState([]);
    const [SelectAsset,setSelectAsset] = React.useState(null);

    const [TestList,setTestList] = React.useState([]);
    const [SelectTest,setSelectTest] = React.useState(null);
    const [TestStatus,setTestStatus] = React.useState(null);
    const [TimeOffset, setTimeOffset] = React.useState(null);

    const [DateRange,setDateRange] = React.useState({StartDate:null,EndDate:null});

    const [ChartOption, setChartOption] = React.useState(null);

    React.useEffect(() => {
        if(SelectAsset != null && SelectTest != null && TestStatus != null && TimeOffset != null  ){
            let dt = new Date();
            let currentDate = new Date(new Date().getTime() + ((TimeOffset+dt.getTimezoneOffset())*60000));
            let eddate = currentDate;
            eddate.setHours( eddate.getHours() + 1 );

            let stdate=new Date(new Date().getTime() + ((TimeOffset+dt.getTimezoneOffset())*60000));

            if(TestStatus === 'Hourly'){
                stdate.setDate( stdate.getDate() - 1 );
            }
            else{
                stdate.setDate( stdate.getDate() - 7 );
            }
            setDateRange({StartDate:stdate,EndDate:eddate});
        }
    }, [SelectAsset,SelectTest,TestStatus]);

    React.useEffect(() => {
        if(SelectAsset != null && SelectTest != null && DateRange.EndDate != null && DateRange.StartDate != null && TimeOffset != null  ){
            GetChartData();
        }
    }, [SelectAsset,SelectTest,DateRange]);

    React.useEffect(() => {
        GetAssetList();
        GetTestList();
        setTimeOffset(420);
    }, []);

////////////////////////////////////////////Data Call Start//////////////////////
    let toast = useToast();
    function GetAssetList(){
        // let res = eqlist;

        // setAssetList(res);
        // if(res.length>0){
        //     setSelectAsset(res[0].equipmentId);
        // }
        // else{
        //     setSelectAsset(null);
        // }


        props.uxpContext?.executeAction(LucyModel, "GetSensors", {}, { json: true })
        .then(res => {
            setAssetList(res);
            if(res.length>0){
                setSelectAsset(res[0].equipmentId);
            }
            else{
                setSelectAsset(null);
            }
        })
            .catch(e => {
            console.log("except: ", e);
            setAssetList([]);
            setSelectAsset(null);
            toast.error("Something went wrong");
        })
    }

    function GetTestList(){
        let res = Metrics;
        setTestList(res);
        if(res.length>0){
            setSelectTest(res[0].TestID);
            setTestStatus(res[0].Status);
        }
        else{
            setSelectTest(null);
            setTestStatus(null);
        }
    }

    function GetChartData(){
        // let res = chexmple;
        // CreatChartOption(res);
        props.uxpContext?.executeAction(LucyModel, "GetData", {start:DateRange.StartDate.toISOString(),end:DateRange.EndDate.toISOString(),sensor:SelectAsset,metric:SelectTest}, { json: true })
        .then(res => {
            console.log(res,"receive chart data.......");
            CreatChartOption(res);
        })
        .catch(e => {
            console.log("except: ", e);
            setChartOption(null);
            toast.error("Something went wrong");
        })
    }
////////////////////////////////////////////Data Call End//////////////////////

    async function CreatChartOption(getData : any[]){
        let chlength = document.getElementById('divid-aqisummary-main').clientWidth-80;
        let chHeight = document.getElementById('divid-aqisummary-main').clientHeight-100;
        let chartdata = await OrganizeData(getData);

        let chartoption = {
            title: {
                text: '',
                style: {
                    fontWeight: 'bold',
                    fontSize:"12px"
                }
            },
            chart:{
                type:'spline',
                height: chHeight,
                zoomType: 'xy',
                width:chlength
            },
            credits: {
                enabled: false
            },
            xAxis: {
                lineColor: '#111112',
                lineWidth: 1,
                type: "datetime",
                dateTimeLabelFormats: {
                    millisecond: "%Y/%m/%d %H:%M",
                    second: "%Y/%m/%d %H:%M",
                    minute: "%Y/%m/%d %H:%M",
                    hour: "%Y/%m/%d %H:%M",
                    day: "%Y/%m/%d",
                    week: "%Y/%m/%d",
                    month: "%Y/%m/%d",
                    year: "%Y/%m/%d"
                },
                labels: {
                    style: {
                        fontSize: 9,
                        fontWeight:'bolder'
                    }
                }
                
            },
            yAxis: {
                //max: 500 ,
                min: 0 ,
                lineColor: '#111112',
                lineWidth: 1,
                gridLineWidth: 0,
                minorGridLineWidth:0,
                //tickInterval: 20,
                plotBands: [
                    {
                        color: 'rgba(140, 82, 15, 0.4)',
                        from: 300,
                        to: 500
                    },
                    {
                        color: 'rgba(166, 0, 255, 0.3)',
                        from: 200,
                        to: 300
                    },
                    {
                        color: 'rgba(255, 0, 0, 0.3)',
                        from: 150,
                        to: 200
                    },
                    {
                        color: 'rgba(255, 106, 0, 0.3)',
                        from: 100,
                        to: 150
                    },
                    {
                        color: 'rgba(251, 255, 0, 0.3)',
                        from: 50,
                        to: 100
                    },
                    {
                        color: 'rgba(11, 212, 21, 0.3)',
                        from: 0,
                        to: 50
                     }
                ],
                labels: {
                    style: {
                        fontSize: 8
                    }
                },
                title: {
                    text: `AQI Value`,
                    style: {
                        fontSize: 10
                    }
                }
            },
            tooltip: {
                xDateFormat: '%Y-%m-%d %H:%M',
                shared: true,
                backgroundColor: 'black',
                style : {
                    color:'white'
                }
            },
            // tooltip: {
            //     useHTML:true,
            //     formatter: function () {
            //         let msg='';
            //         if(this.point.manhours != undefined){
            //             msg = `<div><table><tbody><tr><td><div style="width:15px; height:15px; background-color:${this.color};"></div></td><td><div style="font-weight:bolder;">${this.point.name}</div></td></tr></tbody></table>
            //             <table><tbody><tr><td><div>Count : </div></td><td><div>${this.y}</div></td></tr></tbody></table>
            //             <table><tbody><tr><td><div>Saved Man Hours : </div></td><td><div>${this.point.manhours}Hrs</div></td></tr></tbody></table>
            //             </div>`;
            //         }
            //         else{
            //             msg = `<div><table><tbody><tr><td><div style="width:15px; height:15px; background-color:${this.color};"></div></td><td><div style="font-weight:bolder;">${this.point.name}</div></td></tr></tbody></table>
            //             <table><tbody><tr><td><div>Count : </div></td><td><div>${this.y}</div></td></tr></tbody></table>
            //             </div>`;
            //         }
            //         return msg;
            //     }
            // },
           
            legend: {
                align: 'right',
                verticalAlign: 'top',
                layout: 'vertical',
                maxHeight: 60,
                y: 10,
                x: -10,
                floating: true,
                enabled:true,
                itemMarginBottom: 0,
                useHTML: true,
                backgroundColor: "#c2c2c2",
                borderColor: 'black',
                borderWidth: 1,
                shadow: false,
                labelFormatter: function() {
                    return '<div class="insightslastackchart-legend-wrapper"><div class="insightslastackchart-legend-square" style="background: ' + this.color + '"></div><div class="insightslastackchart-legend-label">' + this.name + '</div></div>';
                }
            },
            rangeSelector: {
                inputEnabled: true,
		        selected: 2,
				buttons: [{
					type: 'minute',
					count: 60,
					text: '1h'
				}, {
					type: 'day',
					count: 1,
					text: '1d'
				}, {
					type: 'week',
					count: 1,
					text: '1w'
				}, {
					type: 'month',
					count: 1,
					text: '1m'
				}, {
					type: 'year',
					count: 1,
					text: '1y'
				}, {
					type: 'all',
					text: 'All'
				}]
            },
            navigator:{
                enabled: true,
                series: chartdata
            },
            series:  [
                {
                    data: chartdata,
                    name: SelectAsset,
                    color: '#292eba'
                }
                    
             ]
        }


        setChartOption(chartoption);
    }

    function OrganizeData(Dataarray:any[]){
		let finalar =[];
		for(var t=0; t<Dataarray.length; t++){
            var dxt = new Date(Dataarray[t]["DateTime"]);
            var dt = dxt.valueOf();
			finalar.push(
				{
					x:dt,
					y:parseFloat(Dataarray[t]["Value"]),
                    AssetID: Dataarray[t]["AssetID"]
				}
			);
		}
        return finalar;
	}



    return (
        <WidgetWrapper>
            <div className='AQIsummary-main' id='divid-aqisummary-main'>
                <TitleBar title='AQI Summary'
                    icon="data:image/svg+xml;base64,PHN2ZyBpZD0iQ2FwYV8xIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCA1MTIgNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHdpZHRoPSI1MTIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGc+PGNpcmNsZSBjeD0iMTUiIGN5PSI5MS41IiByPSIxNSIvPjxjaXJjbGUgY3g9Ijc2IiBjeT0iOTEuNSIgcj0iMTUiLz48Y2lyY2xlIGN4PSI0NiIgY3k9IjE1MS41IiByPSIxNSIvPjxjaXJjbGUgY3g9IjE1IiBjeT0iMjExLjUiIHI9IjE1Ii8+PGNpcmNsZSBjeD0iNzYiIGN5PSIyMTEuNSIgcj0iMTUiLz48Y2lyY2xlIGN4PSI0NiIgY3k9IjI3MS41IiByPSIxNSIvPjxjaXJjbGUgY3g9IjE1IiBjeT0iMzMxLjUiIHI9IjE1Ii8+PGNpcmNsZSBjeD0iNzYiIGN5PSIzMzEuNSIgcj0iMTUiLz48cGF0aCBkPSJtNDYxLjUgMjU2LjVjLTc0LjE3NC4wMTEtNjkuNzIzLS4wMzEtNzAuNS4wNHYyOS45MmMuODE0LjA3NC0zLjE1My4wMyA3MC41LjA0IDExLjMgMCAyMC41IDkuMiAyMC41IDIwLjVzLTkuMiAyMC41LTIwLjUgMjAuNWMtOS40MSAwLTE3LjU4LTYuMzUtMTkuODgtMTUuNDUtMi4wMy04LjAzLTEwLjE4LTEyLjktMTguMjEtMTAuODctOC4wNCAyLjAzLTEyLjkgMTAuMTktMTAuODcgMTguMjIgNS42NyAyMi40MyAyNS44IDM4LjEgNDguOTYgMzguMSAyNy44NSAwIDUwLjUtMjIuNjUgNTAuNS01MC41cy0yMi42NS01MC41LTUwLjUtNTAuNXoiLz48cGF0aCBkPSJtNDYxLjUgMTY2LjVjMjcuODUgMCA1MC41LTIyLjY1IDUwLjUtNTAuNXMtMjIuNjUtNTAuNS01MC41LTUwLjVjLTIzLjE2IDAtNDMuMjkgMTUuNjctNDguOTYgMzguMS0yLjAzIDguMDMgMi44MyAxNi4xOSAxMC44NyAxOC4yMiA4LjAyIDIuMDMgMTYuMTgtMi44NCAxOC4yMS0xMC44NyAyLjMtOS4xIDEwLjQ3LTE1LjQ1IDE5Ljg4LTE1LjQ1IDExLjMgMCAyMC41IDkuMiAyMC41IDIwLjVzLTkuMiAyMC41LTIwLjUgMjAuNWMtNzQuMTc0LjAxMS02OS43MjMtLjAzMS03MC41LjA0djI5LjkyYy44MTQuMDc0LTMuMTUzLjAyOSA3MC41LjA0eiIvPjxwYXRoIGQ9Im00NTEgMjExLjVjMC04LjI4LTYuNzItMTUtMTUtMTVoLTQ1djMwaDQ1YzguMjggMCAxNS02LjcyIDE1LTE1eiIvPjxjaXJjbGUgY3g9IjQ5NyIgY3k9IjIxMS41IiByPSIxNSIvPjxwYXRoIGQ9Im0yODYgMTA2LjVoNzV2MzBoLTc1eiIvPjxwYXRoIGQ9Im0yODYgMTY2LjVoNzV2MzBoLTc1eiIvPjxwYXRoIGQ9Im0xMjEgMjg2LjVoNzV2MzBoLTc1eiIvPjxwYXRoIGQ9Im0yODYgMjg2LjVoNzV2MzBoLTc1eiIvPjxwYXRoIGQ9Im0yODYgMjI2LjVoNzV2MzBoLTc1eiIvPjxwYXRoIGQ9Im0zNDYgMTUuNWgtMjEwYy04LjI4NCAwLTE1IDYuNzE2LTE1IDE1djQ2aDkwYzguMjg0IDAgMTUgNi43MTYgMTUgMTV2MjQwYzAgOC4yODQtNi43MTYgMTUtMTUgMTVoLTkwdjEzNWMwIDguMjg0IDYuNzE2IDE1IDE1IDE1aDIxMGM4LjI4NCAwIDE1LTYuNzE2IDE1LTE1di0xMzVoLTkwYy04LjI4NCAwLTE1LTYuNzE2LTE1LTE1di0yNDBjMC04LjI4NCA2LjcxNi0xNSAxNS0xNWg5MHYtNDZjMC04LjI4NC02LjcxNi0xNS0xNS0xNXptLTc1IDQwNmMwIDguMjg0LTYuNzE2IDE1LTE1IDE1aC0zMGMtOC4yODQgMC0xNS02LjcxNi0xNS0xNXM2LjcxNi0xNSAxNS0xNWgzMGM4LjI4NCAwIDE1IDYuNzE2IDE1IDE1eiIvPjxwYXRoIGQ9Im0xMjEgMjI2LjVoNzV2MzBoLTc1eiIvPjxwYXRoIGQ9Im0xMjEgMTA2LjVoNzV2MzBoLTc1eiIvPjxwYXRoIGQ9Im0xMjEgMTY2LjVoNzV2MzBoLTc1eiIvPjwvZz48L3N2Zz4="
                >
                    <table style={{position:'relative'}}><tbody><tr>
                        <td style={{width:"220px"}}>
                            <div style={{width:"200px"}}>
                                <Select 
                                    className={'AQIsummary-selectfilter'}
                                    selected={SelectAsset}
                                    options={AssetList}
                                    labelField="equipmentId"
                                    valueField="equipmentId"
                                    onChange={(newValue, option) => {
                                        setSelectAsset(newValue);
                                    }}
                                    showEndOfContent={false}
                                />
                            </div>
                        </td>
                        <td style={{width:"220px"}}>
                            <div style={{width:"200px"}}>
                                <Select 
                                    className={'AQIsummary-selectfilter'}
                                    selected={SelectTest}
                                    options={TestList}
                                    labelField="TestID"
                                    valueField="TestID"
                                    onChange={(newValue, option) => {
                                        setTestStatus(option.Status);
                                        setSelectTest(newValue);
                                    }}
                                    showEndOfContent={false}
                                />
                            </div>
                        </td>
                        <td>
                            <FilterPanel>
                                <DateRangePicker
                                    title=""
                                    startDate={DateRange.StartDate}
                                    endDate={DateRange.EndDate}
                                    closeOnSelect
                                    onChange={(stDate, endDate) =>  {setDateRange({StartDate:stDate,EndDate:endDate})}}
                                />
                            </FilterPanel>
                        </td>
                    </tr></tbody></table>
                </TitleBar>
                <div className='AQIsummary-main-chart'>
                    {ChartOption != null && <HighchartsReact
                        highcharts={Highchartstock}
                        constructorType={'stockChart'}
                        options={ChartOption}
                    />}
                </div>
                <div className='AQIsummary-legends-positioning'>
                    <div className='AQIsummary-legends-container'>
                        <table><tbody>
                            <tr>
                                <td>
                                    <table><tbody><tr><td><div style={{backgroundColor:'rgba(11, 212, 21, 0.3)'}} className="AQIsummary-legends-box"></div></td><td><div className="AQIsummary-legends-text">Good</div></td></tr></tbody></table>
                                </td>
                                <td>
                                    <table><tbody><tr><td><div style={{backgroundColor:'rgba(251, 255, 0, 0.3)'}} className="AQIsummary-legends-box"></div></td><td><div className="AQIsummary-legends-text">Moderate</div></td></tr></tbody></table>
                                </td>
                                <td>
                                    <table><tbody><tr><td><div style={{backgroundColor:'rgba(255, 106, 0, 0.3)'}} className="AQIsummary-legends-box"></div></td><td><div className="AQIsummary-legends-text">Unhealthy for Sensitive Groups</div></td></tr></tbody></table>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <table><tbody><tr><td><div style={{backgroundColor:'rgba(255, 106, 0, 0.3)'}} className="AQIsummary-legends-box"></div></td><td><div className="AQIsummary-legends-text">Unhealthy</div></td></tr></tbody></table>
                                </td>
                                <td>
                                    <table><tbody><tr><td><div style={{backgroundColor:'rgba(166, 0, 255, 0.3)'}} className="AQIsummary-legends-box"></div></td><td><div className="AQIsummary-legends-text">Very Unhealthy</div></td></tr></tbody></table>
                                </td>
                                <td>
                                    <table><tbody><tr><td><div style={{backgroundColor:'rgba(140, 82, 15, 0.4)'}} className="AQIsummary-legends-box"></div></td><td><div className="AQIsummary-legends-text">Hazarddous</div></td></tr></tbody></table>
                                </td>
                            </tr>
                        </tbody></table>
                    </div>
                </div>
            </div>
        </WidgetWrapper>
    )
};

export default AQISummaryLiteWidget;




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
    FilterPanel,
    RadialGauge,
    useUpdateWidgetProps
} from "uxp/components";
import { LucyModel, Metrics } from "./common";
import './AQICurrent.scss';

interface IProps {
    metric: string;
    sensor: string;
    uxpContext?: IContextProvider,
    instanceId?: string
}
const AQICurrentWidget: React.FunctionComponent<IProps> = (props) => {
    let [value,setValue] = React.useState(0);
    let [sensor,setSensor] = React.useState(props.sensor);
    let [metric,setMetric] = React.useState(props.metric);
    let [sensors,setSensors] = React.useState([]);
    let updater = useUpdateWidgetProps();
    const init = async () => {
        try {
            let sensors = await props.uxpContext.executeAction(LucyModel, "GetSensors", {},{json:true});
            setSensors(sensors);
        } catch(e) {
            console.error(e);
        }
       
    };
    React.useEffect(() => {
       init().then(_ => {}).catch(e => {});
    },[]);
    function updateSensor(val:string) {
        setSensor(val);
        updater(props.instanceId,{sensor:val,metric});
    }
    function updateMetric(val:string) {
        setMetric(val);
        updater(props.instanceId,{sensor,metric:val});
    }
    React.useEffect(()=>{
        props.uxpContext.executeAction(LucyModel,'GetCurrentData',{sensor,metric},{json:true}).then(res => {
            console.log('Currnt Val',res,sensor,metric);
            setValue(Number(res.value));

        }).catch(e => {
            console.error(e);
        });
    },[sensor,metric]);
    return <WidgetWrapper className='aqi-current'>
        <TitleBar title={`Current Value: ${sensor || ''}`} >
            <FilterPanel className='aqi-current'>
                <div className='filter-item'>

                    <Select
                        className={'AQIsummary-selectfilter'}
                        selected={sensor}
                        options={sensors}
                        placeholder={'Select a sensor'}

                        labelField="equipmentId"
                        valueField="equipmentId"
                        onChange={(newValue, option) => {
                            updateSensor(newValue);
                        }}
                        showEndOfContent={false}
                    />

                </div>


                <div className='filter-item'>
                    <Select
                        className={'AQIsummary-selectfilter'}
                        selected={metric}
                        placeholder={'Select a metric'}
                        options={Metrics}
                        labelField="TestID"
                        valueField="TestID"
                        onChange={(newValue, option) => {
                            updateMetric(newValue);
                        }}
                        showEndOfContent={false}
                    />
                </div>
            </FilterPanel>
        </TitleBar>
        <div style={{flex:1}}>
            <RadialGauge max={20} min={0} value={value} colors={[{color:'coral',stopAt:2},{color:'#EEFFCC',stopAt:4},{color:'#AAFFAA',stopAt:10}]} />
        </div>
    </WidgetWrapper>
};
export {AQICurrentWidget};
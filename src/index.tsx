import * as React from "react";
import { registerWidget, registerLink, registerUI, IContextProvider, } from './uxp';
import './styles.scss';
import AQISummaryLiteWidget from "./Lite/AQISummary";
import { AQICurrentWidget } from "./Lite/AQICurrent";


registerWidget({
    id: "AQISummaryLite",
    widget: AQISummaryLiteWidget,
    configs: {
        layout: {
            w: 30,
            h: 16,
            minH: 5,
            minW: 5
        }
    }
});

registerWidget({
    id: "AQICurrent",
    widget: AQICurrentWidget,
    configs: {
        layout: {
            w: 30,
            h: 16,
            minH: 5,
            minW: 5
        }
    }
});
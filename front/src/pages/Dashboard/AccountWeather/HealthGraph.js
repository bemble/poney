import React, {useEffect, useState} from 'react';
import {XYPlot, VerticalBarSeries, YAxis, XAxis, Hint, makeWidthFlexible} from 'react-vis';
import moment from "moment";
import {formatNumber} from "../../../core/Tools";
import {makeStyles, useTheme} from "@material-ui/core";

const useStyles = makeStyles(theme => {
    return {
        hint: {
            background: 'rgba(0, 0, 0, 0.43)',
            borderRadius: 3,
            padding: 8,
            "& h3": {
                margin: 0,
                marginBottom: 4,
                padding: 0,
                color: "#FFFFFF"
            },
            "& p": {
                margin: 0,
                padding: 0,
                color: "#FFFFFF"
            }
        }
    }
});

export default function HealthGraph(props) {
    const [data, setData] = useState([]);
    const [domain, setDomain] = useState({max: -Infinity, min: Infinity});
    const [value, setValue] = useState(null);

    const theme = useTheme();
    useEffect(() => {
        const newData = (props.data || []).map(l => {
            const colorType = l.amount > props.warning ? "success" : (l.amount > 0 ? "warning" : "error");
            let color = theme.palette.type === "dark" ? theme.palette[colorType].dark : theme.palette[colorType].light;
            let opacity = 0.4;
            if (moment.utc(l.date, 'X').isSame(moment(), 'day')) {
                opacity = 1;
                color = theme.palette.type === "dark" ? theme.palette[colorType].main : theme.palette[colorType].main;
            }
            return {
                y: l.amount > 0 ? l.amount : 0,
                y0: l.amount < 0 ? l.amount : 0,
                x: l.date,
                opacity,
                color
            };
        });
        setData(newData);
        const newDomain = newData.reduce(
            (res, row) => {
                return {
                    max: Math.max(res.max, row.y),
                    min: Math.min(res.min, row.y0)
                };
            },
            {max: -Infinity, min: Infinity}
        );
        setDomain(newDomain);
    }, [props.data, theme.palette.type]);


    const classes = useStyles();
    const FlexibleXYPlot = makeWidthFlexible(XYPlot);
    return <FlexibleXYPlot height={200} yDomain={[domain.min, domain.max]}
                           colorType="literal" margin={{left: 50, bottom: 50}}>
        <XAxis tickFormat={v => moment.utc(v, 'X').format('DD/MM/YY')}
               style={{line: {stroke: "none"}}} tickLabelAngle={-45}/>
        <YAxis tickFormat={v => v} style={{line: {stroke: "none"}}}/>
        <VerticalBarSeries onValueMouseOver={v => setValue(v)}
                           onValueMouseOut={() => setValue(null)} data={data} stroke={"none"}/>
        {value ? <Hint value={value}>
            <div className={classes.hint}>
                <h3>{moment.utc(value.x, 'X').format('DD/MM/YY')}</h3>
                <p>{formatNumber(value.y || value.y0)}</p>
            </div>
        </Hint> : null}
    </FlexibleXYPlot>;
}
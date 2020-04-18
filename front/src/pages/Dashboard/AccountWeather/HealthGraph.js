import React, {useEffect, useState} from 'react';
import {XYPlot, VerticalBarSeries, YAxis, XAxis, Hint, makeWidthFlexible} from 'react-vis';
import moment from "moment";
import {formatNumber} from "../../../core/Tools";
import {red, green} from "@material-ui/core/colors";
import {makeStyles} from "@material-ui/core";

let appTheme = null;
const useStyles = makeStyles(theme => {
    appTheme = theme;
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

    useEffect(() => {
        const otherColor = appTheme.palette.type === "dark" ? 900 : 100;

        const newData = (props.data || []).map(l => {
            let color = l.amount > 0 ? green[otherColor] : red[otherColor];
            if (moment.utc(l.date, 'X').isSame(moment(), 'day')) {
                color = l.amount > 0 ? green[500] : red[500];
            }
            return {
                y: l.amount > 0 ? l.amount : 0,
                y0: l.amount < 0 ? l.amount : 0,
                x: l.date,
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
    }, [props.data]);


    const classes = useStyles();
    const FlexibleXYPlot = makeWidthFlexible(XYPlot);
    return <FlexibleXYPlot height={250} yDomain={[domain.min, domain.max]}
                           colorType="literal" margin={{left: 50, bottom: 50}}>
        <XAxis tickFormat={v => moment.utc(v, 'X').format('DD/MM/YY')} tickLabelAngle={-45}/>
        <YAxis tickFormat={v => v}/>
        <VerticalBarSeries onValueMouseOver={v => setValue(v)}
                           onValueMouseOut={() => setValue(null)} data={data}/>
        {value ? <Hint value={value}>
            <div className={classes.hint}>
                <h3>{moment.utc(value.x, 'X').format('DD/MM/YY')}</h3>
                <p>{formatNumber(value.y || value.y0)}</p>
            </div>
        </Hint> : null}
    </FlexibleXYPlot>;
}
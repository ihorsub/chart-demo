const distributedContainer = document.getElementById('distributed-container')
const cumulativeContainer = document.getElementById('cumulative-container')

const distributedChart = echarts.init(distributedContainer, null, {
    renderer: 'canvas',
    useDirtyRect: false
})

const cumulativeChart = echarts.init(cumulativeContainer, null, {
    renderer: 'canvas',
    useDirtyRect: false
})

let periodStart
let periodEnd
let unitType
let startDateInput
let endDateInput
let distributedBtn
let cumulativeBtn
let viewType
let yearBtn
let monthBtn
let weekBtn
let dayBtn
let myChart;

const ranges = {
    'month': {
        plannedWorkTime: { min: 140, max: 160 },
        workedTime: { min: 100, max: 160 },
        plannedPoolTime: { min: 40, max: 50 },
        workedPoolTime: { min: 20, max: 50 },
        absencePoolTime: { min: 0, max: 20 },
        absencePoolTimeWorked: { min: 0, max: 10 }
    },
    'year': {
        plannedWorkTime: { min: 1800, max: 1920 },
        workedTime: { min: 1600, max: 1800 },
        plannedPoolTime: { min: 500, max: 600 },
        workedPoolTime: { min: 300, max: 500 },
        absencePoolTime: { min: 0, max: 300 },
        absencePoolTimeWorked: { min: 0, max: 100 }
    },
    'day': {
        plannedWorkTime: { min: 5, max: 8 },
        workedTime: { min: 2, max: 8 },
        plannedPoolTime: { min: 2, max: 3 },
        workedPoolTime: { min: 1, max: 2 },
        absencePoolTime: { min: 0, max: 3 },
        absencePoolTimeWorked: { min: 0, max: 2 }
    },
    'week': {
        plannedWorkTime: { min: 32, max: 40 },
        workedTime: { min: 20, max: 40 },
        plannedPoolTime: { min: 10, max: 16 },
        workedPoolTime: { min: 0, max: 8 },
        absencePoolTime: { min: 0, max: 10 },
        absencePoolTimeWorked: { min: 0, max: 10 }
    }
}

const expectedWorkTimes = {
    'month': 160,
    'year': 1960,
    'day': 8,
    'week': 40
}

const random = (min, max) => {
    return Math.ceil(Math.random() * (max - min) + min);
}

const getCumulativeXAxisValue = (unit = 'month') => {
    const date = [];
    const diff = Math.ceil(Math.abs(dayjs(periodEnd).diff(dayjs(periodStart), unit))) || 1

    for (let i = 0; i < diff; i++) {
        const format = {
            'month': 'MMM',
            'day': 'DD/MM',
            'year': 'YYYY',
            'week': `W${i + 1}`
        }

        date.push(dayjs(periodStart).add(i, unit).format(format[unit]))
    }

    return date;
}

const getDistributedXAxisValue = (unit = 'month') => {
    const date = [];
    const values = [];
    const diff = Math.ceil(Math.abs(dayjs(periodEnd).diff(dayjs(periodStart), unit))) || 1

    for (let i = 0; i < diff; i++) {
        const format = {
            'month': 'MMM',
            'day': 'DD/MM',
            'year': 'YYYY',
            'week': `W${i + 1}`
        }

        values.push(dayjs(periodStart).add(i, unit).toDate())
        date.push(dayjs(periodStart).add(i, unit).format(format[unit]))
    }

    return {
        values,
        data: date
    };
}

const generateDistributedValues = (unit = 'month', axis) => {
    const expectedWorkTime = [];
    const plannedWorkTime = [];
    const workedTime = [];
    const plannedPoolTime = [];
    const workedPoolTime = [];
    const absencePoolTime = [];
    const absencePoolTimeWorked = [];

    const diff = Math.ceil(Math.abs(dayjs(periodEnd).diff(dayjs(periodStart), unit))) || 1

    for (let i = 0; i < diff; i++) {
        // const start = dayjs(periodStart).add(i, unit).startOf(unit)
        // const end = dayjs(start).endOf(unit)

        expectedWorkTime.push(expectedWorkTimes[unit])
        plannedWorkTime.push(random(ranges[unit].plannedWorkTime.min, ranges[unit].plannedWorkTime.max))

        workedTime.push(
            random(ranges[unit].workedTime.min, ranges[unit].workedTime.max)
        );
        plannedPoolTime.push(
            random(ranges[unit].plannedPoolTime.min, ranges[unit].plannedPoolTime.max)
        );
        workedPoolTime.push(
            random(ranges[unit].workedPoolTime.min, ranges[unit].workedPoolTime.max)
        );
        absencePoolTime.push(
            random(ranges[unit].absencePoolTime.min, ranges[unit].absencePoolTime.max)
        );
        absencePoolTimeWorked.push(
            random(ranges[unit].absencePoolTimeWorked.min, ranges[unit].absencePoolTimeWorked.max)
        );
    }

    return {
        expectedWorkTime,
        plannedWorkTime,
        workedTime,
        plannedPoolTime,
        workedPoolTime,
        absencePoolTime,
        absencePoolTimeWorked
    }
}

let distributedValues = {};
let cumulativeValues = {};

const generateCumulativeValues = (unit = 'month') => {
    const expectedWorkTime = [];
    const plannedWorkTime = [];
    const workedTime = [];
    const plannedPoolTime = [];
    const workedPoolTime = [];
    const absencePoolTime = [];
    const absencePoolTimeWorked = [];

    const diff = Math.ceil(Math.abs(dayjs(periodEnd).diff(dayjs(periodStart), unit))) || 1;

    for (let i = 0; i < diff; i++) {
        const prev1 = expectedWorkTime[expectedWorkTime.length - 1] || 0;
        expectedWorkTime.push(prev1 + expectedWorkTimes[unit])

        const prev2 = plannedWorkTime[plannedWorkTime.length - 1] || 0;
        plannedWorkTime.push(prev2 + random(ranges[unit].plannedWorkTime.min, ranges[unit].plannedWorkTime.max))

        if (i <= diff / 2) {

            const prev3 = workedTime[workedTime.length - 1] || 0;
            workedTime.push(
                prev3 + random(ranges[unit].workedTime.min, ranges[unit].workedTime.max)
            )

            const prev5 = workedPoolTime[workedPoolTime.length - 1] || 0;
            workedPoolTime.push(
                prev5 + random(ranges[unit].workedPoolTime.min, ranges[unit].workedPoolTime.max)
            );


            const prev7 = absencePoolTimeWorked[absencePoolTimeWorked.length - 1] || 0;
            absencePoolTimeWorked.push(
                prev7 + random(ranges[unit].absencePoolTimeWorked.min, ranges[unit].absencePoolTimeWorked.max)
            );
        }

        const prev4 = plannedPoolTime[plannedPoolTime.length - 1] || 0;
        plannedPoolTime.push(
            prev4 + random(ranges[unit].plannedPoolTime.min, ranges[unit].plannedPoolTime.max)
        );

        const prev6 = absencePoolTime[absencePoolTime.length - 1] || 0;
        absencePoolTime.push(
            prev6 + random(ranges[unit].absencePoolTime.min, ranges[unit].absencePoolTime.max)
        );
    }

    return {
        expectedWorkTime,
        plannedWorkTime,
        workedTime,
        plannedPoolTime,
        workedPoolTime,
        absencePoolTime,
        absencePoolTimeWorked
    }
}

const getOptions = (data) => ({
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'shadow'
        },
        position: function (pt) {
            return [pt[0], '10%'];}
    },
    legend: {
        left: 80,
        top: 6,
        orient: 'horizontal',
        width: 600,
    },
    toolbox: {
        feature: {
            saveAsImage: {}
        }
    },
    xAxis: {
        type: 'category',
        boundaryGap: true,
        data: data.xAxisData,
    },
    yAxis: {
        type: 'value',
        boundaryGap: [0, 0],
        axisLabel: {
            inside: false,
        }
    },
    grid: {
        top: '14%',
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
    },
    dataZoom: data.dataZoom || [
        {
            type: 'inside',
            start: 0,
            end: 100,
        },
        {
            start: 0,
            end: 100,
        }
    ],
    series: [
        {
            name: 'Planned worked time',
            type: 'bar',
            barMaxWidth: 200,
            barGap: '-100%',
            barCategoryGap: '30%',
            emphasis: {
                focus: 'series'
            },
            itemStyle: {
                normal: {
                    color: '#82abff',
                    label: {
                        show: true,
                        position: 'insideTop',
                        color: 'white'
                    },
                    barBorderRadius: [8, 8, 0, 0]
                },
            },
            data: data.plannedWorkTime,
        },
        {
            name: 'Worked time',
            type: 'bar',
            barMaxWidth: 200,
            emphasis: {
                focus: 'series'
            },
            itemStyle: {
                normal: {
                    color: '#4D88FF',
                    label: {
                        show: true,
                        position: 'insideTop',
                        color: 'white'
                    },
                    barBorderRadius: [8, 8, 0, 0]
                },
            },
            data: data.workedTime,
        },
        {
            name: 'Pool time planned',
            type: 'bar',
            barMaxWidth: 200,
            emphasis: {
                focus: 'series'
            },
            itemStyle: {
                normal: {
                    color: '#ff5d95',
                    label: {
                        show: true,
                        position: 'insideTop',
                        color: 'white'
                    },
                    barBorderRadius: [8, 8, 0, 0]
                },
            },
            data: data.plannedPoolTime,
        },
        {
            name: 'Worked pool time',
            type: 'bar',
            barMaxWidth: 200,
            emphasis: {
                focus: 'series'
            },
            itemStyle: {
                normal: {
                    color: '#ffaecb',
                    label: {
                        show: true,
                        position: 'insideTop',
                        color: 'white'
                    },
                    barBorderRadius: [8, 8, 0, 0]
                },
            },
            data: data.workedPoolTime,
        },
        {
            name: 'Absence pool time',
            type: 'bar',
            barMaxWidth: 200,
            emphasis: {
                focus: 'series'
            },
            itemStyle: {
                normal: {
                    color: '#FFC31F',
                    label: {
                        show: true,
                        position: 'insideTop',
                        color: 'white'
                    },
                    barBorderRadius: [8, 8, 0, 0]
                },
            },
            data: data.absencePoolTime,
        },
        {
            name: 'Absence pool time worked',
            type: 'bar',
            barMaxWidth: 200,
            emphasis: {
                focus: 'series'
            },
            itemStyle: {
                normal: {
                    color: '#ffde84',
                    label: {
                        show: true,
                        position: 'insideTop',
                        color: 'white'
                    },
                    barBorderRadius: [8, 8, 0, 0]
                },
            },
            data: data.absencePoolTimeWorked,
        },
        {
            name: 'Expected work time',
            type: 'line',
            barMaxWidth: 200,
            emphasis: {
                focus: 'series'
            },
            itemStyle: {
                color: 'black'
            },
            smooth: true,
            symbol: "none",
            data: data.expectedWorkTime
        },
    ]
});

const getCumulativeOptions = (data) => {
    return  {
        responsive: true,
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            position: function (pt) {
                return [pt[0], '10%'];
            }
        },
        legend: {
            // Try 'horizontal'
            left: 80,
            top: 6,
            orient: 'horizontal',
            width: 600,
        },
        dataZoom: data.dataZoom || [
            {
                type: 'inside',
                start: 0,
                end: 100,
            },
            {
                start: 0,
                end: 100,
                bottom: 30
            }
        ],
        toolbox: {

            feature: {
                saveAsImage: {}
            }
        },
        xAxis: {
            type: 'category',
            boundaryGap: true,
            data: data.xAxisData,
            axisLabel: {
                showMaxLabel: true
            }
        },
        yAxis: {
            type: 'value',
            boundaryGap: [0, 0],
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '7%',
            containLabel: true
        },

        series: [
            {
                name: 'Planned work time',
                type: 'line',

                emphasis: {
                    focus: 'series'
                },
                symbol: 'none',
                step: 'step2',
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                            offset: 0,
                            color: 'rgb(130, 171, 255)',
                        },
                        {
                            offset: 1,
                            color: 'rgb(255, 255, 255)'
                        }
                    ])
                },
                itemStyle: {
                    normal: {
                        color: '#82abff',
                        barBorderRadius: [8, 8, 0, 0]
                    },
                },
                data: data.plannedWorkTime,
            },

            {
                name: 'Worked time',
                type: 'line',
                symbol: 'none',
                step: 'step2',
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                            offset: 0,
                            color: 'rgb(77, 136, 255)',
                        },
                        {
                            offset: 1,
                            color: 'rgb(255, 255, 255)'
                        }
                    ])
                },
                emphasis: {
                    focus: 'series'
                },
                itemStyle: {
                    normal: {
                        color: '#4D88FF',
                        barBorderRadius: [8, 8, 0, 0]
                    },
                },
                data: data.workedTime,
            },
            {
                name: 'Pool time planned',
                type: 'line',
                symbol: 'none',
                step: 'step2',
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                            offset: 0,
                            color: 'rgb(255, 174, 203)',
                        },
                        {
                            offset: 1,
                            color: 'rgb(255, 255, 255)'
                        }
                    ])
                },
                emphasis: {
                    focus: 'series'
                },
                itemStyle: {
                    normal: {
                        color: '#ffaecb',
                        barBorderRadius: [8, 8, 0, 0]
                    },
                },
                data: data.plannedPoolTime,
            },
            {
                name: 'Pool time worked',
                type: 'line',
                symbol: 'none',
                step: 'step2',
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                            offset: 0,
                            color: 'rgb(255, 93, 149)',
                        },
                        {
                            offset: 1,
                            color: 'rgb(255, 255, 255)'
                        }
                    ])
                },
                emphasis: {
                    focus: 'series'
                },
                itemStyle: {
                    normal: {
                        color: '#ff5d95',
                        barBorderRadius: [8, 8, 0, 0]
                    },
                },
                data: data.workedPoolTime,
            },
            //  {
            //    name: 'Absence pool time',
            //    type: 'bar',
            //    emphasis: {
            //      focus: 'series'
            //    },
            //    itemStyle: {
            //      normal: {
            //        color: '#FFC31F',
            //        label: {
            //          show: true,
            //          position: 'insideTop',
            //          color: 'white'
            //        },
            //        barBorderRadius: [8, 8, 0, 0]
            //      },
            //    },
            //    data: data5,
            //  },
            {
                name: 'Absence pool time worked',
                type: 'line',
                emphasis: {
                    focus: 'series'
                },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                            offset: 0,
                            color: 'rgb(255, 222, 132)'
                        },
                        {
                            offset: 1,
                            color: 'rgb(255, 255, 255)'
                        }
                    ]),
                },
                itemStyle: {
                    normal: {
                        color: '#ffde84',
                        barBorderRadius: [8, 8, 0, 0]
                    },
                },
                step: "step82",
                data: data.absencePoolTimeWorked,
            },

            {
                name: 'Expected work time',
                type: 'line',
                emphasis: {
                    focus: 'series'
                },
                itemStyle: {
                    normal: {
                        lineStyle: {
                            width: 2,
//            type: [16, 20], // before v5.0.0, it can only be `solid`, `dotted`, `dashed`
//            dashOffset:  // To control the offset of dashed line
                        },
                        color: 'black',
                        width: 2,

                    }
                },
                step: "step2",
                symbol: "none",
                data: data.expectedWorkTime
            },
        ]
    };
}

const generateChart = (unit = unitType, dataZoom) => {
    let xAxis, data;

    if (viewType === 'distributed') {
         xAxis = getDistributedXAxisValue(unit);
         distributedValues = generateDistributedValues(unit, xAxis.values)
        data = distributedValues;

        return getOptions({ xAxisData: xAxis.data, ...data, dataZoom })
    }

    xAxis = getCumulativeXAxisValue(unit)
    cumulativeValues = generateCumulativeValues(unit);
    data = cumulativeValues;

    return getCumulativeOptions({ xAxisData: xAxis, ...data, dataZoom })
}

const onStartChange = (e) => {
    periodStart = e.target.value;
    myChart.setOption(generateChart(unitType));
}

const onEndChange = (e) => {
    periodEnd = e.target.value;
    myChart.setOption(generateChart(unitType));
}


const init = () => {
    startDateInput = document.getElementById('start-date');
    endDateInput = document.getElementById('end-date');
    periodStart = dayjs().subtract(6, 'month').format('YYYY-MM-DD');
    periodEnd = dayjs().format('YYYY-MM-DD')
    unitType = 'month';
    viewType = 'distributed'
    distributedBtn = document.getElementById('btn-distributed');
    cumulativeBtn = document.getElementById('btn-cumulative');
    yearBtn = document.getElementById('yearBtn');
    monthBtn = document.getElementById('monthBtn');
    weekBtn = document.getElementById('weekBtn');
    dayBtn = document.getElementById('dayBtn');
    startDateInput.setAttribute('value', periodStart);
    startDateInput.addEventListener('change', onStartChange);
    endDateInput.setAttribute('value', periodEnd);
    endDateInput.addEventListener('change', onEndChange);

    monthBtn.classList.add('btn-active');

    showDistributed();

    if (!!myChart) {
        myChart.setOption(generateChart('month'));
    }
}

const removeActive = () => {
    [monthBtn, dayBtn, weekBtn, yearBtn].forEach((btn) => btn.classList.remove('btn-active'))
}

const showByYear = () => {
    unitType = 'year'
    myChart.setOption(generateChart('year'));
    removeActive();
    yearBtn.classList.add('btn-active');
}

const showByMonth = () => {
    unitType = 'month';
    myChart.setOption(generateChart('month'));
    removeActive();
    monthBtn.classList.add('btn-active');
}

const showByWeek = (date = new Date()) => {
    unitType = 'week';

    // const d1 = Math.abs(dayjs(periodStart).diff(date, unitType));
    // const d2 = Math.abs(dayjs(periodEnd).diff(date, unitType));

    // const full = d1 + d2;
    // const offset = d1 / full * 100
    // const offsetEnd = offset + 20;

    myChart.setOption(generateChart('week', [{
        type: 'inside',
        startValue: 'W12',
        endValue: 'W16',
    },
        {
            startValue: 'W12',
            endValue: 'W16',
        }]));
    removeActive();
    weekBtn.classList.add('btn-active');
}

const showByDay = () => {
    unitType = 'day';
    myChart.setOption(generateChart('day', [{
        type: 'inside',
        start: 0,
        end: 20,
    },
        {
            start: 0,
            end: 20,
        }]));
    removeActive();
    dayBtn.classList.add('btn-active');
}

const showDistributed = () => {
    viewType = 'distributed';
    myChart = distributedChart;

    distributedContainer.classList.remove('hidden');
    cumulativeContainer.classList.add('hidden')

    distributedBtn.classList.add('btn-active');
    cumulativeBtn.classList.remove('btn-active')

    myChart.setOption(generateChart());
}

const showCumulative = (skip, dataZoom) => {
    viewType = 'cumulative';
    myChart = cumulativeChart;

    cumulativeContainer.classList.remove('hidden')
    distributedContainer.classList.add('hidden');

    cumulativeBtn.classList.add('btn-active')
    distributedBtn.classList.remove('btn-active');


    if (!skip) {
        myChart.setOption(generateChart(unitType, dataZoom));
    }
}


const onDistributedItemClick = (item) => {
    const dateToShow = new Date();


    if (unitType === 'day') {
        return;
    }

    showCumulative(true)


    if (unitType === 'month') {
        showByWeek(dateToShow);
    } else if (unitType === 'week') {
        showByDay()
    } else if (unitType === 'year') {
        showByMonth();
    }

}

const onCumulativeItemClick = (item) => {
    const dateToShow = item.data?.smt

    if (unitType === 'day') {
        return;
    }

    // showCumulative(true)

    //
    // if (unitType === 'month') {
    //     showByWeek(dateToShow);
    // } else if (unitType === 'week') {
    //     showByDay()
    // } else if (unitType === 'year') {
    //     showByYear();
    // }

}



distributedChart.on('click', onDistributedItemClick)
cumulativeChart.on('click', onCumulativeItemClick)



init();


const labelOption = {
    show: true,
    formatter: '{c}',
    position: 'top',
    color: "black",
    fontSize: 16,
    rich: {
        name: {}
    }
};

window.addEventListener('resize', myChart.resize);

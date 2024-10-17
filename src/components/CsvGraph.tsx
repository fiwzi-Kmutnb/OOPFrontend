import { useEffect, useState } from "react"
import { parse } from 'csv-parse/sync';
import Graph from "./Graph";

interface CsvGraphProps {
    data: any
}
export default function CsvGraph({ data }: CsvGraphProps) {
    const [csvData, setCsvData] = useState<any>(null);
    useEffect(() => {
        const d = parse(data, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        });
        setCsvData(d);
        checkVauleisAllString(d)
        setPaginatedData([])
        setPagination({
            start: 0,
            limit: 50
        });
    }, [data])
    const [uniqueValues, setUniqueValues] = useState<any>(null);
    const uniqueValue = (data: any) => {
        if (data === null) return;
        const getKey = Object.keys(data?.[0]);
        let listKey: Record<string, any> = {};
        getKey?.forEach((key) => {
            listKey[key] = [];
        });
        data?.forEach((item: any) => {
            getKey?.forEach((key) => {
                if (!listKey[key].includes(item[key])) {
                    listKey[key].push(item[key]);
                }
            });
        })
        setUniqueValues(listKey);
    }
    const getUniqueValueByKey = (key: string) => {
        if (csvData === null) return;
        let list: any = [];
        csvData?.forEach((item: any) => {
            if (list.indexOf(item[key]) === -1) {
                list.push(item[key]);
            }
        })
        return list
    }
    const [keyisAllString, setKeyisAllString] = useState<any>(null);
    const checkVauleisAllString = (data: any) => {
        if (data === null) return;
        const getKey = Object.keys(data?.[0]);
        let listKey: Record<string, number[]> = {};
        let keyisAllString: Record<string, boolean> = {}
        getKey?.forEach((key) => {
            listKey[key] = [0, 0];
            keyisAllString[key] = true;
        });
        data?.forEach((item: any) => {
            getKey?.forEach((key) => {
                if (isNaN(Number(item[key]))) {
                    listKey[key][0] += 1;
                } else {
                    listKey[key][1] += 1;
                }
            });
        })
        getKey?.forEach((key) => {
            if (listKey[key][0] == 0) {
                keyisAllString[key] = false;
            }
        })
        setKeyisAllString(keyisAllString);
    }
    const getVauleAllbykey = (key: string) => {
        if (csvData === null) return;
        let list: any = [];
        csvData?.forEach((item: any) => {
            list.push(item[key]);
        })
        return list
    }
    const [numOfRanges, setNumOfRanges] = useState<number>(10);
    const getFrequency = (key: string): [number, number][] | null => {
        if (csvData === null) return null;
        const numericData = csvData?.filter((item: any) => !isNaN(Number(item[key])));
        if (numericData.length === 0) return null;

        const sortCsvList = numericData.sort((a: any, b: any) => Number(a[key]) - Number(b[key]));
        const startValue = Number(sortCsvList[0][key]);
        const endValue = Number(sortCsvList[sortCsvList.length - 1][key]);
        if (startValue == endValue)
            return [[startValue, endValue]];

        const stepSize = (endValue - startValue + 1) / numOfRanges;

        let ranges: [number, number][] = [];

        for (let i = 0; i < numOfRanges; i++) {
            let rangeStart = startValue + (i * stepSize);
            let rangeEnd = (i === numOfRanges - 1) ? endValue : rangeStart + stepSize - 1;
            ranges.push([rangeStart, rangeEnd]);
        }
        return ranges
    }
    const getFrequencyData = (key: string) => {
        if (csvData === null) return [];
        const numericData = csvData?.filter((item: any) => !isNaN(Number(item[key])));
        if (numericData.length === 0) return [];

        const sortCsvList = numericData.sort((a: any, b: any) => Number(a[key]) - Number(b[key]));
        const startValue = Number(sortCsvList[0][key]);
        const endValue = Number(sortCsvList[sortCsvList.length - 1][key]);
        if (startValue == endValue)
            return [numericData.length];

        const stepSize = (endValue - startValue + 1) / numOfRanges;

        let ranges: [number, number][] = [];

        for (let i = 0; i < numOfRanges; i++) {
            let rangeStart = startValue + (i * stepSize);
            let rangeEnd = (i === numOfRanges - 1) ? endValue : rangeStart + stepSize - 1;
            ranges.push([rangeStart, rangeEnd]);
        }

        let frequencyData: number[] = [];
        for (let i = 0; i < numOfRanges; i++) {
            let rangeStart = ranges[i][0];
            let rangeEnd = ranges[i][1];
            let count = 0;
            for (let j = 0; j < numericData.length; j++) {
                let value = Number(numericData[j][key]);
                if (value >= rangeStart && value <= rangeEnd) {
                    count++;
                }
            }
            frequencyData.push(count);
        }
        return frequencyData
    }
    const getKeyFrequency = (key: string) => {
        const Frequency = getFrequency(key);
        if (Frequency == null)
            return [];
        let keys = [];
        for (let item of Frequency) {
            keys.push(`${item[0]} - ${item[1]}`)
        }
        return keys;
    }
    const analyzeData = (key: string) => {
        const dataValue = getVauleAllbykey(key);
        const uniqueValue = getUniqueValueByKey(key);
        const uniqueValueObject = uniqueValue.reduce((acc: any, curr: any) => {
            acc[curr.length == 0 ? "[null]" : curr] = (acc[curr.length == 0 ? "[null]" : curr] || 0);
            return acc;
        }, {});
        dataValue.forEach((item: any) => {
            uniqueValueObject[item.length == 0 ? "[null]" : item] += 1;
        })
        const totalValues = dataValue.length;
        const sortedUniqueValue = Object.entries(uniqueValueObject)
            .sort(([, a]: [string, number | unknown], [, b]: [string, number | unknown]) => (b as number) - (a as number))
            .reduce((acc: any, [key, value]) => {
                acc[key] = value;
                return acc;
            }, {});
        const uniqueValuePercentage = Object.keys(sortedUniqueValue).reduce((acc: any, key: any) => {
            acc[key] = Math.round((uniqueValueObject[key] / totalValues) * 100);
            return acc;
        }, {});
        const topTwo = Object.entries(uniqueValuePercentage).slice(0, 2);
        let obj: Record<string, number> = {};
        topTwo.forEach(([key, value]) => {
            obj[key] = value as number;
        });
        const countOthers = Object.entries(sortedUniqueValue).slice(2).reduce((acc, [_, value]) => acc + (value as number), 0);
        obj[`Others (${countOthers})`] = Object.entries(uniqueValuePercentage).slice(2).reduce((acc, [_, value]) => acc + (value as number), 0);
        return obj;
    }
    const [pagination, setPagination] = useState<{
        start: number,
        limit: number
    }>({
        start: 0,
        limit: 50
    });
    const [paginatedData, setPaginatedData] = useState<any>([]);
    useEffect(() => {
        if (csvData === null) return;
        setPaginatedData([
            ...paginatedData,
            ...csvData.slice(pagination.start, pagination.limit)
        ]);
    }, [csvData, pagination])

    useEffect(() => { 
        window.onscroll = (e) => {
            console.log(e)
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
                setPagination({
                    start: pagination.start + 50,
                    limit: pagination.limit + 50
                });
            }
        }
    },[])

    return (
        <>
            <div className="w-full px-3 mt-4">
                <div className="overflow-x-auto w-full">
                    <table className="table w-full">
                        <thead>
                            <tr className="bg-base-200">
                                {csvData?.[0] && Object.keys(csvData?.[0])?.map((key) => {
                                    return (
                                        <th key={key}>{key}</th>
                                    )
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                {csvData?.[0] && Object.keys(csvData?.[0])?.map((key,i) => {
                                    if (csvData.length <= 3 || (i == 0 && keyisAllString[key])) {
                                        return (
                                            <th>
                                                <div className="text-center">
                                                    {csvData.length}
                                                    <p>Values</p>
                                                    </div>
                                            </th>
                                        )
                                    } else if (keyisAllString[key]) {
                                        const vdata = analyzeData(key);
                                        return (
                                            <th>
                                                {Object.entries(vdata).map(([key, value]) => {
                                                    return (
                                                        <div key={key}>
                                                            <p>{key} : {value}%</p>
                                                        </div>
                                                    )
                                                })}
                                            </th>
                                        )
                                    } else {
                                        return (
                                            <th>
                                                <Graph data={getFrequencyData(key)} lables={getKeyFrequency(key)} />
                                            </th>
                                        )
                                    }
                                })}
                            </tr>
                            {paginatedData?.map((item: any, index: number) => {
                                return (
                                    <tr key={index}>
                                        {Object.keys(item)?.map((key) => {
                                            return (
                                                <td key={key}>{item[key]}</td>
                                            )
                                        })}
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}
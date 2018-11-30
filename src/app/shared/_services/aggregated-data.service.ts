import {Injectable} from '@angular/core';

@Injectable()
export class AggregatedDataService {

  constructor() {
  }

  getAggregatedData(data, chart_id) {

    let resultData;

    let type;
    let sum = 0.;
    let highest = 0.;
    let lowest = 100.;

    switch (chart_id) {

      case 4: //GA impressions
        type = 'ga_impressions';
        for (let i = 0; i < data.length; i++) {
          const value = parseInt(data[i][1]);
          sum += value;
          highest = value > highest ? value : highest;
          lowest = value < lowest ? value : lowest;
        }
        resultData = {average: sum / data.length, highest: highest, lowest: lowest, type: type};
        break;
      case 10: // GA bounce rate
        type = 'ga_bounce';
        // Calculates aggregated extra data
        for (let i = 0; i < data.length; i++) {

          const value = parseFloat(data[i][1]);
          sum += value;
          highest = value > highest ? value : highest;
          lowest = value < lowest ? value : lowest;
        }
        resultData = {average: sum / data.length, highest: highest, lowest: lowest, type: type};
        break;
      case 11: // GA Avg Session duration
        type = 'ga_avgsessionduration';
        // Calculates aggregated extra data
        for (let i = 0; i < data.length; i++) {

          const value = parseFloat(data[i][1]);
          sum += value;
          highest = value > highest ? value : highest;
          lowest = value < lowest ? value : lowest;
        }
        resultData = {average: sum / data.length, highest: highest, lowest: lowest, type: type};
        break;

    }

    return resultData;

  }
}

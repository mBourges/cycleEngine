import xs from 'xstream';

function buildDriver(picklistTypes) {
  const values = {
    Gender: [
      { label: 'Male', value: 'male' },
      { label: 'Female', value: 'female' }
    ],
    SchoolYear: [
      { label: '中1', value: '中1' },
      { label: '中2', value: '中2' },
      { label: '中2', value: '中3' },
      { label: '中2', value: '中4' },
      { label: '中2', value: '中5' },
      { label: '中2', value: '中6' }
    ]
  };

  return function picklistValuesDriver(sink$) {
    const select = picklistType => xs.of(values[picklistType]);

    return {
      select
    };
  };
}

export default function makePicklistValuesDriver(picklistTypes) {
  if (!picklistTypes) {
    throw new Error('[PicklistValues] You must a picklist type array');
  }

  return buildDriver(picklistTypes);
}

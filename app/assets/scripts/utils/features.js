export function geometryToFeature (results) {
  if (results.length > 1) {
    return {
      'type': 'FeatureCollection',
      'features':
        results.map((result) => {
          return {
            'type': 'Feature',
            'geometry': {
              'type': 'Polygon',
              'coordinates': [result.geometry]
            },
            'properties': { }
          };
        })
    };
  } else if (results.length) {
    return {
      'type': 'Feature',
      'geometry': {
        'type': 'Polygon',
        'coordinates': [results[0].geometry]
      },
      'properties': { }
    };
  }
}

export function combineFeatureResults (results) {
  results = results.filter((result) => {
    return result.footprint != null;
  });
  return ({
    'type': 'FeatureCollection',
    'features':
      results.map((result) => {
        return {
          'type': 'Feature',
          'geometry': {
            'type': 'Polygon',
            'coordinates': result.footprint.geometry.coordinates
          },
          'properties': { }
        };
      })
  });
}
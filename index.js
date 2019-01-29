const KDBush = require('kdbush');
const geokdbush = require('geokdbush');

const snapNearby = function (geo, debugBoolean) {

  const features = Array.isArray(geo) ? geo : [...geo.features];

  // snap single valency points within ??ft
  // get unique nodes
  const uniqueNodesSet1 = createValency(features);

  // format for kdbush
  const points1 = Object.keys(uniqueNodesSet1).map(node => {
    const coords = node.split(',');
    return {
      node,
      lon: Number(coords[0]),
      lat: Number(coords[1])
    };
  });

  // index all the points
  const index1 = new KDBush(points1, (p) => p.lon, (p) => p.lat);

  // get single valency points
  const singleValencyPts1 = Object.keys(uniqueNodesSet1).filter(key => {
    return uniqueNodesSet1[key] === 1;
  });

  // create a Old Node to New Node Lookup from the closest points found below
  const replaceNode = {};

  // loop over single valency points
  singleValencyPts1.forEach(vpt => {
    // find closest point (that isn't itself)
    const split = vpt.split(',');
    const lng = split[0];
    const lat = split[1];
    // 0.05km is 164ft.  Anything further won't be matched.
    // 1km might be library bug

    const nearest = geokdbush.around(index1, lng, lat, 2, 0.05);

    if (nearest[1]) {
      replaceNode[vpt] = nearest[1];
    }
  });

  let hit1 = 0;
  let hit2 = 0;
  let del1 = 0;
  let del2 = 0;

  // loop over all segments in dataset, if has start or end point = to a key in the lookup above,
  // then change the coordinate to the new point
  features.forEach(feature => {
    const startPt = feature.geometry.coordinates[0].join(',');
    const endPt = feature.geometry.coordinates[feature.geometry.coordinates.length - 1].join(',');

    if (replaceNode[startPt]) {
      hit1++;
      const nearest = replaceNode[startPt];

      feature.geometry.coordinates[0] = [nearest.lon, nearest.lat];

      // delete opposite if exists
      if (replaceNode[nearest.node]) {
        del1++;
        delete replaceNode[nearest.node];
      }
    }
    if (replaceNode[endPt]) {
      hit2++;
      const nearest = replaceNode[endPt];
      feature.geometry.coordinates[feature.geometry.coordinates.length - 1] = [nearest.lon, nearest.lat];

      // delete opposite if exists
      if (replaceNode[nearest.node]) {
        del2++;
        delete replaceNode[nearest.node];
      }
    }
  });

  if (debugBoolean) {
    console.log({hit1, hit2, del1, del2});
  }

  return {
    "type": "FeatureCollection",
    "features": features
  };

};

exports.snapNearby = snapNearby;

module.exports = snapNearby;


// createValency
function createValency(geo) {
  const uniqueNodesSet = {};
  geo.forEach(feature => {
    const coords = feature.geometry.coordinates;
    // start
    const start = coords[0].join(',');
    if (!uniqueNodesSet[start]) {
      uniqueNodesSet[start] = 1;
    } else {
      uniqueNodesSet[start]++;
    }
    // end
    const end = coords[coords.length - 1].join(',');
    if (!uniqueNodesSet[end]) {
      uniqueNodesSet[end] = 1;
    } else {
      uniqueNodesSet[end]++;
    }
  });
  return uniqueNodesSet;
}

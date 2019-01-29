# geojson-network-node-snap
Snap line ends to nearest network node


TODO

More details of why, what and how this works.

Basically:
```
npm install geojson-network-node-snap --save
```

and

```
const snapNearby = require('geojson-network-node-snap');

const geo = require('geojsonFile.json');

const km = 0.05;  // max km tolerance to look for a node to snap to

const newGeo = snapNearby(geo, km);
```
# geojson-network-node-snap
Snap line ends to nearest network node


```bash
npm install geojson-network-node-snap --save
```

```javascript
const snapNearby = require('geojson-network-node-snap');
const fs = require('fs').promises;

main();

async function main() {
    // load and parse GeoJSON LineString dataset
    const geo_raw = await fs.readFile('./rough_network.geojson', 'utf8');
    const geo = JSON.parse(geo_raw);
    
    // max km distance to look for a node to snap to
    const km = 0.05;  

    // perform operation
    const newGeo = snapNearby(geo, km);

    // save new geojson to file
    await fs.writeFile('./corrected_network.geojson', JSON.stringify(newGeo), 'utf8');
```

See blog post [Cleaning a GeoJSON Network](https://www.danieltrone.com/post/clean-geojson-network-javascript/#snap-nearby-nodes) for more information.
